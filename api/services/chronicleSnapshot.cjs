const { ObjectId } = require('mongodb');
const { getTomeChroniclesCollection, getStoryNodesCollection } = require('../../lib/mongodb.cjs');

function serializeNode(doc) {
  return {
    id: doc._id.toString(),
    nodeKey: doc.nodeKey || null,
    parentId: doc.parentId || null,
    type: doc.type,
    title: doc.title,
    content: doc.content || '',
    choices: doc.choices || [],
    roles: doc.roles || [],
    crossLinks: doc.crossLinks || [],
    situational: doc.situational || { visible: [], audible: [], discoverable: [] },
    branchIndex: doc.branchIndex ?? 0,
    order: doc.order ?? 0,
    frame: doc.frame || null,
  };
}

function serializeChronicleMeta(doc) {
  return {
    title: doc.title,
    slug: doc.slug || null,
    description: doc.description || '',
    linkedWorldId: doc.linkedWorldId || null,
    linkedWorldBranchId: doc.linkedWorldBranchId || null,
    visibility: doc.visibility || 'private',
  };
}

async function loadFullChronicleBundle(chronicleId) {
  if (!ObjectId.isValid(chronicleId)) return null;
  const cid = chronicleId.toString();
  const chronicles = await getTomeChroniclesCollection();
  const chronicle = await chronicles.findOne({ _id: new ObjectId(chronicleId) });
  if (!chronicle) return null;
  const nodes = await (await getStoryNodesCollection()).find({ chronicleId: cid }).sort({ order: 1, branchIndex: 1 }).toArray();
  return { chronicle, nodes };
}

function buildChronicleSnapshot(bundle) {
  if (!bundle) return null;
  return {
    chronicle: serializeChronicleMeta(bundle.chronicle),
    nodes: bundle.nodes.map(serializeNode),
  };
}

async function captureChronicleSnapshot(chronicleId) {
  const bundle = await loadFullChronicleBundle(chronicleId);
  if (!bundle) return null;
  return buildChronicleSnapshot(bundle);
}

module.exports = {
  loadFullChronicleBundle,
  buildChronicleSnapshot,
  captureChronicleSnapshot,
  serializeNode,
  serializeChronicleMeta,
};
