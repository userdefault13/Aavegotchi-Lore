#!/usr/bin/env node
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import {
  GOTCHIVERSE_LANDMARKS,
  buildLandmarkPins,
  mergeLandmarkPins,
  landmarksChanged,
  landmarkPageMeta,
  normalizeLabel,
} from '../src/constants/gotchiverseLandmarks.js';
import { mergeMapIntoDiagram } from '../src/utils/diagramGraph.js';

const DEFAULT_DIAGRAM_TITLE = 'Diplomacy';

function isGotchiverseOverviewMap(map) {
  if (!map) return false;
  if (map.mapPreset === 'gotchiverse') return true;
  if (map.imageUrl?.includes('gotchiverse-overview')) return true;
  if (map.title === 'Gotchiverse' && map.mapPreset !== 'citaadel') return true;
  return false;
}

async function linkLandmarkPinsInDb(db, worldId, pins) {
  const pagesColl = db.collection('lore_pages');
  const existingPages = await pagesColl.find({ worldId }).toArray();
  const pageByTitle = new Map(existingPages.map((p) => [normalizeLabel(p.title), p]));
  const nextPins = pins.map((p) => ({ ...p }));
  let pagesCreated = 0;

  for (let i = 0; i < nextPins.length; i++) {
    const pin = nextPins[i];
    if (!pin.id?.startsWith('landmark-') || pin.pageId) continue;

    const lmId = pin.id.replace('landmark-', '');
    const lm = GOTCHIVERSE_LANDMARKS.find((l) => l.id === lmId);
    const title = pin.label || lm?.label || 'Location';

    let page = pageByTitle.get(normalizeLabel(title));
    if (!page) {
      const meta = landmarkPageMeta(lm);
      const now = new Date();
      const doc = {
        worldId,
        parentId: null,
        templateId: meta.templateId,
        title,
        blocks: [{ id: `b-${pin.id}`, type: 'prose', content: '' }],
        runes: meta.runes,
        tags: [],
        mirrorLinks: [],
        crossLinks: [],
        frame: null,
        order: existingPages.length + pagesCreated,
        createdAt: now,
        updatedAt: now,
      };
      const result = await pagesColl.insertOne(doc);
      page = { ...doc, _id: result.insertedId };
      pageByTitle.set(normalizeLabel(title), page);
      pagesCreated += 1;
    }

    nextPins[i] = { ...pin, pageId: page._id.toString() };
  }

  return { pins: nextPins, pagesCreated };
}

async function seedDiplomacyDiagram(db, worldId, map) {
  const coll = db.collection('lore_diagrams');
  let diagram = await coll.findOne({ worldId, title: DEFAULT_DIAGRAM_TITLE });
  const { nodes, edges } = mergeMapIntoDiagram(
    diagram?.nodes || [],
    diagram?.edges || [],
    map.pins || [],
    map.paths || [],
    { width: 720, height: 480 },
  );

  if (!nodes.length) return { created: false, updated: false, nodeCount: 0 };

  const now = new Date();
  if (!diagram) {
    await coll.insertOne({
      worldId,
      title: DEFAULT_DIAGRAM_TITLE,
      nodes,
      edges,
      viewport: null,
      ownerWallet: map.ownerWallet || '',
      createdAt: now,
      updatedAt: now,
    });
    return { created: true, updated: false, nodeCount: nodes.length, edgeCount: edges.length };
  }

  const sameNodes = nodes.length === (diagram.nodes?.length || 0);
  const sameEdges = edges.length === (diagram.edges?.length || 0);
  if (sameNodes && sameEdges && diagram.nodes?.length) {
    return { created: false, updated: false, nodeCount: nodes.length, edgeCount: edges.length };
  }

  await coll.updateOne({ _id: diagram._id }, { $set: { nodes, edges, updatedAt: now } });
  return { created: false, updated: true, nodeCount: nodes.length, edgeCount: edges.length };
}

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

const dbName = (process.env.MONGO_DB_NAME || 'gotchi-lore').trim();
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const coll = db.collection('realm_maps');
  const maps = await coll.find({}).toArray();
  const gotchiverseMaps = maps.filter(isGotchiverseOverviewMap);

  if (!gotchiverseMaps.length) {
    console.log('No Gotchiverse overview maps found.');
    process.exit(0);
  }

  let updated = 0;
  let totalPages = 0;
  let diagramsSeeded = 0;
  const seenWorldMaps = new Set();
  for (const map of gotchiverseMaps) {
    const worldKey = map.worldId;
    if (seenWorldMaps.has(worldKey)) {
      await coll.deleteOne({ _id: map._id });
      console.log(`  removed duplicate Gotchiverse map ${map._id} in world ${worldKey}`);
      continue;
    }
    seenWorldMaps.add(worldKey);

    let merged = mergeLandmarkPins(map.pins || []);
    const linked = await linkLandmarkPinsInDb(db, map.worldId, merged);
    merged = linked.pins;
    totalPages += linked.pagesCreated;

    const patch = {
      pins: merged,
      mapPreset: 'gotchiverse',
      mapWidth: 621,
      mapHeight: 602,
      imageUrl: map.imageUrl || '/images/maps/gotchiverse-overview.svg',
      updatedAt: new Date(),
    };
    const needsUpdate =
      landmarksChanged(map.pins || [], merged) ||
      map.mapPreset !== 'gotchiverse' ||
      map.mapWidth !== 621 ||
      map.mapHeight !== 602 ||
      linked.pagesCreated > 0;

    if (!needsUpdate) {
      console.log(`  skip ${map.title} (${map._id}) — already seeded`);
    } else {
      await coll.updateOne({ _id: map._id }, { $set: patch });
      const linkedCount = merged.filter((p) => p.pageId).length;
      console.log(`  ✓ ${map.title} (${map._id}) — ${merged.length} pins, ${linkedCount} linked to lore pages`);
      updated += 1;
    }

    const diagramResult = await seedDiplomacyDiagram(db, map.worldId, { ...map, pins: merged });
    if (diagramResult.created || diagramResult.updated) {
      console.log(
        `  ✓ ${DEFAULT_DIAGRAM_TITLE} diagram — ${diagramResult.nodeCount} nodes, ${diagramResult.edgeCount || 0} edges`,
      );
      diagramsSeeded += 1;
    }
  }

  console.log(
    `\nSeeded ${updated} map(s) with ${buildLandmarkPins().length} labeled locations (${totalPages} new lore pages).`,
  );
  if (diagramsSeeded) {
    console.log(`Seeded ${diagramsSeeded} diplomacy diagram(s) from map pins.`);
  } else if (gotchiverseMaps.length) {
    console.log('Diplomacy diagram(s) already up to date.');
  }
} finally {
  await client.close();
}
