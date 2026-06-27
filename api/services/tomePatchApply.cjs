/** Apply governed field hunks to story nodes. */

function applyHunkToNode(next, hunk, sourceNode) {
  const { path, after, action } = hunk;
  if (path === '_node') return;
  if (path === 'title') {
    next.title = after;
    return;
  }
  if (path === 'content') {
    next.content = after;
    return;
  }
  if (path === 'type') {
    next.type = after;
    return;
  }
  if (path === 'frame') {
    next.frame = after;
    return;
  }
  if (path === 'choices') {
    next.choices = after || [];
    return;
  }
  if (path === 'roles') {
    next.roles = after || [];
    return;
  }
  if (path === 'crossLinks') {
    next.crossLinks = after || [];
    return;
  }
  if (path === 'situational') {
    next.situational = after || { visible: [], audible: [], discoverable: [] };
    return;
  }
  if (path === 'order') {
    next.order = after ?? 0;
    return;
  }
  if (path === 'branchIndex') {
    next.branchIndex = after ?? 0;
    return;
  }
}

function buildParentKeyMap(snapshot) {
  const byId = new Map((snapshot?.nodes || []).map((n) => [n.id, n]));
  const map = new Map();
  for (const node of snapshot?.nodes || []) {
    if (!node.parentId) continue;
    const parent = byId.get(node.parentId);
    if (parent?.nodeKey) map.set(node.nodeKey, parent.nodeKey);
  }
  return map;
}

function nodeDocFromSnapshot(sourceNode, chronicleId, ownerWallet, parentId, now) {
  return {
    chronicleId,
    nodeKey: sourceNode.nodeKey,
    parentId: parentId || null,
    type: sourceNode.type,
    title: sourceNode.title,
    content: sourceNode.content || '',
    status: 'pending',
    choices: JSON.parse(JSON.stringify(sourceNode.choices || [])),
    roles: JSON.parse(JSON.stringify(sourceNode.roles || [])),
    memoSheets: [],
    crossLinks: JSON.parse(JSON.stringify(sourceNode.crossLinks || [])),
    situational: JSON.parse(JSON.stringify(sourceNode.situational || { visible: [], audible: [], discoverable: [] })),
    branchIndex: sourceNode.branchIndex ?? 0,
    order: sourceNode.order ?? 0,
    frame: sourceNode.frame || null,
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

function cloneNodeFields(nodeDoc) {
  return {
    title: nodeDoc.title,
    type: nodeDoc.type,
    content: nodeDoc.content,
    frame: nodeDoc.frame,
    choices: [...(nodeDoc.choices || [])],
    roles: [...(nodeDoc.roles || [])],
    crossLinks: [...(nodeDoc.crossLinks || [])],
    situational: JSON.parse(JSON.stringify(nodeDoc.situational || {})),
    order: nodeDoc.order ?? 0,
    branchIndex: nodeDoc.branchIndex ?? 0,
  };
}

module.exports = {
  applyHunkToNode,
  buildParentKeyMap,
  nodeDocFromSnapshot,
  cloneNodeFields,
};
