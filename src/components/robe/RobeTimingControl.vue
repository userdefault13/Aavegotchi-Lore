<template>
  <div :class="$style.wrap">
    <label class="text-xs opacity-70">Hold duration</label>
    <p class="text-[10px] opacity-60 mt-0.5">Auto: {{ formatHoldSeconds(estimated) }} (from caption)</p>
    <div class="flex gap-1 items-center mt-1">
      <input
        v-model.number="overrideMs"
        type="number"
        min="500"
        max="15000"
        step="100"
        class="input-gotchi text-xs w-24"
        placeholder="Override ms"
        @change="emitOverride"
      />
      <button type="button" class="btn-pixel text-[8px]" @click="clearOverride">Use auto</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { estimateHoldMs, formatHoldSeconds } from '@/utils/robeTiming';

const props = defineProps({
  captionText: { type: String, default: '' },
  holdDurationMs: { type: Number, default: null },
});
const emit = defineEmits(['update:holdDurationMs']);

const overrideMs = ref(props.holdDurationMs ?? null);
const estimated = computed(() => estimateHoldMs(props.captionText));

watch(
  () => props.holdDurationMs,
  (v) => {
    overrideMs.value = v ?? null;
  },
);

function emitOverride() {
  const v = overrideMs.value;
  emit('update:holdDurationMs', v && v > 0 ? v : null);
}

function clearOverride() {
  overrideMs.value = null;
  emit('update:holdDurationMs', null);
}
</script>

<style module>
.wrap {
  margin-bottom: 0.75rem;
}
</style>
