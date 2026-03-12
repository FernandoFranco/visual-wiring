import type { Component } from '../types/component';
import { snapToGrid, snapToGridCeil } from './gridUtils';

export function computeBodySize(
  component: Component,
  grid: number
): { bodyW: number; bodyH: number } {
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

  const bodyW = snapToGridCeil(
    Math.max(grid * minW, 2 * BODY_PAD + (hCount - 1) * PIN_SPACING),
    grid
  );
  const bodyH = snapToGridCeil(
    Math.max(grid * minH, 2 * BODY_PAD + (vCount - 1) * PIN_SPACING),
    grid
  );

  return { bodyW, bodyH };
}

export function computeComponentCanvasSize(
  component: Component,
  grid: number
): { width: number; height: number } {
  const { bodyW, bodyH } = computeBodySize(component, grid);
  return {
    width: bodyW + 2 * grid,
    height: bodyH + 2 * grid,
  };
}

export function centeredSnapPosition(
  component: Component,
  grid: number,
  cursorX: number,
  cursorY: number
): { x: number; y: number } {
  const { bodyW, bodyH } = computeBodySize(component, grid);
  return {
    x: snapToGrid(cursorX - grid - bodyW / 2, grid),
    y: snapToGrid(cursorY - grid - bodyH / 2, grid),
  };
}
