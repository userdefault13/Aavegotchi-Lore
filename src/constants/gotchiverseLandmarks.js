/** Pin positions on the Gotchiverse overview map (621×602). x/y are viewBox percents (0–100). */
export const GOTCHIVERSE_LANDMARKS = [
  { id: 'rofl-reefs', label: 'ROFL Reefs', x: 12, y: 3 },
  { id: 'north-beach', label: 'North Beach', x: 27, y: 6 },
  { id: 'the-beyond', label: 'The Beyond', x: 78, y: 3 },
  { id: 'broken-line', label: 'Broken Line', x: 8, y: 15 },
  { id: 'defi-desert', label: 'Defi Desert', x: 21, y: 21 },
  { id: 'genesis-blocks', label: 'Genesis Blocks', x: 33, y: 26 },
  { id: 'shelnot-pass', label: 'Shelnot Pass', x: 80, y: 11 },
  { id: 'laughing-peaks', label: 'Laughing Peaks', x: 75, y: 19 },
  { id: 'alpha-river', label: 'Alpha River Valley', x: 48, y: 19 },
  { id: 'caaverns', label: 'Caaverns', x: 5, y: 36 },
  { id: 'daark-forest', label: 'Daark Forest', x: 21, y: 45 },
  { id: 'tree-of-fud', label: 'Tree of FUD', x: 28, y: 43 },
  { id: 'aarena', label: 'The Aarena', x: 38, y: 48 },
  { id: 'yield-fields', label: 'Yield Fields', x: 48, y: 42 },
  { id: 'poly-lakes', label: 'Poly Lakes', x: 65, y: 48 },
  { id: 'phaantastic-grounds', label: 'Phaantastic Grounds', x: 75, y: 41 },
  { id: 'open-steppe', label: 'Open Steppe', x: 90, y: 35 },
  { id: 'ranging-range', label: 'The Ranging Range', x: 97, y: 50 },
  { id: 'citaadel', label: 'The Citaadel', x: 30, y: 65 },
  { id: 'great-portal', label: 'Great Portal', x: 30, y: 77 },
  { id: 'south-beach', label: 'South Beach', x: 30, y: 92 },
  { id: 'aalpha-lake', label: 'Aalpha Lake', x: 63, y: 68 },
  { id: 'liquidator-ruins', label: 'Liquidator Ruins', x: 68, y: 75 },
  { id: 'maagma-springs', label: 'Maagma Springs', x: 78, y: 62 },
  { id: 'mount-oomf', label: 'Mount Oomf', x: 88, y: 73 },
  { id: 'infinity-cliffs', label: 'The Infinity Cliffs', x: 80, y: 88 },
  { id: 'impassable-sea', label: 'Impassable Sea', x: 65, y: 98 },
];

const CITAADEL_LANDMARKS = new Set(['citaadel', 'great-portal', 'aarena', 'south-beach', 'north-beach']);
const BEYOND_LANDMARKS = new Set([
  'the-beyond',
  'open-steppe',
  'shelnot-pass',
  'laughing-peaks',
  'ranging-range',
  'infinity-cliffs',
]);

export function normalizeLabel(label) {
  return (label || '').trim().toLowerCase().replace(/^the\s+/, '');
}

/** Lore template + runes for a seeded landmark pin. */
export function landmarkPageMeta(lm) {
  if (!lm) {
    return { templateId: 'landmark', runes: { zone: 'Grid', landmarkType: 'Other' } };
  }
  if (lm.id === 'liquidator-ruins') {
    return {
      templateId: 'lickquidator',
      runes: { threat: 'Medium', appetite: 'Abandoned yields' },
    };
  }
  const zone = CITAADEL_LANDMARKS.has(lm.id)
    ? 'Citaadel'
    : BEYOND_LANDMARKS.has(lm.id)
      ? 'Beyond'
      : 'Grid';
  const landmarkTypes = {
    'great-portal': 'Great Portal',
    aarena: 'Aarena',
    'phaantastic-grounds': 'Phantastic Grounds',
  };
  return {
    templateId: 'landmark',
    runes: { zone, landmarkType: landmarkTypes[lm.id] || 'Other' },
  };
}

/** Build default landmark pins for the Gotchiverse overview. */
export function buildLandmarkPins() {
  return GOTCHIVERSE_LANDMARKS.map((lm) => ({
    id: `landmark-${lm.id}`,
    type: 'landmark',
    x: lm.x,
    y: lm.y,
    label: lm.label,
    pageId: null,
  }));
}

/** Merge labeled landmarks into existing pins; preserves page links and custom pins. */
export function mergeLandmarkPins(existingPins = []) {
  const pageLinks = new Map();
  for (const pin of existingPins) {
    if (!pin.pageId) continue;
    if (pin.id?.startsWith('landmark-')) {
      pageLinks.set(pin.id.replace('landmark-', ''), pin.pageId);
    }
    if (pin.label) pageLinks.set(normalizeLabel(pin.label), pin.pageId);
  }

  const landmarkLabels = new Set(GOTCHIVERSE_LANDMARKS.map((lm) => normalizeLabel(lm.label)));
  const customPins = existingPins.filter((pin) => {
    if (pin.id?.startsWith('landmark-')) {
      const slug = pin.id.replace('landmark-', '');
      return !GOTCHIVERSE_LANDMARKS.some((lm) => lm.id === slug);
    }
    return !landmarkLabels.has(normalizeLabel(pin.label));
  });

  const landmarkPins = GOTCHIVERSE_LANDMARKS.map((lm) => ({
    id: `landmark-${lm.id}`,
    type: 'landmark',
    x: lm.x,
    y: lm.y,
    label: lm.label,
    pageId: pageLinks.get(lm.id) || pageLinks.get(normalizeLabel(lm.label)) || null,
    color: existingPins.find((p) => p.id === `landmark-${lm.id}`)?.color,
    imageUrl: existingPins.find((p) => p.id === `landmark-${lm.id}`)?.imageUrl,
  }));

  return [...landmarkPins, ...customPins];
}

export function landmarksChanged(existingPins = [], mergedPins = []) {
  return JSON.stringify(existingPins) !== JSON.stringify(mergedPins);
}
