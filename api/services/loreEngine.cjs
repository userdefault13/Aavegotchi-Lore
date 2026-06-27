/**
 * Mirror automation engine — sync page fields to linked targets on save.
 */
const { ObjectId } = require('mongodb');

function normalizeMirrorLink(link) {
  const sync = link.sync || {};
  return {
    targetPageId: link.targetPageId,
    title: sync.title === true,
    runes: [...(link.fields || []), ...(sync.runes || [])].filter((v, i, a) => a.indexOf(v) === i),
    blocks: sync.blocks || [],
  };
}

function findBlockByLabel(blocks, label) {
  if (!label) return null;
  return (blocks || []).find((b) => b.label === label) || null;
}

function copyBlockContent(sourceBlock, targetBlock) {
  if (!sourceBlock || !targetBlock) return targetBlock;
  const next = { ...targetBlock };
  if (sourceBlock.content !== undefined) next.content = sourceBlock.content;
  if (sourceBlock.url !== undefined) next.url = sourceBlock.url;
  if (sourceBlock.alt !== undefined) next.alt = sourceBlock.alt;
  return next;
}

async function applyMirrorLinks(coll, sourceDoc) {
  if (!sourceDoc.mirrorLinks?.length) return { synced: [] };

  const synced = [];

  for (const link of sourceDoc.mirrorLinks) {
    if (!ObjectId.isValid(link.targetPageId)) continue;
    const target = await coll.findOne({ _id: new ObjectId(link.targetPageId) });
    if (!target) continue;

    const spec = normalizeMirrorLink(link);
    const patch = {};
    const syncedParts = [];

    if (spec.title && sourceDoc.title && target.title !== sourceDoc.title) {
      patch.title = sourceDoc.title;
      syncedParts.push('title');
    }

    if (spec.runes.length) {
      const runes = { ...(target.runes || {}) };
      let runesChanged = false;
      for (const field of spec.runes) {
        if (sourceDoc.runes?.[field] === undefined) continue;
        if (runes[field] !== sourceDoc.runes[field]) {
          runes[field] = sourceDoc.runes[field];
          syncedParts.push(`rune:${field}`);
          runesChanged = true;
        }
      }
      if (runesChanged) patch.runes = runes;
    }

    if (spec.blocks.length) {
      let blocks = [...(target.blocks || [])];
      let blocksChanged = false;
      for (const mapping of spec.blocks) {
        const src = findBlockByLabel(sourceDoc.blocks, mapping.sourceLabel);
        const tgtIdx = blocks.findIndex((b) => b.label === mapping.targetLabel);
        if (!src || tgtIdx < 0) continue;
        const merged = copyBlockContent(src, blocks[tgtIdx]);
        if (JSON.stringify(merged) !== JSON.stringify(blocks[tgtIdx])) {
          blocks[tgtIdx] = merged;
          blocksChanged = true;
          syncedParts.push(`block:${mapping.targetLabel}`);
        }
      }
      if (blocksChanged) patch.blocks = blocks;
    }

    if (!syncedParts.length) continue;

    patch.updatedAt = new Date();
    await coll.updateOne({ _id: target._id }, { $set: patch });
    synced.push({
      pageId: target._id.toString(),
      title: patch.title || target.title,
      parts: syncedParts,
    });
  }

  return { synced };
}

function mergePageBlocksFromTemplate(pageBlocks, templateSpecs) {
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

    const block = {
      id: existing?.id || `b${index}-${Date.now()}`,
      type: spec.type,
      label: spec.label || spec.type,
      grid: spec.grid ? { ...spec.grid } : existing?.grid,
    };
    if (spec.runeId) block.runeId = spec.runeId;
    if (block.type === 'prose') block.content = existing?.content ?? '';
    if (block.type === 'image') {
      block.url = existing?.url ?? '';
      block.alt = existing?.alt ?? '';
    }
    if (block.type === 'diagram') block.content = existing?.content ?? 'graph TD\n  A --> B';
    return block;
  });
}

function blocksFromLegacyOrder(pageBlocks, blockOrder) {
  return (blockOrder || []).map((type, i) => {
    const existing = pageBlocks?.find((b) => b.type === type);
    return existing || { id: `b${i}`, type, content: type === 'prose' ? '' : null };
  });
}

async function propagateTemplateChange(coll, worldId, templateId, templateSpec) {
  const filter = { worldId, templateId };
  const pages = await coll.find(filter).toArray();
  let count = 0;

  const layout = templateSpec?.layout || null;
  const blockSpecs = templateSpec?.blocks || null;
  const blockOrder = Array.isArray(templateSpec) ? templateSpec : templateSpec?.blockOrder;

  for (const page of pages) {
    let blocks;
    if (blockSpecs?.length) {
      blocks = mergePageBlocksFromTemplate(page.blocks, blockSpecs);
    } else if (blockOrder?.length) {
      blocks = blocksFromLegacyOrder(page.blocks, blockOrder);
    } else {
      continue;
    }

    const patch = { blocks, updatedAt: new Date() };
    if (layout) patch.layout = layout;
    await coll.updateOne({ _id: page._id }, { $set: patch });
    count += 1;
  }
  return count;
}

async function listMirrorGraph(coll, worldId, pageId) {
  const pages = await coll.find({ worldId }).project({ title: 1, mirrorLinks: 1 }).toArray();
  const current = pages.find((p) => p._id.toString() === pageId);
  const outgoing = (current?.mirrorLinks || []).map((link) => ({
    ...link,
    targetTitle: pages.find((p) => p._id.toString() === link.targetPageId)?.title,
  }));

  const incoming = [];
  for (const source of pages) {
    if (source._id.toString() === pageId) continue;
    for (const link of source.mirrorLinks || []) {
      if (link.targetPageId !== pageId) continue;
      incoming.push({
        sourcePageId: source._id.toString(),
        sourceTitle: source.title,
        link,
      });
    }
  }

  return { outgoing, incoming };
}

module.exports = {
  applyMirrorLinks,
  propagateTemplateChange,
  mergePageBlocksFromTemplate,
  listMirrorGraph,
};
