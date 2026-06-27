import { buildLandmarkPins, mergeLandmarkPins, landmarksChanged } from '@/constants/gotchiverseLandmarks';
import { getMapPreset, isGotchiverseOverviewMap } from '@/constants/gotchiverseMaps';
import { linkLandmarkPinsToPages } from '@/utils/landmarkPages';

/** Create Gotchiverse + Citaadel maps when a world has none. */
export async function ensureDefaultMaps(loreApi, worldId, maps, pages) {
  if (maps?.length) return { maps, pages };
  const gotchiverse = await loreApi.createMap({
    worldId,
    title: 'Gotchiverse',
    mapPreset: 'gotchiverse',
    imageUrl: '/images/maps/gotchiverse-overview.svg',
    mapWidth: 621,
    mapHeight: 602,
    pins: buildLandmarkPins(),
  });
  const citaadelPreset = getMapPreset('citaadel');
  const citaadel = await loreApi.createMap({
    worldId,
    title: 'The Citaadel',
    mapPreset: 'citaadel',
    imageUrl: citaadelPreset.backgrounds.dark,
    mapWidth: citaadelPreset.width,
    mapHeight: citaadelPreset.height,
    pins: [],
  });
  return { maps: [gotchiverse, citaadel], pages };
}

/** Merge landmark pins and link them to lore pages on Gotchiverse overview maps. */
export async function ensureGotchiverseLandmarks(loreApi, worldId, maps, pages) {
  let nextMaps = [...(maps || [])];
  let nextPages = [...(pages || [])];
  let gotchiverseHandled = false;

  for (let i = 0; i < nextMaps.length; i++) {
    const map = nextMaps[i];
    if (!isGotchiverseOverviewMap(map)) continue;
    if (gotchiverseHandled) continue;
    gotchiverseHandled = true;

    let merged = mergeLandmarkPins(map.pins || []);
    const linked = await linkLandmarkPinsToPages(worldId, nextPages, merged);
    nextPages = linked.pages;
    merged = linked.pins;

    const needsPins = landmarksChanged(map.pins || [], merged) || linked.changed;
    const needsMeta = map.mapPreset !== 'gotchiverse' || map.mapWidth !== 621 || map.mapHeight !== 602;
    if (!needsPins && !needsMeta) continue;

    const patch = { pins: merged };
    if (needsMeta) {
      patch.mapPreset = 'gotchiverse';
      patch.mapWidth = 621;
      patch.mapHeight = 602;
      if (!map.imageUrl) patch.imageUrl = '/images/maps/gotchiverse-overview.svg';
    }
    nextMaps[i] = await loreApi.updateMap(map.id, patch);
  }

  return { maps: nextMaps, pages: nextPages };
}

export async function ensureWorldMapSeed(loreApi, worldId, maps, pages) {
  let result = await ensureDefaultMaps(loreApi, worldId, maps, pages);
  return ensureGotchiverseLandmarks(loreApi, worldId, result.maps, result.pages);
}
