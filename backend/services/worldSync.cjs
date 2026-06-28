const { ObjectId } = require('mongodb');
const { getLoreWorldsCollection } = require('../lib/mongodb.cjs');
const { getWorldCommit } = require('./worldCommits.cjs');

async function walkCommitChain(fromCommitId, stopAtCommitId, maxSteps = 500) {
  if (!fromCommitId) return { count: 0, reached: true, commits: [] };
  if (fromCommitId === stopAtCommitId) return { count: 0, reached: true, commits: [] };

  let current = fromCommitId;
  let count = 0;
  const commits = [];

  while (current && current !== stopAtCommitId && count < maxSteps) {
    const commit = await getWorldCommit(current);
    if (!commit) break;
    commits.push({
      id: commit._id.toString(),
      message: commit.message,
      authorWallet: commit.authorWallet,
      createdAt: commit.createdAt?.toISOString?.(),
    });
    count += 1;
    current = commit.parentCommitId;
  }

  return { count, reached: current === stopAtCommitId, commits };
}

async function getForkSyncStatus(forkWorld) {
  if (!forkWorld.upstreamWorldId) {
    return { isFork: false };
  }

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(forkWorld.upstreamWorldId) });
  if (!upstream) {
    return { isFork: true, error: 'Upstream world not found' };
  }

  const baseCommitId = forkWorld.baseCommitId || null;
  const upstreamHead = upstream.headCommitId || null;
  const forkHead = forkWorld.headCommitId || null;

  const behind = await walkCommitChain(upstreamHead, baseCommitId);
  const ahead = await walkCommitChain(forkHead, baseCommitId);

  return {
    isFork: true,
    isBranch: true,
    upstreamWorldId: upstream._id.toString(),
    upstreamTitle: upstream.title,
    upstreamSlug: upstream.slug,
    upstreamHeadCommitId: upstreamHead,
    baseCommitId,
    forkHeadCommitId: forkHead,
    commitsBehind: behind.count,
    commitsAhead: ahead.count,
    diverged: !behind.reached && behind.count > 0,
    recentUpstreamCommits: behind.commits.slice(0, 5),
    recentForkCommits: ahead.commits.slice(0, 8),
  };
}

module.exports = {
  getForkSyncStatus,
  walkCommitChain,
};
