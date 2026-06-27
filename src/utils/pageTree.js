/** Build nested page tree from flat API list (uses parentId). */

export function buildPageTree(pages) {
  const map = new Map();
  for (const p of pages) {
    map.set(p.id, { ...p, children: [] });
  }
  const roots = [];
  for (const p of pages) {
    const node = map.get(p.id);
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function flattenPageTree(nodes, depth = 0, out = []) {
  for (const n of nodes) {
    out.push({ ...n, depth, children: undefined });
    if (n.children?.length) flattenPageTree(n.children, depth + 1, out);
  }
  return out;
}

function sortByOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title);
}

/** True if `nodeId` is nested under `ancestorId`. */
export function isDescendant(pages, ancestorId, nodeId) {
  if (ancestorId === nodeId) return true;
  const childrenByParent = new Map();
  for (const p of pages) {
    if (!p.parentId) continue;
    if (!childrenByParent.has(p.parentId)) childrenByParent.set(p.parentId, []);
    childrenByParent.get(p.parentId).push(p.id);
  }
  const stack = [ancestorId];
  while (stack.length) {
    const id = stack.pop();
    for (const childId of childrenByParent.get(id) || []) {
      if (childId === nodeId) return true;
      stack.push(childId);
    }
  }
  return false;
}

/**
 * Compute parentId/order updates after a tree drag-drop.
 * position: 'before' | 'after' | 'inside'
 */
export function computeMoveUpdates(pages, draggedId, targetId, position) {
  if (!draggedId || !targetId || draggedId === targetId) return null;
  if (isDescendant(pages, draggedId, targetId)) return null;

  const target = pages.find((p) => p.id === targetId);
  if (!target) return null;

  let parentId;
  let orderedIds;

  if (position === 'inside') {
    parentId = targetId;
    orderedIds = pages
      .filter((p) => p.parentId === parentId && p.id !== draggedId)
      .sort(sortByOrder)
      .map((p) => p.id);
    orderedIds.push(draggedId);
  } else {
    parentId = target.parentId || null;
    const siblings = pages
      .filter((p) => (p.parentId || null) === parentId && p.id !== draggedId)
      .sort(sortByOrder);
    const idx = siblings.findIndex((p) => p.id === targetId);
    if (idx < 0) return null;
    const insertAt = position === 'before' ? idx : idx + 1;
    orderedIds = siblings.map((p) => p.id);
    orderedIds.splice(insertAt, 0, draggedId);
  }

  const dragged = pages.find((p) => p.id === draggedId);
  const oldParentId = dragged?.parentId || null;

  const updates = [];
  const seen = new Set();

  function pushUpdate(id, nextParentId, order) {
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    if ((page.parentId || null) === (nextParentId || null) && (page.order ?? 0) === order) return;
    if (seen.has(id)) {
      const i = updates.findIndex((u) => u.id === id);
      if (i >= 0) updates[i] = { id, parentId: nextParentId || null, order };
      return;
    }
    seen.add(id);
    updates.push({ id, parentId: nextParentId || null, order });
  }

  for (let order = 0; order < orderedIds.length; order++) {
    const id = orderedIds[order];
    const nextParent = id === draggedId ? parentId : parentId;
    pushUpdate(id, nextParent, order);
  }

  if (oldParentId !== parentId) {
    const oldSiblings = pages
      .filter((p) => (p.parentId || null) === oldParentId && p.id !== draggedId)
      .sort(sortByOrder);
    oldSiblings.forEach((p, order) => pushUpdate(p.id, oldParentId, order));
  }

  return updates.length ? updates : null;
}

/** Apply reorder updates to a flat page list (local optimistic merge). */
export function applyPageUpdates(pages, updates) {
  const patch = new Map(updates.map((u) => [u.id, u]));
  return pages.map((p) => {
    const u = patch.get(p.id);
    return u ? { ...p, parentId: u.parentId, order: u.order } : p;
  });
}
