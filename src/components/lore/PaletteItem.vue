<template>
  <button
    type="button"
    :class="[$style.item, disabled && $style.disabled]"
    :draggable="!disabled"
    :disabled="disabled"
    @dragstart="onDragStart"
    @click="!disabled && $emit('add')"
  >
    <span :class="$style.icon">{{ item.icon }}</span>
    <span :class="$style.label">{{ item.label }}</span>
  </button>
</template>

<script setup>
import { PALETTE_MIME, paletteDragPayload } from '@/utils/blockPalette';

const props = defineProps({
  item: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
});

defineEmits(['add']);

function onDragStart(evt) {
  if (props.disabled) {
    evt.preventDefault();
    return;
  }
  evt.dataTransfer.setData(PALETTE_MIME, paletteDragPayload(props.item));
  evt.dataTransfer.effectAllowed = 'copy';
}
</script>

<style module>
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.4rem;
  margin-bottom: 0.2rem;
  background: none;
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.78rem;
  cursor: grab;
  text-align: left;
}
.item:hover:not(.disabled) {
  background: rgba(139, 87, 255, 0.14);
}
.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.icon {
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
}
.label {
  flex: 1;
}
</style>
