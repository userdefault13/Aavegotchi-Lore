#!/usr/bin/env node
import dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config();
const require = createRequire(import.meta.url);
const { connect, getStoryNodesCollection } = require('../lib/mongodb.cjs');
const { generateNodeKey, uniquifyNodeKey } = require('../api/services/nodeKey.cjs');

await connect();
const coll = await getStoryNodesCollection();
const chronicleIds = [...new Set((await coll.find({}).project({ chronicleId: 1 }).toArray()).map((d) => d.chronicleId))];
let updated = 0;

for (const chronicleId of chronicleIds) {
  const nodes = await coll.find({ chronicleId }).sort({ order: 1, title: 1 }).toArray();
  const used = new Set(nodes.filter((n) => n.nodeKey).map((n) => n.nodeKey));
  const byId = new Map(nodes.map((n) => [n._id.toString(), n]));

  async function keyFor(node) {
    if (node.nodeKey) return node.nodeKey;
    const parent = node.parentId ? byId.get(node.parentId) : null;
    const parentKey = parent ? await keyFor(parent) : null;
    const base = generateNodeKey(node.title, parentKey);
    const finalKey = uniquifyNodeKey(base, used);
    used.add(finalKey);
    await coll.updateOne({ _id: node._id }, { $set: { nodeKey: finalKey } });
    node.nodeKey = finalKey;
    updated += 1;
    return finalKey;
  }

  for (const node of nodes) await keyFor(node);
}

console.log(`Assigned nodeKey to ${updated} nodes across ${chronicleIds.length} chronicles.`);
