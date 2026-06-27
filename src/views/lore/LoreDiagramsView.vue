<template>
  <div v-if="world" :class="$style.workspace">
    <header :class="$style.topbar">
      <div :class="$style.topLeft">
        <router-link :to="`/lore/${worldId}`" class="text-xs opacity-70">← {{ world.title }}</router-link>
      </div>
      <h1 class="font-pixel text-[9px] opacity-90">Diagrams — {{ world.title }}</h1>
      <div :class="$style.topRight">
        <button type="button" class="btn-pixel text-[8px]" @click="createDiagramTab">+ Diagram</button>
      </div>
    </header>

    <p v-if="loadError" :class="$style.error">{{ loadError }}</p>

    <div :class="$style.tabs">
      <button
        v-for="d in diagrams"
        :key="d.id"
        type="button"
        :class="[$style.tab, { [$style.tabActive]: d.id === activeDiagramId }]"
        @click="selectDiagram(d.id)"
      >
        {{ d.title }}
        <span v-if="diagrams.length > 1" :class="$style.tabClose" @click.stop="closeDiagram(d.id)">×</span>
      </button>
    </div>

    <div :class="$style.body">
      <LoreWorkspaceRail :world-id="worldId" active="diagrams" />
      <main v-if="activeDiagram" :class="$style.canvasWrap">
        <LoreDiagramCanvas
          ref="canvasRef"
          :nodes="activeDiagram.nodes"
          :edges="activeDiagram.edges"
          :selected-node-id="selectedNodeId"
          :connect-mode="connectMode"
          :viewport="activeDiagram.viewport"
          @select-node="onNodeSelect"
          @clear-selection="clearSelection"
          @move-nodes="onMoveNodes"
        />
      </main>
      <main v-else-if="loading" :class="$style.empty">
        <p class="text-sm opacity-60">Loading diagrams…</p>
      </main>
      <main v-else :class="$style.empty">
        <p class="text-sm opacity-60">{{ loadError ? 'Diagrams unavailable.' : 'No diagrams yet.' }}</p>
        <button type="button" class="btn-pixel text-[8px] mt-2" @click="load">Retry</button>
        <button v-if="!loadError" type="button" class="btn-pixel text-[8px] mt-2 ml-2" @click="createDiagramTab">
          Create diagram
        </button>
      </main>
      <DiagramInsertPanel
        v-if="activeDiagram"
        :world-id="worldId"
        :pages="pages"
        :maps="maps"
        :selected-node="selectedNode"
        :edges="activeDiagram.edges"
        :connect-mode="connectMode"
        @add-node="addNode"
        @add-from-page="addFromPage"
        @seed-from-map="seedFromMap"
        @toggle-connect="toggleConnect"
        @update-node-label="updateNodeLabel"
        @update-node-type="updateNodeType"
        @link-page="linkPage"
        @update-edge-label="updateEdgeLabel"
        @remove-edge="removeEdge"
        @delete-node="deleteNode"
        @fit-view="fitView"
        @export-json="exportJson"
        @export-mermaid="exportMermaid"
        @export-svg="exportSvg"
        @export-png="exportPng"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';
import LoreDiagramCanvas from '@/components/lore/LoreDiagramCanvas.vue';
import DiagramInsertPanel from '@/components/lore/DiagramInsertPanel.vue';
import { resolveDiagramDeepLink } from '@/utils/diagramDeepLink';
import { DEFAULT_DIAGRAM_TITLE, ensureWorldDiagramsSeeded } from '@/utils/seedDiagram';
import { ensureWorldMapSeed } from '@/utils/seedMaps';
import {
  addDiagramEdge,
  createDiagramNode,
  diagramToMermaid,
  downloadDiagramPng,
  downloadDiagramSvg,
  flowPositionsToNodes,
  mergeMapIntoDiagram,
  NODE_COLORS,
  NODE_ICONS,
  removeDiagramEdge,
  removeDiagramNode,
} from '@/utils/diagramGraph';

const route = useRoute();
const router = useRouter();
const worldId = computed(() => route.params.worldId);
const world = ref(null);
const pages = ref([]);
const maps = ref([]);
const diagrams = ref([]);
const activeDiagramId = ref('');
const selectedNodeId = ref('');
const connectMode = ref(false);
const saving = ref(false);
const canvasRef = ref(null);
const applyingDeepLink = ref(false);
const loading = ref(true);
const loadError = ref('');

const activeDiagram = computed(() => diagrams.value.find((d) => d.id === activeDiagramId.value) || null);
const selectedNode = computed(() => activeDiagram.value?.nodes?.find((n) => n.id === selectedNodeId.value) || null);

onMounted(load);
watch(
  () => [route.query.diagram, route.query.node],
  () => applyDeepLink(),
);

async function load() {
  loadError.value = '';
  loading.value = true;
  try {
    world.value = await loreApi.getWorld(worldId.value);
    pages.value = await loreApi.listPages(worldId.value);
    maps.value = await loreApi.listMaps(worldId.value);

    const mapSeed = await ensureWorldMapSeed(loreApi, worldId.value, maps.value, pages.value);
    maps.value = mapSeed.maps;
    pages.value = mapSeed.pages;

    try {
      diagrams.value = await loreApi.listDiagrams(worldId.value);
    } catch (err) {
      loadError.value =
        err.message?.includes('404') || err.message?.includes('failed')
          ? 'Diagrams API not available — restart the dev server: npm run dev:all'
          : err.message || 'Could not load diagrams';
      diagrams.value = [];
    }

    if (!loadError.value && !diagrams.value.length) {
      const created = await loreApi.createDiagram({
        worldId: worldId.value,
        title: DEFAULT_DIAGRAM_TITLE,
        nodes: [],
        edges: [],
      });
      diagrams.value = [created];
    }

    if (!loadError.value && diagrams.value.length) {
      diagrams.value = await ensureWorldDiagramsSeeded(maps.value, diagrams.value, (id, patch) =>
        loreApi.updateDiagram(id, patch),
      );
    }

    await applyDeepLink();
    if (!activeDiagramId.value) {
      activeDiagramId.value = diagrams.value[0]?.id || '';
    }

    await nextTick();
    if (activeDiagram.value?.nodes?.length) canvasRef.value?.fitView();
  } catch (err) {
    loadError.value = err.message || 'Failed to load diagrams workspace';
  } finally {
    loading.value = false;
  }
}

async function persistDiagram(patch) {
  if (!activeDiagram.value || saving.value) return;
  saving.value = true;
  try {
    const updated = await loreApi.updateDiagram(activeDiagram.value.id, patch);
    const i = diagrams.value.findIndex((d) => d.id === updated.id);
    if (i >= 0) diagrams.value[i] = updated;
  } finally {
    saving.value = false;
  }
}

function syncDiagramUrl(overrides = {}) {
  if (applyingDeepLink.value) return;
  const query = { ...route.query };
  const diagramId = overrides.diagram !== undefined ? overrides.diagram : activeDiagramId.value;
  const nodeId = overrides.node !== undefined ? overrides.node : selectedNodeId.value;

  if (diagramId) query.diagram = diagramId;
  else delete query.diagram;

  if (nodeId) query.node = nodeId;
  else delete query.node;

  router.replace({ query });
}

async function applyDeepLink() {
  if (!diagrams.value.length) return;
  applyingDeepLink.value = true;
  const diagramQ = route.query.diagram ? String(route.query.diagram) : '';
  const nodeQ = route.query.node ? String(route.query.node) : '';
  const resolved = resolveDiagramDeepLink(diagrams.value, {
    diagramId: diagramQ || undefined,
    nodeId: nodeQ || undefined,
  });

  if (resolved?.diagram) activeDiagramId.value = resolved.diagram.id;
  else if (!activeDiagramId.value) activeDiagramId.value = diagrams.value[0]?.id || '';

  selectedNodeId.value = resolved?.node?.id || nodeQ || '';
  connectMode.value = false;
  applyingDeepLink.value = false;

  await nextTick();
  if (selectedNodeId.value) canvasRef.value?.focusNode(selectedNodeId.value);
  else if (activeDiagram.value?.nodes?.length) canvasRef.value?.fitView();
}

async function createDiagramTab() {
  const title = prompt('Diagram title?', 'Relations');
  if (!title?.trim()) return;
  const created = await loreApi.createDiagram({
    worldId: worldId.value,
    title: title.trim(),
    nodes: [],
    edges: [],
  });
  diagrams.value.push(created);
  activeDiagramId.value = created.id;
  selectedNodeId.value = '';
  connectMode.value = false;
  syncDiagramUrl({ diagram: created.id, node: undefined });
}

function selectDiagram(id) {
  activeDiagramId.value = id;
  selectedNodeId.value = '';
  connectMode.value = false;
  syncDiagramUrl({ diagram: id, node: undefined });
  nextTick(() => canvasRef.value?.fitView());
}

async function closeDiagram(id) {
  if (diagrams.value.length <= 1) {
    alert('Keep at least one diagram.');
    return;
  }
  if (!confirm('Delete this diagram?')) return;
  await loreApi.deleteDiagram(id);
  diagrams.value = diagrams.value.filter((d) => d.id !== id);
  if (activeDiagramId.value === id) {
    activeDiagramId.value = diagrams.value[0]?.id || '';
    selectedNodeId.value = '';
    syncDiagramUrl({ diagram: activeDiagramId.value, node: undefined });
  }
}

function clearSelection() {
  selectedNodeId.value = '';
  connectMode.value = false;
  syncDiagramUrl({ node: undefined });
}

function onNodeSelect(nodeId) {
  if (connectMode.value && selectedNodeId.value && selectedNodeId.value !== nodeId) {
    const edges = addDiagramEdge(activeDiagram.value.edges, selectedNodeId.value, nodeId);
    persistDiagram({ edges });
    connectMode.value = false;
    selectedNodeId.value = nodeId;
    syncDiagramUrl({ node: nodeId });
    return;
  }
  selectedNodeId.value = nodeId;
  syncDiagramUrl({ node: nodeId });
}

async function addNode(type) {
  const count = activeDiagram.value.nodes?.length || 0;
  const node = createDiagramNode({
    type,
    x: 80 + (count % 4) * 140,
    y: 80 + Math.floor(count / 4) * 120,
  });
  await persistDiagram({ nodes: [...(activeDiagram.value.nodes || []), node] });
  selectedNodeId.value = node.id;
  syncDiagramUrl({ node: node.id });
  nextTick(() => canvasRef.value?.focusNode(node.id));
}

async function addFromPage(pageId) {
  const page = pages.value.find((p) => p.id === pageId);
  if (!page) return;
  const count = activeDiagram.value.nodes?.length || 0;
  const node = createDiagramNode({
    label: page.title,
    pageId: page.id,
    type: 'entity',
    x: 80 + (count % 4) * 140,
    y: 80 + Math.floor(count / 4) * 120,
  });
  await persistDiagram({ nodes: [...(activeDiagram.value.nodes || []), node] });
  selectedNodeId.value = node.id;
  syncDiagramUrl({ node: node.id });
}

async function seedFromMap(mapId) {
  const map = maps.value.find((m) => m.id === mapId);
  if (!map) return;
  const pins = map.pins || [];
  if (!pins.length) {
    alert('This map has no pins to import.');
    return;
  }
  const { nodes, edges } = mergeMapIntoDiagram(
    activeDiagram.value.nodes,
    activeDiagram.value.edges,
    pins,
    map.paths || [],
  );
  await persistDiagram({ nodes, edges });
  nextTick(() => canvasRef.value?.fitView());
}

function toggleConnect() {
  connectMode.value = !connectMode.value;
}

function updateNodeLabel(label) {
  if (!selectedNode.value) return;
  const nodes = activeDiagram.value.nodes.map((n) =>
    n.id === selectedNode.value.id ? { ...n, label } : n,
  );
  persistDiagram({ nodes });
}

function updateNodeType(type) {
  if (!selectedNode.value) return;
  const nodes = activeDiagram.value.nodes.map((n) =>
    n.id === selectedNode.value.id
      ? {
          ...n,
          type,
          icon: NODE_ICONS[type] || NODE_ICONS.custom,
          color: NODE_COLORS[type] || NODE_COLORS.custom,
        }
      : n,
  );
  persistDiagram({ nodes });
}

function linkPage(pageId) {
  if (!selectedNode.value) return;
  const nodes = activeDiagram.value.nodes.map((n) =>
    n.id === selectedNode.value.id ? { ...n, pageId } : n,
  );
  persistDiagram({ nodes });
}

function updateEdgeLabel({ edgeId, label }) {
  const edges = activeDiagram.value.edges.map((e) => (e.id === edgeId ? { ...e, label } : e));
  persistDiagram({ edges });
}

function removeEdge(edgeId) {
  persistDiagram({ edges: removeDiagramEdge(activeDiagram.value.edges, edgeId) });
}

function deleteNode() {
  if (!selectedNode.value || !confirm('Delete this node and its links?')) return;
  const { nodes, edges } = removeDiagramNode(
    activeDiagram.value.nodes,
    activeDiagram.value.edges,
    selectedNode.value.id,
  );
  selectedNodeId.value = '';
  syncDiagramUrl({ node: undefined });
  persistDiagram({ nodes, edges });
}

function onMoveNodes(flowNodes) {
  const nodes = flowPositionsToNodes(activeDiagram.value.nodes, flowNodes);
  persistDiagram({ nodes });
}

function fitView() {
  canvasRef.value?.fitView(selectedNodeId.value ? [selectedNodeId.value] : undefined);
}

function slug(title) {
  return (title || 'diagram').replace(/\s+/g, '-').toLowerCase();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(activeDiagram.value, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug(activeDiagram.value.title)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportMermaid() {
  const text = diagramToMermaid(activeDiagram.value.title, activeDiagram.value.nodes, activeDiagram.value.edges);
  navigator.clipboard?.writeText(text).then(
    () => alert('Mermaid copied to clipboard'),
    () => prompt('Copy Mermaid:', text),
  );
}

function exportSvg() {
  downloadDiagramSvg(
    activeDiagram.value.title,
    activeDiagram.value.nodes,
    activeDiagram.value.edges,
    `${slug(activeDiagram.value.title)}.svg`,
  );
}

function exportPng() {
  downloadDiagramPng(
    activeDiagram.value.title,
    activeDiagram.value.nodes,
    activeDiagram.value.edges,
    `${slug(activeDiagram.value.title)}.png`,
  );
}
</script>

<style module>
.workspace {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
}
.topLeft {
  justify-self: start;
}
.topRight {
  justify-self: end;
}
.tabs {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.tab {
  padding: 0.35rem 0.65rem;
  background: rgba(18, 10, 34, 0.8);
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 4px 4px 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.75rem;
  cursor: pointer;
}
.tabActive {
  background: #1a142d;
  color: #c4b5fd;
  border-bottom-color: #1a142d;
}
.tabClose {
  margin-left: 0.35rem;
  opacity: 0.5;
}
.tabClose:hover {
  opacity: 1;
}
.body {
  display: flex;
  gap: 0;
  min-height: 480px;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
}
.canvasWrap {
  flex: 1;
  min-width: 0;
  position: relative;
}
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.error {
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 4px;
  color: #fca5a5;
  font-size: 0.75rem;
}
</style>
