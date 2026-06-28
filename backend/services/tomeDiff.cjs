/** Field-level diff between chronicle snapshots (by nodeKey). Session play fields excluded. */

function stableJson(value) {
  return JSON.stringify(value ?? null);
}

function eq(a, b) {
  return stableJson(a) === stableJson(b);
}

function nodesByKey(snapshot) {
  const map = new Map();
  for (const node of snapshot?.nodes || []) {
    if (node.nodeKey) map.set(node.nodeKey, node);
  }
  return map;
}

function getNodePathValue(node, path) {
  if (!node || !path) return undefined;
  if (path === 'title') return node.title;
  if (path === 'content') return node.content;
  if (path === 'type') return node.type;
  if (path === 'frame') return node.frame;
  if (path === 'choices') return node.choices;
  if (path === 'roles') return node.roles;
  if (path === 'crossLinks') return node.crossLinks;
  if (path === 'situational') return node.situational;
  if (path === 'order') return node.order;
  if (path === 'branchIndex') return node.branchIndex;
  if (path === 'parentKey') return node.parentKey;
  return undefined;
}

function pushHunk(hunks, hunk) {
  hunks.push(hunk);
}

function diffNode(base, source) {
  const hunks = [];
  const fields = ['title', 'content', 'type', 'frame', 'choices', 'roles', 'crossLinks', 'situational', 'order', 'branchIndex'];
  for (const field of fields) {
    const before = getNodePathValue(base, field);
    const after = getNodePathValue(source, field);
    if (eq(before, after)) continue;
    pushHunk(hunks, { path: field, kind: 'field', before, after });
  }
  return hunks;
}

function annotateConflicts(hunks, base, upstream) {
  return hunks.map((h) => {
    const upVal = getNodePathValue(upstream, h.path);
    if (!eq(upVal, h.before) && !eq(upVal, h.after)) {
      return { ...h, conflict: true, upstream: upVal };
    }
    return h;
  });
}

function computeProposalPatches({ baseSnapshot, sourceSnapshot, upstreamSnapshot }) {
  const baseNodes = nodesByKey(baseSnapshot);
  const sourceNodes = nodesByKey(sourceSnapshot);
  const upstreamNodes = nodesByKey(upstreamSnapshot || baseSnapshot);
  const allKeys = new Set([...baseNodes.keys(), ...sourceNodes.keys()]);

  const patches = [];
  for (const nodeKey of [...allKeys].sort()) {
    const base = baseNodes.get(nodeKey);
    const source = sourceNodes.get(nodeKey);
    const upstream = upstreamNodes.get(nodeKey);

    if (!base && source) {
      patches.push({
        nodeKey,
        nodeTitle: source.title,
        action: 'add',
        hunks: [{ path: '_node', kind: 'node', before: null, after: source.title, action: 'add' }],
      });
      continue;
    }
    if (base && !source) {
      patches.push({
        nodeKey,
        nodeTitle: base.title,
        action: 'delete',
        hunks: [{ path: '_node', kind: 'node', before: base.title, after: null, action: 'delete' }],
      });
      continue;
    }
    if (!base || !source) continue;

    const rawHunks = diffNode(base, source);
    if (!rawHunks.length) continue;

    patches.push({
      nodeKey,
      nodeTitle: source.title,
      action: 'modify',
      hunks: annotateConflicts(rawHunks, base, upstream || base),
    });
  }
  return patches;
}

function computePullPlan({ baseSnapshot, upstreamSnapshot, branchSnapshot }) {
  const baseNodes = nodesByKey(baseSnapshot);
  const upstreamNodes = nodesByKey(upstreamSnapshot);
  const branchNodes = nodesByKey(branchSnapshot);
  const allKeys = new Set([...baseNodes.keys(), ...upstreamNodes.keys(), ...branchNodes.keys()]);

  const autoApply = [];
  const conflicts = [];

  for (const nodeKey of [...allKeys].sort()) {
    const base = baseNodes.get(nodeKey);
    const upstream = upstreamNodes.get(nodeKey);
    const branch = branchNodes.get(nodeKey);

    if (!base && upstream) {
      if (!branch) {
        autoApply.push({
          nodeKey,
          nodeTitle: upstream.title,
          action: 'add',
          hunks: [{ path: '_node', kind: 'node', before: null, after: upstream.title, action: 'add' }],
        });
      } else {
        conflicts.push({
          nodeKey,
          nodeTitle: branch.title || upstream.title,
          path: '_node',
          kind: 'node',
          action: 'add',
          base: null,
          ours: branch.title,
          theirs: upstream.title,
        });
      }
      continue;
    }

    if (base && !upstream) {
      const branchMods = branch ? diffNode(base, branch) : [];
      if (!branch || branchMods.length === 0) {
        autoApply.push({
          nodeKey,
          nodeTitle: base.title,
          action: 'delete',
          hunks: [{ path: '_node', kind: 'node', before: base.title, after: null, action: 'delete' }],
        });
      } else {
        conflicts.push({
          nodeKey,
          nodeTitle: branch?.title || base.title,
          path: '_node',
          kind: 'node',
          action: 'delete',
          base: base.title,
          ours: branch.title,
          theirs: null,
        });
      }
      continue;
    }

    if (base && upstream && !branch) {
      conflicts.push({
        nodeKey,
        nodeTitle: upstream.title,
        path: '_node',
        kind: 'node',
        action: 'missing_local',
        base: base.title,
        ours: null,
        theirs: upstream.title,
      });
      continue;
    }

    if (!base || !upstream || !branch) continue;

    const upstreamHunks = diffNode(base, upstream);
    if (!upstreamHunks.length) continue;

    const autoHunks = [];
    for (const hunk of upstreamHunks) {
      const branchVal = getNodePathValue(branch, hunk.path);
      const baseVal = hunk.before;
      if (eq(branchVal, baseVal)) {
        autoHunks.push({ ...hunk });
      } else if (!eq(branchVal, hunk.after)) {
        conflicts.push({
          nodeKey,
          nodeTitle: branch.title,
          path: hunk.path,
          kind: hunk.kind || 'field',
          action: hunk.action,
          base: baseVal,
          ours: branchVal,
          theirs: hunk.after,
        });
      }
    }

    if (autoHunks.length) {
      autoApply.push({ nodeKey, nodeTitle: branch.title, action: 'modify', hunks: autoHunks });
    }
  }

  return { autoApply, conflicts };
}

function summarizeTomePatches(patches) {
  let nodesChanged = 0;
  let hunksCount = 0;
  let conflictCount = 0;
  for (const p of patches || []) {
    nodesChanged += 1;
    hunksCount += p.hunks?.length || 0;
    conflictCount += (p.hunks || []).filter((h) => h.conflict).length;
  }
  return { nodesChanged, hunksCount, conflictCount };
}

module.exports = {
  nodesByKey,
  computeProposalPatches,
  computePullPlan,
  summarizeTomePatches,
  getNodePathValue,
};
