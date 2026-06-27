<template>
  <div v-if="world" :class="$style.page">
    <LoreWorkspaceRail
      :world-id="worldId"
      active="proposals"
      :is-branch="isBranch"
      :is-canon="isReview"
    />
    <div :class="$style.main">
    <header :class="$style.head">
      <div>
        <router-link :to="`/lore/${worldId}`" class="text-xs opacity-70">← Workspace</router-link>
        <h1 class="font-pixel text-xs mt-1">{{ isReview ? 'DAO review inbox' : 'Pull requests' }}</h1>
        <p class="text-xs opacity-60 mt-1">{{ subtitle }}</p>
      </div>
      <GotchiTooltip v-if="isBranch && !selected" :tip="LORE_ACTIONS.pushReview">
        <button
          type="button"
          class="btn-pixel text-[8px]"
          :disabled="previewLoading"
          @click="startNew"
        >
          {{ previewLoading ? '…' : 'Push for review' }}
        </button>
      </GotchiTooltip>
    </header>

    <div v-if="isReview" :class="$style.filters">
      <button
        v-for="f in statusFilters"
        :key="f.id"
        type="button"
        :class="[$style.filterBtn, statusFilter === f.id && $style.filterActive]"
        @click="statusFilter = f.id"
      >
        {{ f.label }}
      </button>
    </div>

    <div :class="$style.layout">
      <aside :class="$style.list">
        <button
          v-for="p in filteredProposals"
          :key="p.id"
          type="button"
          :class="[$style.item, selected?.id === p.id && $style.itemActive]"
          @click="selectProposal(p.id)"
        >
          <span :class="$style.itemTitle">{{ p.title }}</span>
          <span :class="[$style.status, statusClass(p.status)]">{{ statusLabel(p.status) }}</span>
          <span class="text-[10px] opacity-50">{{ formatProposalStats(p) }}</span>
        </button>
        <p v-if="!filteredProposals.length && !loading" class="text-xs opacity-50 p-2">No proposals yet.</p>
      </aside>

      <main :class="$style.detail">
        <template v-if="composing">
          <form :class="$style.compose" @submit.prevent="submitProposal">
            <h2 class="font-pixel text-[9px]">New pull request</h2>
            <p class="text-xs opacity-60">
              {{ formatProposalStats(preview?.stats) }}
              <span v-if="preview?.stats?.conflictCount"> · {{ preview.stats.conflictCount }} conflicts</span>
            </p>
            <input v-model="form.title" class="input-gotchi mb-2 text-xs" placeholder="PR title" required />
            <textarea v-model="form.body" class="input-gotchi mb-2 text-xs" rows="3" placeholder="Summary for DAO reviewers" />
            <section :class="$style.diffSection">
              <h3 class="font-pixel text-[8px]">Lore changes</h3>
              <ProposalDiffViewer :patches="preview?.patches || []" />
            </section>
            <section :class="$style.diffSection">
              <h3 class="font-pixel text-[8px]">Tome changes</h3>
              <TomeDiffViewer :patches="preview?.tomePatches || []" />
            </section>
            <div class="flex gap-2 mt-3">
              <button
                type="submit"
                class="btn-pixel text-[8px]"
                :disabled="submitting || !hasProposalChanges(preview)"
              >
                {{ submitting ? 'Submitting…' : 'Submit for review' }}
              </button>
              <button type="button" class="btn-pixel text-[8px]" @click="composing = false">Cancel</button>
            </div>
          </form>
        </template>

        <template v-else-if="selected">
          <div :class="$style.detailHead">
            <div>
              <h2 class="font-pixel text-[9px]">{{ selected.title }}</h2>
              <p :class="[$style.status, statusClass(selected.status)]">{{ statusLabel(selected.status) }}</p>
              <p v-if="selected.nominatedAt" class="text-[10px] opacity-55 mt-0.5">
                Nominated {{ formatDate(selected.nominatedAt) }}
              </p>
              <p v-if="selected.body" class="text-xs opacity-70 mt-1">{{ selected.body }}</p>
              <p class="text-[10px] opacity-50 mt-1">
                {{ formatProposalStats(selected.stats) }}
                <span v-if="selected.stats?.conflictCount"> · {{ selected.stats.conflictCount }} conflicts</span>
              </p>
            </div>
            <div :class="$style.actions">
              <button
                v-if="isAuthor && ['open', 'changes_requested'].includes(selected.status)"
                type="button"
                class="btn-pixel text-[8px]"
                :disabled="refreshing"
                @click="refreshProposal"
              >
                {{ refreshing ? '…' : 'Refresh diff' }}
              </button>
              <button
                v-if="isAuthor && ['open', 'changes_requested', 'nominated'].includes(selected.status)"
                type="button"
                class="btn-pixel text-[8px]"
                @click="setStatus('closed')"
              >
                Withdraw
              </button>
              <button
                v-if="isMaintainer && selected.status === 'open'"
                type="button"
                class="btn-pixel text-[8px]"
                @click="setStatus('nominated')"
              >
                Nominate for vote
              </button>
              <button
                v-if="isMaintainer && selected.status === 'nominated'"
                type="button"
                class="btn-pixel text-[8px]"
                @click="setStatus('open')"
              >
                Remove nomination
              </button>
              <button
                v-if="isMaintainer && ['open', 'nominated'].includes(selected.status)"
                type="button"
                class="btn-pixel text-[8px]"
                @click="setStatus('changes_requested')"
              >
                Request changes
              </button>
              <button
                v-if="isMaintainer && ['open', 'nominated', 'changes_requested'].includes(selected.status)"
                type="button"
                class="btn-pixel text-[8px]"
                @click="setStatus('rejected')"
              >
                Reject
              </button>
            </div>
          </div>

          <ProposalComments
            title="General discussion"
            :comments="comments"
            :can-comment="!!wallet.address"
            :wallet-address="wallet.address || ''"
            :is-maintainer="isMaintainer"
            :is-author="isAuthor"
            @add="onAddComment"
            @delete="onDeleteComment"
          />

          <ProposalSnapshotPanel
            v-if="isReview && selected.status !== 'merged'"
            :proposal-id="selected.id"
            :proposal-status="selected.status"
            :conflict-count="selected.stats?.conflictCount || 0"
            :is-maintainer="isMaintainer"
            @updated="onGovernanceUpdated"
          />

          <section :class="$style.diffSection">
            <h3 class="font-pixel text-[8px]">Lore changes</h3>
            <ProposalDiffViewer :patches="selected.patches || []">
              <template #hunk-comments="{ pageKey, hunkPath }">
                <ProposalComments
                  :comments="comments"
                  :page-key="pageKey"
                  :hunk-path="hunkPath"
                  title="Field notes"
                  placeholder="Comment on this field…"
                  :can-comment="!!wallet.address"
                  :wallet-address="wallet.address || ''"
                  :is-maintainer="isMaintainer"
                  :is-author="isAuthor"
                  @add="onAddComment"
                  @delete="onDeleteComment"
                />
              </template>
            </ProposalDiffViewer>
          </section>

          <section :class="$style.diffSection">
            <h3 class="font-pixel text-[8px]">Tome changes</h3>
            <TomeDiffViewer :patches="selected.tomePatches || []">
              <template #hunk-comments="{ nodeKey, hunkPath }">
                <ProposalComments
                  :comments="comments"
                  :node-key="nodeKey"
                  :hunk-path="hunkPath"
                  title="Field notes"
                  placeholder="Comment on this scene field…"
                  :can-comment="!!wallet.address"
                  :wallet-address="wallet.address || ''"
                  :is-maintainer="isMaintainer"
                  :is-author="isAuthor"
                  @add="onAddComment"
                  @delete="onDeleteComment"
                />
              </template>
            </TomeDiffViewer>
          </section>

          <ProposalTimeline :events="events" />
        </template>

        <p v-else class="text-sm opacity-60">Select a proposal or open a new pull request.</p>
      </main>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import { useWalletStore } from '@/stores';
import { statusClass, statusLabel } from '@/utils/loreDiff';
import ProposalDiffViewer from '@/components/lore/ProposalDiffViewer.vue';
import TomeDiffViewer from '@/components/tome/TomeDiffViewer.vue';
import ProposalComments from '@/components/lore/ProposalComments.vue';
import ProposalTimeline from '@/components/lore/ProposalTimeline.vue';
import ProposalSnapshotPanel from '@/components/lore/ProposalSnapshotPanel.vue';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LORE_ACTIONS } from '@/utils/workspaceHints';

const route = useRoute();
const router = useRouter();
const wallet = useWalletStore();

const worldId = computed(() => route.params.worldId);
const proposalId = computed(() => route.params.proposalId);

const world = ref(null);
const proposals = ref([]);
const selected = ref(null);
const comments = ref([]);
const events = ref([]);
const preview = ref(null);
const loading = ref(true);
const previewLoading = ref(false);
const submitting = ref(false);
const refreshing = ref(false);
const composing = ref(false);
const statusFilter = ref('all');
const form = ref({ title: '', body: '' });

const statusFilters = [
  { id: 'all', label: 'All active' },
  { id: 'open', label: 'Open' },
  { id: 'nominated', label: 'Nominated' },
  { id: 'voting', label: 'Voting' },
  { id: 'changes_requested', label: 'Changes' },
];

const isBranch = computed(() => !!world.value?.upstreamWorldId);
const isReview = computed(() => world.value?.visibility === 'canonical');
const isAuthor = computed(
  () => selected.value && wallet.address && selected.value.authorWallet === wallet.address.toLowerCase(),
);
const isMaintainer = computed(() => {
  if (!world.value || !wallet.address) return false;
  const w = wallet.address.toLowerCase();
  if (isReview.value) return world.value.ownerWallet === w || world.value.maintainers?.includes(w);
  return false;
});

const filteredProposals = computed(() => {
  if (!isReview.value || statusFilter.value === 'all') return proposals.value;
  return proposals.value.filter((p) => p.status === statusFilter.value);
});

const subtitle = computed(() => {
  if (isReview.value) return 'Review PRs, nominate for Snapshot, and merge passed votes into canon.';
  if (isBranch.value) return 'Propose field-level changes from your branch to upstream canon.';
  return 'Pull requests for this world.';
});

onMounted(load);
watch(() => route.params.proposalId, loadSelected);

async function load() {
  loading.value = true;
  try {
    world.value = await loreApi.getWorld(worldId.value);
    const filter = isReview.value
      ? { upstreamWorldId: worldId.value }
      : { sourceWorldId: worldId.value };
    proposals.value = await loreApi.listProposals(filter);
    if (route.query.new === '1' && isBranch.value) {
      await startNew();
    } else if (proposalId.value) {
      await loadSelected();
    }
  } finally {
    loading.value = false;
  }
}

async function loadSelected() {
  if (!proposalId.value) {
    selected.value = null;
    comments.value = [];
    events.value = [];
    return;
  }
  composing.value = false;
  selected.value = await loreApi.getProposal(proposalId.value);
  [comments.value, events.value] = await Promise.all([
    loreApi.listProposalComments(proposalId.value),
    loreApi.listProposalEvents(proposalId.value),
  ]);
}

function selectProposal(id) {
  router.push(`/lore/${worldId.value}/proposals/${id}`);
}

async function startNew() {
  composing.value = true;
  selected.value = null;
  previewLoading.value = true;
  try {
    preview.value = await loreApi.previewProposal(worldId.value);
    form.value.title = form.value.title || `Update ${preview.value.stats?.pagesChanged || ''} pages`.trim();
  } catch (err) {
    alert(err.message || 'Could not preview changes');
    composing.value = false;
  } finally {
    previewLoading.value = false;
  }
}

async function submitProposal() {
  submitting.value = true;
  try {
    const created = await loreApi.createProposal({
      sourceWorldId: worldId.value,
      title: form.value.title,
      body: form.value.body,
    });
    composing.value = false;
    proposals.value = await loreApi.listProposals({ sourceWorldId: worldId.value });
    router.push(`/lore/${worldId.value}/proposals/${created.id}`);
  } catch (err) {
    alert(err.message || 'Submit failed');
  } finally {
    submitting.value = false;
  }
}

async function setStatus(status) {
  if (!selected.value) return;
  try {
    selected.value = await loreApi.updateProposal(selected.value.id, { status });
    syncListItem();
    events.value = await loreApi.listProposalEvents(selected.value.id);
    if (isReview.value) {
      proposals.value = await loreApi.listProposals({ upstreamWorldId: worldId.value });
    }
  } catch (err) {
    alert(err.message || 'Update failed');
  }
}

async function refreshProposal() {
  if (!selected.value) return;
  refreshing.value = true;
  try {
    selected.value = await loreApi.refreshProposal(selected.value.id);
    syncListItem();
    events.value = await loreApi.listProposalEvents(selected.value.id);
  } catch (err) {
    alert(err.message || 'Refresh failed');
  } finally {
    refreshing.value = false;
  }
}

async function onAddComment(payload) {
  if (!selected.value) return;
  const created = await loreApi.addProposalComment(selected.value.id, payload);
  comments.value = [...comments.value, created];
  events.value = await loreApi.listProposalEvents(selected.value.id);
}

async function onDeleteComment(commentId) {
  if (!selected.value) return;
  await loreApi.deleteProposalComment(selected.value.id, commentId);
  comments.value = comments.value.filter((c) => c.id !== commentId);
}

async function onGovernanceUpdated() {
  if (!selected.value) return;
  selected.value = await loreApi.getProposal(selected.value.id);
  syncListItem();
  events.value = await loreApi.listProposalEvents(selected.value.id);
  if (isReview.value) {
    proposals.value = await loreApi.listProposals({ upstreamWorldId: worldId.value });
  }
}

function syncListItem() {
  const i = proposals.value.findIndex((p) => p.id === selected.value.id);
  if (i >= 0) proposals.value[i] = selected.value;
}

function formatProposalStats(stats) {
  if (!stats) return '0 pages · 0 scenes · 0 fields';
  const pages = stats.pagesChanged || 0;
  const nodes = stats.nodesChanged || 0;
  const fields = stats.hunksCount || 0;
  return `${pages} pages · ${nodes} scenes · ${fields} fields`;
}

function hasProposalChanges(previewData) {
  if (!previewData) return false;
  return (previewData.patches?.length || 0) + (previewData.tomePatches?.length || 0) > 0;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>

<style module>
.page {
  display: flex;
  gap: 0;
  min-height: 520px;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  min-width: 0;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.filterBtn {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.45rem;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 3px;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  cursor: pointer;
}
.filterActive {
  border-color: #a78bfa;
  background: rgba(101, 31, 255, 0.15);
  opacity: 1;
}
.layout {
  display: flex;
  gap: 0;
  flex: 1;
  border: 1px solid rgba(139, 125, 184, 0.25);
  border-radius: 4px;
  overflow: hidden;
  min-height: 420px;
}
.list {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid rgba(139, 125, 184, 0.35);
  overflow-y: auto;
  padding: 0.35rem;
}
.item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background: rgba(26, 20, 45, 0.6);
  cursor: pointer;
  color: inherit;
}
.itemActive {
  border-color: #a78bfa;
  background: rgba(101, 31, 255, 0.12);
}
.itemTitle {
  font-size: 0.72rem;
  font-weight: 600;
}
.status {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
}
.compose {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.detailHead {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex-shrink: 0;
}
.diffSection {
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px dashed rgba(139, 125, 184, 0.25);
}
.diffSection h3 {
  margin-bottom: 0.45rem;
}
</style>
