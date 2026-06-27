<template>
  <div :class="$style.row">
    <PageLayoutCanvas
      :world-id="worldId"
      :page-title="pageTitle"
      :template-id="templateId"
      :blocks="blocks"
      :layout="layout"
      :frame="frame"
      :runes="runes"
      :rune-fields="runeFields"
      :selected-block-id="selectedBlockId"
      @clear-selection="$emit('update:selectedBlockId', '')"
      @select-block="$emit('update:selectedBlockId', $event)"
      @remove-block="$emit('remove-block', $event)"
      @update-block="(id, patch) => $emit('update-block', id, patch)"
      @update-runes="$emit('update-runes', $event)"
      @add-from-palette="$emit('add-from-palette', $event)"
    />
    <PageInsertPanel
      :rune-fields="runeFields"
      :blocks="blocks"
      :selected-block="selectedBlock"
      @add-from-palette="$emit('add-from-palette', $event)"
      @update-block="(id, patch) => $emit('update-block', id, patch)"
      @remove-block="$emit('remove-block', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PageLayoutCanvas from '@/components/lore/PageLayoutCanvas.vue';
import PageInsertPanel from '@/components/lore/PageInsertPanel.vue';

const props = defineProps({
  worldId: { type: String, required: true },
  pageTitle: { type: String, default: '' },
  templateId: { type: String, default: '' },
  blocks: { type: Array, default: () => [] },
  layout: { type: Object, default: () => ({}) },
  frame: { type: String, default: null },
  runes: { type: Object, default: () => ({}) },
  runeFields: { type: Array, default: () => [] },
  selectedBlockId: { type: String, default: '' },
});

defineEmits([
  'update:selectedBlockId',
  'remove-block',
  'update-block',
  'update-runes',
  'add-from-palette',
]);

const selectedBlock = computed(
  () => props.blocks.find((b) => b.id === props.selectedBlockId) || null,
);
</script>

<style module>
.row {
  display: flex;
  flex: 1;
  min-height: 400px;
  gap: 0;
  border: 1px solid rgba(139, 125, 184, 0.25);
  border-radius: 6px;
  overflow: hidden;
}
</style>
