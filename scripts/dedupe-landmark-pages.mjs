#!/usr/bin/env node
/**
 * Remove duplicate lore pages (same title within a world) and fix map pin links.
 * Usage: node scripts/dedupe-landmark-pages.mjs [worldIdOrSlug]
 */
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { normalizeLabel } from '../src/constants/gotchiverseLandmarks.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const dbName = (process.env.MONGO_DB_NAME || 'gotchi-lore').trim();
const target = process.argv[2]?.trim();

function scorePage(page) {
  let score = 0;
  if (page.pageKey) score += 10;
  const content = JSON.stringify(page.blocks || page.runes || '');
  if (content.length > 80) score += 5;
  if (page.updatedAt) score += 1;
  return score;
}

function pickKeeper(pages) {
  return [...pages].sort((a, b) => {
    const ds = scorePage(b) - scorePage(a);
    if (ds !== 0) return ds;
    return (a.createdAt || 0) - (b.createdAt || 0);
  })[0];
}

async function dedupeWorld(db, world) {
  const worldId = world._id.toString();
  const pagesColl = db.collection('lore_pages');
  const mapsColl = db.collection('realm_maps');
  const diagramsColl = db.collection('lore_diagrams');
  const invColl = db.collection('lore_inventory_links');

  const pages = await pagesColl.find({ worldId }).toArray();
  const byTitle = new Map();
  for (const p of pages) {
    const key = normalizeLabel(p.title);
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key).push(p);
  }

  const remap = new Map();
  let removed = 0;

  for (const [, group] of byTitle) {
    if (group.length < 2) continue;
    const keeper = pickKeeper(group);
    const keeperId = keeper._id.toString();
    for (const p of group) {
      const id = p._id.toString();
      if (id !== keeperId) remap.set(id, keeperId);
    }
  }

  if (!remap.size) {
    console.log(`  ${world.slug || worldId}: no duplicate titles`);
    return { removed: 0, mapsMerged: 0 };
  }

  const maps = await mapsColl.find({ worldId }).toArray();
  for (const map of maps) {
    let pinsChanged = false;
    const pins = (map.pins || []).map((pin) => {
      if (pin.pageId && remap.has(pin.pageId)) {
        pinsChanged = true;
        return { ...pin, pageId: remap.get(pin.pageId) };
      }
      return pin;
    });
    if (pinsChanged) {
      await mapsColl.updateOne({ _id: map._id }, { $set: { pins, updatedAt: new Date() } });
    }
  }

  const diagrams = await diagramsColl.find({ worldId }).toArray();
  for (const diagram of diagrams) {
    let changed = false;
    const nodes = (diagram.nodes || []).map((node) => {
      if (node.pageId && remap.has(node.pageId)) {
        changed = true;
        return { ...node, pageId: remap.get(node.pageId) };
      }
      return node;
    });
    if (changed) {
      await diagramsColl.updateOne({ _id: diagram._id }, { $set: { nodes, updatedAt: new Date() } });
    }
  }

  for (const page of pages) {
    let patch = null;
    if (page.crossLinks?.length) {
      const crossLinks = page.crossLinks.map((l) =>
        l.pageId && remap.has(l.pageId) ? { ...l, pageId: remap.get(l.pageId) } : l,
      );
      if (JSON.stringify(crossLinks) !== JSON.stringify(page.crossLinks)) {
        patch = { ...(patch || {}), crossLinks };
      }
    }
    if (page.mirrorLinks?.length) {
      const mirrorLinks = page.mirrorLinks.map((l) =>
        l.targetPageId && remap.has(l.targetPageId) ? { ...l, targetPageId: remap.get(l.targetPageId) } : l,
      );
      if (JSON.stringify(mirrorLinks) !== JSON.stringify(page.mirrorLinks)) {
        patch = { ...(patch || {}), mirrorLinks };
      }
    }
    if (patch) {
      await pagesColl.updateOne({ _id: page._id }, { $set: { ...patch, updatedAt: new Date() } });
    }
  }

  for (const [fromId, toId] of remap) {
    await invColl.updateMany({ worldId, pageId: fromId }, { $set: { pageId: toId } });
  }

  for (const [fromId, toId] of remap) {
    await pagesColl.deleteOne({ _id: new ObjectId(fromId) });
    removed += 1;
    console.log(`  removed duplicate "${pages.find((p) => p._id.toString() === fromId)?.title}" → kept ${toId.slice(-6)}`);
  }

  const gotchiverseMaps = maps.filter(
    (m) => m.mapPreset === 'gotchiverse' || m.title === 'Gotchiverse' || m.imageUrl?.includes('gotchiverse-overview'),
  );
  let mapsMerged = 0;
  if (gotchiverseMaps.length > 1) {
    const [keep, ...extra] = gotchiverseMaps;
    for (const dup of extra) {
      await mapsColl.deleteOne({ _id: dup._id });
      mapsMerged += 1;
      console.log(`  removed duplicate Gotchiverse map ${dup._id.toString().slice(-6)}`);
    }
  }

  console.log(`  ${world.slug || worldId}: removed ${removed} duplicate page(s)`);
  return { removed, mapsMerged };
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const worldsColl = db.collection('lore_worlds');

  let worlds;
  if (target) {
    const query = ObjectId.isValid(target) ? { _id: new ObjectId(target) } : { slug: target };
    const w = await worldsColl.findOne(query);
    worlds = w ? [w] : [];
    if (!worlds.length) {
      console.error('World not found:', target);
      process.exit(1);
    }
  } else {
    worlds = await worldsColl.find({}).toArray();
  }

  let totalRemoved = 0;
  for (const world of worlds) {
    console.log(`Deduping ${world.title} (${world.slug || world._id})…`);
    const { removed } = await dedupeWorld(db, world);
    totalRemoved += removed;
  }
  console.log(`Done. Removed ${totalRemoved} duplicate page(s) total.`);
} finally {
  await client.close();
}
