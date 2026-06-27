import { loreApi } from '@/services/api';
import {
  GOTCHIVERSE_LANDMARKS,
  landmarkPageMeta,
  normalizeLabel,
} from '@/constants/gotchiverseLandmarks';

/** Create lore pages for unlinked landmark pins and attach pageId. */
export async function linkLandmarkPinsToPages(worldId, pages, pins) {
  let pagesList = pages?.length ? [...pages] : await loreApi.listPages(worldId);
  const pageByTitle = new Map(pagesList.map((p) => [normalizeLabel(p.title), p]));
  const nextPins = pins.map((p) => ({ ...p }));
  let changed = false;

  for (let i = 0; i < nextPins.length; i++) {
    const pin = nextPins[i];
    if (!pin.id?.startsWith('landmark-') || pin.pageId) continue;

    const lmId = pin.id.replace('landmark-', '');
    const lm = GOTCHIVERSE_LANDMARKS.find((l) => l.id === lmId);
    const title = pin.label || lm?.label || 'Location';
    const norm = normalizeLabel(title);

    let page = pageByTitle.get(norm);
    if (!page) {
      const fresh = await loreApi.listPages(worldId);
      page = fresh.find((p) => normalizeLabel(p.title) === norm);
      if (page) {
        pagesList = fresh;
        pageByTitle.set(norm, page);
      }
    }

    if (!page) {
      const meta = landmarkPageMeta(lm);
      page = await loreApi.createPage({
        worldId,
        title,
        templateId: meta.templateId,
        runes: meta.runes,
        blocks: [{ id: `b-${pin.id}`, type: 'prose', content: '' }],
      });
      pagesList = [...pagesList, page];
      pageByTitle.set(norm, page);
      changed = true;
    }

    if (pin.pageId !== page.id) {
      nextPins[i] = { ...pin, pageId: page.id };
      changed = true;
    }
  }

  return { pages: pagesList, pins: nextPins, changed };
}
