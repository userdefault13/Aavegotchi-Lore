<template>
  <aside :class="$style.panel">
    <h3 class="font-pixel text-[8px] mb-1">Canon history</h3>
    <p :class="$style.hint">DAO direct edits and merges are recorded as world snapshots.</p>

    <button
      v-if="canWrite"
      type="button"
      class="btn-pixel text-[8px] w-full"
      :disabled="committing"
      @click="$emit('record-edit')"
    >
      {{ committing ? 'Recording…' : 'Record DAO edit' }}
    </button>

    <router-link
      v-if="canReview"
      :to="`/lore/${worldId}/proposals`"
      class="btn-pixel text-[8px] w-full mt-2 block text-center"
    >
      Review PRs
    </router-link>

    <section v-if="commits.length" :class="$style.log">
      <p :class="$style.logTitle">Commit log</p>
      <ul>
        <li v-for="c in commits" :key="c.id">
          <span :class="[$style.kind, kindClass(c.kind)]">{{ kindLabel(c.kind) }}</span>
          <span class="text-xs">{{ c.message }}</span>
          <span class="text-[10px] opacity-50">{{ formatDate(c.createdAt) }}</span>
        </li>
      </ul>
    </section>
    <p v-else class="text-xs opacity-50 mt-2">No commits yet.</p>
  </aside>
</template>

<script setup>
defineProps({
  worldId: { type: String, required: true },
  commits: { type: Array, default: () => [] },
  canWrite: { type: Boolean, default: false },
  canReview: { type: Boolean, default: false },
  committing: { type: Boolean, default: false },
});

defineEmits(['record-edit']);

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function kindLabel(kind) {
  return {
    dao_edit: 'DAO',
    pull: 'Pull',
    merge: 'Merge',
    fork_genesis: 'Branch',
    checkpoint: 'Snap',
  }[kind] || 'Snap';
}

function kindClass(kind) {
  return {
    dao_edit: 'text-cyan-300',
    merge: 'text-purple-300',
    fork_genesis: 'text-green-300',
  }[kind] || '';
}
</script>

<style module>
.panel {
  width: 180px;
  flex-shrink: 0;
  border-left: 2px solid #7c3aed;
  padding: 0.75rem 0.75rem 0.75rem 0.65rem;
  background: rgba(124, 58, 237, 0.08);
}
.hint {
  font-size: 10px;
  opacity: 0.55;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}
.log {
  margin-top: 0.75rem;
  border-top: 1px dashed rgba(139, 125, 184, 0.25);
  padding-top: 0.5rem;
}
.logTitle {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
  margin: 0 0 0.35rem;
}
.log ul {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
}
.log li {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.4rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(139, 125, 184, 0.12);
}
.kind {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}
</style>
