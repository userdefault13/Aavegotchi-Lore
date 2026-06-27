import { isGotchiverseOverviewMap } from '@/constants/gotchiverseMaps';
import { mergeMapIntoDiagram } from './diagramGraph';

/** Best map to seed a diplomacy-style diagram (most pins on Gotchiverse overview). */
export function findSeedMap(maps) {
  const candidates = (maps || []).filter(isGotchiverseOverviewMap);
  if (!candidates.length) return null;
  return candidates.sort((a, b) => (b.pins?.length || 0) - (a.pins?.length || 0))[0];
}

/** Build node/edge patch from map pins; null if nothing to add. */
export function seedDiagramFromMap(diagram, map) {
  if (!map?.pins?.length) return null;
  const { nodes, edges } = mergeMapIntoDiagram(
    diagram?.nodes || [],
    diagram?.edges || [],
    map.pins,
    map.paths || [],
    { width: 720, height: 480 },
  );
  if (!nodes.length) return null;

  const sameNodes = nodes.length === (diagram?.nodes?.length || 0);
  const sameEdges = edges.length === (diagram?.edges?.length || 0);
  if (sameNodes && sameEdges && diagram?.nodes?.length) return null;

  return { nodes, edges };
}

/**
 * Seed the world's default diagram ("Diplomacy", or first tab) from map pins.
 * @param {Function} updateDiagram - async (id, patch) => updated diagram
 */
export async function ensureWorldDiagramsSeeded(maps, diagrams, updateDiagram) {
  const seedMap = findSeedMap(maps);
  if (!seedMap || !diagrams?.length) return diagrams;

  const idx = Math.max(
    0,
    diagrams.findIndex((d) => d.title === 'Diplomacy'),
  );
  const diagram = diagrams[idx];
  const patch = seedDiagramFromMap(diagram, seedMap);
  if (!patch) return diagrams;

  const updated = await updateDiagram(diagram.id, patch);
  const next = [...diagrams];
  next[idx] = updated;
  return next;
}

export const DEFAULT_DIAGRAM_TITLE = 'Diplomacy';
