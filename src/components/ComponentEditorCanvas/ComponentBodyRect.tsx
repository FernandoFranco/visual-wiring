import type React from 'react';

import { CANVAS_STROKE_WIDTH } from '../../utils/canvasConstants';
import { hexToRgba } from '../../utils/colorUtils';

export interface ComponentBodyRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  isSelected: boolean;
}

export function ComponentBodyRect(props: ComponentBodyRectProps) {
  const isWhiteColor = props.color?.toLowerCase() === '#ffffff';

  const bodyRectStyle: React.CSSProperties | undefined = props.color
    ? {
        fill: isWhiteColor ? '#ffffff' : hexToRgba(props.color, 0.86),
        stroke: props.isSelected
          ? '#3b82f6'
          : isWhiteColor
            ? '#1e293b'
            : props.color,
        strokeWidth: props.isSelected ? 2 : CANVAS_STROKE_WIDTH,
      }
    : undefined;

  return (
    <rect
      x={props.x}
      y={props.y}
      width={props.width}
      height={props.height}
      rx={2}
      className="cec-body"
      style={bodyRectStyle}
    />
  );
}
