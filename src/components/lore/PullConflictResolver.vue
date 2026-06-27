<template>
  <div :class="$style.list">
    <p v-if="!conflicts.length" class="text-xs opacity-50">No conflicts — pull can proceed.</p>
    <article v-for="(c, i) in conflicts" :key="cKey(c)" :class="$style.item">
      <header :class="$style.head">
        <strong class="text-xs">{{ c.nodeTitle || c.pageTitle || c.nodeKey || c.pageKey }}</strong>
        <span class="text-[10px] opacity-50">{{ formatHunkPath(c.path) }}</span>
      </header>

      <div :class="$style.cols">
        <div :class="$style.col">
          <span :class="$style.label">Base</span>
          <pre>{{ formatHunkValue(c.base) }}</pre>
        </div>
        <div :class="$style.col">
          <span :class="$style.label">Your branch</span>
          <pre>{{ formatHunkValue(c.ours) }}</pre>
        </div>
        <div :class="$style.col">
          <span :class="$style.label">Canon now</span>
          <pre>{{ formatHunkValue(c.theirs) }}</pre>
        </div>
      </div>

      <div :class="$style.choices">
        <label :class="[$style.choice, model[cKey(c)] === 'mine' && $style.choiceActive]">
          <input v-model="model[cKey(c)]" type="radio" :name="`c-${i}`" value="mine" />
          Keep mine
        </label>
        <label :class="[$style.choice, model[cKey(c)] === 'theirs' && $style.choiceActive]">
          <input v-model="model[cKey(c)]" type="radio" :name="`c-${i}`" value="theirs" />
          Take canon
        </label>
      </div>
    </article>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { conflictKey, formatHunkPath, formatHunkValue } from '@/utils/loreDiff';

const props = defineProps({
  conflicts: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const model = reactive({ ...props.modelValue });

watch(
  () => props.conflicts,
  (list) => {
    for (const c of list) {
      const key = cKey(c);
      if (!model[key]) model[key] = 'mine';
    }
  },
  { immediate: true },
);

watch(
  model,
  () => emit('update:modelValue', { ...model }),
  { deep: true },
);

function cKey(c) {
  return conflictKey(c.nodeKey || c.pageKey, c.path);
}
</script>

<style module>
.list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.item {
  border: 1px solid rgba(251, 191, 36, 0.35);
  border-radius: 6px;
  padding: 0.55rem;
  background: rgba(251, 191, 36, 0.06);
}
.head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
}
.cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.35rem;
  margin-bottom: 0.45rem;
}
.col pre {
  margin: 0.12rem 0 0;
  font-size: 0.62rem;
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-word;
}
.label {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
}
.choices {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.choice {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid rgba(139, 125, 184, 0.3);
  border-radius: 3px;
  cursor: pointer;
}
.choiceActive {
  border-color: #a78bfa;
  background: rgba(101, 31, 255, 0.12);
}
.choice input {
  accent-color: #a78bfa;
}
</style>
