import type { Component } from '../types/component';
import type { PlacedComponent } from '../types/project';
import { snapToGridCeil } from './gridUtils';

function buildLayout(comp: Component, grid: number) {
  const PIN_HALF = grid / 2;
  const PIN_SPACING = grid * 2;
  const BODY_PAD = grid;

  const topPins = comp.pins.filter(p => p.side === 'up');
  const bottomPins = comp.pins.filter(p => p.side === 'down');
  const leftPins = comp.pins.filter(p => p.side === 'left');
  const rightPins = comp.pins.filter(p => p.side === 'right');

  const hCount = Math.max(1, topPins.length, bottomPins.length);
  const vCount = Math.max(1, leftPins.length, rightPins.length);

  const minWidth = comp.minWidth ?? 4;
  const minHeight = comp.minHeight ?? 4;

  const bodyW = snapToGridCeil(
    Math.max(grid * minWidth, 2 * BODY_PAD + (hCount - 1) * PIN_SPACING),
    grid
  );
  const bodyH = snapToGridCeil(
    Math.max(grid * minHeight, 2 * BODY_PAD + (vCount - 1) * PIN_SPACING),
    grid
  );

  const bx = grid;
  const by = grid;

  const hPad = (bodyW - (hCount - 1) * PIN_SPACING) / 2;
  const vPad = (bodyH - (vCount - 1) * PIN_SPACING) / 2;
  const hCx = (i: number) => bx + hPad + i * PIN_SPACING;
  const vCy = (i: number) => by + vPad + i * PIN_SPACING;

  const bodyCx = bx + bodyW / 2;
  const bodyCy = by + bodyH / 2;

  return {
    topPins,
    bottomPins,
    leftPins,
    rightPins,
    bx,
    by,
    bodyW,
    bodyH,
    bodyCx,
    bodyCy,
    hCx,
    vCy,
    PIN_HALF,
  };
}

function rotatePoint(
  x: number,
  y: number,
  cx: number,
  cy: number,
  deg: number
): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));
  return {
    x: cx + (x - cx) * cos - (y - cy) * sin,
    y: cy + (x - cx) * sin + (y - cy) * cos,
  };
}

export function getPinSide(
  comp: Component,
  pinId: string
): 'up' | 'down' | 'left' | 'right' | null {
  const pin = comp.pins.find(p => p.id === pinId);
  return pin?.side ?? null;
}

export function getPinConnectionPoint(
  placed: PlacedComponent,
  comp: Component,
  pinId: string,
  grid: number
): { x: number; y: number } | null {
  const layout = buildLayout(comp, grid);
  const {
    topPins,
    bottomPins,
    leftPins,
    rightPins,
    bx,
    by,
    bodyW,
    bodyH,
    bodyCx,
    bodyCy,
    hCx,
    vCy,
    PIN_HALF,
  } = layout;

  let localX: number | null = null;
  let localY: number | null = null;

  const topIdx = topPins.findIndex(p => p.id === pinId);
  if (topIdx !== -1) {
    localX = hCx(topIdx);
    localY = by - PIN_HALF;
  }

  if (localX === null) {
    const botIdx = bottomPins.findIndex(p => p.id === pinId);
    if (botIdx !== -1) {
      localX = hCx(botIdx);
      localY = by + bodyH + PIN_HALF;
    }
  }

  if (localX === null) {
    const leftIdx = leftPins.findIndex(p => p.id === pinId);
    if (leftIdx !== -1) {
      localX = bx - PIN_HALF;
      localY = vCy(leftIdx);
    }
  }

  if (localX === null) {
    const rightIdx = rightPins.findIndex(p => p.id === pinId);
    if (rightIdx !== -1) {
      localX = bx + bodyW + PIN_HALF;
      localY = vCy(rightIdx);
    }
  }

  if (localX === null || localY === null) return null;

  const rotation = placed.rotation ?? 0;
  const rotated = rotatePoint(localX, localY, bodyCx, bodyCy, rotation);

  return {
    x: placed.x + rotated.x,
    y: placed.y + rotated.y,
  };
}
