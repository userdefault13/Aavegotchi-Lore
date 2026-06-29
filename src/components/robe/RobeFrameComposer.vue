<template>
  <div :class="$style.wrap">
    <div :class="$style.canvasWrap">
      <canvas ref="canvasEl" :class="$style.canvas" width="1280" height="720" @mousedown="onCanvasDown" />
      <div v-if="!hasBackgroundImage" :class="$style.emptyOverlay">
        <p class="text-xs opacity-80 mb-2">No frame art yet</p>
        <button type="button" class="btn-pixel text-[8px]" @click="$emit('generate-pixel-lab')">
          ✨ Generate with Pixel Lab
        </button>
      </div>
    </div>
    <div v-if="selectedLayer" :class="$style.handles">
      <p class="text-[10px] opacity-60 mb-1">Drag layer · resize from corner</p>
      <div class="grid grid-cols-2 gap-1">
        <label class="text-[10px]">X<input v-model.number="selectedLayer.x" type="number" class="input-gotchi text-xs" @change="emitLayers" /></label>
        <label class="text-[10px]">Y<input v-model.number="selectedLayer.y" type="number" class="input-gotchi text-xs" @change="emitLayers" /></label>
        <label class="text-[10px]">W<input v-model.number="selectedLayer.w" type="number" class="input-gotchi text-xs" @change="emitLayers" /></label>
        <label class="text-[10px]">H<input v-model.number="selectedLayer.h" type="number" class="input-gotchi text-xs" @change="emitLayers" /></label>
      </div>
      <textarea
        v-if="selectedLayer.kind === 'text'"
        v-model="selectedLayer.text"
        class="input-gotchi text-xs mt-1 w-full"
        rows="3"
        @input="emitLayers"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { compositeFrameToCanvas, frameHasBackgroundImage } from '@/utils/robeCompositor';

const props = defineProps({
  frame: { type: Object, required: true },
  selectedLayerId: { type: String, default: '' },
});
const emit = defineEmits(['update:layers', 'generate-pixel-lab']);

const hasBackgroundImage = computed(() => frameHasBackgroundImage(props.frame));

const canvasEl = ref(null);
const drag = ref(null);

const layers = computed({
  get: () => props.frame.layers || [],
  set: (v) => emit('update:layers', v),
});

const selectedLayer = computed(() => layers.value.find((l) => l.id === props.selectedLayerId));

async function redraw() {
  if (!canvasEl.value) return;
  await compositeFrameToCanvas(canvasEl.value, props.frame, { scale: 0.5 });
  const ctx = canvasEl.value.getContext('2d');
  const layer = selectedLayer.value;
  if (layer) {
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(layer.x * 0.5, layer.y * 0.5, layer.w * 0.5, layer.h * 0.5);
  }
}

watch(() => [props.frame, props.selectedLayerId], redraw, { deep: true, immediate: true });

function emitLayers() {
  emit('update:layers', [...layers.value]);
  redraw();
}

function hitLayer(x, y) {
  const scale = 0.5;
  const px = x / scale;
  const py = y / scale;
  const sorted = [...layers.value].sort((a, b) => (b.z ?? 0) - (a.z ?? 0));
  return sorted.find((l) => px >= l.x && px <= l.x + l.w && py >= l.y && py <= l.y + l.h);
}

function onCanvasDown(e) {
  const rect = canvasEl.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const layer = hitLayer(x, y);
  if (!layer) return;
  drag.value = { layerId: layer.id, startX: e.clientX, startY: e.clientY, ox: layer.x, oy: layer.y };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function onMove(e) {
  if (!drag.value) return;
  const layer = layers.value.find((l) => l.id === drag.value.layerId);
  if (!layer) return;
  const scale = 0.5;
  layer.x = Math.round(drag.value.ox + (e.clientX - drag.value.startX) / scale);
  layer.y = Math.round(drag.value.oy + (e.clientY - drag.value.startY) / scale);
  emitLayers();
}

function onUp() {
  drag.value = null;
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', onUp);
}
</script>

<style module>
.wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.canvasWrap {
  position: relative;
  max-width: 640px;
}
.canvas {
  width: 100%;
  max-width: 640px;
  height: auto;
  border: 2px solid #47238d;
  border-radius: 4px;
  cursor: crosshair;
  background: #0f0b1e;
}
.emptyOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(15, 11, 30, 0.72);
  pointer-events: auto;
}
.handles {
  margin-top: 0.75rem;
  max-width: 640px;
}
</style>
