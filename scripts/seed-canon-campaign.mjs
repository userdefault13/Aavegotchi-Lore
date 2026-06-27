#!/usr/bin/env node
/**
 * Seed DAO canonical campaign chronicle linked to gotchiverse-canon.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const require = createRequire(import.meta.url);
const { CAMPAIGN_NODES } = require('./campaign-canon-data.cjs');
const { NINE_AADEPTS_CAMPAIGN_NODES } = require('./nine-aadepts-canon-data.cjs');
const { AAVEGOTCHI_LORE_CAMPAIGN_NODES } = require('./aavegotchi-lore-canon-data.cjs');

const ALL_CAMPAIGN_NODES = [...CAMPAIGN_NODES, ...AAVEGOTCHI_LORE_CAMPAIGN_NODES, ...NINE_AADEPTS_CAMPAIGN_NODES];
const { ObjectId } = require('mongodb');
const {
  connect,
  getTomeChroniclesCollection,
  getStoryNodesCollection,
  getLoreWorldsCollection,
} = require('../lib/mongodb.cjs');
const { createChronicleCommit } = require('../api/services/chronicleCommits.cjs');

const CANON_SLUG = (process.env.CAMPAIGN_CANON_SLUG || 'gotchiverse-campaign-canon').trim();
const CANON_TITLE = (process.env.CAMPAIGN_CANON_TITLE || 'Gotchiverse Act I Campaign').trim();
const LORE_CANON_SLUG = (process.env.CANON_SLUG || 'gotchiverse-canon').trim();
const CANON_OWNER = (process.env.CANON_OWNER_WALLET || '0x0000000000000000000000000000000000000001').toLowerCase();

async function main() {
  await connect();
  const chronicles = await getTomeChroniclesCollection();
  const nodesColl = await getStoryNodesCollection();
  const worlds = await getLoreWorldsCollection();
  const now = new Date();

  const loreCanon = await worlds.findOne({ slug: LORE_CANON_SLUG, visibility: 'canonical' });
  if (!loreCanon) {
    console.error(`Lore canon not found (${LORE_CANON_SLUG}). Run seed:canon first.`);
    process.exit(1);
  }

  const existing = await chronicles.findOne({ slug: CANON_SLUG });
  if (existing) {
    await nodesColl.deleteMany({ chronicleId: existing._id.toString() });
    await chronicles.deleteOne({ _id: existing._id });
    console.log(`Removed existing campaign canon: ${CANON_SLUG}`);
  }

  const chronicleDoc = {
    title: CANON_TITLE,
    slug: CANON_SLUG,
    description: 'Canonical Act I campaign — litepaper, Aavegotchi Lore origins, and The Nine Aadepts (Episodes 1–2).',
    linkedWorldId: loreCanon._id.toString(),
    linkedWorldBranchId: null,
    toolboard: { widgets: [] },
    visibility: 'canonical',
    forkOfChronicleId: null,
    upstreamChronicleId: null,
    baseCommitId: null,
    headCommitId: null,
    maintainers: [CANON_OWNER],
    ownerWallet: CANON_OWNER,
    createdAt: now,
    updatedAt: now,
  };

  const chronicleResult = await chronicles.insertOne(chronicleDoc);
  const chronicleId = chronicleResult.insertedId.toString();

  await worlds.updateOne(
    { _id: loreCanon._id },
    { $addToSet: { linkedChronicleIds: chronicleId }, $set: { updatedAt: now } },
  );

  const nodeIdByKey = new Map();
  let order = 0;
  for (const spec of ALL_CAMPAIGN_NODES) {
    const parentId = spec.parentKey ? nodeIdByKey.get(spec.parentKey)?.toString() || null : null;
    const doc = {
      chronicleId,
      nodeKey: spec.nodeKey,
      parentId,
      type: spec.type,
      title: spec.title,
      content: spec.content || '',
      status: 'pending',
      choices: spec.choices || [],
      roles: spec.roles || [],
      memoSheets: [],
      crossLinks: [],
      situational: { visible: [], audible: [], discoverable: [] },
      branchIndex: spec.branchIndex ?? 0,
      order: spec.order ?? order,
      frame: null,
      ownerWallet: CANON_OWNER,
      createdAt: now,
      updatedAt: now,
    };
    const result = await nodesColl.insertOne(doc);
    nodeIdByKey.set(spec.nodeKey, result.insertedId);
    order += 1;
  }

  const commit = await createChronicleCommit({
    chronicleId,
    message: 'Genesis campaign canon — Act I + Aavegotchi Origins + Nine Aadepts',
    authorWallet: CANON_OWNER,
    kind: 'fork_genesis',
  });

  console.log(`Created campaign canon: ${CANON_SLUG} (${chronicleId})`);
  console.log(`Linked to lore canon: ${LORE_CANON_SLUG}`);
  console.log(
    `Seeded ${ALL_CAMPAIGN_NODES.length} story nodes (${AAVEGOTCHI_LORE_CAMPAIGN_NODES.length} Aavegotchi Origins, ${NINE_AADEPTS_CAMPAIGN_NODES.length} Nine Aadepts)`,
  );
  console.log(`Genesis commit: ${commit.id}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
