#!/usr/bin/env node
/**
 * Assign stable pageKey to all pages missing one (tree-based paths).
 * Usage: node scripts/migrate-page-keys.mjs [--worldId=...]
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const require = createRequire(import.meta.url);
const { connect } = require('../lib/mongodb.cjs');
const { assignMissingPageKeys } = require('../backend/services/worldClone.cjs');

const worldArg = process.argv.find((a) => a.startsWith('--worldId='));
const worldId = worldArg ? worldArg.split('=')[1] : null;

async function main() {
  await connect();
  if (worldId) {
    const count = await assignMissingPageKeys(worldId);
    console.log(`Updated page keys for ${count} pages in world ${worldId}`);
    return;
  }

  const require2 = createRequire(import.meta.url);
  const { getLoreWorldsCollection } = require2('../lib/mongodb.cjs');
  const worlds = await (await getLoreWorldsCollection()).find({}).project({ _id: 1, title: 1 }).toArray();
  for (const w of worlds) {
    const count = await assignMissingPageKeys(w._id.toString());
    console.log(`${w.title}: ${count} pages keyed`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
