/** Deep-link helpers for lore diagram workspace. */

export function findDiagramNodesForPage(diagrams, pageId) {
  const matches = [];
  for (const diagram of diagrams || []) {
    for (const node of diagram.nodes || []) {
      if (node.pageId === pageId) {
        matches.push({
          diagramId: diagram.id,
          diagramTitle: diagram.title,
          nodeId: node.id,
          label: node.label,
        });
      }
    }
  }
  return matches;
}

export function resolveDiagramDeepLink(diagrams, { diagramId, nodeId }) {
  const diagram = diagramId
    ? diagrams.find((d) => d.id === diagramId)
    : diagrams.find((d) => (d.nodes || []).some((n) => n.id === nodeId));
  if (!diagram) return null;
  const node = nodeId ? (diagram.nodes || []).find((n) => n.id === nodeId) : null;
  return { diagram, node };
}

export function diagramsUrl(worldId, { diagramId, nodeId, pageId } = {}) {
  const q = new URLSearchParams();
  if (diagramId) q.set('diagram', diagramId);
  if (nodeId) q.set('node', nodeId);
  if (pageId) q.set('page', pageId);
  const qs = q.toString();
  return `/lore/${worldId}/diagrams${qs ? `?${qs}` : ''}`;
}
