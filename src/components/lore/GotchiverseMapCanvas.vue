<template>
  <div :class="[$style.wrap, chromeless && $style.chromeless]">
    <div v-if="!chromeless" :class="$style.toolbar">
      <slot name="toolbar" />
    </div>

    <div ref="containerRef" :class="$style.svgWrap">
      <div
        :class="[
          $style.viewport,
          placeMode ? $style.viewportPlace : connectMode ? $style.viewportConnect : $style.viewportPan,
        ]"
        :style="chromeless ? undefined : { paddingTop: `calc(min(100% / ${aspectRatio}, ${maxHeight})` }"
        @wheel.prevent="onWheel"
        @mousedown="onPointerDown"
        @mousemove="onPointerMove"
        @mouseup="onPointerUp"
        @mouseleave="onPointerUp"
        @touchstart.passive="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onPointerUp"
      >
        <svg
          ref="svgRef"
          :class="$style.svg"
          :viewBox="viewBoxStr"
          xmlns="http://www.w3.org/2000/svg"
          @click="onCanvasClick"
        >
          <image
            v-if="displayImageUrl"
            :href="displayImageUrl"
            :x="bgOffset.x"
            :y="bgOffset.y"
            :width="bgWidth"
            :height="bgHeight"
            preserveAspectRatio="xMidYMid meet"
          />
          <g v-if="showDistricts && districts.length" pointer-events="none">
            <g
              v-for="district in districts"
              :key="district.id"
              :transform="`translate(${district.x} ${district.y})`"
            >
              <rect
                fill="none"
                stroke="rgba(167, 139, 250, 0.55)"
                stroke-width="10"
                :width="district.width"
                :height="district.height"
              />
              <text
                fill="rgba(255, 255, 255, 0.85)"
                font-family="'Press Start 2P', monospace"
                font-size="28"
                x="24"
                y="48"
              >
                {{ district.id }}
              </text>
            </g>
          </g>
          <g v-if="pathSegments.length" :class="$style.paths" pointer-events="none">
            <line
              v-for="seg in pathSegments"
              :key="seg.id"
              :x1="seg.x1"
              :y1="seg.y1"
              :x2="seg.x2"
              :y2="seg.y2"
              :stroke="seg.stroke"
              :stroke-width="pathStrokeWidth"
              :stroke-dasharray="pathDash"
              stroke-linecap="round"
              :opacity="seg.highlight ? 0.95 : 0.72"
            />
          </g>
          <MapPinMarker
            v-for="pin in pins"
            :key="pin.id"
            :x="pinMapX(pin)"
            :y="pinMapY(pin)"
            :scale="pinScale"
            :color="pinColor(pin)"
            :selected="pin.id === selectedPinId"
            @click="$emit('pin-click', pin)"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import MapPinMarker from '@/components/lore/MapPinMarker.vue';
import {
  getMapPreset,
  mapCoordsToPercent,
  percentToMapCoords,
} from '@/constants/gotchiverseMaps';
import { resolvePathSegments } from '@/utils/mapPinPaths';

const PIN_COLORS = {
  page: '#4ade80',
  direction: '#38bdf8',
  terrain: '#9ca3af',
  landmark: '#c084fc',
};

const props = defineProps({
  mapPreset: { type: String, default: 'gotchiverse' },
  imageUrl: { type: String, default: '' },
  pins: { type: Array, default: () => [] },
  paths: { type: Array, default: () => [] },
  selectedPinId: { type: String, default: '' },
  placeMode: { type: String, default: null },
  connectMode: { type: Boolean, default: false },
  showDistricts: { type: Boolean, default: true },
  chromeless: { type: Boolean, default: false },
  theme: { type: String, default: 'dark' },
  maxHeight: { type: String, default: '80vh' },
  mapWidth: { type: Number, default: null },
  mapHeight: { type: Number, default: null },
});

const emit = defineEmits(['update:pins', 'pin-click', 'pin-place']);

const districts = ref([]);
const svgRef = ref(null);
const containerRef = ref(null);

const preset = computed(() => {
  if (props.mapPreset === 'custom') {
    const w = props.mapWidth || 1000;
    const h = props.mapHeight || 700;
    return {
      width: w,
      height: h,
      aspectRatio: w / h,
      backgrounds: { dark: props.imageUrl, light: props.imageUrl },
      bgOffset: { dark: { x: 0, y: 0 }, light: { x: 0, y: 0 } },
      bgScale: 1,
    };
  }
  return getMapPreset(props.mapPreset) || getMapPreset('gotchiverse');
});

const aspectRatio = computed(() => preset.value.aspectRatio);

/** Pin scale in map SVG units — sized for 621px Gotchiverse overview. */
const pinScale = computed(() => (preset.value.width || 621) / 621);

const pathStrokeWidth = computed(() => Math.max(0.75, pinScale.value * 0.85));
const pathDash = computed(() => {
  const u = pinScale.value;
  return `${u * 4} ${u * 3.5}`;
});

const pathSegments = computed(() => {
  const segments = resolvePathSegments(props.paths, props.pins, (pin) => ({
    x: pinMapX(pin),
    y: pinMapY(pin),
  }));
  if (!props.selectedPinId) return segments.map((s) => ({ ...s, highlight: false }));
  return segments.map((s) => ({
    ...s,
    highlight: s.fromPinId === props.selectedPinId || s.toPinId === props.selectedPinId,
  }));
});

const displayImageUrl = computed(() => {
  if (props.mapPreset === 'custom') return props.imageUrl;
  const p = preset.value;
  return p.backgrounds[props.theme] || p.backgrounds.dark;
});

const bgOffset = computed(() => {
  const p = preset.value;
  return p.bgOffset?.[props.theme] || p.bgOffset?.dark || { x: 0, y: 0 };
});
const bgWidth = computed(() => (preset.value.width || 1) * (preset.value.bgScale || 1));
const bgHeight = computed(() => (preset.value.height || 1) * (preset.value.bgScale || 1));

const viewX = ref(0);
const viewY = ref(0);
const viewW = ref(preset.value.width);
const viewH = ref(preset.value.height);
const dragging = ref(false);
let dragStart = { x: 0, y: 0, vx: 0, vy: 0 };
let touchPanStart = null;
let movedDuringDrag = false;

const viewBoxStr = computed(() => `${viewX.value} ${viewY.value} ${viewW.value} ${viewH.value}`);

watch(
  () => props.mapPreset,
  () => {
    resetView();
    loadDistricts();
  },
);

onMounted(loadDistricts);

async function loadDistricts() {
  const url = getMapPreset(props.mapPreset)?.districtsUrl;
  if (!url) {
    districts.value = [];
    return;
  }
  try {
    const res = await fetch(url);
    districts.value = res.ok ? await res.json() : [];
  } catch {
    districts.value = [];
  }
}

function pinColor(pin) {
  if (pin.color) return pin.color;
  return PIN_COLORS[pin.type] || PIN_COLORS.page;
}

function pinMapX(pin) {
  return percentToMapCoords(preset.value, pin.x, pin.y).x;
}

function pinMapY(pin) {
  return percentToMapCoords(preset.value, pin.x, pin.y).y;
}

function clientToSvg(clientX, clientY) {
  const svg = svgRef.value;
  if (!svg) return null;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return pt.matrixTransform(ctm.inverse());
}

function addPinAtPercent(x, y, type) {
  const pin = {
    id: `pin-${Date.now()}`,
    type: type || 'page',
    x,
    y,
    pageId: null,
    label: '',
  };
  emit('update:pins', [...props.pins, pin]);
  emit('pin-place', pin);
}

function onCanvasClick(e) {
  if (!props.placeMode || movedDuringDrag) return;
  const pt = clientToSvg(e.clientX, e.clientY);
  if (!pt) return;
  const { x, y } = mapCoordsToPercent(preset.value, pt.x, pt.y);
  addPinAtPercent(x, y, props.placeMode);
}

function onPointerDown(evt) {
  if (evt.button !== 0) return;
  movedDuringDrag = false;
  if (props.placeMode || props.connectMode) return;
  dragging.value = true;
  dragStart = { x: evt.clientX, y: evt.clientY, vx: viewX.value, vy: viewY.value };
}

function onPointerMove(evt) {
  if (!dragging.value || !svgRef.value) return;
  if (Math.abs(evt.clientX - dragStart.x) > 3 || Math.abs(evt.clientY - dragStart.y) > 3) {
    movedDuringDrag = true;
  }
  const scaleX = viewW.value / (svgRef.value.clientWidth || 1);
  const scaleY = viewH.value / (svgRef.value.clientHeight || 1);
  viewX.value = dragStart.vx - (evt.clientX - dragStart.x) * scaleX;
  viewY.value = dragStart.vy - (evt.clientY - dragStart.y) * scaleY;
}

function onPointerUp() {
  dragging.value = false;
}

function onWheel(evt) {
  const p = preset.value;
  if (!p || !svgRef.value) return;
  const factor = evt.deltaY > 0 ? 1.1 : 0.9;
  const cursor = clientToSvg(evt.clientX, evt.clientY);
  if (!cursor) return;
  const newW = Math.max(p.width * 0.08, Math.min(p.width, viewW.value * factor));
  const newH = Math.max(p.height * 0.08, Math.min(p.height, viewH.value * factor));
  const ratioX = (cursor.x - viewX.value) / viewW.value;
  const ratioY = (cursor.y - viewY.value) / viewH.value;
  viewW.value = newW;
  viewH.value = newH;
  viewX.value = cursor.x - ratioX * newW;
  viewY.value = cursor.y - ratioY * newH;
}

function onTouchStart(evt) {
  if (evt.touches.length !== 1 || props.placeMode) return;
  const t = evt.touches[0];
  touchPanStart = { x: t.clientX, y: t.clientY, vx: viewX.value, vy: viewY.value };
}

function onTouchMove(evt) {
  if (!touchPanStart || !svgRef.value || evt.touches.length !== 1) return;
  const t = evt.touches[0];
  const scaleX = viewW.value / (svgRef.value.clientWidth || 1);
  const scaleY = viewH.value / (svgRef.value.clientHeight || 1);
  viewX.value = touchPanStart.vx - (t.clientX - touchPanStart.x) * scaleX;
  viewY.value = touchPanStart.vy - (t.clientY - touchPanStart.y) * scaleY;
}

function resetView() {
  const p = preset.value;
  viewX.value = 0;
  viewY.value = 0;
  viewW.value = p.width;
  viewH.value = p.height;
}

function zoomToPin(pin, padding = 0.15) {
  if (!pin) return;
  const cx = pinMapX(pin);
  const cy = pinMapY(pin);
  const p = preset.value;
  const zoomW = p.width * (1 - padding * 2);
  const zoomH = p.height * (1 - padding * 2);
  viewW.value = zoomW;
  viewH.value = zoomH;
  viewX.value = cx - zoomW / 2;
  viewY.value = cy - zoomH / 2;
}

defineExpose({ resetView, zoomToPin });
</script>

<style module>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  flex: 1;
}
.chromeless {
  gap: 0;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.svgWrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #0a0614;
  border-radius: 4px;
}
.chromeless .svgWrap {
  border-radius: 0;
  background: #14101f;
  height: 100%;
}
.chromeless .viewport {
  height: 100%;
  padding-top: 0 !important;
}
.viewport {
  position: relative;
  width: 100%;
  height: 0;
}
.viewportPan {
  cursor: grab;
}
.viewportPan:active {
  cursor: grabbing;
}
.viewportConnect {
  cursor: cell;
}
.viewportPlace {
  cursor: crosshair;
}
.paths {
  pointer-events: none;
}
.svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
