<template>
  <article
    :class="[$style.card, { [$style.selected]: selected, [$style.dragging]: dragging }]"
    :style="areaStyle"
    @click.stop="$emit('select')"
  >
    <header :class="$style.head">
      <span
        :class="$style.drag"
        title="Drag to move"
        @pointerdown.stop="$emit('move-start', $event)"
      >⠿</span>
      <input
        :value="block.label || block.type"
        class="input-gotchi text-[10px] flex-1 min-w-0"
        @click.stop
        @change="$emit('update-label', $event.target.value)"
      />
      <button type="button" :class="$style.remove" title="Remove" @click.stop="$emit('remove')">×</button>
    </header>

    <div :class="$style.body">
      <BlockEditor
        v-if="block.type === 'prose'"
        :model-value="block.content || ''"
        :frame="frame"
        @update:model-value="$emit('update-content', $event)"
      />

      <div
        v-else-if="block.type === 'image'"
        :class="[$style.imageBlock, { [$style.dropTarget]: dropActive }]"
        @dragover.prevent="dropActive = true"
        @dragleave="dropActive = false"
        @drop.prevent="onDrop"
      >
        <img v-if="block.url" :src="block.url" :alt="block.alt || ''" :class="$style.imagePreview" />
        <p v-else class="text-xs opacity-60">Drop an image, pick from library, or paste a URL.</p>
        <input
          :value="block.url || ''"
          class="input-gotchi mt-2 text-xs"
          placeholder="Image URL"
          @change="$emit('patch', { url: $event.target.value })"
        />
        <input
          :value="block.alt || ''"
          class="input-gotchi mt-2 text-xs"
          placeholder="Alt text"
          @change="$emit('patch', { alt: $event.target.value })"
        />
        <div :class="$style.imageActions">
          <label class="btn-pixel text-[8px] cursor-pointer">
            Upload
            <input type="file" accept="image/*" hidden @change="onUpload" />
          </label>
          <button type="button" class="btn-pixel text-[8px]" @click.stop="generateAi">✨ AI</button>
        </div>
        <MediaLibrary compact title="Library" :selected-url="block.url || ''" @select="onPick" />
      </div>

      <DiagramBlock
        v-else-if="block.type === 'diagram'"
        :model-value="block.content || defaultDiagram"
        @update:model-value="$emit('update-content', $event)"
      />

      <div v-else-if="block.type === 'rune' && runeField" :class="$style.runeBlock">
        <label :class="$style.runeLabel">{{ runeField.label }}</label>
        <select
          v-if="runeField.type === 'select'"
          :value="runeValue"
          class="input-gotchi text-xs"
          @change="$emit('update-rune', { [runeField.id]: $event.target.value })"
        >
          <option value="">—</option>
          <option v-for="opt in runeField.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <textarea
          v-else-if="runeField.type === 'textarea'"
          :value="runeValue"
          class="input-gotchi text-xs"
          rows="3"
          @input="$emit('update-rune', { [runeField.id]: $event.target.value })"
        />
        <input
          v-else
          :type="runeField.type === 'number' ? 'number' : 'text'"
          :value="runeValue"
          class="input-gotchi text-xs"
          @input="$emit('update-rune', { [runeField.id]: $event.target.value })"
        />
      </div>

      <div v-else-if="block.type === 'map-pin'" :class="$style.runeBlock">
        <p class="text-xs opacity-60">Map pin block — link from the Maps workspace.</p>
        <router-link :to="`/lore/${worldId}/maps`" class="btn-pixel text-[8px] mt-2 inline-block">
          Open maps
        </router-link>
      </div>

      <p v-else class="text-xs opacity-50">Unsupported block: {{ block.type }}</p>
    </div>

    <div
      v-if="selected"
      :class="$style.resize"
      title="Drag to resize"
      @pointerdown.stop="$emit('resize-start', $event)"
    />
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { loreApi } from '@/services/api';
import { useAibotStore } from '@/stores';
import { buildPageIllustrationPrompt } from '@/utils/aibotPrompts';
import { gridAreaStyle } from '@/utils/layoutEngine';
import BlockEditor from '@/components/lore/BlockEditor.vue';
import DiagramBlock from '@/components/lore/DiagramBlock.vue';
import MediaLibrary from '@/components/lore/MediaLibrary.vue';

const defaultDiagram = 'graph TD\n  A[Gotchiverse] --> B[Citaadel]';

const props = defineProps({
  block: { type: Object, required: true },
  frame: { type: String, default: null },
  runes: { type: Object, default: () => ({}) },
  runeFields: { type: Array, default: () => [] },
  selected: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
  worldId: { type: String, default: '' },
  pageTitle: { type: String, default: '' },
  templateId: { type: String, default: '' },
});

const route = useRoute();
const aibot = useAibotStore();
const dropActive = ref(false);
const worldId = computed(() => props.worldId || route.params.worldId);

const emit = defineEmits([
  'select',
  'remove',
  'update-label',
  'update-content',
  'patch',
  'update-rune',
  'move-start',
  'resize-start',
]);

const areaStyle = computed(() => gridAreaStyle(props.block));

const runeField = computed(() => props.runeFields.find((f) => f.id === props.block.runeId));

const runeValue = computed(() => {
  if (!props.block.runeId) return '';
  return props.runes?.[props.block.runeId] ?? '';
});

function onPick(url) {
  emit('patch', { url });
}

async function onUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const { url } = await loreApi.uploadAsset(file);
    emit('patch', { url, alt: props.block.alt || file.name.replace(/\.[^.]+$/, '') });
  } catch (err) {
    alert(err.message || 'Upload failed');
  } finally {
    e.target.value = '';
  }
}

async function onDrop(e) {
  dropActive.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (!file?.type?.startsWith('image/')) return;
  try {
    const { url } = await loreApi.uploadAsset(file);
    emit('patch', { url, alt: props.block.alt || file.name.replace(/\.[^.]+$/, '') });
  } catch (err) {
    alert(err.message || 'Upload failed');
  }
}

function generateAi() {
  const promptText = buildPageIllustrationPrompt({
    title: props.pageTitle || props.block.label || 'Lore illustration',
    templateId: props.templateId,
    runes: props.runes || {},
  });
  aibot.open({
    prompt: promptText,
    contextLabel: props.pageTitle || props.block.label || 'Image block',
    onImageGenerated: (url) => emit('patch', { url, alt: props.block.alt || props.pageTitle || 'Generated art' }),
  });
}
</script>

<style module>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(139, 125, 184, 0.4);
  border-radius: 6px;
  background: rgba(15, 11, 30, 0.88);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}
.dragging {
  opacity: 0.92;
  z-index: 2;
}
.selected {
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.35);
}
.head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.4rem;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(139, 125, 184, 0.2);
}
.drag {
  opacity: 0.45;
  font-size: 0.75rem;
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.resize {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #a78bfa 50%);
  border-radius: 0 0 4px 0;
  touch-action: none;
}
.remove {
  background: #2d1b3d;
  border: 1px solid #8b7db8;
  color: #fff;
  width: 1.35rem;
  height: 1.35rem;
  cursor: pointer;
  font-size: 0.75rem;
  border-radius: 3px;
  flex-shrink: 0;
}
.body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0.35rem;
}
.imageBlock {
  padding: 0.25rem;
  border-radius: 4px;
}
.dropTarget {
  outline: 2px dashed #a78bfa;
  outline-offset: 2px;
}
.imagePreview {
  max-width: 100%;
  max-height: 160px;
  border-radius: 4px;
  display: block;
}
.imageActions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin: 0.45rem 0;
}
.runeBlock {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.25rem;
}
.runeLabel {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
}
</style>
