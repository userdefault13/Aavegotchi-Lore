#!/usr/bin/env node
/**
 * Seed DAO canonical lore from the Gotchiverse Realm Litepaper v1.0.
 * Usage: node scripts/seed-canon-world.mjs
 *
 * Run after clear-db for a fresh canon:
 *   npm run db:reset
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { GOTCHIVERSE_LANDMARKS, buildLandmarkPins, landmarkPageMeta } from '../src/constants/gotchiverseLandmarks.js';
import { GOTCHI_TEMPLATES } from '../src/seed/gotchiTemplates.js';
import { getMapPreset } from '../src/constants/gotchiverseMaps.js';
import { mergeMapIntoDiagram } from '../src/utils/diagramGraph.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const require = createRequire(import.meta.url);
const { ObjectId } = require('mongodb');
const {
  connect,
  getLoreWorldsCollection,
  getLorePagesCollection,
  getRealmMapsCollection,
  getLoreDiagramsCollection,
} = require('../lib/mongodb.cjs');
const { createWorldCommit } = require('../backend/services/worldCommits.cjs');
const { CANON_PAGES, LANDMARK_BLURBS, buildCanonPageDoc } = require('./litepaper-canon-data.cjs');
const { NINE_AADEPTS_PAGES, NINE_AADEPTS_LANDMARK_BLURBS } = require('./nine-aadepts-canon-data.cjs');
const { AAVEGOTCHI_LORE_PAGES, AAVEGOTCHI_LORE_LANDMARK_BLURBS } = require('./aavegotchi-lore-canon-data.cjs');

const ALL_CANON_PAGES = [...CANON_PAGES, ...AAVEGOTCHI_LORE_PAGES, ...NINE_AADEPTS_PAGES];
const ALL_LANDMARK_BLURBS = { ...LANDMARK_BLURBS, ...AAVEGOTCHI_LORE_LANDMARK_BLURBS, ...NINE_AADEPTS_LANDMARK_BLURBS };

const CANON_SLUG = (process.env.CANON_SLUG || 'gotchiverse-canon').trim();
const CANON_TITLE = (process.env.CANON_TITLE || 'Gotchiverse Canon').trim();
const CANON_OWNER = (process.env.CANON_OWNER_WALLET || '0x0000000000000000000000000000000000000001').toLowerCase();

async function linkLandmarkPins(pagesColl, worldId, pins, pageByKey, ownerWallet, now) {
  const pageByTitle = new Map();
  for (const p of pageByKey.values()) {
    pageByTitle.set((p.title || '').trim().toLowerCase().replace(/^the\s+/, ''), p);
  }

  const nextPins = pins.map((p) => ({ ...p }));
  for (let i = 0; i < nextPins.length; i++) {
    const pin = nextPins[i];
    if (!pin.id?.startsWith('landmark-')) continue;
    const lmId = pin.id.replace('landmark-', '');
    const lm = GOTCHIVERSE_LANDMARKS.find((l) => l.id === lmId);
    const pageKey = `landmarks/${lmId}`;
    let page = pageByKey.get(pageKey);
    if (!page) {
      const norm = (pin.label || lm?.label || '').trim().toLowerCase().replace(/^the\s+/, '');
      page = pageByTitle.get(norm);
    }
    if (page) nextPins[i] = { ...pin, pageId: page._id.toString() };
  }
  return nextPins;
}

async function seedLandmarkPages(pagesColl, worldId, ownerWallet, now) {
  const pageByKey = new Map();
  let order = ALL_CANON_PAGES.length;

  for (const lm of GOTCHIVERSE_LANDMARKS) {
    const pageKey = `landmarks/${lm.id}`;
    const meta = landmarkPageMeta(lm);
    const blurb =
      ALL_LANDMARK_BLURBS[lm.id] ||
      `${lm.label} is a notable location on the Gotchiverse overview map (${meta.runes.zone} zone).`;
    const doc = buildCanonPageDoc(
      {
        pageKey,
        title: lm.label,
        templateId: meta.templateId,
        runes: meta.runes,
        tags: [{ label: 'landmark', color: 'cyan' }],
        content: blurb,
      },
      worldId,
      ownerWallet,
      null,
      order,
      now,
    );
    const result = await pagesColl.insertOne(doc);
    pageByKey.set(pageKey, { ...doc, _id: result.insertedId });
    order += 1;
  }

  return pageByKey;
}

async function main() {
  await connect();
  const worlds = await getLoreWorldsCollection();
  const pagesColl = await getLorePagesCollection();
  const mapsColl = await getRealmMapsCollection();
  const diagramsColl = await getLoreDiagramsCollection();
  const now = new Date();

  const existing = await worlds.findOne({ slug: CANON_SLUG });
  if (existing) {
    const wid = existing._id.toString();
    await diagramsColl.deleteMany({ worldId: wid });
    await mapsColl.deleteMany({ worldId: wid });
    await pagesColl.deleteMany({ worldId: wid });
    const { getLoreWorldCommitsCollection } = require('../lib/mongodb.cjs');
    await (await getLoreWorldCommitsCollection()).deleteMany({ worldId: wid });
    await worlds.deleteOne({ _id: existing._id });
    console.log(`Removed existing canon: ${CANON_SLUG}`);
  }

  const worldDoc = {
    title: CANON_TITLE,
    slug: CANON_SLUG,
    description: 'Canonical Gotchiverse lore — Litepaper, Aavegotchi Lore origins, and The Nine Aadepts screenplay — maintained by the DAO.',
    templateDefs: GOTCHI_TEMPLATES,
    linkedChronicleIds: [],
    tags: [{ label: 'canon', color: 'purple' }],
    visibility: 'canonical',
    forkOfWorldId: null,
    upstreamWorldId: null,
    baseCommitId: null,
    headCommitId: null,
    maintainers: [CANON_OWNER],
    ownerWallet: CANON_OWNER,
    createdAt: now,
    updatedAt: now,
  };
  const worldResult = await worlds.insertOne(worldDoc);
  const worldId = worldResult.insertedId.toString();
  console.log(`Created canon world: ${CANON_SLUG} (${worldId})`);

  const pageIdByKey = new Map();
  let order = 0;

  for (const spec of ALL_CANON_PAGES) {
    const parentId = spec.parentKey ? pageIdByKey.get(spec.parentKey)?.toString() || null : null;
    const doc = buildCanonPageDoc(spec, worldId, CANON_OWNER, parentId, order, now);
    const result = await pagesColl.insertOne(doc);
    pageIdByKey.set(spec.pageKey, result.insertedId);
    order += 1;
  }
  console.log(
    `Seeded ${CANON_PAGES.length} litepaper + ${AAVEGOTCHI_LORE_PAGES.length} Aavegotchi Lore + ${NINE_AADEPTS_PAGES.length} Nine Aadepts pages`,
  );

  await seedLandmarkPages(pagesColl, worldId, CANON_OWNER, now);
  console.log(`Seeded ${GOTCHIVERSE_LANDMARKS.length} landmark pages`);

  const allPages = await pagesColl.find({ worldId }).toArray();
  const pageByKey = new Map(allPages.filter((p) => p.pageKey).map((p) => [p.pageKey, p]));

  let pins = buildLandmarkPins();
  pins = await linkLandmarkPins(pagesColl, worldId, pins, pageByKey, CANON_OWNER, now);

  await mapsColl.insertOne({
    worldId,
    title: 'Gotchiverse',
    mapPreset: 'gotchiverse',
    imageUrl: '/images/maps/gotchiverse-overview.svg',
    mapWidth: 621,
    mapHeight: 602,
    pins,
    paths: [],
    situationalLayers: [],
    ownerWallet: CANON_OWNER,
    createdAt: now,
    updatedAt: now,
  });

  const citaadelPreset = getMapPreset('citaadel');
  await mapsColl.insertOne({
    worldId,
    title: 'The Citaadel',
    mapPreset: 'citaadel',
    imageUrl: citaadelPreset.backgrounds.dark,
    mapWidth: citaadelPreset.width,
    mapHeight: citaadelPreset.height,
    pins: [],
    paths: [],
    situationalLayers: [],
    ownerWallet: CANON_OWNER,
    createdAt: now,
    updatedAt: now,
  });
  console.log('Seeded Gotchiverse + Citaadel maps');

  const gotchiverseMap = await mapsColl.findOne({ worldId, title: 'Gotchiverse' });
  const { nodes, edges } = mergeMapIntoDiagram([], [], gotchiverseMap.pins || [], gotchiverseMap.paths || [], {
    width: 720,
    height: 480,
  });
  await diagramsColl.insertOne({
    worldId,
    title: 'Diplomacy',
    nodes,
    edges,
    viewport: null,
    ownerWallet: CANON_OWNER,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Seeded Diplomacy diagram (${nodes.length} nodes)`);

  const commit = await createWorldCommit({
    worldId,
    message: 'Genesis canon — Litepaper + Aavegotchi Lore + Nine Aadepts (Episodes 1–2)',
    authorWallet: CANON_OWNER,
    kind: 'fork_genesis',
  });
  console.log(`Genesis commit: ${commit.id}`);
  console.log(`Total pages: ${await pagesColl.countDocuments({ worldId })}`);
  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
