<template>
  <div v-if="world" :class="$style.workspace">
    <header :class="$style.topbar">
      <div :class="$style.topLeft">
        <button type="button" class="btn-pixel text-[8px]" title="Search" @click="ui.searchOpen = true">🔍</button>
        <button type="button" class="btn-pixel text-[8px]" :disabled="!canUndo" @click="undo">Undo</button>
        <button type="button" class="btn-pixel text-[8px]" :disabled="!canRedo" @click="redo">Redo</button>
      </div>
      <h1 class="font-pixel text-[9px] opacity-90">Lore — {{ world.title }}</h1>
      <div :class="$style.topRight">
        <button type="button" class="btn-pixel text-[8px]" @click="showAddMap = !showAddMap">+ Map</button>
        <div v-if="showAddMap" :class="$style.addMenu">
          <button
            v-for="p in MAP_PRESET_LIST"
            :key="p.id"
            type="button"
            class="btn-pixel text-[8px] w-full text-left"
            @click="createMap(p)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </header>

    <div :class="$style.tabs">
      <button
        v-for="m in maps"
        :key="m.id"
        type="button"
        :class="[$style.tab, { [$style.tabActive]: m.id === activeMapId }]"
        @click="selectMap(m.id)"
      >
        {{ m.title }}
        <span
          v-if="maps.length > 1"
          :class="$style.tabClose"
          @click.stop="closeMap(m.id)"
        >×</span>
      </button>
    </div>

    <div :class="$style.body">
      <LoreWorkspaceRail :world-id="worldId" active="maps" />
      <MapLocationList
        :world-title="world.title"
        :items="locationItems"
        :selected-id="selectedPinId"
        @select="onLocationSelect"
      />
      <main :class="$style.mapArea">
        <GotchiverseMapCanvas
          v-if="activeMap"
          ref="canvasRef"
          chromeless
          max-height="100%"
          :map-preset="activeMap.mapPreset || 'gotchiverse'"
          :image-url="activeMap.imageUrl"
          :map-width="activeMap.mapWidth"
          :map-height="activeMap.mapHeight"
          :pins="activeMap.pins"
          :paths="activeMap.paths || []"
          :selected-pin-id="selectedPinId"
          :place-mode="placeMode"
          :connect-mode="connectMode"
          :show-districts="showDistricts"
          @update:pins="onPinsChange"
          @pin-click="onPinClick"
          @pin-place="onPinPlaced"
        />
      </main>
      <MapInsertPanel
        :place-mode="placeMode"
        :map-preset="activeMap?.mapPreset || 'gotchiverse'"
        :selected-pin="selectedPin"
        :pins="activeMap?.pins || []"
        :paths="activeMap?.paths || []"
        :connect-mode="connectMode"
        :pages="pages"
        :templates="templates"
        :world-id="worldId"
        :show-districts="showDistricts"
        :show-district-toggle="activeMap?.mapPreset === 'citaadel'"
        :show-seed-landmarks="activeMap && isGotchiverseOverviewMap(activeMap)"
        @new-diagram="createDiagramPage"
        @place-pin="setPlaceMode"
        @toggle-districts="showDistricts = !showDistricts"
        @reset-view="canvasRef?.resetView()"
        @update:map-preset="onPresetChange"
        @update-pin-label="updatePinLabel"
        @update-pin-type="updatePinType"
        @link-page="linkPage"
        @unlink-page="unlinkPage"
        @create-page-from-pin="onCreatePageFromPin"
        @add-path="addPathToSelected"
        @remove-path="removePath"
        @toggle-connect="toggleConnectMode"
        @delete-pin="deleteSelectedPin"
        @seed-landmarks="seedLandmarks"
        @upload="onUpload"
        @open-ai-art="openAiArt"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import { useUiStore } from '@/stores';
import GotchiverseMapCanvas from '@/components/lore/GotchiverseMapCanvas.vue';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';
import MapLocationList from '@/components/lore/MapLocationList.vue';
import MapInsertPanel from '@/components/lore/MapInsertPanel.vue';
import { MAP_PRESET_LIST, getMapPreset, isGotchiverseOverviewMap } from '@/constants/gotchiverseMaps';
import { buildLandmarkPins, mergeLandmarkPins, landmarksChanged } from '@/constants/gotchiverseLandmarks';
import { GOTCHI_TEMPLATES } from '@/seed/gotchiTemplates';
import { useAibotStore } from '@/stores';
import {
  buildMapBackgroundPrompt,
  buildMapPinPrompt,
} from '@/utils/aibotPrompts';
import { findPinsForPage, resolveMapPinDeepLink } from '@/utils/mapPins';
import { linkLandmarkPinsToPages } from '@/utils/landmarkPages';
import { addPinPath, removePinPath, removePathsForPin } from '@/utils/mapPinPaths';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const worldId = computed(() => route.params.worldId);
const world = ref(null);
const pages = ref([]);
const templates = ref(GOTCHI_TEMPLATES);
const maps = ref([]);
const activeMapId = ref('');
const selectedPinId = ref('');
const highlightPageId = ref('');
const placeMode = ref(null);
const connectMode = ref(false);
const showDistricts = ref(true);
const showAddMap = ref(false);
const canvasRef = ref(null);
const aibot = useAibotStore();

const history = ref([]);
const historyIndex = ref(-1);

const activeMap = computed(() => maps.value.find((m) => m.id === activeMapId.value));
const selectedPin = computed(() => activeMap.value?.pins?.find((p) => p.id === selectedPinId.value) || null);

const PIN_COLORS = {
  page: '#4ade80',
  direction: '#38bdf8',
  terrain: '#9ca3af',
  landmark: '#c084fc',
};

const locationItems = computed(() => {
  const pageById = (id) => pages.value.find((p) => p.id === id);
  const pagePinIds = highlightPageId.value
    ? new Set(findPinsForPage(maps.value, highlightPageId.value).map(({ pin }) => pin.id))
    : new Set();

  const pinItems = (activeMap.value?.pins || []).map((pin) => {
    const linkedPage = pin.pageId ? pageById(pin.pageId) : null;
    return {
      id: pin.id,
      label: pin.label || pin.type || 'Pin',
      subtitle: linkedPage?.title,
      linked: !!linkedPage,
      highlight: pagePinIds.has(pin.id),
      color: pin.color || PIN_COLORS[pin.type] || PIN_COLORS.page,
      pin,
    };
  });

  return pinItems.sort((a, b) => a.label.localeCompare(b.label));
});

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);

onMounted(load);
watch(
  () => [route.query.map, route.query.pin, route.query.page],
  () => applyDeepLink(),
);
watch(activeMapId, (id, prev) => {
  if (!applyingDeepLink.value && id !== prev) {
    selectedPinId.value = '';
    placeMode.value = null;
    connectMode.value = false;
    syncMapUrl({ pin: undefined, page: undefined });
  }
});

const applyingDeepLink = ref(false);

async function load() {
  world.value = await loreApi.getWorld(worldId.value);
  if (world.value.templateDefs?.length) templates.value = world.value.templateDefs;
  pages.value = await loreApi.listPages(worldId.value);
  maps.value = await loreApi.listMaps(worldId.value);
  if (maps.value.length) {
    activeMapId.value = maps.value[0].id;
  } else {
    await seedDefaultMaps();
  }
  pushHistory();
  await ensureGotchiverseLandmarks();
  await applyDeepLink();
}

async function ensureGotchiverseLandmarks() {
  for (const map of maps.value) {
    if (!isGotchiverseOverviewMap(map)) continue;
    let merged = mergeLandmarkPins(map.pins || []);
    const linked = await linkLandmarkPinsToPages(worldId.value, pages.value, merged);
    pages.value = linked.pages;
    merged = linked.pins;

    const needsPins = landmarksChanged(map.pins || [], merged) || linked.changed;
    const needsMeta = map.mapPreset !== 'gotchiverse' || map.mapWidth !== 621 || map.mapHeight !== 602;
    if (!needsPins && !needsMeta) continue;

    const patch = { pins: merged };
    if (needsMeta) {
      patch.mapPreset = 'gotchiverse';
      patch.mapWidth = 621;
      patch.mapHeight = 602;
      if (!map.imageUrl) patch.imageUrl = '/images/maps/gotchiverse-overview.svg';
    }
    const updated = await loreApi.updateMap(map.id, patch);
    const i = maps.value.findIndex((m) => m.id === updated.id);
    if (i >= 0) maps.value[i] = updated;
  }
  pushHistory();
}

async function applyDeepLink() {
  if (!maps.value.length) return;

  const mapQ = route.query.map ? String(route.query.map) : '';
  const pinQ = route.query.pin ? String(route.query.pin) : '';
  const pageQ = route.query.page ? String(route.query.page) : '';

  if (!mapQ && !pinQ && !pageQ) return;

  applyingDeepLink.value = true;
  highlightPageId.value = pageQ;

  if (pageQ) {
    const matches = findPinsForPage(maps.value, pageQ);
    if (matches.length) {
      const { map, pin } = matches[0];
      activeMapId.value = map.id;
      await nextTick();
      selectPin(pin, { syncUrl: false });
      applyingDeepLink.value = false;
      return;
    }
  }

  const resolved = resolveMapPinDeepLink(maps.value, { mapId: mapQ || undefined, pinId: pinQ || undefined });
  if (resolved?.map) {
    activeMapId.value = resolved.map.id;
    if (resolved.pin) {
      await nextTick();
      selectPin(resolved.pin, { syncUrl: false });
    }
  } else if (mapQ && maps.value.some((m) => m.id === mapQ)) {
    activeMapId.value = mapQ;
  }

  applyingDeepLink.value = false;
}

function syncMapUrl(overrides = {}) {
  const query = { ...route.query };
  const mapId = overrides.map !== undefined ? overrides.map : activeMapId.value;
  if (mapId) query.map = mapId;
  else delete query.map;

  if ('pin' in overrides) {
    if (overrides.pin) query.pin = overrides.pin;
    else delete query.pin;
  } else if (selectedPinId.value) {
    query.pin = selectedPinId.value;
  }

  if ('page' in overrides) {
    if (overrides.page) query.page = overrides.page;
    else delete query.page;
  } else if ('pin' in overrides) {
    delete query.page;
  }

  router.replace({ query });
}

async function seedDefaultMaps() {
  const gotchiverse = await loreApi.createMap({
    worldId: worldId.value,
    title: 'Gotchiverse',
    mapPreset: 'gotchiverse',
    imageUrl: '/images/maps/gotchiverse-overview.svg',
    mapWidth: 621,
    mapHeight: 602,
    pins: landmarkPins(),
  });
  const citaadel = await loreApi.createMap({
    worldId: worldId.value,
    title: 'The Citaadel',
    mapPreset: 'citaadel',
    imageUrl: getMapPreset('citaadel').backgrounds.dark,
    mapWidth: 9504,
    mapHeight: 6336,
    pins: [],
  });
  maps.value = [gotchiverse, citaadel];
  activeMapId.value = gotchiverse.id;
}

function landmarkPins() {
  return buildLandmarkPins();
}

async function createMap(preset) {
  showAddMap.value = false;
  const title = preset?.title || 'Custom Map';
  const m = await loreApi.createMap({
    worldId: worldId.value,
    title,
    mapPreset: preset?.id || 'custom',
    imageUrl: preset?.backgrounds?.dark || '',
    mapWidth: preset?.width || null,
    mapHeight: preset?.height || null,
    pins: preset?.id === 'gotchiverse' ? landmarkPins() : [],
  });
  maps.value.push(m);
  activeMapId.value = m.id;
  pushHistory();
}

async function closeMap(id) {
  if (maps.value.length <= 1) return;
  if (!confirm('Delete this map?')) return;
  await loreApi.deleteMap(id);
  maps.value = maps.value.filter((m) => m.id !== id);
  if (activeMapId.value === id) activeMapId.value = maps.value[0]?.id || '';
}

function pushHistory() {
  const snapshot = JSON.stringify({
    maps: maps.value,
    activeMapId: activeMapId.value,
  });
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(snapshot);
  historyIndex.value = history.value.length - 1;
}

function restoreHistory(index) {
  const snap = JSON.parse(history.value[index]);
  maps.value = snap.maps;
  activeMapId.value = snap.activeMapId;
}

function undo() {
  if (!canUndo.value) return;
  historyIndex.value -= 1;
  restoreHistory(historyIndex.value);
  persistActiveMapPins();
}

function redo() {
  if (!canRedo.value) return;
  historyIndex.value += 1;
  restoreHistory(historyIndex.value);
  persistActiveMapPins();
}

async function persistActiveMapPins() {
  const snap = JSON.parse(history.value[historyIndex.value]);
  const current = snap.maps.find((m) => m.id === activeMapId.value);
  if (current) {
    await loreApi.updateMap(current.id, { pins: current.pins, paths: current.paths || [] });
  }
}

async function updateMap(patch) {
  if (!activeMap.value) return;
  const updated = await loreApi.updateMap(activeMap.value.id, patch);
  const i = maps.value.findIndex((m) => m.id === updated.id);
  if (i >= 0) maps.value[i] = updated;
}

function onPathsChange(paths) {
  if (!activeMap.value) return;
  activeMap.value.paths = paths;
  updateMap({ paths });
  pushHistory();
}

function onPinsChange(pins) {
  if (!activeMap.value) return;
  activeMap.value.pins = pins;
  updateMap({ pins });
  pushHistory();
}

function selectMap(id) {
  activeMapId.value = id;
}

function onPinClick(pin) {
  if (connectMode.value && selectedPinId.value && selectedPinId.value !== pin.id) {
    addPathBetween(selectedPinId.value, pin.id);
    connectMode.value = false;
    selectPin(pin);
    return;
  }
  selectPin(pin);
}

function selectPin(pin, { syncUrl = true } = {}) {
  selectedPinId.value = pin.id;
  placeMode.value = null;
  highlightPageId.value = '';
  canvasRef.value?.zoomToPin(pin);
  if (syncUrl) syncMapUrl({ pin: pin.id, page: undefined });
}

function toggleConnectMode() {
  if (!selectedPin.value) return;
  connectMode.value = !connectMode.value;
  if (connectMode.value) placeMode.value = null;
}

function addPathBetween(fromPinId, toPinId) {
  const next = addPinPath(activeMap.value?.paths || [], fromPinId, toPinId);
  onPathsChange(next);
}

function addPathToSelected(toPinId) {
  if (!selectedPin.value || !toPinId) return;
  addPathBetween(selectedPin.value.id, toPinId);
}

function removePath(pathId) {
  const next = removePinPath(activeMap.value?.paths || [], pathId);
  onPathsChange(next);
}

function onLocationSelect(item) {
  if (item.linked && item.pin?.pageId) {
    router.push(`/lore/${worldId.value}?page=${item.pin.pageId}`);
    return;
  }
  if (item.pin) selectPin(item.pin);
}

function setPlaceMode(mode) {
  placeMode.value = placeMode.value === mode ? null : mode;
  if (placeMode.value) connectMode.value = false;
}

function onPinPlaced(pin) {
  selectedPinId.value = pin.id;
  placeMode.value = null;
  syncMapUrl({ pin: pin.id });
}

function updatePinLabel(label) {
  if (!selectedPin.value) return;
  const pins = activeMap.value.pins.map((p) =>
    p.id === selectedPin.value.id ? { ...p, label } : p,
  );
  onPinsChange(pins);
}

function deleteSelectedPin() {
  if (!selectedPin.value) return;
  const pinId = selectedPin.value.id;
  const pins = activeMap.value.pins.filter((p) => p.id !== pinId);
  const paths = removePathsForPin(activeMap.value.paths || [], pinId);
  selectedPinId.value = '';
  connectMode.value = false;
  syncMapUrl({ pin: undefined });
  activeMap.value.pins = pins;
  activeMap.value.paths = paths;
  updateMap({ pins, paths });
  pushHistory();
}

async function seedLandmarks() {
  if (!activeMap.value || !isGotchiverseOverviewMap(activeMap.value)) return;
  let merged = mergeLandmarkPins(activeMap.value.pins || []);
  const linked = await linkLandmarkPinsToPages(worldId.value, pages.value, merged);
  pages.value = linked.pages;
  onPinsChange(linked.pins);
}

function onPresetChange(presetId) {
  const preset = getMapPreset(presetId);
  const patch = { mapPreset: presetId };
  if (preset) {
    patch.imageUrl = preset.backgrounds.dark;
    patch.mapWidth = preset.width;
    patch.mapHeight = preset.height;
  }
  updateMap(patch);
  canvasRef.value?.resetView();
}

function onUpload(url) {
  updateMap({ mapPreset: 'custom', imageUrl: url });
}

function updatePinType(type) {
  if (!selectedPin.value) return;
  const pins = activeMap.value.pins.map((p) =>
    p.id === selectedPin.value.id
      ? { ...p, type, color: PIN_COLORS[type] || p.color }
      : p,
  );
  onPinsChange(pins);
}

function linkPage(pageId) {
  if (!selectedPin.value || !pageId) return;
  const linkedPage = pages.value.find((p) => p.id === pageId);
  const pins = activeMap.value.pins.map((p) =>
    p.id === selectedPin.value.id
      ? { ...p, pageId, label: p.label || linkedPage?.title || p.label }
      : p,
  );
  onPinsChange(pins);
}

function unlinkPage() {
  if (!selectedPin.value?.pageId) return;
  const pins = activeMap.value.pins.map((p) =>
    p.id === selectedPin.value.id ? { ...p, pageId: null } : p,
  );
  onPinsChange(pins);
}

async function onCreatePageFromPin({ templateId, title }) {
  const created = await loreApi.createPage({
    worldId: worldId.value,
    title,
    templateId,
  });
  pages.value.push(created);
  linkPage(created.id);
}

async function createDiagramPage() {
  const title = prompt('Diagram page title?', 'Realm diagram');
  if (!title) return;
  const created = await loreApi.createPage({
    worldId: worldId.value,
    title,
    templateId: 'landmark',
  });
  pages.value.push(created);
}

function openAiArt(kind) {
  const map = activeMap.value;
  if (!map) return;

  if (kind === 'map') {
    const prompt = buildMapBackgroundPrompt({ mapTitle: map.title, mapPreset: map.mapPreset });
    aibot.open({
      prompt,
      contextLabel: `${map.title} — map texture`,
      onImageGenerated: (url) => {
        updateMap({ imageUrl: url, mapPreset: 'custom' });
      },
    });
    return;
  }

  const pin = selectedPin.value;
  const prompt = buildMapPinPrompt({
    label: pin?.label || pin?.type,
    mapTitle: map.title,
    zone: map.mapPreset === 'citaadel' ? 'Citaadel' : 'Gotchiverse',
  });
  aibot.open({
    prompt,
    contextLabel: pin?.label || map.title,
    onImageGenerated: (url) => {
      if (pin) {
        const pins = map.pins.map((p) =>
          p.id === pin.id ? { ...p, imageUrl: url, label: p.label || 'Generated art' } : p,
        );
        onPinsChange(pins);
      }
    },
  });
}
</script>

<style module>
.workspace {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  margin: -1rem -1.25rem -2rem;
  background: #0f0b1e;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0.75rem;
  background: #120a22;
  border-bottom: 1px solid rgba(139, 125, 184, 0.35);
}
.topLeft,
.topRight {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  min-width: 140px;
}
.topRight {
  justify-content: flex-end;
  position: relative;
}
.addMenu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 30;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #1a0a2e;
  border: 2px solid #8b7db8;
  border-radius: 6px;
  min-width: 11rem;
}
.tabs {
  display: flex;
  gap: 0;
  padding: 0 0.5rem;
  background: #120a22;
  border-bottom: 1px solid rgba(139, 125, 184, 0.25);
  overflow-x: auto;
}
.tab {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}
.tab:hover {
  color: #fff;
}
.tabActive {
  color: #c4b5fd;
  border-bottom-color: #8b57ff;
  background: rgba(139, 87, 255, 0.1);
}
.tabClose {
  opacity: 0.5;
  font-size: 1rem;
  line-height: 1;
  padding: 0 0.15rem;
}
.tabClose:hover {
  opacity: 1;
  color: #f472b6;
}
.body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.mapArea {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
