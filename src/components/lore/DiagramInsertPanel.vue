<template>
  <aside :class="$style.panel">
    <div :class="$style.tabs">
      <button
        v-for="t in tabList"
        :key="t.id"
        type="button"
        :class="[$style.tab, tab === t.id && $style.tabActive, t.disabled && $style.tabDisabled]"
        :disabled="t.disabled"
        @click="!t.disabled && (tab = t.id)"
      >
        {{ t.label }}
      </button>
    </div>

    <div :class="$style.body">
      <div v-show="tab === 'insert'">
        <p :class="$style.section">Nodes</p>
        <button type="button" :class="$style.tool" @click="$emit('add-node', 'entity')">
          <span>◆</span> Add entity
        </button>
        <button type="button" :class="$style.tool" @click="$emit('add-node', 'faction')">
          <span>⚑</span> Add faction
        </button>
        <button type="button" :class="$style.tool" @click="$emit('add-node', 'place')">
          <span>⌂</span> Add place
        </button>

        <p :class="$style.section">From lore</p>
        <label :class="$style.field">
          <span>Link page as node</span>
          <select class="input-gotchi text-xs" @change="onPagePick($event.target.value)">
            <option value="">Choose page…</option>
            <option v-for="p in pages" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </label>

        <p v-if="maps.length" :class="$style.section">From maps</p>
        <template v-if="maps.length">
          <button
            v-for="m in maps"
            :key="m.id"
            type="button"
            :class="$style.tool"
            @click="$emit('seed-from-map', m.id)"
          >
            <span>🗺️</span> {{ m.title }}
          </button>
        </template>
      </div>

      <div v-show="tab === 'link'">
        <p :class="$style.section">Connections</p>
        <button
          type="button"
          :class="[$style.tool, connectMode && $style.toolActive]"
          :disabled="!selectedNode"
          @click="$emit('toggle-connect')"
        >
          <span>↔</span> Connect links
        </button>
        <p v-if="connectMode && selectedNode" class="text-[10px] opacity-70 mt-1">
          Click another node to link from <strong>{{ selectedNode.label }}</strong>.
        </p>

        <template v-if="selectedNode">
          <p :class="$style.section">Selected</p>
          <label :class="$style.field">
            <span>Label</span>
            <input
              :value="selectedNode.label"
              class="input-gotchi text-xs"
              @input="$emit('update-node-label', $event.target.value)"
            />
          </label>
          <label :class="$style.field">
            <span>Type</span>
            <select
              :value="selectedNode.type"
              class="input-gotchi text-xs"
              @change="$emit('update-node-type', $event.target.value)"
            >
              <option v-for="(color, key) in NODE_COLORS" :key="key" :value="key">{{ key }}</option>
            </select>
          </label>
          <label :class="$style.field">
            <span>Lore page</span>
            <select
              :value="selectedNode.pageId || ''"
              class="input-gotchi text-xs"
              @change="$emit('link-page', $event.target.value || null)"
            >
              <option value="">None</option>
              <option v-for="p in pages" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </label>
          <router-link
            v-if="selectedNode.pageId"
            :to="`/lore/${worldId}?page=${selectedNode.pageId}`"
            class="btn-pixel text-[8px] w-full text-center mb-2"
          >
            Open page
          </router-link>

          <p v-if="edgesForSelected.length" :class="$style.section">Links</p>
          <div v-for="edge in edgesForSelected" :key="edge.id" :class="$style.edgeRow">
            <input
              :value="edge.label"
              class="input-gotchi text-[10px] flex-1"
              placeholder="Label"
              @change="$emit('update-edge-label', { edgeId: edge.id, label: $event.target.value })"
            />
            <button type="button" class="btn-pixel text-[8px]" @click="$emit('remove-edge', edge.id)">×</button>
          </div>

          <button type="button" class="btn-pixel text-[8px] w-full mt-2" @click="$emit('delete-node')">
            Delete node
          </button>
        </template>
        <p v-else class="text-xs opacity-50">Select a node on the canvas.</p>
      </div>

      <div v-show="tab === 'view'">
        <p :class="$style.section">Canvas</p>
        <button type="button" :class="$style.tool" @click="$emit('fit-view')">
          <span>⌂</span> Fit view
        </button>
      </div>

      <div v-show="tab === 'export'">
        <p :class="$style.section">Export</p>
        <button type="button" :class="$style.tool" @click="$emit('export-json')">
          <span>⬇</span> Download JSON
        </button>
        <button type="button" :class="$style.tool" @click="$emit('export-mermaid')">
          <span>⑂</span> Copy Mermaid
        </button>
        <button type="button" :class="$style.tool" @click="$emit('export-svg')">
          <span>◇</span> Download SVG
        </button>
        <button type="button" :class="$style.tool" @click="$emit('export-png')">
          <span>🖼</span> Download PNG
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { NODE_COLORS } from '@/utils/diagramGraph';

const props = defineProps({
  worldId: { type: String, required: true },
  pages: { type: Array, default: () => [] },
  maps: { type: Array, default: () => [] },
  selectedNode: { type: Object, default: null },
  edges: { type: Array, default: () => [] },
  connectMode: { type: Boolean, default: false },
});

const emit = defineEmits([
  'add-node',
  'add-from-page',
  'seed-from-map',
  'toggle-connect',
  'update-node-label',
  'update-node-type',
  'link-page',
  'update-edge-label',
  'remove-edge',
  'delete-node',
  'fit-view',
  'export-json',
  'export-mermaid',
  'export-svg',
  'export-png',
]);

const tab = ref('insert');

const tabList = computed(() => [
  { id: 'insert', label: 'Insert' },
  { id: 'link', label: 'Link', disabled: false },
  { id: 'view', label: 'View' },
  { id: 'export', label: 'Export' },
]);

const edgesForSelected = computed(() => {
  if (!props.selectedNode) return [];
  const id = props.selectedNode.id;
  return (props.edges || []).filter((e) => e.fromNodeId === id || e.toNodeId === id);
});

watch(
  () => props.selectedNode,
  (node) => {
    if (node) tab.value = 'link';
  },
);

function onPagePick(pageId) {
  if (!pageId) return;
  emit('add-from-page', pageId);
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
  padding: 0.55rem 0.15rem;
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
.edgeRow {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  margin-bottom: 0.35rem;
}
</style>
