<template>
  <div :class="$style.flow">
    <VueFlow v-model:nodes="flowNodes" v-model:edges="flowEdges" fit-view-on-init @node-click="onNodeClick">
      <Background pattern-color="#8b7db8" :gap="16" />
    </VueFlow>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const props = defineProps({
  nodes: { type: Array, default: () => [] },
});

const emit = defineEmits(['select']);

const flowNodes = computed(() =>
  props.nodes.map((n, i) => ({
    id: n.id,
    label: `${icon(n.type)} ${n.title}`,
    position: { x: (n.branchIndex || 0) * 180 + 40, y: depth(n) * 100 + 40 },
    data: n,
    style: nodeStyle(n),
  })),
);

const flowEdges = computed(() => {
  const edges = [];
  for (const n of props.nodes) {
    if (n.parentId) {
      edges.push({ id: `e-${n.parentId}-${n.id}`, source: n.parentId, target: n.id, animated: n.status === 'pending' });
    }
  }
  return edges;
});

function depth(node) {
  let d = 0;
  let cur = node;
  const byId = Object.fromEntries(props.nodes.map((n) => [n.id, n]));
  while (cur?.parentId && byId[cur.parentId]) {
    d += 1;
    cur = byId[cur.parentId];
  }
  return d;
}

function icon(type) {
  return { arc: '📖', chapter: '📑', scene: '🎬' }[type] || '•';
}

function nodeStyle(n) {
  const colors = { played: '#22c55e', skipped: '#94a3b8', pending: '#651fff' };
  return { border: `2px solid ${colors[n.status] || '#8b7db8'}`, borderRadius: 8, padding: 8, background: '#1a142d', color: '#fff', fontSize: 12 };
}

function onNodeClick({ node }) {
  emit('select', node.id);
}
</script>

<style module>
.flow {
  height: 420px;
  border: 2px solid #8b7db8;
  border-radius: 8px;
  overflow: hidden;
}
</style>
