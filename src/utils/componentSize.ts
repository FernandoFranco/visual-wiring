import type { Component } from '../types/component';

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

export function centeredSnapPosition(
  component: Component,
  grid: number,
  cursorX: number,
  cursorY: number
): { x: number; y: number } {
  const snapRound = (v: number) => Math.round(v / grid) * grid;
  const { bodyW, bodyH } = computeBodySize(component, grid);
  return {
    x: snapRound(cursorX - grid - bodyW / 2),
    y: snapRound(cursorY - grid - bodyH / 2),
  };
}
