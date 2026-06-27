<template>
  <div
    ref="canvasRef"
    :class="[$style.canvas, { [$style.dropActive]: dropActive }]"
    :style="gridStyle"
    @click="$emit('clear-selection')"
    @dragover.prevent="onDragOver"
    @dragleave="dropActive = false"
    @drop.prevent="onDrop"
  >
    <PageBlockCard
      v-for="block in displayBlocks"
      :key="block.id"
      :block="block"
      :frame="frame"
      :runes="runes"
      :rune-fields="runeFields"
      :selected="block.id === selectedBlockId"
      :dragging="dragState?.blockId === block.id"
      :world-id="worldId"
      :page-title="pageTitle"
      :template-id="templateId"
      @select="$emit('select-block', block.id)"
      @remove="$emit('remove-block', block.id)"
      @update-label="$emit('update-block', block.id, { label: $event })"
      @update-content="$emit('update-block', block.id, { content: $event })"
      @patch="$emit('update-block', block.id, $event)"
      @update-rune="$emit('update-runes', $event)"
      @move-start="startMove(block.id, $event)"
      @resize-start="startResize(block.id, $event)"
    />

    <div v-if="!blocks.length" :class="$style.empty">
      <p class="text-sm opacity-60">Drag blocks from Insert →</p>
      <p class="text-xs opacity-40 mt-1">or click a palette item to add</p>
    </div>

    <div v-if="dropActive" :class="$style.dropHint">Drop to place block</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import PageBlockCard from '@/components/lore/PageBlockCard.vue';
import { canvasStyle, updateBlock } from '@/utils/layoutEngine';
import { PALETTE_MIME, parsePaletteDrop } from '@/utils/blockPalette';
import {
  getCanvasMetrics,
  gridDelta,
  moveGridFromDelta,
  resizeGridFromPointer,
} from '@/utils/gridDrag';

const props = defineProps({
  blocks: { type: Array, default: () => [] },
  layout: { type: Object, default: () => ({}) },
  frame: { type: String, default: null },
  runes: { type: Object, default: () => ({}) },
  runeFields: { type: Array, default: () => [] },
  selectedBlockId: { type: String, default: '' },
  worldId: { type: String, default: '' },
  pageTitle: { type: String, default: '' },
  templateId: { type: String, default: '' },
});

const emit = defineEmits([
  'clear-selection',
  'select-block',
  'remove-block',
  'update-block',
  'update-runes',
  'add-from-palette',
]);

const canvasRef = ref(null);
const dropActive = ref(false);
const dragState = ref(null);
const draftGrid = ref(null);

const gridStyle = computed(() => canvasStyle(props.layout, props.blocks));

const displayBlocks = computed(() => {
  if (!draftGrid.value) return props.blocks;
  return updateBlock(props.blocks, draftGrid.value.blockId, { grid: draftGrid.value.grid });
});

function onDragOver(evt) {
  if (evt.dataTransfer?.types?.includes(PALETTE_MIME)) {
    dropActive.value = true;
    evt.dataTransfer.dropEffect = 'copy';
  }
}

function onDrop(evt) {
  dropActive.value = false;
  const item = parsePaletteDrop(evt.dataTransfer?.getData(PALETTE_MIME));
  if (!item || !canvasRef.value) return;
  const metrics = getCanvasMetrics(canvasRef.value, props.layout);
  const cell = metrics.columns
    ? (() => {
        const x = evt.clientX - metrics.rect.left - metrics.padLeft;
        const y = evt.clientY - metrics.rect.top - metrics.padTop;
        const col = Math.floor(x / (metrics.colWidth + metrics.gap)) + 1;
        const row = Math.floor(y / (metrics.rowHeight + metrics.gap)) + 1;
        return { col: Math.min(metrics.columns, Math.max(1, col)), row: Math.max(1, row) };
      })()
    : { col: 1, row: 1 };
  emit('add-from-palette', {
    ...item,
    grid: {
      col: cell.col,
      row: cell.row,
      colSpan: item.grid?.colSpan ?? item.colSpan ?? 12,
      rowSpan: item.grid?.rowSpan ?? item.rowSpan ?? 2,
    },
  });
}

function startMove(blockId, evt) {
  const block = props.blocks.find((b) => b.id === blockId);
  if (!block?.grid) return;
  dragState.value = {
    mode: 'move',
    blockId,
    startX: evt.clientX,
    startY: evt.clientY,
    originGrid: { ...block.grid },
  };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function startResize(blockId, evt) {
  const block = props.blocks.find((b) => b.id === blockId);
  if (!block?.grid) return;
  evt.stopPropagation();
  dragState.value = {
    mode: 'resize',
    blockId,
    originGrid: { ...block.grid },
  };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(evt) {
  if (!dragState.value || !canvasRef.value) return;
  const metrics = getCanvasMetrics(canvasRef.value, props.layout);

  if (dragState.value.mode === 'move') {
    const { dCol, dRow } = gridDelta(
      { x: dragState.value.startX, y: dragState.value.startY },
      { x: evt.clientX, y: evt.clientY },
      metrics,
    );
    draftGrid.value = {
      blockId: dragState.value.blockId,
      grid: moveGridFromDelta(dragState.value.originGrid, dCol, dRow, metrics.columns),
    };
  } else {
    draftGrid.value = {
      blockId: dragState.value.blockId,
      grid: resizeGridFromPointer(
        dragState.value.originGrid,
        evt.clientX,
        evt.clientY,
        metrics,
      ),
    };
  }
}

function onPointerUp() {
  if (draftGrid.value) {
    emit('update-block', draftGrid.value.blockId, { grid: draftGrid.value.grid });
  }
  dragState.value = null;
  draftGrid.value = null;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
});
</script>

<style module>
.canvas {
  position: relative;
  flex: 1;
  min-height: 360px;
  padding: 0.75rem;
  border-radius: 6px;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(139, 87, 255, 0.12), transparent 55%),
    radial-gradient(ellipse at 80% 90%, rgba(34, 197, 94, 0.08), transparent 50%),
    #0a0614;
  border: 1px solid rgba(139, 125, 184, 0.35);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.dropActive {
  border-color: #a78bfa;
  box-shadow: inset 0 0 0 2px rgba(167, 139, 250, 0.25);
}
.empty {
  grid-column: 1 / -1;
  grid-row: 1 / span 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.dropHint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.35rem 0.75rem;
  background: rgba(139, 87, 255, 0.25);
  border: 1px solid rgba(167, 139, 250, 0.5);
  border-radius: 4px;
  font-size: 0.7rem;
  color: #c4b5fd;
  pointer-events: none;
}
</style>
