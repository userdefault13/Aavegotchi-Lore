const archiver = require('archiver');
const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');
const { ObjectId } = require('mongodb');
const { getLoreWorldsCollection, getLorePagesCollection, getRealmMapsCollection } = require('../../lib/mongodb.cjs');

function slugify(text) {
  return (text || 'page')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'page';
}

function blockToMarkdown(block) {
  if (!block) return '';
  if (block.type === 'prose') return block.content || block.text || '';
  if (block.type === 'image') return `![${block.alt || 'image'}](${block.url || ''})\n`;
  if (block.type === 'diagram') {
    return ['```mermaid', block.content || '', '```', ''].join('\n');
  }
  return JSON.stringify(block, null, 2);
}

function pageToMarkdown(page, { maps = [] } = {}) {
  const lines = [`# ${page.title}`, ''];
  if (page.templateId) lines.push(`> Template: ${page.templateId}`, '');
  if (page.tags?.length) {
    lines.push(`Tags: ${page.tags.map((t) => t.label).join(', ')}`, '');
  }
  if (page.runes && Object.keys(page.runes).length) {
    lines.push('## Runes', '');
    for (const [k, v] of Object.entries(page.runes)) {
      if (v != null && v !== '') lines.push(`- **${k}**: ${v}`);
    }
    lines.push('');
  }
  for (const block of page.blocks || []) {
    lines.push(blockToMarkdown(block), '');
  }
  const pinLinks = [];
  for (const map of maps) {
    for (const pin of map.pins || []) {
      if (pin.pageId === page.id) pinLinks.push(`- ${map.title}: ${pin.label || pin.id}`);
    }
  }
  if (pinLinks.length) {
    lines.push('## Map pins', '', ...pinLinks, '');
  }
  if (page.crossLinks?.length) {
    lines.push('## Cross-links', '');
    for (const link of page.crossLinks) lines.push(`- ${link.label || link.pageId}`);
    lines.push('');
  }
  return lines.join('\n').trim() + '\n';
}

async function loadWorldBundle(worldId) {
  if (!ObjectId.isValid(worldId)) return null;
  const worlds = await getLoreWorldsCollection();
  const pages = await getLorePagesCollection();
  const maps = await getRealmMapsCollection();
  const world = await worlds.findOne({ _id: new ObjectId(worldId) });
  if (!world) return null;
  const pageList = await pages.find({ worldId }).sort({ order: 1, title: 1 }).toArray();
  const mapList = await maps.find({ worldId }).toArray();
  return { world, pages: pageList, maps: mapList };
}

async function buildMarkdownZip(worldId) {
  const bundle = await loadWorldBundle(worldId);
  if (!bundle) return null;

  const { world, pages, maps } = bundle;
  const stream = new PassThrough();
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => stream.emit('error', err));
  archive.pipe(stream);

  const readme = [
    `# ${world.title}`,
    '',
    world.description || 'Exported from gotchi-lore.',
    '',
    `Pages: ${pages.length}`,
    `Maps: ${maps.length}`,
    '',
  ].join('\n');
  archive.append(readme, { name: 'README.md' });

  const used = new Set();
  for (const page of pages) {
    let name = slugify(page.title);
    if (used.has(name)) name = `${name}-${page._id.toString().slice(-6)}`;
    used.add(name);
    const md = pageToMarkdown(
      { ...page, id: page._id.toString() },
      { maps: maps.map((m) => ({ ...m, id: m._id.toString(), pins: m.pins || [] })) },
    );
    archive.append(md, { name: `pages/${name}.md` });
  }

  if (maps.length) {
    const mapIndex = maps.map((m) => `- ${m.title} (${(m.pins || []).length} pins)`).join('\n');
    archive.append(`# Maps\n\n${mapIndex}\n`, { name: 'maps/index.md' });
  }

  archive.finalize();
  return { stream, filename: `${slugify(world.title)}-lore.zip` };
}

async function buildWorldPdf(worldId) {
  const bundle = await loadWorldBundle(worldId);
  if (!bundle) return null;

  const { world, pages, maps } = bundle;
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fontSize(20).text(world.title, { underline: true });
  doc.moveDown();
  if (world.description) {
    doc.fontSize(11).fillColor('#444444').text(world.description);
    doc.moveDown();
  }
  doc.fontSize(10).fillColor('#000000');
  doc.text(`Exported: ${new Date().toLocaleString()} · ${pages.length} pages · ${maps.length} maps`);
  doc.moveDown(1.5);

  for (const page of pages) {
    if (doc.y > doc.page.height - 120) doc.addPage();
    doc.fontSize(14).fillColor('#4c1d95').text(page.title, { underline: true });
    doc.moveDown(0.35);
    doc.fontSize(9).fillColor('#666666').text(`Template: ${page.templateId || 'default'}`);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#000000');

    if (page.runes && Object.keys(page.runes).length) {
      for (const [k, v] of Object.entries(page.runes)) {
        if (v != null && v !== '') doc.text(`${k}: ${v}`);
      }
      doc.moveDown(0.35);
    }

    for (const block of page.blocks || []) {
      const text = blockToMarkdown(block).replace(/```mermaid|```/g, '').trim();
      if (!text) continue;
      doc.text(text, { align: 'left' });
      doc.moveDown(0.35);
    }
    doc.moveDown(1);
  }

  doc.end();
  return { stream, filename: `${slugify(world.title)}-lore.pdf` };
}

module.exports = {
  pageToMarkdown,
  buildMarkdownZip,
  buildWorldPdf,
  loadWorldBundle,
};
