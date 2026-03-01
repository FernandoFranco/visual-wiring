import './CanvasPin.css';

import { useGridCanvas } from '../GridCanvas';

export interface CanvasPinProps {
  rectX: number;
  rectY: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'hanging' | 'middle' | 'central';
  name: string;
}

export function CanvasPin({
  rectX,
  rectY,
  labelX,
  labelY,
  textAnchor,
  dominantBaseline,
  name,
}: CanvasPinProps) {
  const { grid } = useGridCanvas();
  const pinFont = Math.max(5, grid * 0.9);

  return (
    <g className="cec-pin">
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
      >
        {name || '?'}
      </text>
    </g>
  );
}
