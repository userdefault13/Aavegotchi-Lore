<template>
  <aside :class="$style.panel">
    <h3 class="font-pixel text-[8px] mb-1">Branch sync</h3>
    <p v-if="loading" class="text-xs opacity-50">Checking upstream…</p>
    <template v-else-if="status?.isBranch || status?.isFork">
      <router-link :to="`/lore/${status.upstreamWorldId}`" :class="$style.upstreamLink">
        ↑ {{ status.upstreamTitle }}
      </router-link>

      <div :class="$style.stats">
        <GotchiTooltip :tip="SYNC_PANEL.behind">
          <span :class="[$style.stat, status.commitsBehind > 0 && $style.statWarn]">
            {{ status.commitsBehind }} behind
          </span>
        </GotchiTooltip>
        <GotchiTooltip :tip="SYNC_PANEL.ahead">
          <span :class="$style.stat">{{ status.commitsAhead }} ahead</span>
        </GotchiTooltip>
      </div>

      <p v-if="status.commitsBehind > 0" :class="$style.hint">
        Canon has {{ status.commitsBehind }} new snapshot(s). Pull to sync before your next PR.
      </p>
      <p v-else :class="$style.hint">Up to date with upstream canon.</p>

      <GotchiTooltip v-if="status.commitsBehind > 0" :tip="SYNC_PANEL.pull" block>
        <router-link
          :to="`/lore/${worldId}/sync`"
          class="btn-pixel text-[8px] w-full mt-2 block text-center"
        >
          Pull from canon
        </router-link>
      </GotchiTooltip>

      <GotchiTooltip :tip="SYNC_PANEL.commit" block>
        <button
          type="button"
          class="btn-pixel text-[8px] w-full mt-2"
          :disabled="committing"
          @click="$emit('checkpoint')"
        >
          {{ committing ? 'Saving…' : 'Commit changes' }}
        </button>
      </GotchiTooltip>

      <GotchiTooltip :tip="SYNC_PANEL.pushReview" block>
        <router-link :to="`/lore/${worldId}/proposals?new=1`" class="btn-pixel text-[8px] w-full mt-2 block text-center">
          Push for review
        </router-link>
      </GotchiTooltip>
      <GotchiTooltip :tip="SYNC_PANEL.viewPrs" block>
        <router-link :to="`/lore/${worldId}/proposals`" class="btn-pixel text-[8px] w-full mt-1 block text-center">
          View PRs
        </router-link>
      </GotchiTooltip>

      <section v-if="commits.length" :class="$style.log">
        <p :class="$style.logTitle">Your commits</p>
        <ul>
          <li v-for="c in commits" :key="c.id">
            <span v-if="c.kind && c.kind !== 'checkpoint'" :class="$style.kind">{{ kindLabel(c.kind) }}</span>
            <span class="text-xs">{{ c.message }}</span>
            <span class="text-[10px] opacity-50">{{ formatDate(c.createdAt) }}</span>
          </li>
        </ul>
      </section>
    </template>
  </aside>
</template>

<script setup>
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { SYNC_PANEL } from '@/utils/workspaceHints';

defineProps({
  status: { type: Object, default: null },
  commits: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  committing: { type: Boolean, default: false },
  worldId: { type: String, default: '' },
});

defineEmits(['checkpoint']);

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function kindLabel(kind) {
  return { pull: 'Pull', merge: 'Merge', dao_edit: 'DAO', fork_genesis: 'Branch' }[kind] || kind;
}
</script>

<style module>
.panel {
  width: 180px;
  flex-shrink: 0;
  border-left: 2px solid #651fff;
  padding: 0.75rem 0.75rem 0.75rem 0.65rem;
  background: rgba(101, 31, 255, 0.06);
}
.upstreamLink {
  display: block;
  font-size: 0.72rem;
  color: #c4b5fd;
  text-decoration: none;
  margin-bottom: 0.5rem;
}
.upstreamLink:hover {
  text-decoration: underline;
}
.stats {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.45rem;
}
.stat {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.4rem;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 3px;
  opacity: 0.75;
}
.statWarn {
  border-color: #fbbf24;
  color: #fcd34d;
  opacity: 1;
}
.hint {
  font-size: 10px;
  opacity: 0.55;
  line-height: 1.35;
  margin: 0 0 0.35rem;
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
  max-height: 140px;
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
  color: #67e8f9;
  opacity: 0.85;
}
</style>
