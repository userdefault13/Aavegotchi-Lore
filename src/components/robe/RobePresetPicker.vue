<template>
  <div :class="$style.wrap">
    <p class="font-pixel text-[8px] mb-2 opacity-80">Layout preset</p>
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        class="btn-pixel text-[8px]"
        :class="{ 'opacity-100': modelValue === p.id }"
        @click="$emit('update:modelValue', p.id)"
      >
        {{ p.label }}
      </button>
      <button type="button" class="btn-pixel text-[8px] opacity-60" @click="$emit('update:modelValue', null)">Clear</button>
    </div>
  </div>
</template>

<script setup>
import { ROBE_PRESETS } from '@/utils/robeCompositor';

defineProps({ modelValue: { type: String, default: null } });
defineEmits(['update:modelValue']);

const presets = Object.values(ROBE_PRESETS);
</script>

<style module>
.wrap {
  margin-bottom: 0.75rem;
}
</style>
