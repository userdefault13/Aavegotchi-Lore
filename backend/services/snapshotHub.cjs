const SNAPSHOT_HUB_URL = (process.env.SNAPSHOT_HUB_URL || 'https://hub.snapshot.org/graphql').trim();
const SNAPSHOT_SPACE = (process.env.SNAPSHOT_SPACE || '').trim();
const SNAPSHOT_RELAXED = (process.env.SNAPSHOT_RELAXED || '0') === '1';

async function snapshotGraphql(query, variables = {}) {
  const res = await fetch(SNAPSHOT_HUB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Snapshot hub error: ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || 'Snapshot query failed');
  }
  return json.data;
}

async function fetchSnapshotProposal(proposalId) {
  if (!proposalId) return null;
  const data = await snapshotGraphql(
    `query Proposal($id: String!) {
      proposal(id: $id) {
        id
        ipfs
        title
        body
        choices
        start
        end
        state
        scores
        scores_total
        quorum
        author
        space { id name }
      }
    }`,
    { id: proposalId },
  );
  return data?.proposal || null;
}

function parseScore(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function evaluateProposalOutcome(proposal) {
  if (!proposal) {
    return {
      linked: false,
      state: 'unknown',
      passed: false,
      readyToMerge: false,
      message: 'No Snapshot proposal linked',
    };
  }

  const state = proposal.state || 'unknown';
  const scores = (proposal.scores || []).map(parseScore);
  const yes = scores[0] || 0;
  const no = scores[1] || 0;
  const abstain = scores[2] || 0;

  if (state === 'pending') {
    return {
      linked: true,
      state,
      passed: false,
      readyToMerge: false,
      yes,
      no,
      abstain,
      scoresTotal: proposal.scores_total,
      voteEndsAt: proposal.end ? new Date(proposal.end * 1000).toISOString() : null,
      voteStartsAt: proposal.start ? new Date(proposal.start * 1000).toISOString() : null,
      snapshotTitle: proposal.title,
      snapshotUrl: buildSnapshotUrl(proposal),
      spaceId: proposal.space?.id || null,
      message: 'Vote has not started yet',
    };
  }

  if (state === 'active') {
    return {
      linked: true,
      state,
      passed: false,
      readyToMerge: false,
      yes,
      no,
      abstain,
      scoresTotal: proposal.scores_total,
      voteEndsAt: proposal.end ? new Date(proposal.end * 1000).toISOString() : null,
      voteStartsAt: proposal.start ? new Date(proposal.start * 1000).toISOString() : null,
      snapshotTitle: proposal.title,
      snapshotUrl: buildSnapshotUrl(proposal),
      spaceId: proposal.space?.id || null,
      message: 'Vote in progress',
    };
  }

  if (state === 'closed') {
    const passed = yes > no;
    return {
      linked: true,
      state,
      passed,
      readyToMerge: passed,
      yes,
      no,
      abstain,
      scoresTotal: proposal.scores_total,
      voteEndsAt: proposal.end ? new Date(proposal.end * 1000).toISOString() : null,
      voteStartsAt: proposal.start ? new Date(proposal.start * 1000).toISOString() : null,
      snapshotTitle: proposal.title,
      snapshotUrl: buildSnapshotUrl(proposal),
      spaceId: proposal.space?.id || null,
      message: passed ? 'Vote passed — ready to merge' : 'Vote did not pass',
    };
  }

  return {
    linked: true,
    state,
    passed: false,
    readyToMerge: false,
    snapshotTitle: proposal.title,
    snapshotUrl: buildSnapshotUrl(proposal),
    message: `Snapshot state: ${state}`,
  };
}

function buildSnapshotUrl(proposal) {
  const spaceId = proposal?.space?.id;
  if (!spaceId || !proposal?.id) return null;
  return `https://snapshot.org/#/${spaceId}/proposal/${proposal.id}`;
}

function buildSnapshotPayload(proposal, loreProposalId) {
  const appOrigin = (process.env.SIWE_URI || 'http://localhost:5174').replace(/\/$/, '');
  return {
    type: 'lore-merge',
    version: 1,
    loreProposalId,
    title: proposal.title,
    body: proposal.body || '',
    summary: `${proposal.stats?.pagesChanged || 0} pages · ${proposal.stats?.hunksCount || 0} field changes`,
    diffUrl: `${appOrigin}/lore/${proposal.upstreamWorldId}/proposals/${loreProposalId}`,
    patches: proposal.patches,
    stats: proposal.stats,
    sourceWorldId: proposal.sourceWorldId,
    authorWallet: proposal.authorWallet,
  };
}

function assertSnapshotSpaceMatch(proposal) {
  if (!SNAPSHOT_SPACE || !proposal?.space?.id) return;
  if (proposal.space.id.toLowerCase() !== SNAPSHOT_SPACE.toLowerCase()) {
    throw new Error(`Snapshot proposal is in ${proposal.space.id}, expected ${SNAPSHOT_SPACE}`);
  }
}

module.exports = {
  SNAPSHOT_SPACE,
  SNAPSHOT_RELAXED,
  fetchSnapshotProposal,
  evaluateProposalOutcome,
  buildSnapshotUrl,
  buildSnapshotPayload,
  assertSnapshotSpaceMatch,
};
