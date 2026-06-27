<template>
  <div :class="[$style.card, selected && $style.selected]">
    <Handle type="target" :position="Position.Top" :class="$style.handle" />
    <div :class="$style.iconWrap" :style="{ borderColor: data.color }">
      <span :class="$style.icon" :style="{ color: data.color }">{{ data.icon }}</span>
    </div>
    <span :class="$style.label">{{ data.label }}</span>
    <Handle type="source" :position="Position.Bottom" :class="$style.handle" />
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core';

defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
});
</script>

<style module>
.card {
  min-width: 72px;
  max-width: 120px;
  padding: 0.5rem 0.4rem 0.55rem;
  background: rgba(15, 11, 30, 0.92);
  border: 2px solid rgba(139, 125, 184, 0.45);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}
.selected {
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.35);
}
.iconWrap {
  width: 28px;
  height: 28px;
  border: 2px solid;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}
.icon {
  font-size: 14px;
  line-height: 1;
}
.label {
  font-size: 9px;
  text-align: center;
  line-height: 1.25;
  color: #e2e8f0;
  word-break: break-word;
}
.handle {
  width: 6px;
  height: 6px;
  background: #8b7db8;
  border: none;
}
</style>
