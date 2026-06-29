<template>
  <aside :class="$style.panel">
    <h3 class="font-pixel text-[8px] mb-2">Layers</h3>
    <ul :class="$style.list">
      <li
        v-for="layer in sortedLayers"
        :key="layer.id"
        :class="[$style.row, { [$style.active]: layer.id === selectedLayerId }]"
        @click="$emit('select-layer', layer.id)"
      >
        <span>{{ layer.kind === 'text' ? 'T' : 'IMG' }}</span>
        <span class="truncate flex-1">{{ layerLabel(layer) }}</span>
        <button type="button" class="text-xs opacity-60" @click.stop="$emit('remove-layer', layer.id)">×</button>
      </li>
    </ul>
    <div class="flex flex-col gap-1 mt-2">
      <label class="btn-pixel text-[8px] cursor-pointer text-center">
        Upload image
        <input type="file" accept="image/*" hidden @change="onUpload" />
      </label>
      <button type="button" class="btn-pixel text-[8px]" @click="$emit('add-text')">+ Text</button>
      <MediaLibrary compact title="Library" @select="onPick" />
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import MediaLibrary from '@/components/lore/MediaLibrary.vue';
import { loreApi } from '@/services/api';

const props = defineProps({
  layers: { type: Array, default: () => [] },
  selectedLayerId: { type: String, default: '' },
});
const emit = defineEmits(['select-layer', 'remove-layer', 'add-image', 'add-text']);

const sortedLayers = computed(() =>
  [...props.layers].sort((a, b) => (b.z ?? 0) - (a.z ?? 0)),
);

function layerLabel(layer) {
  if (layer.kind === 'text') return (layer.text || 'Text').slice(0, 24);
  return layer.assetUrl ? 'Image' : 'Empty image';
}

async function onUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const asset = await loreApi.uploadAsset(file);
  emit('add-image', asset.url);
  e.target.value = '';
}

function onPick(url) {
  emit('add-image', url);
}
</script>

<style module>
.panel {
  width: 180px;
  flex-shrink: 0;
  border-left: 1px solid rgba(139, 125, 184, 0.25);
  padding: 0.75rem;
  overflow-y: auto;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
}
.row:hover {
  background: rgba(139, 87, 255, 0.12);
}
.active {
  background: rgba(236, 72, 153, 0.2);
}
</style>
