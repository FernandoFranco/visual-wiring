import type { Component } from '../../types/component';
import type { Pin, PinSide } from '../../types/pin';
import type { LabelPosition } from '../../types/project';
import { snapToGridCeil } from '../../utils/gridUtils';

export interface ComponentBodyLayoutParams {
  component: Component;
  grid: number;
  canvasWidth: number;
  canvasHeight: number;
  x?: number;
  y?: number;
  rotation?: number;
  labelPosition?: LabelPosition;
}

export interface ComponentBodyLayout {
  bodyX: number;
  bodyY: number;
  bodyWidth: number;
  bodyHeight: number;
  svgWidth: number;
  svgHeight: number;
  translateX: number;
  translateY: number;
  bodyCenterX: number;
  bodyCenterY: number;
  pinHalfSize: number;
  rotateTransform: string;
  effectiveLabelPosition: LabelPosition;
  topPins: Pin[];
  bottomPins: Pin[];
  leftPins: Pin[];
  rightPins: Pin[];
  getHorizontalPinX: (index: number) => number;
  getVerticalPinY: (index: number) => number;
  getLabelPosition: (position: LabelPosition) => { x: number; y: number };
}

function sidePins(pins: Pin[], side: PinSide): Pin[] {
  return pins.filter(p => p.side === side);
}

export function useComponentBodyLayout(
  params: ComponentBodyLayoutParams
): ComponentBodyLayout {
  const rotation = params.rotation ?? 0;
  const pins = params.component.pins;
  const minWidth = params.component.minWidth ?? 4;
  const minHeight = params.component.minHeight ?? 4;

  const PIN_HALF = params.grid / 2;
  const PIN_SPACING = params.grid * 2;
  const BODY_PAD = params.grid;

  const topPins = sidePins(pins, 'up');
  const bottomPins = sidePins(pins, 'down');
  const leftPins = sidePins(pins, 'left');
  const rightPins = sidePins(pins, 'right');

  const hCount = Math.max(1, topPins.length, bottomPins.length);
  const vCount = Math.max(1, leftPins.length, rightPins.length);

  const bodyW = snapToGridCeil(
    Math.max(params.grid * minWidth, 2 * BODY_PAD + (hCount - 1) * PIN_SPACING),
    params.grid
  );
  const bodyH = snapToGridCeil(
    Math.max(
      params.grid * minHeight,
      2 * BODY_PAD + (vCount - 1) * PIN_SPACING
    ),
    params.grid
  );

  const bx = params.grid;
  const by = params.grid;

  const hPad = (bodyW - (hCount - 1) * PIN_SPACING) / 2;
  const vPad = (bodyH - (vCount - 1) * PIN_SPACING) / 2;

  const getHorizontalPinX = (i: number) => bx + hPad + i * PIN_SPACING;
  const getVerticalPinY = (i: number) => by + vPad + i * PIN_SPACING;

  const svgW = bodyW + 2 * params.grid;
  const svgH = bodyH + 2 * params.grid;

  const tx =
    params.x !== undefined
      ? params.x
      : Math.round((params.canvasWidth / 2 - svgW / 2) / params.grid) *
        params.grid;
  const ty =
    params.y !== undefined
      ? params.y
      : Math.round((params.canvasHeight / 2 - svgH / 2) / params.grid) *
        params.grid;

  const bodyCx = bx + bodyW / 2;
  const bodyCy = by + bodyH / 2;

  const rotateTransform = rotation
    ? ` rotate(${rotation}, ${bodyCx}, ${bodyCy})`
    : '';

  const effectiveLabelPosition =
    params.labelPosition ?? params.component.defaultLabelPosition ?? 'center';

  const getLabelPosition = (position: LabelPosition) => {
    const centerX = tx + bodyCx;
    const centerY = ty + bodyCy;

    const visualW = rotation === 90 || rotation === 270 ? bodyH : bodyW;
    const visualH = rotation === 90 || rotation === 270 ? bodyW : bodyH;

    switch (position) {
      case 'center':
        return { x: centerX, y: centerY };
      case 'top':
        return { x: centerX, y: centerY - visualH / 2 - params.grid };
      case 'bottom':
        return { x: centerX, y: centerY + visualH / 2 + params.grid };
      case 'left':
        return { x: centerX - visualW / 2 - params.grid / 2, y: centerY };
      case 'right':
        return { x: centerX + visualW / 2 + params.grid / 2, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  };

  return {
    bodyX: bx,
    bodyY: by,
    bodyWidth: bodyW,
    bodyHeight: bodyH,
    svgWidth: svgW,
    svgHeight: svgH,
    translateX: tx,
    translateY: ty,
    bodyCenterX: bodyCx,
    bodyCenterY: bodyCy,
    pinHalfSize: PIN_HALF,
    rotateTransform,
    effectiveLabelPosition,
    topPins,
    bottomPins,
    leftPins,
    rightPins,
    getHorizontalPinX,
    getVerticalPinY,
    getLabelPosition,
  };
}
