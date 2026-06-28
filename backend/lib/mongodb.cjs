const { MongoClient } = require('mongodb');

let cached = global.__gotchi_lore_mongo__;
if (!cached) cached = global.__gotchi_lore_mongo__ = { client: null, promise: null };

const MONGO_DB_NAME = (process.env.MONGO_DB_NAME || 'gotchi-lore').trim();

async function connect() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) throw new Error('Missing MONGODB_URI — copy from env.example or AarcadeGh-t .env');
  if (cached.client) return cached.client;
  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri).then((client) => {
      cached.client = client;
      return client;
    });
  }
  return cached.promise;
}

async function getCollection(name) {
  const client = await connect();
  return client.db(MONGO_DB_NAME).collection(name);
}

async function getLoreWorldsCollection() {
  const coll = await getCollection('lore_worlds');
  await coll.createIndex({ ownerWallet: 1, updatedAt: -1 });
  await coll.createIndex({ slug: 1 }, { unique: true, sparse: true });
  return coll;
}

async function getLorePagesCollection() {
  const coll = await getCollection('lore_pages');
  await coll.createIndex({ worldId: 1, parentId: 1, order: 1 });
  await coll.createIndex({ worldId: 1, title: 'text', 'blocks.text': 'text' });
  return coll;
}

async function getTomeChroniclesCollection() {
  const coll = await getCollection('tome_chronicles');
  await coll.createIndex({ ownerWallet: 1, updatedAt: -1 });
  await coll.createIndex({ slug: 1 }, { unique: true, sparse: true });
  await coll.createIndex({ visibility: 1, updatedAt: -1 });
  await coll.createIndex({ upstreamChronicleId: 1, ownerWallet: 1 });
  await coll.createIndex({ linkedWorldBranchId: 1 }, { sparse: true });
  return coll;
}

async function getStoryNodesCollection() {
  const coll = await getCollection('story_nodes');
  await coll.createIndex({ chronicleId: 1, parentId: 1, order: 1 });
  return coll;
}

async function getTomeChronicleCommitsCollection() {
  const coll = await getCollection('tome_chronicle_commits');
  await coll.createIndex({ chronicleId: 1, createdAt: -1 });
  return coll;
}

async function getRealmMapsCollection() {
  const coll = await getCollection('realm_maps');
  await coll.createIndex({ worldId: 1 });
  return coll;
}

async function getSuiteAssetsCollection() {
  return getCollection('suite_assets');
}

async function getLoreInventoryCollection() {
  const coll = await getCollection('lore_inventory_links');
  await coll.createIndex({ worldId: 1, kind: 1 });
  await coll.createIndex({ pageId: 1 });
  return coll;
}

async function getLorePageRevisionsCollection() {
  const coll = await getCollection('lore_page_revisions');
  await coll.createIndex({ pageId: 1, createdAt: -1 });
  return coll;
}

async function getLoreDiagramsCollection() {
  const coll = await getCollection('lore_diagrams');
  await coll.createIndex({ worldId: 1, updatedAt: -1 });
  return coll;
}

async function getLoreWorldCommitsCollection() {
  const coll = await getCollection('lore_world_commits');
  await coll.createIndex({ worldId: 1, createdAt: -1 });
  return coll;
}

async function getLoreProposalsCollection() {
  const coll = await getCollection('lore_proposals');
  await coll.createIndex({ upstreamWorldId: 1, status: 1, updatedAt: -1 });
  await coll.createIndex({ sourceWorldId: 1, status: 1 });
  await coll.createIndex({ authorWallet: 1, updatedAt: -1 });
  return coll;
}

async function getLoreProposalCommentsCollection() {
  const coll = await getCollection('lore_proposal_comments');
  await coll.createIndex({ proposalId: 1, createdAt: 1 });
  return coll;
}

async function getLoreGovernanceEventsCollection() {
  const coll = await getCollection('lore_governance_events');
  await coll.createIndex({ proposalId: 1, createdAt: 1 });
  return coll;
}

async function ensureIndexes() {
  await getLoreWorldsCollection();
  await getLorePagesCollection();
  await getTomeChroniclesCollection();
  await getStoryNodesCollection();
  await getTomeChronicleCommitsCollection();
  await getRealmMapsCollection();
  await getLoreInventoryCollection();
  await getLorePageRevisionsCollection();
  await getLoreDiagramsCollection();
  await getLoreWorldCommitsCollection();
  await getLoreProposalsCollection();
  await getLoreProposalCommentsCollection();
  await getLoreGovernanceEventsCollection();
  const pages = await getLorePagesCollection();
  await pages.createIndex(
    { worldId: 1, pageKey: 1 },
    { unique: true, partialFilterExpression: { pageKey: { $type: 'string' } } },
  );
  const worlds = await getLoreWorldsCollection();
  await worlds.createIndex({ visibility: 1, updatedAt: -1 });
  await worlds.createIndex({ upstreamWorldId: 1, ownerWallet: 1 });
  const nodes = await getStoryNodesCollection();
  await nodes.createIndex(
    { chronicleId: 1, nodeKey: 1 },
    { unique: true, partialFilterExpression: { nodeKey: { $type: 'string' } } },
  );
}

module.exports = {
  connect,
  MONGO_DB_NAME,
  getLoreWorldsCollection,
  getLorePagesCollection,
  getTomeChroniclesCollection,
  getStoryNodesCollection,
  getTomeChronicleCommitsCollection,
  getRealmMapsCollection,
  getLoreInventoryCollection,
  getLorePageRevisionsCollection,
  getLoreDiagramsCollection,
  getLoreWorldCommitsCollection,
  getLoreProposalsCollection,
  getLoreProposalCommentsCollection,
  getLoreGovernanceEventsCollection,
  getSuiteAssetsCollection,
  ensureIndexes,
};
