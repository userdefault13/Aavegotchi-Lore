<template>
  <section :class="$style.timeline">
    <h3 class="font-pixel text-[8px] mb-1">Activity</h3>
    <ul v-if="events.length" :class="$style.list">
      <li v-for="ev in events" :key="ev.id">
        <span :class="$style.type">{{ eventLabel(ev.type) }}</span>
        <span v-if="ev.message" class="text-xs opacity-75">{{ ev.message }}</span>
        <span class="text-[10px] opacity-45">{{ formatDate(ev.createdAt) }}</span>
      </li>
    </ul>
    <p v-else class="text-xs opacity-50">No activity yet.</p>
  </section>
</template>

<script setup>
import { governanceEventLabel } from '@/utils/loreDiff';

defineProps({
  events: { type: Array, default: () => [] },
});

function eventLabel(type) {
  return governanceEventLabel(type);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style module>
.timeline {
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px dashed rgba(139, 125, 184, 0.25);
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 160px;
  overflow-y: auto;
}
.list li {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.45rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(139, 125, 184, 0.12);
}
.type {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #c4b5fd;
}
</style>
