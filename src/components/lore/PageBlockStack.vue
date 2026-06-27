<template>
  <div :class="$style.stack">
    <div :class="$style.toolbar">
      <span class="font-pixel text-[8px] opacity-70">Blocks</span>
      <div :class="$style.actions">
        <button type="button" class="btn-pixel text-[8px]" @click="addBlock('prose')">+ Prose</button>
        <button type="button" class="btn-pixel text-[8px]" @click="addBlock('image')">+ Image</button>
        <button type="button" class="btn-pixel text-[8px]" @click="addBlock('diagram')">+ Diagram</button>
      </div>
    </div>

    <article v-for="(block, index) in localBlocks" :key="block.id" :class="$style.block">
      <header :class="$style.blockHead">
        <span :class="$style.blockType">{{ block.type }}</span>
        <div :class="$style.blockActions">
          <button type="button" :disabled="index === 0" title="Move up" @click="moveBlock(index, -1)">↑</button>
          <button type="button" :disabled="index === localBlocks.length - 1" title="Move down" @click="moveBlock(index, 1)">↓</button>
          <button type="button" title="Remove" @click="removeBlock(index)">×</button>
        </div>
      </header>

      <BlockEditor
        v-if="block.type === 'prose'"
        :model-value="block.content || ''"
        :frame="frame"
        @update:model-value="updateBlock(index, { content: $event })"
      />

      <div v-else-if="block.type === 'image'" :class="$style.imageBlock">
        <img v-if="block.url" :src="block.url" :alt="block.alt || ''" :class="$style.imagePreview" />
        <p v-else class="text-xs opacity-60">No image yet — upload or use ✨ AI art.</p>
        <input
          :value="block.url || ''"
          class="input-gotchi mt-2 text-xs"
          placeholder="Image URL"
          @change="updateBlock(index, { url: $event.target.value })"
        />
        <input
          :value="block.alt || ''"
          class="input-gotchi mt-1 text-xs"
          placeholder="Alt text"
          @change="updateBlock(index, { alt: $event.target.value })"
        />
        <label class="btn-pixel text-[8px] mt-2 inline-block cursor-pointer">
          Upload
          <input type="file" accept="image/*" hidden @change="uploadImage($event, index)" />
        </label>
      </div>

      <DiagramBlock
        v-else-if="block.type === 'diagram'"
        :model-value="block.content || defaultDiagram"
        @update:model-value="updateBlock(index, { content: $event })"
      />
    </article>

    <p v-if="!localBlocks.length" class="text-sm opacity-60">No blocks — add prose, images, or diagrams.</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { loreApi } from '@/services/api';
import BlockEditor from '@/components/lore/BlockEditor.vue';
import DiagramBlock from '@/components/lore/DiagramBlock.vue';

const defaultDiagram = 'graph TD\n  A[Gotchiverse] --> B[Citaadel]\n  B --> C[Great Portal]';

const props = defineProps({
  blocks: { type: Array, default: () => [] },
  frame: { type: String, default: null },
});

const emit = defineEmits(['update:blocks']);

const localBlocks = ref([]);

watch(
  () => props.blocks,
  (v) => {
    localBlocks.value = (v || []).map((b) => ({ ...b }));
  },
  { immediate: true, deep: true },
);

function emitBlocks() {
  emit('update:blocks', localBlocks.value.map((b) => ({ ...b })));
}

function addBlock(type) {
  const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const block = { id, type };
  if (type === 'prose') block.content = '';
  if (type === 'image') block.url = '';
  if (type === 'diagram') block.content = defaultDiagram;
  localBlocks.value.push(block);
  emitBlocks();
}

function updateBlock(index, patch) {
  localBlocks.value[index] = { ...localBlocks.value[index], ...patch };
  emitBlocks();
}

function removeBlock(index) {
  localBlocks.value.splice(index, 1);
  emitBlocks();
}

function moveBlock(index, dir) {
  const next = index + dir;
  if (next < 0 || next >= localBlocks.value.length) return;
  const arr = [...localBlocks.value];
  [arr[index], arr[next]] = [arr[next], arr[index]];
  localBlocks.value = arr;
  emitBlocks();
}

async function uploadImage(e, index) {
  const file = e.target.files?.[0];
  if (!file) return;
  const { url } = await loreApi.uploadAsset(file);
  updateBlock(index, { url, alt: file.name });
}
</script>

<style module>
.stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.block {
  border: 1px solid rgba(139, 125, 184, 0.45);
  border-radius: 6px;
  overflow: hidden;
  background: rgba(15, 11, 30, 0.5);
}
.blockHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.5rem;
  background: #120a22;
  border-bottom: 1px solid rgba(139, 125, 184, 0.25);
}
.blockType {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}
.blockActions {
  display: flex;
  gap: 0.2rem;
}
.blockActions button {
  background: #2d1b3d;
  border: 1px solid #8b7db8;
  color: #fff;
  width: 1.4rem;
  height: 1.4rem;
  cursor: pointer;
  font-size: 0.7rem;
  border-radius: 3px;
}
.blockActions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.imageBlock {
  padding: 0.75rem;
}
.imagePreview {
  max-width: 100%;
  max-height: 240px;
  border-radius: 4px;
  display: block;
}
</style>
