/**
 * Shared lore page document builders for canon seed scripts.
 */

const LAYOUT = { columns: 12, rowHeight: 48, gap: 8 };
const DEFAULT_LAYOUT = { version: 1, columns: 12, rowHeight: 72, gap: 8 };
const DEFAULT_DIAGRAM = 'graph TD\n  A[Gotchiverse] --> B[Citaadel]\n  B --> C[Great Portal]';

function newBlockId() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultLabel(type, runeField) {
  const map = {
    prose: 'Description',
    image: 'Image',
    diagram: 'Diagram',
    rune: runeField?.label || 'Field',
    timeline: 'Timeline',
  };
  return map[type] || type;
}

function stackGrid(index, colSpan = 12, rowSpan = 2) {
  let row = 1;
  for (let i = 0; i < index; i++) row += 2;
  return { col: 1, row, colSpan, rowSpan };
}

function proseBlock(content, id = 'b-prose') {
  const html = content
    .trim()
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, ' ').trim()}</p>`)
    .join('');
  return {
    id,
    type: 'prose',
    label: 'Lore',
    content: html,
    grid: { col: 1, row: 1, colSpan: 12, rowSpan: 6 },
  };
}

function proseToHtml(content) {
  return content
    .trim()
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, ' ').trim()}</p>`)
    .join('');
}

function blocksFromTemplate(template) {
  const specs = template?.blocks || [];
  const hasLayout = specs.some((s) => s.grid);

  if (!specs.length) {
    return {
      layout: { ...DEFAULT_LAYOUT },
      blocks: [{ id: newBlockId(), type: 'prose', label: 'Description', content: '', grid: stackGrid(0) }],
    };
  }

  const layout = { ...DEFAULT_LAYOUT, ...(template.layout || {}) };

  if (!hasLayout) {
    const blocks = specs.map((spec, index) => {
      const type = spec.type || spec;
      const block = {
        id: newBlockId(),
        type,
        label: defaultLabel(type),
        grid: stackGrid(index, 12, type === 'image' ? 3 : 2),
      };
      if (type === 'prose') block.content = '';
      if (type === 'image') {
        block.url = '';
        block.alt = '';
      }
      if (type === 'diagram') block.content = DEFAULT_DIAGRAM;
      return block;
    });
    return { layout, blocks };
  }

  const blocks = specs.map((spec, index) => {
    const block = {
      id: newBlockId(),
      type: spec.type,
      label: spec.label || defaultLabel(spec.type, template.runeFields?.find((f) => f.id === spec.runeId)),
      grid: spec.grid ? { ...spec.grid } : stackGrid(index, spec.colSpan || 12, spec.rowSpan || 2),
    };
    if (spec.runeId) block.runeId = spec.runeId;
    if (block.type === 'prose') block.content = '';
    if (block.type === 'image') {
      block.url = '';
      block.alt = '';
    }
    if (block.type === 'diagram') block.content = DEFAULT_DIAGRAM;
    return block;
  });
  return { layout, blocks };
}

function mergePageBlocksFromTemplate(pageBlocks, templateSpecs, template) {
  const used = new Set();
  return (templateSpecs || []).map((spec, index) => {
    let existing = (pageBlocks || []).find(
      (b) =>
        !used.has(b.id) &&
        ((spec.runeId && b.runeId === spec.runeId) ||
          (b.type === spec.type && spec.label && b.label === spec.label)),
    );
    if (!existing) {
      existing = (pageBlocks || []).find((b) => !used.has(b.id) && b.type === spec.type);
    }
    if (existing) used.add(existing.id);

    const runeField = template?.runeFields?.find((f) => f.id === spec.runeId);
    const block = {
      id: existing?.id || newBlockId(),
      type: spec.type,
      label: spec.label || defaultLabel(spec.type, runeField),
      grid: spec.grid ? { ...spec.grid } : existing?.grid || stackGrid(index),
    };
    if (spec.runeId) block.runeId = spec.runeId;
    if (block.type === 'prose') block.content = existing?.content ?? '';
    if (block.type === 'image') {
      block.url = existing?.url ?? '';
      block.alt = existing?.alt ?? '';
    }
    if (block.type === 'diagram') block.content = existing?.content ?? DEFAULT_DIAGRAM;
    return block;
  });
}

function buildCanonPageDoc(spec, worldId, ownerWallet, parentId, order, now) {
  const blocks = [proseBlock(spec.content, `b-${spec.pageKey.replace(/\//g, '-')}`)];
  return {
    worldId,
    pageKey: spec.pageKey,
    parentId,
    templateId: spec.templateId || 'default',
    title: spec.title,
    blocks,
    layout: LAYOUT,
    runes: spec.runes || {},
    tags: spec.tags || [{ label: 'canon', color: 'purple' }],
    mirrorLinks: [],
    crossLinks: [],
    frame: null,
    order,
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

function buildCharacterPageDoc(spec, worldId, ownerWallet, parentId, order, now, templates) {
  const templateId = spec.templateId || 'default';
  const template = (templates || []).find((t) => t.id === templateId) || (templates || []).find((t) => t.id === 'default');
  const { layout, blocks: templateBlocks } = blocksFromTemplate(template);
  const proseHtml = proseToHtml(spec.content || '');
  const seedBlocks = [{ type: 'prose', label: 'Description', content: proseHtml }];
  const blocks = mergePageBlocksFromTemplate(seedBlocks, template?.blocks || [{ type: 'prose' }], template);

  const characterTag = { label: 'character', color: 'purple' };
  const extraTags = (spec.tags || []).filter((t) => t.label !== 'character');
  const tags = [characterTag, ...extraTags];

  return {
    worldId,
    pageKey: spec.pageKey,
    parentId,
    templateId,
    title: spec.title,
    blocks,
    layout: template?.layout ? { ...DEFAULT_LAYOUT, ...template.layout } : layout,
    runes: spec.runes || {},
    tags,
    mirrorLinks: [],
    crossLinks: [],
    frame: null,
    order,
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

function buildCharacterStubDoc(stub, title, worldId, ownerWallet, parentId, order, now) {
  const content = `Canonical profile for ${title}. See the Characters roster for the full entry.`;
  return buildCanonPageDoc(
    {
      pageKey: stub.pageKey,
      title,
      templateId: 'default',
      tags: [{ label: 'character-stub', color: 'cyan' }],
      content,
    },
    worldId,
    ownerWallet,
    parentId,
    order,
    now,
  );
}

module.exports = {
  LAYOUT,
  proseBlock,
  buildCanonPageDoc,
  buildCharacterPageDoc,
  buildCharacterStubDoc,
};
