<template>
  <section :class="$style.panel">
    <h3 class="font-pixel text-[8px] mb-1">Snapshot vote</h3>

    <p v-if="loading" class="text-xs opacity-50">Loading vote status…</p>
    <template v-else-if="governance">
      <div v-if="governance.snapshot?.linked" :class="$style.statusBlock">
        <p :class="[$style.state, stateClass(governance.snapshot.state)]">
          {{ stateLabel(governance.snapshot) }}
        </p>
        <p v-if="governance.snapshot.message" class="text-xs opacity-70">{{ governance.snapshot.message }}</p>
        <p v-if="governance.snapshot.yes != null" class="text-[10px] opacity-55 mt-1">
          Yes {{ formatScore(governance.snapshot.yes) }}
          · No {{ formatScore(governance.snapshot.no) }}
          <span v-if="governance.snapshot.abstain"> · Abstain {{ formatScore(governance.snapshot.abstain) }}</span>
        </p>
        <a
          v-if="governance.snapshot.snapshotUrl"
          :href="governance.snapshot.snapshotUrl"
          target="_blank"
          rel="noopener"
          class="text-xs text-purple-300 underline mt-1 inline-block"
        >
          View on Snapshot ↗
        </a>
      </div>
      <p v-else class="text-xs opacity-60">
        Create a Snapshot proposal in your DAO space, then paste its proposal ID below.
      </p>

      <details v-if="governance.payload && isMaintainer" :class="$style.payload">
        <summary class="text-[10px] opacity-60 cursor-pointer">Copy merge metadata (IPFS JSON)</summary>
        <pre>{{ payloadJson }}</pre>
        <button type="button" class="btn-pixel text-[8px] mt-1" @click="copyPayload">Copy JSON</button>
      </details>

      <form
        v-if="isMaintainer && ['nominated', 'voting'].includes(proposalStatus) && !governance.snapshot?.linked"
        :class="$style.form"
        @submit.prevent="linkSnapshot"
      >
        <input
          v-model="snapshotId"
          class="input-gotchi text-xs"
          placeholder="Snapshot proposal ID"
          required
        />
        <button type="submit" class="btn-pixel text-[8px]" :disabled="linking">
          {{ linking ? 'Linking…' : 'Link Snapshot vote' }}
        </button>
      </form>

      <div v-if="isMaintainer && canShowMerge" :class="$style.mergeBox">
        <label v-if="hasConflicts" :class="$style.force">
          <input v-model="forceMerge" type="checkbox" />
          <span class="text-[10px]">Force merge despite {{ conflictCount }} conflict(s)</span>
        </label>
        <button
          type="button"
          class="btn-pixel text-[8px] w-full"
          :disabled="merging || (!governance.canMerge && !forceMerge)"
          @click="executeMerge"
        >
          {{ merging ? 'Merging…' : 'Execute merge to canon' }}
        </button>
        <p v-if="governance.relaxedMode && !governance.snapshot?.linked" class="text-[10px] opacity-45 mt-1">
          SNAPSHOT_RELAXED=1 — merge allowed without linked vote (dev only).
        </p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { loreApi } from '@/services/api';

const props = defineProps({
  proposalId: { type: String, required: true },
  proposalStatus: { type: String, default: '' },
  conflictCount: { type: Number, default: 0 },
  isMaintainer: { type: Boolean, default: false },
});

const emit = defineEmits(['updated']);

const governance = ref(null);
const loading = ref(false);
const linking = ref(false);
const merging = ref(false);
const snapshotId = ref('');
const forceMerge = ref(false);

const payloadJson = computed(() =>
  governance.value?.payload ? JSON.stringify(governance.value.payload, null, 2) : '',
);
const hasConflicts = computed(() => props.conflictCount > 0);
const canShowMerge = computed(
  () =>
    props.isMaintainer &&
    ['nominated', 'voting'].includes(props.proposalStatus) &&
    (governance.value?.canMerge || forceMerge.value || governance.value?.relaxedMode),
);

watch(
  () => props.proposalId,
  () => load(),
  { immediate: true },
);

async function load() {
  if (!props.proposalId) return;
  loading.value = true;
  try {
    governance.value = await loreApi.getProposalGovernance(props.proposalId);
  } catch {
    governance.value = null;
  } finally {
    loading.value = false;
  }
}

async function linkSnapshot() {
  linking.value = true;
  try {
    await loreApi.linkSnapshotProposal(props.proposalId, snapshotId.value.trim());
    snapshotId.value = '';
    await load();
    emit('updated');
  } catch (err) {
    alert(err.message || 'Link failed');
  } finally {
    linking.value = false;
  }
}

async function executeMerge() {
  if (hasConflicts.value && !forceMerge.value) {
    alert('Enable force merge to apply despite conflicts');
    return;
  }
  if (!confirm('Merge this proposal into canon? This cannot be undone.')) return;
  merging.value = true;
  try {
    await loreApi.mergeProposal(props.proposalId, { force: forceMerge.value });
    await load();
    emit('updated');
  } catch (err) {
    alert(err.message || 'Merge failed');
  } finally {
    merging.value = false;
  }
}

async function copyPayload() {
  try {
    await navigator.clipboard.writeText(payloadJson.value);
  } catch {
    alert('Could not copy');
  }
}

function stateLabel(snapshot) {
  if (!snapshot?.linked) return 'Not linked';
  if (snapshot.state === 'active') return 'Vote active';
  if (snapshot.state === 'pending') return 'Vote pending';
  if (snapshot.state === 'closed') return snapshot.passed ? 'Vote passed' : 'Vote failed';
  return snapshot.state;
}

function stateClass(state) {
  return {
    pending: 'text-gray-300',
    active: 'text-blue-300',
    closed: 'text-purple-300',
  }[state] || '';
}

function formatScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(n % 1 ? 1 : 0);
}

defineExpose({ reload: load });
</script>

<style module>
.panel {
  margin-top: 0.75rem;
  padding: 0.65rem;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 6px;
  background: rgba(15, 11, 30, 0.55);
}
.statusBlock {
  margin-bottom: 0.5rem;
}
.state {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.5rem;
}
.payload {
  margin: 0.5rem 0;
}
.payload pre {
  margin: 0.35rem 0 0;
  font-size: 0.58rem;
  max-height: 120px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  opacity: 0.75;
}
.mergeBox {
  margin-top: 0.65rem;
  padding-top: 0.55rem;
  border-top: 1px dashed rgba(139, 125, 184, 0.25);
}
.force {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
}
</style>
