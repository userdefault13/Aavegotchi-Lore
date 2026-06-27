/** Find pins linked to a lore page across realm maps. */
export function findPinsForPage(maps, pageId) {
  const matches = [];
  for (const map of maps || []) {
    for (const pin of map.pins || []) {
      if (pin.pageId === pageId) {
        matches.push({ map, pin });
      }
    }
  }
  return matches;
}

/** Resolve ?map= & ?pin= query against loaded maps. */
export function resolveMapPinDeepLink(maps, { mapId, pinId }) {
  const map = mapId
    ? maps.find((m) => m.id === mapId)
    : maps.find((m) => (m.pins || []).some((p) => p.id === pinId));
  if (!map) return null;
  const pin = pinId ? (map.pins || []).find((p) => p.id === pinId) : null;
  return { map, pin };
}

/** Build maps URL with optional map/pin query params. */
export function mapsUrl(worldId, { mapId, pinId, pageId } = {}) {
  const q = new URLSearchParams();
  if (mapId) q.set('map', mapId);
  if (pinId) q.set('pin', pinId);
  if (pageId) q.set('page', pageId);
  const qs = q.toString();
  return `/lore/${worldId}/maps${qs ? `?${qs}` : ''}`;
}

export const PIN_TYPE_TEMPLATES = {
  page: 'landmark',
  direction: 'lore-event',
  terrain: 'realm-parcel',
  landmark: 'landmark',
};

export const PIN_TYPES = ['page', 'direction', 'terrain', 'landmark'];
