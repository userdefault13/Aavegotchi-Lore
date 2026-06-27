const { ObjectId } = require('mongodb');
const { getTomeChroniclesCollection } = require('../../lib/mongodb.cjs');
const { getChronicleCommit } = require('./chronicleCommits.cjs');
const { walkCommitChain } = require('./worldSync.cjs');

async function getChronicleSyncStatus(chronicle) {
  if (!chronicle.upstreamChronicleId) {
    return { isBranch: false, isFork: false };
  }

  const coll = await getTomeChroniclesCollection();
  const upstream = await coll.findOne({ _id: new ObjectId(chronicle.upstreamChronicleId) });
  if (!upstream) {
    return { isBranch: true, isFork: true, error: 'Upstream chronicle not found' };
  }

  const baseCommitId = chronicle.baseCommitId || null;
  const upstreamHead = upstream.headCommitId || null;
  const branchHead = chronicle.headCommitId || null;

  const behind = await walkCommitChain(upstreamHead, baseCommitId);
  const ahead = await walkCommitChain(branchHead, baseCommitId);

  return {
    isBranch: true,
    isFork: true,
    upstreamChronicleId: upstream._id.toString(),
    upstreamTitle: upstream.title,
    upstreamSlug: upstream.slug,
    upstreamHeadCommitId: upstreamHead,
    baseCommitId,
    branchHeadCommitId: branchHead,
    commitsBehind: behind.count,
    commitsAhead: ahead.count,
    diverged: !behind.reached && behind.count > 0,
    recentUpstreamCommits: behind.commits.slice(0, 5),
    recentBranchCommits: ahead.commits.slice(0, 8),
    linkedWorldBranchId: chronicle.linkedWorldBranchId || null,
  };
}

async function findPairedBranchChronicle(loreBranchWorldId) {
  const coll = await getTomeChroniclesCollection();
  return coll.findOne({ linkedWorldBranchId: loreBranchWorldId.toString() });
}

async function findPairedBranchChronicleByOwner(upstreamChronicleId, ownerWallet) {
  const coll = await getTomeChroniclesCollection();
  return coll.findOne({
    upstreamChronicleId: upstreamChronicleId.toString(),
    ownerWallet: ownerWallet.toLowerCase(),
  });
}

module.exports = {
  getChronicleSyncStatus,
  findPairedBranchChronicle,
  findPairedBranchChronicleByOwner,
};
