<template>
  <aside :class="$style.panel">
    <div :class="$style.tabs">
      <button
        v-for="t in tabList"
        :key="t.id"
        type="button"
        :class="[$style.tab, tab === t.id && $style.tabActive]"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <div :class="$style.body">
      <div v-show="tab === 'insert'">
        <p :class="$style.section">Layout</p>
        <PaletteItem
          v-for="item in LAYOUT_PALETTE"
          :key="item.id"
          :item="item"
          @add="$emit('add-from-palette', item)"
        />

        <p :class="$style.section">Media</p>
        <PaletteItem
          v-for="item in MEDIA_PALETTE"
          :key="item.id"
          :item="item"
          @add="$emit('add-from-palette', item)"
        />

        <p :class="$style.section">Text</p>
        <PaletteItem
          v-for="item in TEXT_PALETTE"
          :key="item.id"
          :item="item"
          @add="$emit('add-from-palette', item)"
        />

        <template v-if="runePalette.length">
          <p :class="$style.section">Runes</p>
          <PaletteItem
            v-for="item in runePalette"
            :key="item.id"
            :item="item"
            :disabled="usedRuneIds.has(item.runeId)"
            @add="$emit('add-from-palette', item)"
          />
        </template>
      </div>

      <div v-show="tab === 'block'">
        <template v-if="selectedBlock">
          <p :class="$style.section">Selected</p>
          <label :class="$style.field">
            <span>Label</span>
            <input
              :value="selectedBlock.label"
              class="input-gotchi text-xs"
              @input="$emit('update-block', selectedBlock.id, { label: $event.target.value })"
            />
          </label>
          <label :class="$style.field">
            <span>Width (cols)</span>
            <input
              type="number"
              min="1"
              max="12"
              :value="selectedBlock.grid?.colSpan || 12"
              class="input-gotchi text-xs"
              @change="onColSpan($event.target.value)"
            />
          </label>
          <label :class="$style.field">
            <span>Height (rows)</span>
            <input
              type="number"
              min="1"
              max="12"
              :value="selectedBlock.grid?.rowSpan || 2"
              class="input-gotchi text-xs"
              @change="onRowSpan($event.target.value)"
            />
          </label>
          <label :class="$style.field">
            <span>Column start</span>
            <input
              type="number"
              min="1"
              max="12"
              :value="selectedBlock.grid?.col || 1"
              class="input-gotchi text-xs"
              @change="onColStart($event.target.value)"
            />
          </label>
          <label :class="$style.field">
            <span>Row start</span>
            <input
              type="number"
              min="1"
              max="48"
              :value="selectedBlock.grid?.row || 1"
              class="input-gotchi text-xs"
              @change="onRowStart($event.target.value)"
            />
          </label>
          <button type="button" class="btn-pixel text-[8px] w-full mt-2" @click="$emit('remove-block', selectedBlock.id)">
            Delete block
          </button>

          <template v-if="selectedBlock.type === 'image'">
            <p :class="$style.section">Image</p>
            <label :class="$style.field">
              <span>URL</span>
              <input
                :value="selectedBlock.url || ''"
                class="input-gotchi text-xs"
                @change="$emit('update-block', selectedBlock.id, { url: $event.target.value })"
              />
            </label>
            <label :class="$style.field">
              <span>Alt text</span>
              <input
                :value="selectedBlock.alt || ''"
                class="input-gotchi text-xs"
                @change="$emit('update-block', selectedBlock.id, { alt: $event.target.value })"
              />
            </label>
            <label class="btn-pixel text-[8px] w-full cursor-pointer text-center">
              Upload image
              <input type="file" accept="image/*" hidden @change="onImageUpload" />
            </label>
            <MediaLibrary
              compact
              title="Pick from library"
              :selected-url="selectedBlock.url || ''"
              @select="(url) => $emit('update-block', selectedBlock.id, { url })"
            />
          </template>
        </template>
        <p v-else class="text-xs opacity-50">Select a block on the canvas.</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  LAYOUT_PALETTE,
  MEDIA_PALETTE,
  TEXT_PALETTE,
  runePaletteItems,
} from '@/utils/blockPalette';
import { runeFieldsOnCanvas } from '@/utils/layoutEngine';
import PaletteItem from '@/components/lore/PaletteItem.vue';
import MediaLibrary from '@/components/lore/MediaLibrary.vue';
import { loreApi } from '@/services/api';

const props = defineProps({
  runeFields: { type: Array, default: () => [] },
  blocks: { type: Array, default: () => [] },
  selectedBlock: { type: Object, default: null },
});

const emit = defineEmits(['add-from-palette', 'update-block', 'remove-block']);

const tab = ref('insert');
const tabList = [
  { id: 'insert', label: 'Insert' },
  { id: 'block', label: 'Block' },
];

const runePalette = computed(() => runePaletteItems(props.runeFields));
const usedRuneIds = computed(() => runeFieldsOnCanvas(props.blocks));

watch(
  () => props.selectedBlock,
  (block) => {
    if (block) tab.value = 'block';
  },
);

function onColSpan(value) {
  const colSpan = Math.min(12, Math.max(1, Number(value) || 12));
  const grid = { ...props.selectedBlock.grid, colSpan };
  if (grid.col + colSpan - 1 > 12) grid.col = Math.max(1, 13 - colSpan);
  emit('update-block', props.selectedBlock.id, { grid });
}

function onRowSpan(value) {
  const rowSpan = Math.min(12, Math.max(1, Number(value) || 2));
  emit('update-block', props.selectedBlock.id, { grid: { ...props.selectedBlock.grid, rowSpan } });
}

function onColStart(value) {
  const col = Math.min(12, Math.max(1, Number(value) || 1));
  const grid = { ...props.selectedBlock.grid, col };
  if (grid.col + (grid.colSpan || 12) - 1 > 12) {
    grid.colSpan = 13 - grid.col;
  }
  emit('update-block', props.selectedBlock.id, { grid });
}

function onRowStart(value) {
  const row = Math.max(1, Number(value) || 1);
  emit('update-block', props.selectedBlock.id, { grid: { ...props.selectedBlock.grid, row } });
}

async function onImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file || !props.selectedBlock) return;
  try {
    const { url } = await loreApi.uploadAsset(file);
    emit('update-block', props.selectedBlock.id, {
      url,
      alt: props.selectedBlock.alt || file.name.replace(/\.[^.]+$/, ''),
    });
  } catch (err) {
    alert(err.message || 'Upload failed');
  } finally {
    e.target.value = '';
  }
}
</script>

<style module>
.panel {
  width: 188px;
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
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
}
.tabActive {
  color: #c4b5fd;
  box-shadow: inset 0 -2px 0 #8b57ff;
}
.body {
  padding: 0.65rem 0.55rem;
  overflow-y: auto;
  flex: 1;
  max-height: 520px;
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
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.8;
}
</style>
