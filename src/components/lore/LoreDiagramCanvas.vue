<template>
  <div :class="$style.canvas">
    <VueFlow
      ref="flowRef"
      v-model:nodes="localNodes"
      v-model:edges="localEdges"
      :node-types="nodeTypes"
      :default-viewport="viewport"
      :min-zoom="0.25"
      :max-zoom="2"
      :nodes-draggable="!connectMode"
      :nodes-connectable="false"
      :elements-selectable="true"
      fit-view-on-init
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @nodes-change="onNodesChange"
    >
      <Background pattern-color="#3d2f6b" :gap="20" :size="1" />
    </VueFlow>
  </div>
</template>

<script setup>
import { computed, markRaw, nextTick, ref, watch } from 'vue';
import { VueFlow, applyNodeChanges } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import DiagramNodeCard from '@/components/lore/DiagramNodeCard.vue';
import { edgesToFlow, nodesToFlow } from '@/utils/diagramGraph';

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  selectedNodeId: { type: String, default: '' },
  connectMode: { type: Boolean, default: false },
  viewport: { type: Object, default: null },
});

const emit = defineEmits(['select-node', 'clear-selection', 'move-nodes']);

const nodeTypes = { diagram: markRaw(DiagramNodeCard) };
const flowRef = ref(null);

const localNodes = ref([]);
const localEdges = ref([]);

watch(
  () => [props.nodes, props.edges, props.selectedNodeId],
  () => {
    localNodes.value = nodesToFlow(props.nodes, props.selectedNodeId);
    localEdges.value = edgesToFlow(props.edges, props.nodes);
  },
  { immediate: true, deep: true },
);

function onNodeClick({ node }) {
  emit('select-node', node.id);
}

function onPaneClick() {
  emit('clear-selection');
}

function onNodesChange(changes) {
  localNodes.value = applyNodeChanges(changes, localNodes.value);
  const moved = changes.filter((c) => c.type === 'position' && c.dragging === false);
  if (moved.length) {
    emit('move-nodes', localNodes.value);
  }
}

const viewport = computed(() => props.viewport || { x: 0, y: 0, zoom: 1 });

async function fitView(nodeIds) {
  await nextTick();
  const ids = nodeIds?.filter(Boolean);
  await flowRef.value?.fitView({
    nodes: ids?.length ? ids.map((id) => ({ id })) : undefined,
    padding: 0.28,
    duration: 280,
  });
}

async function focusNode(nodeId) {
  if (nodeId) await fitView([nodeId]);
  else await fitView();
}

defineExpose({ fitView, focusNode });
</script>

<style module>
.canvas {
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: radial-gradient(ellipse at 30% 20%, rgba(34, 197, 94, 0.08), transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(139, 87, 255, 0.12), transparent 55%),
    #0a0614;
}
.canvas :global(.vue-flow__edge-text) {
  font-size: 9px;
}
</style>
