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
  rotation?: number;
  isSelected?: boolean;
  onMouseDown?: (e: React.MouseEvent<SVGGElement>) => void;
  onContextMenu?: (e: React.MouseEvent<SVGGElement>) => void;
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
  rotation = 0,
  isSelected = false,
  onMouseDown,
  onContextMenu,
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

  const bodyCx = bx + bodyW / 2;
  const bodyCy = by + bodyH / 2;
  const rotateTransform = rotation
    ? ` rotate(${rotation}, ${bodyCx}, ${bodyCy})`
    : '';

  const pinTf = (lx: number, ly: number) =>
    rotation === 180 ? `rotate(-180, ${lx}, ${ly})` : undefined;
  const pinAnchor = (
    a: 'start' | 'middle' | 'end'
  ): 'start' | 'middle' | 'end' => {
    if (rotation !== 180) return a;
    return a === 'start' ? 'end' : a === 'end' ? 'start' : 'middle';
  };
  const pinBaseline = (
    b: 'auto' | 'hanging' | 'middle' | 'central'
  ): 'auto' | 'hanging' | 'middle' | 'central' => {
    if (rotation !== 180) return b;
    return b === 'auto' ? 'hanging' : b === 'hanging' ? 'auto' : b;
  };

  return (
    <g
      transform={`translate(${tx}, ${ty})${rotateTransform}`}
      className={`component-body${isDragging ? ' component-body--dragging' : ''}${isSelected ? ' component-body--selected' : ''}`}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
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
        transform={
          rotation ? `rotate(${-rotation}, ${bodyCx}, ${bodyCy})` : undefined
        }
      >
        {displayName}
      </text>

      {topPins.map((pin, i) => {
        const cx = hCx(i);
        const lx = cx;
        const ly = by - PIN_HALF - 2;
        return (
          <CanvasPin
            key={pin.id}
            rectX={cx - PIN_HALF}
            rectY={by - PIN_HALF}
            labelX={lx}
            labelY={ly}
            textAnchor={pinAnchor('middle')}
            dominantBaseline={pinBaseline('auto')}
            name={pin.name}
            textTransform={pinTf(lx, ly)}
          />
        );
      })}

      {bottomPins.map((pin, i) => {
        const cx = hCx(i);
        const py = by + bodyH - PIN_HALF;
        const lx = cx;
        const ly = py + grid + 2;
        return (
          <CanvasPin
            key={pin.id}
            rectX={cx - PIN_HALF}
            rectY={py}
            labelX={lx}
            labelY={ly}
            textAnchor={pinAnchor('middle')}
            dominantBaseline={pinBaseline('hanging')}
            name={pin.name}
            textTransform={pinTf(lx, ly)}
          />
        );
      })}

      {leftPins.map((pin, i) => {
        const cy = vCy(i);
        const px = bx - PIN_HALF;
        const lx = px - 2;
        const ly = cy;
        return (
          <CanvasPin
            key={pin.id}
            rectX={px}
            rectY={cy - PIN_HALF}
            labelX={lx}
            labelY={ly}
            textAnchor={pinAnchor('end')}
            dominantBaseline={pinBaseline('central')}
            name={pin.name}
            textTransform={pinTf(lx, ly)}
          />
        );
      })}

      {rightPins.map((pin, i) => {
        const cy = vCy(i);
        const px = bx + bodyW - PIN_HALF;
        const lx = px + grid + 2;
        const ly = cy;
        return (
          <CanvasPin
            key={pin.id}
            rectX={px}
            rectY={cy - PIN_HALF}
            labelX={lx}
            labelY={ly}
            textAnchor={pinAnchor('start')}
            dominantBaseline={pinBaseline('central')}
            name={pin.name}
            textTransform={pinTf(lx, ly)}
          />
        );
      })}
    </g>
  );
}
