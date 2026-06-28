const { ObjectId } = require('mongodb');
const {
  getLoreWorldsCollection,
  getLorePagesCollection,
  getRealmMapsCollection,
  getLoreDiagramsCollection,
  getLoreInventoryCollection,
} = require('../lib/mongodb.cjs');
const { loadFullWorldBundle } = require('./worldSnapshot.cjs');
const { createWorldCommit } = require('./worldCommits.cjs');
const { generatePageKey, uniquifyPageKey } = require('./pageKey.cjs');

function branchSlug(canonSlug, wallet) {
  return `${canonSlug}--${wallet.toLowerCase()}`.slice(0, 120);
}

const forkSlug = branchSlug;

function remapPageRefs(page, pageIdMap) {
  const next = { ...page };
  if (next.parentId && pageIdMap[next.parentId]) next.parentId = pageIdMap[next.parentId];
  if (next.crossLinks?.length) {
    next.crossLinks = next.crossLinks.map((link) => ({
      ...link,
      pageId: pageIdMap[link.pageId] || link.pageId,
    }));
  }
  if (next.mirrorLinks?.length) {
    next.mirrorLinks = next.mirrorLinks.map((link) => ({
      ...link,
      targetPageId: pageIdMap[link.targetPageId] || link.targetPageId,
    }));
  }
  return next;
}

function remapMapDoc(map, pageIdMap, worldId, ownerWallet, now) {
  const pins = (map.pins || []).map((pin) => ({
    ...pin,
    pageId: pin.pageId && pageIdMap[pin.pageId] ? pageIdMap[pin.pageId] : pin.pageId,
  }));
  return {
    worldId,
    title: map.title,
    mapPreset: map.mapPreset || null,
    imageUrl: map.imageUrl || '',
    mapWidth: map.mapWidth,
    mapHeight: map.mapHeight,
    pins,
    paths: map.paths || [],
    situationalLayers: map.situationalLayers || [],
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

function remapDiagramDoc(diagram, pageIdMap, worldId, ownerWallet, now) {
  const nodes = (diagram.nodes || []).map((node) => ({
    ...node,
    pageId: node.pageId && pageIdMap[node.pageId] ? pageIdMap[node.pageId] : node.pageId,
  }));
  return {
    worldId,
    title: diagram.title,
    nodes,
    edges: diagram.edges || [],
    viewport: diagram.viewport || null,
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

function remapInventoryDoc(item, pageIdMap, worldId, ownerWallet, now) {
  return {
    worldId,
    pageId: item.pageId && pageIdMap[item.pageId] ? pageIdMap[item.pageId] : item.pageId,
    kind: item.kind,
    tokenId: item.tokenId || '',
    label: item.label || '',
    imageUrl: item.imageUrl || '',
    meta: item.meta || {},
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

async function forkWorld(sourceWorldId, ownerWallet) {
  const bundle = await loadFullWorldBundle(sourceWorldId);
  if (!bundle) throw new Error('Source world not found');
  const { world: source } = bundle;

  if (source.visibility !== 'canonical' && source.visibility !== 'public') {
    throw new Error('Only canonical or public worlds can be branched');
  }

  await assignMissingPageKeys(source._id.toString());
  const freshBundle = await loadFullWorldBundle(sourceWorldId);
  const pages = freshBundle.pages;
  const maps = freshBundle.maps;
  const diagrams = freshBundle.diagrams;
  const inventory = freshBundle.inventory;

  const worlds = await getLoreWorldsCollection();
  const slug = branchSlug(source.slug, ownerWallet);

  const existing = await worlds.findOne({ slug });
  if (existing) {
    return {
      world: existing,
      reused: true,
      worldId: existing._id.toString(),
      pairedChronicle: null,
    };
  }

  const now = new Date();
  let baseCommitId = source.headCommitId || null;
  if (!baseCommitId) {
    const genesis = await createWorldCommit({
      worldId: source._id.toString(),
      message: 'Genesis snapshot',
      authorWallet: source.ownerWallet,
    });
    baseCommitId = genesis.id;
  }

  const branchDoc = {
    title: `${source.title} (${shortWallet(ownerWallet)})`,
    slug,
    description: source.description || '',
    templateDefs: source.templateDefs || [],
    linkedChronicleIds: [],
    tags: [...(source.tags || [])],
    visibility: 'private',
    forkOfWorldId: source._id.toString(),
    upstreamWorldId: source._id.toString(),
    baseCommitId,
    headCommitId: null,
    maintainers: [],
    ownerWallet: ownerWallet.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  const worldResult = await worlds.insertOne(branchDoc);
  const newWorldId = worldResult.insertedId.toString();

  const pageIdMap = {};
  const pagesColl = await getLorePagesCollection();
  const pageDocs = [];

  for (const page of pages) {
    const newId = new ObjectId();
    pageIdMap[page._id.toString()] = newId.toString();
    pageDocs.push({ old: page, newId });
  }

  for (const { old, newId } of pageDocs) {
    const remapped = remapPageRefs(old, pageIdMap);
    await pagesColl.insertOne({
      _id: newId,
      worldId: newWorldId,
      pageKey: old.pageKey,
      parentId: remapped.parentId,
      templateId: remapped.templateId || 'default',
      title: remapped.title,
      blocks: remapped.blocks || [],
      layout: remapped.layout || null,
      runes: remapped.runes || {},
      tags: remapped.tags || [],
      mirrorLinks: remapped.mirrorLinks || [],
      crossLinks: remapped.crossLinks || [],
      frame: remapped.frame || null,
      order: remapped.order ?? 0,
      ownerWallet: ownerWallet.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    });
  }

  const mapsColl = await getRealmMapsCollection();
  for (const map of maps) {
    await mapsColl.insertOne(remapMapDoc(map, pageIdMap, newWorldId, ownerWallet, now));
  }

  const diagramsColl = await getLoreDiagramsCollection();
  for (const diagram of diagrams) {
    await diagramsColl.insertOne(remapDiagramDoc(diagram, pageIdMap, newWorldId, ownerWallet, now));
  }

  const invColl = await getLoreInventoryCollection();
  for (const item of inventory) {
    await invColl.insertOne(remapInventoryDoc(item, pageIdMap, newWorldId, ownerWallet, now));
  }

  const branchCommit = await createWorldCommit({
    worldId: newWorldId,
    parentCommitId: baseCommitId,
    message: `Branch from ${source.slug}`,
    authorWallet: ownerWallet.toLowerCase(),
  });

  await worlds.updateOne(
    { _id: worldResult.insertedId },
    { $set: { baseCommitId, headCommitId: branchCommit.id, updatedAt: now } },
  );

  const created = await worlds.findOne({ _id: worldResult.insertedId });

  let pairedChronicle = null;
  const linkedChronicleId = source.linkedChronicleIds?.[0];
  if (linkedChronicleId) {
    try {
      const { forkChronicle } = require('./chronicleClone.cjs');
      const chronicleResult = await forkChronicle(linkedChronicleId, ownerWallet, {
        linkedWorldBranchId: newWorldId,
      });
      pairedChronicle = {
        id: chronicleResult.chronicleId,
        reused: chronicleResult.reused,
      };
    } catch (err) {
      console.error('Paired chronicle branch failed:', err.message);
    }
  }

  return {
    world: created,
    reused: false,
    worldId: newWorldId,
    baseCommitId,
    headCommitId: branchCommit.id,
    pageIdMap,
    pairedChronicle,
  };
}

function shortWallet(wallet) {
  const w = (wallet || '').toLowerCase();
  if (w.length < 12) return w;
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

async function assignMissingPageKeys(worldId) {
  const pagesColl = await getLorePagesCollection();
  const pages = await pagesColl.find({ worldId: worldId.toString() }).sort({ order: 1, title: 1 }).toArray();
  const used = new Set(pages.filter((p) => p.pageKey).map((p) => p.pageKey));
  const byId = new Map(pages.map((p) => [p._id.toString(), p]));

  async function keyFor(page) {
    if (page.pageKey) return page.pageKey;
    const parent = page.parentId ? byId.get(page.parentId) : null;
    const parentKey = parent ? await keyFor(parent) : null;
    const base = generatePageKey(page.title, parentKey);
    const finalKey = uniquifyPageKey(base, used);
    used.add(finalKey);
    await pagesColl.updateOne({ _id: page._id }, { $set: { pageKey: finalKey } });
    page.pageKey = finalKey;
    return finalKey;
  }

  for (const page of pages) await keyFor(page);
  return pages.length;
}

module.exports = {
  forkWorld,
  branchWorld: forkWorld,
  forkSlug,
  branchSlug,
  assignMissingPageKeys,
};
