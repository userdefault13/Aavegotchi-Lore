/** Insert palette items for the page layout editor. */

export const LAYOUT_PALETTE = [
  { id: 'full', type: 'prose', label: 'Full width', icon: '▬', colSpan: 12, rowSpan: 2 },
  { id: 'half-l', type: 'prose', label: 'Left half', icon: '▌', colSpan: 6, rowSpan: 2, grid: { col: 1, colSpan: 6, rowSpan: 2 } },
  { id: 'half-r', type: 'prose', label: 'Right half', icon: '▐', colSpan: 6, rowSpan: 2, grid: { col: 7, colSpan: 6, rowSpan: 2 } },
  { id: 'third', type: 'prose', label: 'Third', icon: '▍', colSpan: 4, rowSpan: 2, grid: { col: 1, colSpan: 4, rowSpan: 2 } },
];

export const MEDIA_PALETTE = [
  { id: 'image', type: 'image', label: 'Image', icon: '🖼', colSpan: 4, rowSpan: 3 },
  { id: 'diagram', type: 'diagram', label: 'Diagram', icon: '⑂', colSpan: 12, rowSpan: 3 },
];

export const TEXT_PALETTE = [
  { id: 'prose', type: 'prose', label: 'Text block', icon: 'T', colSpan: 12, rowSpan: 2 },
  { id: 'heading', type: 'prose', label: 'Heading area', icon: 'H', colSpan: 12, rowSpan: 1 },
];

export const PALETTE_MIME = 'application/x-gotchi-lore-block';

export function paletteDragPayload(item) {
  return JSON.stringify(item);
}

export function parsePaletteDrop(data) {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function runePaletteItems(runeFields) {
  return (runeFields || []).map((f) => ({
    id: `rune-${f.id}`,
    type: 'rune',
    runeId: f.id,
    label: f.label,
    icon: '◆',
    colSpan: 4,
    rowSpan: 2,
  }));
}
