<template>
  <aside :class="[$style.tree, embedded && $style.embedded]">
    <div :class="$style.head">
      <span class="font-pixel text-[9px]">Pages</span>
      <div v-if="!readOnly" :class="$style.headActions">
        <GotchiTooltip :tip="PAGE_TREE.addChild">
          <button type="button" class="btn-pixel text-[8px]" @click="$emit('add-child', selectedId || null)">+↳</button>
        </GotchiTooltip>
        <GotchiTooltip :tip="{ label: 'Add page', hint: 'Create a top-level page in this world.' }">
          <button type="button" class="btn-pixel text-[8px]" @click="$emit('add')">+</button>
        </GotchiTooltip>
      </div>
    </div>
    <ul :class="$style.list" @dragleave="clearDrop">
      <PageTreeNode
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :selected-id="selectedId"
        :depth="0"
        :drag-id="dragId"
        :drop-hint="dropHint"
        @select="$emit('select', $event)"
        @add-child="$emit('add-child', $event)"
        @delete="$emit('delete', $event)"
        @drag-start="onDragStart"
        @drag-over="onDragOver"
        @drop="onDrop"
      />
    </ul>
    <p v-if="!tree.length" class="text-xs opacity-50 px-1">No pages yet.</p>
    <p :class="$style.tip">Drag pages to reorder or nest.</p>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { buildPageTree } from '@/utils/pageTree';
import PageTreeNode from '@/components/lore/PageTreeNode.vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { PAGE_TREE } from '@/utils/workspaceHints';

const props = defineProps({
  pages: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'add', 'add-child', 'delete', 'reorder']);

const tree = computed(() => buildPageTree(props.pages));
const dragId = ref('');
const dropHint = ref(null);

function onDragStart(id) {
  dragId.value = id;
}

function onDragOver(nodeId, position) {
  dropHint.value = { nodeId, position };
}

function clearDrop() {
  dropHint.value = null;
}

function onDrop(nodeId, position) {
  if (!dragId.value) return;
  emit('reorder', { draggedId: dragId.value, targetId: nodeId, position });
  dragId.value = '';
  dropHint.value = null;
}
</script>

<style module>
.tree {
  width: 220px;
  border-right: 2px solid #8b7db8;
  padding-right: 0.75rem;
  flex-shrink: 0;
}
.embedded {
  width: 100%;
  border-right: none;
  padding: 0 0.65rem 0.65rem;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.headActions {
  display: flex;
  gap: 0.25rem;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.embedded .list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.tip {
  margin: 0.5rem 0 0;
  font-size: 0.62rem;
  opacity: 0.4;
  line-height: 1.35;
}
</style>
