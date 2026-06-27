/** Grid layout engine for lore page blocks (Amsel-style canvas). */

export const DEFAULT_LAYOUT = {
  version: 1,
  columns: 12,
  rowHeight: 72,
  gap: 8,
};

const DEFAULT_DIAGRAM = 'graph TD\n  A[Gotchiverse] --> B[Citaadel]\n  B --> C[Great Portal]';

export function newBlockId() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultLabel(type, runeField) {
  const map = {
    prose: 'Description',
    image: 'Image',
    diagram: 'Diagram',
    rune: runeField?.label || 'Field',
    timeline: 'Timeline',
  };
  return map[type] || type;
}

export function nextGridRow(blocks, rowSpan = 2) {
  if (!blocks?.length) return 1;
  const bottom = blocks.reduce(
    (max, b) => Math.max(max, (b.grid?.row || 1) + (b.grid?.rowSpan || 2) - 1),
    0,
  );
  return bottom + 1;
}

export function stackGrid(index, colSpan = 12, rowSpan = 2) {
  let row = 1;
  for (let i = 0; i < index; i++) row += 2;
  return { col: 1, row, colSpan, rowSpan };
}

/** Assign default grid positions to legacy blocks missing grid. */
export function normalizePageLayout(page, template) {
  const layout = { ...DEFAULT_LAYOUT, ...(template?.layout || {}), ...(page?.layout || {}) };
  const blocks = (page?.blocks || []).map((block, index) => {
    const next = { ...block };
    const runeField = template?.runeFields?.find((f) => f.id === next.runeId);
    if (!next.label) next.label = defaultLabel(next.type, runeField);
    if (!next.grid) {
      const spans = { image: 3, diagram: 3, rune: 2, prose: 2, timeline: 2 };
      next.grid = stackGrid(index, 12, spans[next.type] || 2);
    }
    return next;
  });
  return { layout, blocks };
}

export function layoutNeedsMigration(page) {
  if (!page) return false;
  if (!page.layout?.columns) return true;
  return (page.blocks || []).some((b) => !b.grid);
}

export function gridAreaStyle(block) {
  const g = block.grid || { col: 1, row: 1, colSpan: 12, rowSpan: 2 };
  return {
    gridColumn: `${g.col} / span ${g.colSpan}`,
    gridRow: `${g.row} / span ${g.rowSpan}`,
  };
}

export function canvasStyle(layout, blocks) {
  const l = { ...DEFAULT_LAYOUT, ...layout };
  const maxRow = (blocks || []).reduce(
    (max, b) => Math.max(max, (b.grid?.row || 1) + (b.grid?.rowSpan || 2) - 1),
    4,
  );
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${l.columns}, minmax(0, 1fr))`,
    gridAutoRows: `${l.rowHeight}px`,
    gap: `${l.gap}px`,
    minHeight: `${maxRow * l.rowHeight + Math.max(0, maxRow - 1) * l.gap + l.rowHeight}px`,
  };
}

export function blocksFromTemplate(template) {
  const specs = template?.blocks || [];
  const hasLayout = specs.some((s) => s.grid);

  if (!specs.length) {
    return {
      layout: { ...DEFAULT_LAYOUT },
      blocks: [{ id: newBlockId(), type: 'prose', label: 'Description', content: '', grid: stackGrid(0) }],
    };
  }

  const layout = { ...DEFAULT_LAYOUT, ...(template.layout || {}) };

  if (!hasLayout) {
    const blocks = specs.map((spec, index) => {
      const type = spec.type || spec;
      const block = {
        id: newBlockId(),
        type,
        label: defaultLabel(type),
        grid: stackGrid(index, 12, type === 'image' ? 3 : 2),
      };
      if (type === 'prose') block.content = '';
      if (type === 'image') {
        block.url = '';
        block.alt = '';
      }
      if (type === 'diagram') block.content = DEFAULT_DIAGRAM;
      return block;
    });
    return { layout, blocks };
  }

  const blocks = specs.map((spec, index) => {
    const block = {
      id: newBlockId(),
      type: spec.type,
      label: spec.label || defaultLabel(spec.type, template.runeFields?.find((f) => f.id === spec.runeId)),
      grid: spec.grid ? { ...spec.grid } : stackGrid(index, spec.colSpan || 12, spec.rowSpan || 2),
    };
    if (spec.runeId) block.runeId = spec.runeId;
    if (block.type === 'prose') block.content = '';
    if (block.type === 'image') {
      block.url = '';
      block.alt = '';
    }
    if (block.type === 'diagram') block.content = DEFAULT_DIAGRAM;
    return block;
  });
  return { layout, blocks };
}

export function createBlockFromPalette(item, existingBlocks, template) {
  const colSpan = item.grid?.colSpan ?? item.colSpan ?? 12;
  const rowSpan = item.grid?.rowSpan ?? item.rowSpan ?? 2;
  const row = item.grid?.row ?? nextGridRow(existingBlocks, rowSpan);
  const grid = clampGridFromPalette({
    col: item.grid?.col ?? 1,
    row,
    colSpan,
    rowSpan,
  });

  const block = {
    id: newBlockId(),
    type: item.type,
    label: item.label || defaultLabel(item.type, template?.runeFields?.find((f) => f.id === item.runeId)),
    grid,
  };

  if (item.runeId) block.runeId = item.runeId;
  if (block.type === 'prose') block.content = '';
  if (block.type === 'image') {
    block.url = '';
    block.alt = '';
  }
  if (block.type === 'diagram') block.content = DEFAULT_DIAGRAM;

  return block;
}

function clampGridFromPalette(grid) {
  const colSpan = Math.min(12, Math.max(1, grid.colSpan || 1));
  let col = Math.max(1, grid.col || 1);
  if (col + colSpan - 1 > 12) col = Math.max(1, 13 - colSpan);
  return { col, row: Math.max(1, grid.row || 1), colSpan, rowSpan: Math.max(1, grid.rowSpan || 1) };
}

export function removeBlock(blocks, blockId) {
  return (blocks || []).filter((b) => b.id !== blockId);
}

export function updateBlock(blocks, blockId, patch) {
  return (blocks || []).map((b) => (b.id === blockId ? { ...b, ...patch } : b));
}

export function runeFieldsOnCanvas(blocks) {
  return new Set((blocks || []).filter((b) => b.type === 'rune' && b.runeId).map((b) => b.runeId));
}

/** Strip page content for template definition storage. */
export function templateBlockSpecs(blocks) {
  return (blocks || []).map(({ type, label, grid, runeId }) => {
    const spec = { type, label: label || defaultLabel(type) };
    if (runeId) spec.runeId = runeId;
    if (grid) spec.grid = { ...grid };
    return spec;
  });
}

/** Merge template specs onto existing page blocks, preserving content. */
export function mergePageBlocksFromTemplate(pageBlocks, templateSpecs, template) {
  const used = new Set();
  return (templateSpecs || []).map((spec, index) => {
    let existing = (pageBlocks || []).find(
      (b) =>
        !used.has(b.id) &&
        ((spec.runeId && b.runeId === spec.runeId) ||
          (b.type === spec.type && spec.label && b.label === spec.label)),
    );
    if (!existing) {
      existing = (pageBlocks || []).find((b) => !used.has(b.id) && b.type === spec.type);
    }
    if (existing) used.add(existing.id);

    const runeField = template?.runeFields?.find((f) => f.id === spec.runeId);
    const block = {
      id: existing?.id || newBlockId(),
      type: spec.type,
      label: spec.label || defaultLabel(spec.type, runeField),
      grid: spec.grid ? { ...spec.grid } : existing?.grid || stackGrid(index),
    };
    if (spec.runeId) block.runeId = spec.runeId;
    if (block.type === 'prose') block.content = existing?.content ?? '';
    if (block.type === 'image') {
      block.url = existing?.url ?? '';
      block.alt = existing?.alt ?? '';
    }
    if (block.type === 'diagram') block.content = existing?.content ?? DEFAULT_DIAGRAM;
    return block;
  });
}

export function sandboxBlocksFromTemplate(template) {
  const { layout, blocks } = blocksFromTemplate(template);
  return {
    layout,
    blocks: blocks.map((b) => ({
      ...b,
      content: b.type === 'prose' ? '<p>Sample text…</p>' : b.content,
      url: b.type === 'image' ? '' : b.url,
    })),
  };
}
