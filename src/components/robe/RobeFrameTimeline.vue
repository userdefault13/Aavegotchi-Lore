<template>
  <div :class="$style.timeline">
    <button
      v-for="frame in frames"
      :key="frame.id"
      type="button"
      :class="[$style.thumb, { [$style.selected]: frame.id === selectedId }]"
      @click="$emit('select', frame.id)"
    >
      <img v-if="thumbUrl(frame)" :src="thumbUrl(frame)" :alt="frame.sceneTitle" :class="$style.img" />
      <div v-else :class="$style.placeholder">🎬</div>
      <span :class="$style.caption">{{ frame.sceneTitle || 'Scene' }}</span>
    </button>
  </div>
</template>

<script setup>
import { frameThumbnailUrl } from '@/utils/robeCompositor';

defineProps({
  frames: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
});
defineEmits(['select']);

function thumbUrl(frame) {
  return frameThumbnailUrl(frame);
}
</script>

<style module>
.timeline {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(139, 125, 184, 0.25);
}
.thumb {
  flex-shrink: 0;
  width: 120px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: rgba(18, 10, 34, 0.6);
  padding: 0.35rem;
  cursor: pointer;
  color: inherit;
  text-align: left;
}
.selected {
  border-color: #ec4899;
}
.img {
  width: 100%;
  height: 68px;
  object-fit: cover;
  border-radius: 4px;
  background: #0f0b1e;
}
.placeholder {
  width: 100%;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #1a142d;
  border-radius: 4px;
}
.caption {
  display: block;
  font-size: 0.65rem;
  margin-top: 0.25rem;
  opacity: 0.85;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
