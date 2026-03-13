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

export function CanvasPin(props: CanvasPinProps) {
  const { grid } = useGridCanvas();
  const pinFont = Math.max(5, grid * 0.9);

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    if (!props.onPinDown) return;
    e.stopPropagation();
    props.onPinDown(e);
  };

  const classes = [
    'cec-pin',
    props.onPinDown ? 'cec-pin--connectable' : '',
    props.isWireTarget ? 'cec-pin--wire-target' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={classes}
      onMouseDown={handleMouseDown}
      onClick={props.onPinDown ? e => e.stopPropagation() : undefined}
    >
      <rect
        x={props.rectX + CANVAS_STROKE_WIDTH / 2}
        y={props.rectY + CANVAS_STROKE_WIDTH / 2}
        width={grid - CANVAS_STROKE_WIDTH}
        height={grid - CANVAS_STROKE_WIDTH}
        rx={Math.max(0, 2 - CANVAS_STROKE_WIDTH / 2)}
        className="cec-pin__rect"
        style={
          props.color
            ? {
                fill: '#ffffff',
                stroke: props.color,
                strokeWidth: CANVAS_STROKE_WIDTH,
              }
            : undefined
        }
      />
      <text
        x={props.labelX}
        y={props.labelY}
        fontSize={pinFont}
        className="cec-pin__label cec-pin__label--inside"
        textAnchor={props.textAnchor}
        dominantBaseline={props.dominantBaseline}
        transform={props.textTransform}
        style={props.labelColor ? { fill: props.labelColor } : undefined}
      >
        {props.name || '?'}
      </text>
    </g>
  );
}
