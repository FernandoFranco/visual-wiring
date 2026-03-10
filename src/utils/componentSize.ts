import type { Component } from '../types/component';

/**
 * Replicates the body-size calculation from ComponentBody so we can compute
 * the centering offset before the SVG element is rendered.
 */
export function computeBodySize(
  component: Component,
  grid: number
): { bodyW: number; bodyH: number } {
  const snapCeil = (v: number) => Math.ceil(v / grid) * grid;
  const PIN_SPACING = grid * 2;
  const BODY_PAD = grid;

  const topPins = component.pins.filter(p => p.side === 'up');
  const bottomPins = component.pins.filter(p => p.side === 'down');
  const leftPins = component.pins.filter(p => p.side === 'left');
  const rightPins = component.pins.filter(p => p.side === 'right');

  const hCount = Math.max(1, topPins.length, bottomPins.length);
  const vCount = Math.max(1, leftPins.length, rightPins.length);

  const minW = component.minWidth ?? 4;
  const minH = component.minHeight ?? 4;

  const bodyW = snapCeil(
    Math.max(grid * minW, 2 * BODY_PAD + (hCount - 1) * PIN_SPACING)
  );
  const bodyH = snapCeil(
    Math.max(grid * minH, 2 * BODY_PAD + (vCount - 1) * PIN_SPACING)
  );

  return { bodyW, bodyH };
}

/**
 * Returns the (x, y) translation offset so that the component body center
 * sits exactly at (cursorX, cursorY), snapped to the grid.
 */
export function centeredSnapPosition(
  component: Component,
  grid: number,
  cursorX: number,
  cursorY: number
): { x: number; y: number } {
  const snapRound = (v: number) => Math.round(v / grid) * grid;
  const { bodyW, bodyH } = computeBodySize(component, grid);
  // Inside the <g>, the body rect starts at (grid, grid), so body center is at
  // (grid + bodyW/2) and (grid + bodyH/2) relative to the group origin.
  return {
    x: snapRound(cursorX - grid - bodyW / 2),
    y: snapRound(cursorY - grid - bodyH / 2),
  };
}
