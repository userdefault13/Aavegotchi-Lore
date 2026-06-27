/** Map presets sourced from AarcadeGh-t Real Estate / aadventure.io Citaadel art. */

export const MAP_PRESETS = {
  gotchiverse: {
    id: 'gotchiverse',
    label: 'Gotchiverse Overview',
    title: 'Gotchiverse',
    width: 621,
    height: 602,
    aspectRatio: 621 / 602,
    backgrounds: {
      dark: '/images/maps/gotchiverse-overview.svg',
      light: '/images/maps/gotchiverse-overview.svg',
    },
    bgOffset: { dark: { x: 0, y: 0 }, light: { x: 0, y: 0 } },
    bgScale: 1,
    interactive: 'svg',
    description: 'Realm overview: Citaadel, Grid zones, landmarks, and The Beyond.',
  },
  citaadel: {
    id: 'citaadel',
    label: 'Citaadel District Map',
    title: 'The Citaadel',
    width: 9504,
    height: 6336,
    aspectRatio: 9504 / 6336,
    backgrounds: {
      dark: 'https://www.aadventure.io/map/citaadel_bg_dark.png',
      light: 'https://www.aadventure.io/map/citaadel_bg_light.png',
    },
    bgOffset: {
      dark: { x: -18, y: -16 },
      light: { x: 14, y: -13.5 },
    },
    bgScale: 1.003,
    districtsUrl: '/data/citaadelDistricts.json',
    interactive: 'svg',
    description: 'Parcel-accurate Citaadel map with district overlays.',
  },
};

export const MAP_PRESET_LIST = Object.values(MAP_PRESETS);

export function getMapPreset(id) {
  return MAP_PRESETS[id] || null;
}

/** True for the realm overview map (preset or legacy docs without mapPreset). */
export function isGotchiverseOverviewMap(map) {
  if (!map) return false;
  if (map.mapPreset === 'gotchiverse') return true;
  if (map.imageUrl?.includes('gotchiverse-overview')) return true;
  if (map.title === 'Gotchiverse' && map.mapPreset !== 'citaadel') return true;
  return false;
}

export function percentToMapCoords(preset, xPct, yPct) {
  return {
    x: (xPct / 100) * preset.width,
    y: (yPct / 100) * preset.height,
  };
}

export function mapCoordsToPercent(preset, x, y) {
  return {
    x: (x / preset.width) * 100,
    y: (y / preset.height) * 100,
  };
}
