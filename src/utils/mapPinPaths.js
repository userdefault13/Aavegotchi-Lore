/** Pin-to-pin path helpers for realm maps. */

export function pathPairKey(fromPinId, toPinId) {
  return [fromPinId, toPinId].sort().join('::');
}

export function pathsForPin(paths, pinId) {
  return (paths || []).filter((p) => p.fromPinId === pinId || p.toPinId === pinId);
}

export function otherPinId(path, pinId) {
  return path.fromPinId === pinId ? path.toPinId : path.fromPinId;
}

export function addPinPath(paths, fromPinId, toPinId) {
  if (!fromPinId || !toPinId || fromPinId === toPinId) return paths || [];
  const list = paths || [];
  const key = pathPairKey(fromPinId, toPinId);
  if (list.some((p) => pathPairKey(p.fromPinId, p.toPinId) === key)) return list;
  return [...list, { id: `path-${Date.now()}`, fromPinId, toPinId }];
}

export function removePinPath(paths, pathId) {
  return (paths || []).filter((p) => p.id !== pathId);
}

export function removePathsForPin(paths, pinId) {
  return (paths || []).filter((p) => p.fromPinId !== pinId && p.toPinId !== pinId);
}

const PIN_COLORS = {
  page: '#4ade80',
  direction: '#38bdf8',
  terrain: '#9ca3af',
  landmark: '#c084fc',
};

export function pathStrokeForPins(fromPin, toPin) {
  const a = fromPin?.color || PIN_COLORS[fromPin?.type] || PIN_COLORS.page;
  const b = toPin?.color || PIN_COLORS[toPin?.type] || PIN_COLORS.page;
  if (a === b) return a;
  return fromPin?.type === 'direction' ? a : b;
}

/** Build drawable segments for SVG (drops paths with missing pins). */
export function resolvePathSegments(paths, pins, coordsForPin) {
  const pinById = new Map((pins || []).map((p) => [p.id, p]));
  const segments = [];
  for (const path of paths || []) {
    const from = pinById.get(path.fromPinId);
    const to = pinById.get(path.toPinId);
    if (!from || !to) continue;
    const a = coordsForPin(from);
    const b = coordsForPin(to);
    segments.push({
      id: path.id,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      stroke: pathStrokeForPins(from, to),
      fromPinId: path.fromPinId,
      toPinId: path.toPinId,
    });
  }
  return segments;
}
