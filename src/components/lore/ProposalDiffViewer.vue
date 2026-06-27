<template>
  <div :class="$style.viewer">
    <p v-if="!patches?.length" class="text-xs opacity-50">No field changes detected.</p>
    <section v-for="patch in patches" :key="patch.pageKey" :class="$style.pagePatch">
      <header :class="$style.pageHead">
        <span :class="$style.action">{{ actionLabel(patch.action) }}</span>
        <strong class="text-xs">{{ patch.pageTitle || patch.pageKey }}</strong>
        <span class="text-[10px] opacity-50">{{ patch.pageKey }}</span>
      </header>
      <ul :class="$style.hunks">
        <li v-for="(hunk, i) in patch.hunks" :key="i" :class="{ [$style.conflict]: hunk.conflict }">
          <div :class="$style.hunkHead">
            <span>{{ formatHunkPath(hunk.path) }}</span>
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
            :page-key="patch.pageKey"
            :hunk-path="hunk.path"
            :hunk="hunk"
          />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { actionLabel, formatHunkPath, formatHunkValue } from '@/utils/loreDiff';

defineProps({
  patches: { type: Array, default: () => [] },
});
</script>

<style module>
.viewer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.pagePatch {
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 6px;
  overflow: hidden;
  background: rgba(15, 11, 30, 0.6);
}
.pageHead {
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
  color: #c4b5fd;
}
.hunks {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
}
.hunks li {
  margin-bottom: 0.65rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px dashed rgba(139, 125, 184, 0.15);
}
.hunks li:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.conflict {
  background: rgba(251, 191, 36, 0.08);
  border-radius: 4px;
  padding: 0.35rem !important;
}
.hunkHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.68rem;
  margin-bottom: 0.35rem;
  opacity: 0.85;
}
.conflictBadge {
  font-size: 0.55rem;
  text-transform: uppercase;
  color: #fcd34d;
  letter-spacing: 0.05em;
}
.diffRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.col pre,
.upstream pre {
  margin: 0.15rem 0 0;
  font-size: 0.65rem;
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-word;
  opacity: 0.9;
}
.label {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
}
.upstream {
  margin-top: 0.35rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(251, 191, 36, 0.25);
}
</style>
