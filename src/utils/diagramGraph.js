/** Node-link diagram helpers for lore diagrams. */

export const NODE_COLORS = {
  entity: '#651fff',
  faction: '#ef4444',
  place: '#22c55e',
  item: '#f59e0b',
  custom: '#38bdf8',
};

export const NODE_ICONS = {
  entity: '◆',
  faction: '⚑',
  place: '⌂',
  item: '✦',
  custom: '●',
};

export function newNodeId() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newEdgeId() {
  return `edge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function edgePairKey(fromNodeId, toNodeId) {
  return [fromNodeId, toNodeId].sort().join('::');
}

export function addDiagramEdge(edges, fromNodeId, toNodeId, label = '') {
  if (!fromNodeId || !toNodeId || fromNodeId === toNodeId) return edges || [];
  const list = edges || [];
  const key = edgePairKey(fromNodeId, toNodeId);
  if (list.some((e) => edgePairKey(e.fromNodeId, e.toNodeId) === key)) return list;
  return [
    ...list,
    {
      id: newEdgeId(),
      fromNodeId,
      toNodeId,
      label: label || '',
      color: '',
    },
  ];
}

export function removeDiagramEdge(edges, edgeId) {
  return (edges || []).filter((e) => e.id !== edgeId);
}

export function removeEdgesForNode(edges, nodeId) {
  return (edges || []).filter((e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId);
}

export function removeDiagramNode(nodes, edges, nodeId) {
  return {
    nodes: (nodes || []).filter((n) => n.id !== nodeId),
    edges: removeEdgesForNode(edges, nodeId),
  };
}

export function createDiagramNode({ label = 'New node', type = 'entity', pageId = null, x = 120, y = 120 } = {}) {
  return {
    id: newNodeId(),
    label,
    type,
    pageId,
    icon: NODE_ICONS[type] || NODE_ICONS.custom,
    color: NODE_COLORS[type] || NODE_COLORS.custom,
    x,
    y,
  };
}

export function edgeStroke(fromNode, toNode, edge) {
  if (edge?.color) return edge.color;
  const a = fromNode?.color || NODE_COLORS[fromNode?.type] || NODE_COLORS.custom;
  const b = toNode?.color || NODE_COLORS[toNode?.type] || NODE_COLORS.custom;
  return a === b ? a : a;
}

export function nodesToFlow(nodes, selectedNodeId) {
  return (nodes || []).map((n) => ({
    id: n.id,
    type: 'diagram',
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    selected: n.id === selectedNodeId,
    data: {
      label: n.label,
      pageId: n.pageId,
      icon: n.icon || NODE_ICONS[n.type] || NODE_ICONS.custom,
      color: n.color || NODE_COLORS[n.type] || NODE_COLORS.custom,
      type: n.type || 'entity',
    },
  }));
}

export function edgesToFlow(edges, nodes) {
  const byId = Object.fromEntries((nodes || []).map((n) => [n.id, n]));
  return (edges || []).map((e) => {
    const from = byId[e.fromNodeId];
    const to = byId[e.toNodeId];
    const stroke = edgeStroke(from, to, e);
    return {
      id: e.id,
      source: e.fromNodeId,
      target: e.toNodeId,
      label: e.label || '',
      labelStyle: { fill: '#e2e8f0', fontSize: 10 },
      labelBgStyle: { fill: 'rgba(15, 11, 30, 0.85)' },
      style: { stroke, strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', color: stroke },
    };
  });
}

export function flowPositionsToNodes(nodes, flowNodes) {
  const posById = Object.fromEntries((flowNodes || []).map((n) => [n.id, n.position]));
  return (nodes || []).map((n) => {
    const p = posById[n.id];
    if (!p) return n;
    return { ...n, x: p.x, y: p.y };
  });
}

export function diagramToMermaid(title, nodes, edges) {
  const safe = (s) => String(s || '').replace(/"/g, "'");
  const lines = ['flowchart LR', `  subgraph ${safe(title || 'Diagram')}`];
  for (const n of nodes || []) {
    lines.push(`    ${n.id.replace(/-/g, '_')}["${safe(n.label)}"]`);
  }
  lines.push('  end');
  for (const e of edges || []) {
    const from = e.fromNodeId.replace(/-/g, '_');
    const to = e.toNodeId.replace(/-/g, '_');
    const lbl = e.label ? `|${safe(e.label)}|` : '';
    lines.push(`  ${from} -->${lbl} ${to}`);
  }
  return lines.join('\n');
}

const EXPORT_NODE_W = 96;
const EXPORT_NODE_H = 72;
const EXPORT_PAD = 48;

function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function diagramBounds(nodes) {
  if (!nodes?.length) {
    return { minX: 0, minY: 0, maxX: 480, maxY: 320, width: 480, height: 320 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x ?? 0);
    minY = Math.min(minY, n.y ?? 0);
    maxX = Math.max(maxX, (n.x ?? 0) + EXPORT_NODE_W);
    maxY = Math.max(maxY, (n.y ?? 0) + EXPORT_NODE_H);
  }
  minX -= EXPORT_PAD;
  minY -= EXPORT_PAD;
  maxX += EXPORT_PAD;
  maxY += EXPORT_PAD;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function diagramToSvg(title, nodes, edges) {
  const bounds = diagramBounds(nodes);
  const byId = Object.fromEntries((nodes || []).map((n) => [n.id, n]));
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(bounds.width)}" height="${Math.round(bounds.height)}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">`,
    `<rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="#0a0614"/>`,
    `<text x="${bounds.minX + 12}" y="${bounds.minY + 20}" fill="#c4b5fd" font-size="12" font-family="sans-serif">${escapeXml(title || 'Diagram')}</text>`,
  ];

  for (const e of edges || []) {
    const from = byId[e.fromNodeId];
    const to = byId[e.toNodeId];
    if (!from || !to) continue;
    const x1 = (from.x ?? 0) + EXPORT_NODE_W / 2;
    const y1 = (from.y ?? 0) + EXPORT_NODE_H;
    const x2 = (to.x ?? 0) + EXPORT_NODE_W / 2;
    const y2 = to.y ?? 0;
    const stroke = edgeStroke(from, to, e);
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2"/>`);
    if (e.label) {
      parts.push(
        `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}" fill="#e2e8f0" font-size="10" text-anchor="middle" font-family="sans-serif">${escapeXml(e.label)}</text>`,
      );
    }
  }

  for (const n of nodes || []) {
    const color = n.color || NODE_COLORS[n.type] || NODE_COLORS.custom;
    const x = n.x ?? 0;
    const y = n.y ?? 0;
    parts.push(
      `<rect x="${x}" y="${y}" width="${EXPORT_NODE_W}" height="${EXPORT_NODE_H}" rx="6" fill="#0f0b1e" stroke="${color}" stroke-width="2"/>`,
    );
    parts.push(
      `<text x="${x + EXPORT_NODE_W / 2}" y="${y + EXPORT_NODE_H / 2 + 4}" fill="#e2e8f0" font-size="10" text-anchor="middle" font-family="sans-serif">${escapeXml(n.label)}</text>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
}

export function downloadTextFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function downloadDiagramSvg(title, nodes, edges, filename) {
  downloadTextFile(diagramToSvg(title, nodes, edges), filename, 'image/svg+xml');
}

export function downloadDiagramPng(title, nodes, edges, filename) {
  const svg = diagramToSvg(title, nodes, edges);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width || 800;
    canvas.height = img.height || 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0614';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

const PIN_TYPE_TO_NODE = {
  page: 'place',
  landmark: 'place',
  direction: 'entity',
  terrain: 'custom',
};

export function pinToDiagramType(pinType) {
  return PIN_TYPE_TO_NODE[pinType] || 'place';
}

/** Merge map pins/paths into an existing diagram (skips pins already linked via sourcePinId). */
export function mergeMapIntoDiagram(existingNodes, existingEdges, pins, paths, canvas = { width: 720, height: 480 }) {
  const nodes = [...(existingNodes || [])];
  let edges = [...(existingEdges || [])];
  const pinToNode = new Map();

  for (const n of nodes) {
    if (n.sourcePinId) pinToNode.set(n.sourcePinId, n.id);
  }

  for (const pin of pins || []) {
    if (pinToNode.has(pin.id)) continue;
    const node = createDiagramNode({
      label: pin.label || pin.id,
      type: pinToDiagramType(pin.type),
      pageId: pin.pageId || null,
      x: ((pin.x ?? 20) / 100) * canvas.width,
      y: ((pin.y ?? 20) / 100) * canvas.height,
    });
    node.sourcePinId = pin.id;
    if (pin.color) node.color = pin.color;
    nodes.push(node);
    pinToNode.set(pin.id, node.id);
  }

  for (const path of paths || []) {
    const from = pinToNode.get(path.fromPinId);
    const to = pinToNode.get(path.toPinId);
    if (from && to) edges = addDiagramEdge(edges, from, to, path.label || '');
  }

  return { nodes, edges };
}
