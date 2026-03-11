import './CanvasPin.css';

import type React from 'react';

import { useGridCanvas } from '../GridCanvas';

export interface CanvasPinProps {
  rectX: number;
  rectY: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'hanging' | 'middle' | 'central';
  name: string;
  textTransform?: string;
  onPinDown?: (e: React.MouseEvent<SVGGElement>) => void;
  isWireTarget?: boolean;
}

export function CanvasPin({
  rectX,
  rectY,
  labelX,
  labelY,
  textAnchor,
  dominantBaseline,
  name,
  textTransform,
  onPinDown,
  isWireTarget = false,
}: CanvasPinProps) {
  const { grid } = useGridCanvas();
  const pinFont = Math.max(5, grid * 0.9);

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    if (!onPinDown) return;
    e.stopPropagation();
    onPinDown(e);
  };

  const classes = [
    'cec-pin',
    onPinDown ? 'cec-pin--connectable' : '',
    isWireTarget ? 'cec-pin--wire-target' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={classes}
      onMouseDown={handleMouseDown}
      onClick={onPinDown ? e => e.stopPropagation() : undefined}
    >
      <rect
        x={rectX}
        y={rectY}
        width={grid}
        height={grid}
        rx={2}
        className="cec-pin__rect"
      />
      <text
        x={labelX}
        y={labelY}
        fontSize={pinFont}
        className="cec-pin__label cec-pin__label--outside"
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        transform={textTransform}
      >
        {name || '?'}
      </text>
    </g>
  );
}
