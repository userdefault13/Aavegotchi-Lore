const { ObjectId } = require('mongodb');
const { getTomeChroniclesCollection, getStoryNodesCollection } = require('../../lib/mongodb.cjs');
const { loadFullChronicleBundle } = require('./chronicleSnapshot.cjs');
const { createChronicleCommit } = require('./chronicleCommits.cjs');
const { generateNodeKey, uniquifyNodeKey } = require('./nodeKey.cjs');

function branchSlug(canonSlug, wallet) {
  return `${canonSlug}--${wallet.toLowerCase()}`.slice(0, 120);
}

function shortWallet(wallet) {
  const w = (wallet || '').toLowerCase();
  if (w.length < 12) return w;
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function remapNodeRefs(node, nodeIdMap) {
  const next = { ...node };
  if (next.parentId && nodeIdMap[next.parentId]) next.parentId = nodeIdMap[next.parentId];
  return next;
}

async function assignMissingNodeKeys(chronicleId) {
  const nodesColl = await getStoryNodesCollection();
  const nodes = await nodesColl.find({ chronicleId: chronicleId.toString() }).sort({ order: 1, title: 1 }).toArray();
  const used = new Set(nodes.filter((n) => n.nodeKey).map((n) => n.nodeKey));
  const byId = new Map(nodes.map((n) => [n._id.toString(), n]));

  async function keyFor(node) {
    if (node.nodeKey) return node.nodeKey;
    const parent = node.parentId ? byId.get(node.parentId) : null;
    const parentKey = parent ? await keyFor(parent) : null;
    const base = generateNodeKey(node.title, parentKey);
    const finalKey = uniquifyNodeKey(base, used);
    used.add(finalKey);
    await nodesColl.updateOne({ _id: node._id }, { $set: { nodeKey: finalKey } });
    node.nodeKey = finalKey;
    return finalKey;
  }

  for (const node of nodes) await keyFor(node);
  return nodes.length;
}

async function forkChronicle(sourceChronicleId, ownerWallet, { linkedWorldBranchId = null } = {}) {
  const bundle = await loadFullChronicleBundle(sourceChronicleId);
  if (!bundle) throw new Error('Source chronicle not found');
  const { chronicle: source } = bundle;

  if (source.visibility !== 'canonical' && source.visibility !== 'public') {
    throw new Error('Only canonical or public chronicles can be branched');
  }

  await assignMissingNodeKeys(source._id.toString());
  const freshBundle = await loadFullChronicleBundle(sourceChronicleId);
  const nodes = freshBundle.nodes;

  const chronicles = await getTomeChroniclesCollection();
  const slug = branchSlug(source.slug || `chronicle-${source._id}`, ownerWallet);

  const existing = await chronicles.findOne({ slug });
  if (existing) {
    if (linkedWorldBranchId && !existing.linkedWorldBranchId) {
      await chronicles.updateOne(
        { _id: existing._id },
        { $set: { linkedWorldBranchId: linkedWorldBranchId.toString(), updatedAt: new Date() } },
      );
    }
    return { chronicle: await chronicles.findOne({ _id: existing._id }), reused: true, chronicleId: existing._id.toString() };
  }

  const now = new Date();
  let baseCommitId = source.headCommitId || null;
  if (!baseCommitId) {
    const genesis = await createChronicleCommit({
      chronicleId: source._id.toString(),
      message: 'Genesis snapshot',
      authorWallet: source.ownerWallet,
      kind: 'fork_genesis',
    });
    baseCommitId = genesis.id;
  }

  const branchDoc = {
    title: `${source.title} (${shortWallet(ownerWallet)})`,
    slug,
    description: source.description || '',
    linkedWorldId: source.linkedWorldId || null,
    linkedWorldBranchId: linkedWorldBranchId ? linkedWorldBranchId.toString() : null,
    toolboard: { widgets: [] },
    visibility: 'private',
    forkOfChronicleId: source._id.toString(),
    upstreamChronicleId: source._id.toString(),
    baseCommitId,
    headCommitId: null,
    maintainers: [],
    ownerWallet: ownerWallet.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  const chronicleResult = await chronicles.insertOne(branchDoc);
  const newChronicleId = chronicleResult.insertedId.toString();

  const nodeIdMap = {};
  const nodesColl = await getStoryNodesCollection();
  const nodeDocs = [];

  for (const node of nodes) {
    const newId = new ObjectId();
    nodeIdMap[node._id.toString()] = newId.toString();
    nodeDocs.push({ old: node, newId });
  }

  for (const { old, newId } of nodeDocs) {
    const remapped = remapNodeRefs(old, nodeIdMap);
    await nodesColl.insertOne({
      _id: newId,
      chronicleId: newChronicleId,
      nodeKey: old.nodeKey,
      parentId: remapped.parentId,
      type: remapped.type,
      title: remapped.title,
      content: remapped.content || '',
      status: 'pending',
      choices: remapped.choices || [],
      roles: remapped.roles || [],
      memoSheets: [],
      crossLinks: remapped.crossLinks || [],
      situational: remapped.situational || { visible: [], audible: [], discoverable: [] },
      branchIndex: remapped.branchIndex ?? 0,
      order: remapped.order ?? 0,
      frame: remapped.frame || null,
      ownerWallet: ownerWallet.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    });
  }

  const branchCommit = await createChronicleCommit({
    chronicleId: newChronicleId,
    parentCommitId: baseCommitId,
    message: `Branch from ${source.slug || sourceChronicleId}`,
    authorWallet: ownerWallet.toLowerCase(),
    kind: 'fork_genesis',
  });

  await chronicles.updateOne(
    { _id: chronicleResult.insertedId },
    { $set: { baseCommitId, headCommitId: branchCommit.id, updatedAt: now } },
  );

  const created = await chronicles.findOne({ _id: chronicleResult.insertedId });
  return {
    chronicle: created,
    reused: false,
    chronicleId: newChronicleId,
    baseCommitId,
    headCommitId: branchCommit.id,
    nodeIdMap,
  };
}

module.exports = {
  forkChronicle,
  branchSlug,
  assignMissingNodeKeys,
  shortWallet,
};
