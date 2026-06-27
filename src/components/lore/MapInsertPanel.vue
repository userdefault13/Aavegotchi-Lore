<template>
  <aside :class="$style.panel">
    <div :class="$style.tabs">
      <button
        type="button"
        :class="[$style.tab, tab === 'insert' && $style.tabActive]"
        @click="tab = 'insert'"
      >
        Insert
      </button>
      <button
        type="button"
        :class="[$style.tab, tab === 'pin' && $style.tabActive, !selectedPin && $style.tabDisabled]"
        :disabled="!selectedPin"
        @click="selectedPin && (tab = 'pin')"
      >
        Pin
      </button>
      <button
        type="button"
        :class="[$style.tab, tab === 'style' && $style.tabActive]"
        @click="tab = 'style'"
      >
        Style
      </button>
    </div>

    <div :class="$style.body">
      <div v-show="tab === 'insert'">
        <p :class="$style.section">Create</p>
        <button type="button" :class="$style.tool" @click="$emit('new-diagram')">
          <span>⑂</span> New diagram page
        </button>
        <button type="button" :class="$style.tool" @click="$emit('open-ai-art', 'pin')">
          <span>✨</span> AI art (optional)
        </button>
        <button type="button" :class="$style.tool" @click="$emit('open-ai-art', 'map')">
          <span>🎨</span> AI map texture
        </button>

        <p :class="$style.section">Markers</p>
        <button
          type="button"
          :class="[$style.tool, placeMode === 'page' && $style.toolActive]"
          @click="$emit('place-pin', 'page')"
        >
          <span>📍</span> Add a pin
        </button>
        <button
          type="button"
          :class="[$style.tool, placeMode === 'direction' && $style.toolActive]"
          @click="$emit('place-pin', 'direction')"
        >
          <span>➡️</span> Direction pin
        </button>
        <button
          type="button"
          :class="[$style.tool, connectMode && $style.toolActive]"
          :disabled="!selectedPin"
          @click="$emit('toggle-connect')"
        >
          <span>↔</span> Connect paths
        </button>
        <button
          type="button"
          :class="[$style.tool, placeMode === 'terrain' && $style.toolActive]"
          @click="$emit('place-pin', 'terrain')"
        >
          <span>⛰️</span> Terrain pin
        </button>
        <button
          v-if="showDistrictToggle"
          type="button"
          :class="$style.tool"
          @click="$emit('toggle-districts')"
        >
          <span>▦</span> {{ showDistricts ? 'Hide' : 'Show' }} districts
        </button>
        <button type="button" :class="$style.tool" @click="$emit('reset-view')">
          <span>⌂</span> Reset zoom
        </button>
      </div>

      <MapPinInspector
        v-if="tab === 'pin' && selectedPin"
        :pin="selectedPin"
        :pins="pins"
        :paths="paths"
        :pages="pages"
        :templates="templates"
        :world-id="worldId"
        :connect-mode="connectMode"
        @update-label="$emit('update-pin-label', $event)"
        @update-type="$emit('update-pin-type', $event)"
        @link-page="$emit('link-page', $event)"
        @unlink-page="$emit('unlink-page')"
        @create-page="$emit('create-page-from-pin', $event)"
        @add-path="$emit('add-path', $event)"
        @remove-path="$emit('remove-path', $event)"
        @toggle-connect="$emit('toggle-connect')"
        @delete-pin="$emit('delete-pin')"
      />

      <div v-show="tab === 'style'">
        <p :class="$style.section">Map style</p>
        <label :class="$style.field">
          <span>Preset</span>
          <select :value="mapPreset" class="input-gotchi text-xs" @change="$emit('update:mapPreset', $event.target.value)">
            <option v-for="p in MAP_PRESET_LIST" :key="p.id" :value="p.id">{{ p.label }}</option>
            <option value="custom">Custom upload</option>
          </select>
        </label>
        <label v-if="mapPreset === 'custom'" class="btn-pixel text-[8px] cursor-pointer mt-2 block text-center">
          Upload map
          <input type="file" accept="image/*" hidden @change="onUpload" />
        </label>
        <button
          v-if="showSeedLandmarks"
          type="button"
          class="btn-pixel text-[8px] w-full mt-2"
          @click="$emit('seed-landmarks')"
        >
          Seed Gotchiverse locations
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { loreApi } from '@/services/api';
import { MAP_PRESET_LIST } from '@/constants/gotchiverseMaps';
import MapPinInspector from '@/components/lore/MapPinInspector.vue';

const props = defineProps({
  placeMode: { type: String, default: null },
  mapPreset: { type: String, default: 'gotchiverse' },
  selectedPin: { type: Object, default: null },
  pins: { type: Array, default: () => [] },
  paths: { type: Array, default: () => [] },
  connectMode: { type: Boolean, default: false },
  pages: { type: Array, default: () => [] },
  templates: { type: Array, default: () => [] },
  worldId: { type: String, required: true },
  showDistricts: { type: Boolean, default: true },
  showDistrictToggle: { type: Boolean, default: false },
  showSeedLandmarks: { type: Boolean, default: false },
});

const emit = defineEmits([
  'new-diagram',
  'place-pin',
  'toggle-districts',
  'reset-view',
  'update:mapPreset',
  'update-pin-label',
  'update-pin-type',
  'link-page',
  'unlink-page',
  'create-page-from-pin',
  'add-path',
  'remove-path',
  'toggle-connect',
  'delete-pin',
  'seed-landmarks',
  'upload',
  'open-ai-art',
]);

const tab = ref('insert');

watch(
  () => props.selectedPin,
  (pin) => {
    if (pin) tab.value = 'pin';
  },
);

async function onUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const { url } = await loreApi.uploadAsset(file);
  emit('upload', url);
}
</script>

<style module>
.panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #120a22;
  border-left: 1px solid rgba(139, 125, 184, 0.35);
}
.tabs {
  display: flex;
  border-bottom: 1px solid rgba(139, 125, 184, 0.25);
}
.tab {
  flex: 1;
  padding: 0.55rem 0.2rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.tabActive {
  color: #c4b5fd;
  box-shadow: inset 0 -2px 0 #8b57ff;
}
.tabDisabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.body {
  padding: 0.65rem 0.55rem;
  overflow-y: auto;
  flex: 1;
}
.section {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.45;
  margin: 0 0 0.4rem;
}
.section:not(:first-child) {
  margin-top: 0.85rem;
}
.tool {
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
  cursor: pointer;
  text-align: left;
}
.tool:hover {
  background: rgba(139, 87, 255, 0.14);
}
.toolActive {
  background: rgba(139, 87, 255, 0.28);
  color: #fff;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.8;
}
</style>
