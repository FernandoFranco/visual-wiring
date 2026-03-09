import './ComponentBody.css';

import type React from 'react';

import type { Pin, PinSide } from '../../types/pin';
import { useGridCanvas } from '../GridCanvas';
import { CanvasPin } from './CanvasPin';

export interface ComponentBodyProps {
  name: string;
  minWidth?: number;
  minHeight?: number;
  pins: Pin[];
  x?: number;
  y?: number;
  onMouseDown?: (e: React.MouseEvent<SVGGElement>) => void;
  isDragging?: boolean;
}

function sidePins(pins: Pin[], side: PinSide): Pin[] {
  return pins.filter(p => p.side === side);
}

export function ComponentBody({
  name,
  pins,
  minWidth = 4,
  minHeight = 4,
  x: propX,
  y: propY,
  onMouseDown,
  isDragging = false,
}: ComponentBodyProps) {
  const { grid, canvasWidth, canvasHeight } = useGridCanvas();

  const PIN_HALF = grid / 2;
  const PIN_SPACING = grid * 2;
  const BODY_PAD = grid;
  const snap = (v: number) => Math.ceil(v / grid) * grid;

  const topPins = sidePins(pins, 'up');
  const bottomPins = sidePins(pins, 'down');
  const leftPins = sidePins(pins, 'left');
  const rightPins = sidePins(pins, 'right');

  const hCount = Math.max(1, topPins.length, bottomPins.length);
  const vCount = Math.max(1, leftPins.length, rightPins.length);

  const bodyW = snap(
    Math.max(grid * minWidth, 2 * BODY_PAD + (hCount - 1) * PIN_SPACING)
  );
  const bodyH = snap(
    Math.max(grid * minHeight, 2 * BODY_PAD + (vCount - 1) * PIN_SPACING)
  );

  const bx = grid;
  const by = grid;

  const hPad = (bodyW - (hCount - 1) * PIN_SPACING) / 2;
  const vPad = (bodyH - (vCount - 1) * PIN_SPACING) / 2;
  const hCx = (i: number) => bx + hPad + i * PIN_SPACING;
  const vCy = (i: number) => by + vPad + i * PIN_SPACING;

  const svgW = bodyW + 2 * grid;
  const svgH = bodyH + 2 * grid;

  const tx =
    propX !== undefined
      ? propX
      : Math.round((canvasWidth / 2 - svgW / 2) / grid) * grid;
  const ty =
    propY !== undefined
      ? propY
      : Math.round((canvasHeight / 2 - svgH / 2) / grid) * grid;

  const displayName = name.trim();

  return (
    <g
      transform={`translate(${tx}, ${ty})`}
      className={`component-body${isDragging ? ' component-body--dragging' : ''}`}
      onMouseDown={onMouseDown}
      style={onMouseDown ? { cursor: 'grab' } : undefined}
    >
      <rect
        x={bx}
        y={by}
        width={bodyW}
        height={bodyH}
        rx={2}
        className="cec-body"
      />

      <text
        x={bx + bodyW / 2}
        y={by + bodyH / 2}
        className="cec-name"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {displayName}
      </text>

      {topPins.map((pin, i) => {
        const cx = hCx(i);
        return (
          <CanvasPin
            key={pin.id}
            rectX={cx - PIN_HALF}
            rectY={by - PIN_HALF}
            labelX={cx}
            labelY={by - PIN_HALF - 2}
            textAnchor="middle"
            dominantBaseline="auto"
            name={pin.name}
          />
        );
      })}

      {bottomPins.map((pin, i) => {
        const cx = hCx(i);
        const py = by + bodyH - PIN_HALF;
        return (
          <CanvasPin
            key={pin.id}
            rectX={cx - PIN_HALF}
            rectY={py}
            labelX={cx}
            labelY={py + grid + 2}
            textAnchor="middle"
            dominantBaseline="hanging"
            name={pin.name}
          />
        );
      })}

      {leftPins.map((pin, i) => {
        const cy = vCy(i);
        const px = bx - PIN_HALF;
        return (
          <CanvasPin
            key={pin.id}
            rectX={px}
            rectY={cy - PIN_HALF}
            labelX={px - 2}
            labelY={cy}
            textAnchor="end"
            dominantBaseline="central"
            name={pin.name}
          />
        );
      })}

      {rightPins.map((pin, i) => {
        const cy = vCy(i);
        const px = bx + bodyW - PIN_HALF;
        return (
          <CanvasPin
            key={pin.id}
            rectX={px}
            rectY={cy - PIN_HALF}
            labelX={px + grid + 2}
            labelY={cy}
            textAnchor="start"
            dominantBaseline="central"
            name={pin.name}
          />
        );
      })}
    </g>
  );
}
