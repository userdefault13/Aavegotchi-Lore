const { ObjectId } = require('mongodb');
const {
  getLoreWorldsCollection,
  getLorePagesCollection,
  getRealmMapsCollection,
  getLoreDiagramsCollection,
  getLoreInventoryCollection,
} = require('../lib/mongodb.cjs');

function serializePage(doc) {
  return {
    id: doc._id.toString(),
    pageKey: doc.pageKey,
    parentId: doc.parentId || null,
    templateId: doc.templateId || 'default',
    title: doc.title,
    blocks: doc.blocks || [],
    layout: doc.layout || null,
    runes: doc.runes || {},
    tags: doc.tags || [],
    mirrorLinks: doc.mirrorLinks || [],
    crossLinks: doc.crossLinks || [],
    frame: doc.frame || null,
    order: doc.order ?? 0,
  };
}

function serializeMap(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    mapPreset: doc.mapPreset || null,
    imageUrl: doc.imageUrl || '',
    mapWidth: doc.mapWidth,
    mapHeight: doc.mapHeight,
    pins: doc.pins || [],
    paths: doc.paths || [],
    situationalLayers: doc.situationalLayers || [],
  };
}

function serializeDiagram(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    nodes: doc.nodes || [],
    edges: doc.edges || [],
    viewport: doc.viewport || null,
  };
}

function serializeInventory(doc) {
  return {
    id: doc._id.toString(),
    pageId: doc.pageId || null,
    kind: doc.kind,
    tokenId: doc.tokenId || '',
    label: doc.label || '',
    imageUrl: doc.imageUrl || '',
    meta: doc.meta || {},
  };
}

function serializeWorldMeta(doc) {
  return {
    title: doc.title,
    slug: doc.slug,
    description: doc.description || '',
    templateDefs: doc.templateDefs || [],
    linkedChronicleIds: doc.linkedChronicleIds || [],
    tags: doc.tags || [],
    visibility: doc.visibility || 'private',
  };
}

async function loadFullWorldBundle(worldId) {
  if (!ObjectId.isValid(worldId)) return null;
  const wid = worldId.toString();
  const worlds = await getLoreWorldsCollection();
  const world = await worlds.findOne({ _id: new ObjectId(worldId) });
  if (!world) return null;

  const pages = await (await getLorePagesCollection()).find({ worldId: wid }).sort({ order: 1, title: 1 }).toArray();
  const maps = await (await getRealmMapsCollection()).find({ worldId: wid }).toArray();
  const diagrams = await (await getLoreDiagramsCollection()).find({ worldId: wid }).toArray();
  const inventory = await (await getLoreInventoryCollection()).find({ worldId: wid }).toArray();

  return { world, pages, maps, diagrams, inventory };
}

function buildSnapshot(bundle) {
  if (!bundle) return null;
  const { world, pages, maps, diagrams, inventory } = bundle;
  return {
    world: serializeWorldMeta(world),
    pages: pages.map(serializePage),
    maps: maps.map(serializeMap),
    diagrams: diagrams.map(serializeDiagram),
    inventory: inventory.map(serializeInventory),
  };
}

function collectAssetRefs(snapshot) {
  if (!snapshot) return [];
  const refs = new Set();
  const re = /\/uploads\/[A-Za-z0-9._-]+/g;
  const blob = JSON.stringify(snapshot);
  for (const match of blob.matchAll(re)) refs.add(match[0]);
  return [...refs].sort();
}

async function captureWorldSnapshot(worldId) {
  const bundle = await loadFullWorldBundle(worldId);
  if (!bundle) return null;
  return buildSnapshot(bundle);
}

module.exports = {
  loadFullWorldBundle,
  buildSnapshot,
  captureWorldSnapshot,
  collectAssetRefs,
  serializePage,
  serializeMap,
  serializeDiagram,
  serializeInventory,
  serializeWorldMeta,
};
