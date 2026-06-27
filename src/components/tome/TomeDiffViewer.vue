<template>
  <div :class="$style.viewer">
    <p v-if="!patches?.length" class="text-xs opacity-50">No scene changes detected.</p>
    <section v-for="patch in patches" :key="patch.nodeKey" :class="$style.nodePatch">
      <header :class="$style.nodeHead">
        <span :class="$style.action">{{ actionLabel(patch.action) }}</span>
        <strong class="text-xs">{{ patch.nodeTitle || patch.nodeKey }}</strong>
        <span class="text-[10px] opacity-50">{{ patch.nodeKey }}</span>
      </header>
      <ul :class="$style.hunks">
        <li v-for="(hunk, i) in patch.hunks" :key="i" :class="{ [$style.conflict]: hunk.conflict }">
          <div :class="$style.hunkHead">
            <span>{{ formatNodeHunkPath(hunk.path) }}</span>
            <span v-if="hunk.conflict" :class="$style.conflictBadge">Conflict</span>
          </div>
          <div :class="$style.diffRow">
            <div :class="$style.col">
              <span :class="$style.label">Before</span>
              <pre>{{ formatHunkValue(hunk.before) }}</pre>
            </div>
            <div :class="$style.col">
              <span :class="$style.label">After</span>
              <pre>{{ formatHunkValue(hunk.after) }}</pre>
            </div>
          </div>
          <div v-if="hunk.conflict" :class="$style.upstream">
            <span :class="$style.label">Canon now</span>
            <pre>{{ formatHunkValue(hunk.upstream) }}</pre>
          </div>
          <slot
            name="hunk-comments"
            :node-key="patch.nodeKey"
            :hunk-path="hunk.path"
            :hunk="hunk"
          />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { actionLabel, formatHunkValue } from '@/utils/loreDiff';

defineProps({
  patches: { type: Array, default: () => [] },
});

function formatNodeHunkPath(path) {
  if (!path) return '';
  if (path === '_node') return 'Scene';
  if (path === 'choices') return 'Choices';
  if (path === 'roles') return 'Roles';
  if (path === 'crossLinks') return 'Cross-links';
  if (path === 'situational') return 'Situational';
  if (path === 'branchIndex') return 'Branch index';
  if (path === 'order') return 'Order';
  if (path === 'type') return 'Type';
  if (path === 'frame') return 'Frame';
  if (path === 'content') return 'Content';
  if (path === 'title') return 'Title';
  return path;
}
</script>

<style module>
.viewer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.nodePatch {
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 6px;
  overflow: hidden;
  background: rgba(15, 11, 30, 0.6);
}
.nodeHead {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  padding: 0.45rem 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(139, 125, 184, 0.2);
}
.action {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #67e8f9;
}
.hunks {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hunkHead {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}
.diffRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
}
.col {
  min-width: 0;
}
.label {
  display: block;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.45;
  margin-bottom: 0.15rem;
}
.col pre,
.upstream pre {
  margin: 0;
  padding: 0.35rem;
  font-size: 0.68rem;
  line-height: 1.35;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  white-space: pre-wrap;
  word-break: break-word;
}
.conflict {
  border: 1px solid rgba(251, 191, 36, 0.35);
  border-radius: 4px;
  padding: 0.35rem;
}
.conflictBadge {
  font-size: 0.55rem;
  color: #fcd34d;
  text-transform: uppercase;
}
.upstream {
  margin-top: 0.35rem;
}
</style>
