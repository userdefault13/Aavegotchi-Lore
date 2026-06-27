<template>
  <li>
    <div
      :class="[
        $style.row,
        isDropBefore && $style.dropBefore,
        isDropAfter && $style.dropAfter,
        isDropInside && $style.dropInside,
      ]"
      :style="{ paddingLeft: `${depth * 12 + 4}px` }"
      draggable="true"
      @dragstart="onDragStart"
      @dragend="$emit('drag-start', '')"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >
      <button
        v-if="node.children?.length"
        type="button"
        :class="$style.toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? '▾' : '▸' }}
      </button>
      <span v-else :class="$style.spacer" />
      <button
        type="button"
        :class="[$style.item, { [$style.active]: node.id === selectedId, [$style.dragging]: node.id === dragId }]"
        @click="$emit('select', node.id)"
      >
        {{ node.title }}
      </button>
      <button type="button" :class="$style.mini" title="Add child" @click.stop="$emit('add-child', node.id)">+</button>
      <button type="button" :class="$style.mini" title="Delete" @click.stop="$emit('delete', node.id)">×</button>
    </div>
    <ul v-if="expanded && node.children?.length" :class="$style.childList">
      <PageTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :depth="depth + 1"
        :drag-id="dragId"
        :drop-hint="dropHint"
        @select="$emit('select', $event)"
        @add-child="$emit('add-child', $event)"
        @delete="$emit('delete', $event)"
        @drag-start="$emit('drag-start', $event)"
        @drag-over="(id, pos) => $emit('drag-over', id, pos)"
        @drop="(id, pos) => $emit('drop', id, pos)"
      />
    </ul>
  </li>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  node: { type: Object, required: true },
  selectedId: { type: String, default: '' },
  depth: { type: Number, default: 0 },
  dragId: { type: String, default: '' },
  dropHint: { type: Object, default: null },
});

const emit = defineEmits(['select', 'add-child', 'delete', 'drag-start', 'drag-over', 'drop']);

const expanded = ref(true);

const isDropBefore = computed(
  () => props.dropHint?.nodeId === props.node.id && props.dropHint?.position === 'before',
);
const isDropAfter = computed(
  () => props.dropHint?.nodeId === props.node.id && props.dropHint?.position === 'after',
);
const isDropInside = computed(
  () => props.dropHint?.nodeId === props.node.id && props.dropHint?.position === 'inside',
);

function onDragStart(e) {
  emit('drag-start', props.node.id);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', props.node.id);
}

function onDragOver(e) {
  if (!props.dragId || props.dragId === props.node.id) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const third = rect.height / 3;
  let position = 'inside';
  if (y < third) position = 'before';
  else if (y > third * 2) position = 'after';
  emit('drag-over', props.node.id, position);
}

function onDrop() {
  if (!props.dropHint || props.dropHint.nodeId !== props.node.id) return;
  emit('drop', props.node.id, props.dropHint.position);
}
</script>

<script>
export default { name: 'PageTreeNode' };
</script>

<style module>
.row {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  margin-bottom: 0.1rem;
  border-radius: 4px;
  position: relative;
}
.dropBefore {
  box-shadow: inset 0 2px 0 #67e8f9;
}
.dropAfter {
  box-shadow: inset 0 -2px 0 #67e8f9;
}
.dropInside {
  background: rgba(103, 232, 249, 0.12);
  outline: 1px dashed rgba(103, 232, 249, 0.55);
}
.toggle,
.spacer {
  width: 1rem;
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 0.65rem;
  padding: 0;
}
.spacer {
  display: inline-block;
}
.item {
  flex: 1;
  min-width: 0;
  text-align: left;
  background: transparent;
  border: none;
  color: #fff;
  padding: 0.3rem 0.4rem;
  cursor: grab;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item:active {
  cursor: grabbing;
}
.item:hover,
.active {
  background: #651fff33;
}
.dragging {
  opacity: 0.45;
}
.mini {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0 0.2rem;
  line-height: 1;
}
.mini:hover {
  color: #f472b6;
}
.childList {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
