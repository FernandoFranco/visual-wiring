import './CanvasPin.css';

import type React from 'react';

import { CANVAS_STROKE_WIDTH } from '../../utils/canvasConstants';
import { useGridCanvas } from '../GridCanvas';

export interface CanvasPinProps {
  rectX: number;
  rectY: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'hanging' | 'middle' | 'central';
  name: string;
  color?: string;
  labelColor?: string;
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
  color,
  labelColor,
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
        x={rectX + CANVAS_STROKE_WIDTH / 2}
        y={rectY + CANVAS_STROKE_WIDTH / 2}
        width={grid - CANVAS_STROKE_WIDTH}
        height={grid - CANVAS_STROKE_WIDTH}
        rx={Math.max(0, 2 - CANVAS_STROKE_WIDTH / 2)}
        className="cec-pin__rect"
        style={
          color
            ? {
                fill: '#ffffff',
                stroke: color,
                strokeWidth: CANVAS_STROKE_WIDTH,
              }
            : undefined
        }
      />
      <text
        x={labelX}
        y={labelY}
        fontSize={pinFont}
        className="cec-pin__label cec-pin__label--inside"
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        transform={textTransform}
        style={labelColor ? { fill: labelColor } : undefined}
      >
        {name || '?'}
      </text>
    </g>
  );
}
