#!/usr/bin/env node
/**
 * Wipe all gotchi-lore MongoDB collections.
 * Usage: node scripts/clear-db.mjs
 */
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const COLLECTIONS = [
  'lore_governance_events',
  'lore_proposal_comments',
  'lore_proposals',
  'lore_world_commits',
  'lore_page_revisions',
  'lore_inventory_links',
  'lore_diagrams',
  'lore_pages',
  'realm_maps',
  'lore_worlds',
  'tome_chronicle_commits',
  'story_nodes',
  'tome_chronicles',
  'suite_assets',
];

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const dbName = (process.env.MONGO_DB_NAME || 'gotchi-lore').trim();
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  console.log(`Clearing database: ${dbName}`);
  for (const name of COLLECTIONS) {
    const result = await db.collection(name).deleteMany({});
    console.log(`  ${name}: ${result.deletedCount} deleted`);
  }
  console.log('Database cleared.');
} finally {
  await client.close();
}
