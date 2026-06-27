/** Shared field-level patch application helpers. */

function applyHunkToPage(next, hunk, sourcePage) {
  const { path, after, action } = hunk;

  if (path === '_page') return;
  if (path === 'title') {
    next.title = after;
    return;
  }
  if (path === 'templateId') {
    next.templateId = after;
    return;
  }
  if (path === 'frame') {
    next.frame = after;
    return;
  }
  if (path === 'tags') {
    next.tags = after || [];
    return;
  }
  if (path.startsWith('runes.')) {
    const key = path.slice(6);
    if (after == null) delete next.runes[key];
    else next.runes[key] = after;
    return;
  }
  if (!path.startsWith('blocks.')) return;

  const parts = path.split('.');
  const blockId = parts[1];
  const field = parts[2];

  if (action === 'add' || (parts.length === 2 && action === 'add')) {
    const sourceBlock = (sourcePage?.blocks || []).find((b) => b.id === blockId);
    if (sourceBlock) {
      next.blocks = [...(next.blocks || []), JSON.parse(JSON.stringify(sourceBlock))];
    }
    return;
  }

  if (action === 'remove' || (parts.length === 2 && hunk.before != null && after == null)) {
    next.blocks = (next.blocks || []).filter((b) => b.id !== blockId);
    return;
  }

  const blockIdx = (next.blocks || []).findIndex((b) => b.id === blockId);
  if (blockIdx < 0) {
    const sourceBlock = (sourcePage?.blocks || []).find((b) => b.id === blockId);
    if (sourceBlock) {
      next.blocks = [...(next.blocks || []), JSON.parse(JSON.stringify(sourceBlock))];
    } else {
      return;
    }
  }

  const idx = (next.blocks || []).findIndex((b) => b.id === blockId);
  if (idx < 0) return;

  const block = { ...next.blocks[idx] };
  if (field === 'grid') block.grid = after;
  else if (field) block[field] = after;
  next.blocks[idx] = block;
}

function buildParentKeyMap(snapshot) {
  const byId = new Map((snapshot?.pages || []).map((p) => [p.id, p]));
  const map = new Map();
  for (const page of snapshot?.pages || []) {
    if (!page.parentId) continue;
    const parent = byId.get(page.parentId);
    if (parent?.pageKey) map.set(page.pageKey, parent.pageKey);
  }
  return map;
}

function pageDocFromSnapshot(sourcePage, worldId, ownerWallet, parentId, now) {
  return {
    worldId,
    pageKey: sourcePage.pageKey,
    parentId: parentId || null,
    templateId: sourcePage.templateId || 'default',
    title: sourcePage.title,
    blocks: JSON.parse(JSON.stringify(sourcePage.blocks || [])),
    layout: sourcePage.layout ? JSON.parse(JSON.stringify(sourcePage.layout)) : null,
    runes: JSON.parse(JSON.stringify(sourcePage.runes || {})),
    tags: JSON.parse(JSON.stringify(sourcePage.tags || [])),
    mirrorLinks: [],
    crossLinks: JSON.parse(JSON.stringify(sourcePage.crossLinks || [])),
    frame: sourcePage.frame || null,
    order: sourcePage.order ?? 0,
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

function clonePageFields(pageDoc) {
  return {
    title: pageDoc.title,
    templateId: pageDoc.templateId,
    frame: pageDoc.frame,
    tags: [...(pageDoc.tags || [])],
    runes: { ...(pageDoc.runes || {}) },
    blocks: JSON.parse(JSON.stringify(pageDoc.blocks || [])),
    layout: pageDoc.layout ? JSON.parse(JSON.stringify(pageDoc.layout)) : null,
  };
}

module.exports = {
  applyHunkToPage,
  buildParentKeyMap,
  pageDocFromSnapshot,
  clonePageFields,
};
