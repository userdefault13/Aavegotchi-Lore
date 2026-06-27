/** Pointer drag helpers for grid canvas (M4). */

import { DEFAULT_LAYOUT } from './layoutEngine';

export function getCanvasMetrics(el, layout) {
  const l = { ...DEFAULT_LAYOUT, ...layout };
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const innerW = rect.width - padX;
  const innerH = rect.height - padY;
  const colWidth = (innerW - (l.columns - 1) * l.gap) / l.columns;
  return {
    rect,
    padLeft: parseFloat(style.paddingLeft),
    padTop: parseFloat(style.paddingTop),
    colWidth,
    rowHeight: l.rowHeight,
    gap: l.gap,
    columns: l.columns,
    innerW,
    innerH,
  };
}

export function clientToGrid(clientX, clientY, metrics) {
  const x = clientX - metrics.rect.left - metrics.padLeft;
  const y = clientY - metrics.rect.top - metrics.padTop;
  const cellW = metrics.colWidth + metrics.gap;
  const cellH = metrics.rowHeight + metrics.gap;
  const col = Math.floor(x / cellW) + 1;
  const row = Math.floor(y / cellH) + 1;
  return {
    col: clamp(col, 1, metrics.columns),
    row: Math.max(1, row),
  };
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function clampGrid(grid, columns = 12) {
  const colSpan = clamp(grid.colSpan || 1, 1, columns);
  let col = clamp(grid.col || 1, 1, columns);
  if (col + colSpan - 1 > columns) col = columns - colSpan + 1;
  return {
    col,
    row: Math.max(1, grid.row || 1),
    colSpan,
    rowSpan: Math.max(1, grid.rowSpan || 1),
  };
}

export function gridDelta(startClient, curClient, metrics) {
  const a = clientToGrid(startClient.x, startClient.y, metrics);
  const b = clientToGrid(curClient.x, curClient.y, metrics);
  return { dCol: b.col - a.col, dRow: b.row - a.row };
}

export function resizeGridFromPointer(originGrid, clientX, clientY, metrics) {
  const cell = clientToGrid(clientX, clientY, metrics);
  return clampGrid({
    ...originGrid,
    colSpan: Math.max(1, cell.col - originGrid.col + 1),
    rowSpan: Math.max(1, cell.row - originGrid.row + 1),
  });
}

export function moveGridFromDelta(originGrid, dCol, dRow, columns = 12) {
  return clampGrid(
    {
      ...originGrid,
      col: originGrid.col + dCol,
      row: originGrid.row + dRow,
    },
    columns,
  );
}
