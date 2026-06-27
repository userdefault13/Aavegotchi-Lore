<template>
  <div :class="$style.wrap">
    <div :class="$style.toolbar">
      <input v-model="localTitle" class="input-gotchi" placeholder="Map title" @change="$emit('update:title', localTitle)" />
      <label class="btn-pixel text-[8px] cursor-pointer">
        Upload
        <input type="file" accept="image/*" hidden @change="onUpload" />
      </label>
      <button type="button" class="btn-pixel text-[8px]" @click="addPin('page')">+ Page Pin</button>
      <button type="button" class="btn-pixel text-[8px]" @click="addPin('direction')">+ Direction</button>
    </div>
    <div ref="canvasRef" :class="$style.canvas" @click="onCanvasClick">
      <img v-if="imageUrl" :src="imageUrl" alt="" :class="$style.img" />
      <div
        v-for="pin in pins"
        :key="pin.id"
        :class="[$style.pin, $style[pin.type]]"
        :style="{ left: `${pin.x}%`, top: `${pin.y}%` }"
        @click.stop="$emit('pin-click', pin)"
      >
        {{ pin.type === 'page' ? '📍' : '➡️' }}
      </div>
    </div>
    <div v-if="situational" :class="$style.layers">
      <label v-for="layer in ['visible', 'audible', 'discoverable']" :key="layer" class="text-xs">
        <input type="checkbox" :checked="situational[layer]?.length" @change="toggleLayer(layer)" />
        {{ layer }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { loreApi } from '@/services/api';

const props = defineProps({
  title: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  pins: { type: Array, default: () => [] },
  situational: { type: Object, default: null },
});

const emit = defineEmits(['update:title', 'update:imageUrl', 'update:pins', 'pin-click', 'update:situational']);
const localTitle = ref(props.title);
const canvasRef = ref(null);

watch(() => props.title, (v) => { localTitle.value = v; });

async function onUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const { url } = await loreApi.uploadAsset(file);
  emit('update:imageUrl', url);
}

function addPin(type) {
  const pins = [...props.pins, { id: `pin-${Date.now()}`, type, x: 50, y: 50, pageId: null }];
  emit('update:pins', pins);
}

function onCanvasClick(e) {
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  if (props.pins.length && e.shiftKey) {
    const pins = [...props.pins];
    pins[pins.length - 1] = { ...pins[pins.length - 1], x, y };
    emit('update:pins', pins);
  }
}

function toggleLayer(layer) {
  if (!props.situational) return;
  const next = { ...props.situational, [layer]: props.situational[layer]?.length ? [] : ['marker'] };
  emit('update:situational', next);
}
</script>

<style module>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.canvas {
  position: relative;
  min-height: 320px;
  background: #0f0b1e;
  border: 2px solid #8b7db8;
  border-radius: 8px;
  overflow: hidden;
}
.img {
  width: 100%;
  display: block;
  pointer-events: none;
}
.pin {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  font-size: 1.25rem;
}
.layers {
  display: flex;
  gap: 1rem;
}
</style>
