<template>
  <aside :class="$style.panel">
    <h3 class="font-pixel text-[8px] mb-2">History</h3>
    <p v-if="loading" class="text-xs opacity-50">Loading…</p>
    <ul v-else-if="revisions.length" :class="$style.list">
      <li v-for="rev in revisions" :key="rev.id">
        <div :class="$style.row">
          <span :class="$style.when">{{ formatWhen(rev.createdAt) }}</span>
          <button
            type="button"
            class="btn-pixel text-[8px]"
            :disabled="restoring === rev.id"
            @click="$emit('restore', rev.id)"
          >
            {{ restoring === rev.id ? '…' : 'Restore' }}
          </button>
        </div>
        <span :class="$style.label">{{ rev.label || 'Snapshot' }}</span>
      </li>
    </ul>
    <p v-else class="text-xs opacity-50">No revisions yet — edits are saved automatically.</p>
  </aside>
</template>

<script setup>
defineProps({
  revisions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  restoring: { type: String, default: '' },
});

defineEmits(['restore']);

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>

<style module>
.panel {
  width: 180px;
  flex-shrink: 0;
  border-left: 2px solid #8b7db8;
  padding-left: 0.75rem;
  padding-top: 0.75rem;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.list li {
  margin-bottom: 0.65rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(139, 125, 184, 0.2);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}
.when {
  font-size: 0.68rem;
  opacity: 0.75;
}
.label {
  display: block;
  font-size: 0.65rem;
  opacity: 0.45;
  margin-top: 0.15rem;
}
</style>
