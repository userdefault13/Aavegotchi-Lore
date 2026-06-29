<template>
  <div :class="$style.wrap">
    <label class="text-xs opacity-70">Transition to next frame</label>
    <div class="flex gap-1 flex-wrap mt-1">
      <select v-model="local.type" class="input-gotchi text-xs w-auto" @change="emitUpdate">
        <option value="fade">Fade</option>
        <option value="slide">Slide</option>
        <option value="cut">Cut</option>
      </select>
      <input
        v-model.number="local.durationMs"
        type="number"
        min="0"
        max="3000"
        step="100"
        class="input-gotchi text-xs w-20"
        @change="emitUpdate"
      />
      <span class="text-xs opacity-50 self-center">ms</span>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: () => ({ type: 'fade', durationMs: 600 }) },
});
const emit = defineEmits(['update:modelValue']);

const local = reactive({ type: 'fade', durationMs: 600, ...props.modelValue });

watch(
  () => props.modelValue,
  (v) => Object.assign(local, v || { type: 'fade', durationMs: 600 }),
  { deep: true },
);

function emitUpdate() {
  emit('update:modelValue', { ...local });
}
</script>

<style module>
.wrap {
  margin-bottom: 0.75rem;
}
</style>
