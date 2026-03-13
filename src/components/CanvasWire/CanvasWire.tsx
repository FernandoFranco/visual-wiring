import './CanvasWire.css';

import React, { useState } from 'react';

import { CANVAS_STROKE_WIDTH } from '../../utils/canvasConstants';
import { DEFAULT_SWATCHES } from '../ColorPicker';

export const DEFAULT_WIRE_COLOR = DEFAULT_SWATCHES[0];

export interface WirePoint {
  x: number;
  y: number;
}

export interface CanvasWireProps {
  points: WirePoint[];
  inProgress?: boolean;
  color?: string;
  isSelected?: boolean;
  onWireClick?: (e: React.MouseEvent) => void;
  onSegmentMouseDown?: (
    segmentIndex: number,
    isHorizontal: boolean,
    e: React.MouseEvent<SVGLineElement>
  ) => void;
  onSegmentContextMenu?: (
    segmentIndex: number,
    mouseX: number,
    mouseY: number
  ) => void;
  onGhostClick?: (segmentIndex: number, ghostX: number, ghostY: number) => void;
  onWaypointContextMenu?: (
    waypointIndex: number,
    mouseX: number,
    mouseY: number
  ) => void;
  onWaypointMouseDown?: (
    waypointIndex: number,
    e: React.MouseEvent<SVGCircleElement>
  ) => void;
  onWaypointClick?: (
    waypointIndex: number,
    e: React.MouseEvent<SVGCircleElement>
  ) => void;
}

const WAYPOINT_R = 4;
const WAYPOINT_HIT_R = 8;
const GHOST_R = 5;

export function CanvasWire(props: CanvasWireProps) {
  const [hoveredSegIdx, setHoveredSegIdx] = useState<number | null>(null);

  const inProgress = props.inProgress || false;
  const color = props.color || DEFAULT_WIRE_COLOR;
  const isSelected = props.isSelected || false;

  const n = props.points.length;
  if (n < 2) return null;

  const ptStr = props.points.map(p => `${p.x},${p.y}`).join(' ');

  const segments = props.points.slice(0, -1).map((p, i) => {
    const p2 = props.points[i + 1];
    const dx = Math.abs(p2.x - p.x);
    const dy = Math.abs(p2.y - p.y);
    return {
      x1: p.x,
      y1: p.y,
      x2: p2.x,
      y2: p2.y,
      index: i,
      isHorizontal: dy <= dx,
    };
  });

  const waypointCount = n - 2;
  const isDraggable = !inProgress && waypointCount >= 2;
  const isHovered = hoveredSegIdx !== null;
  const showWaypoints = !inProgress && n >= 3 && (isSelected || isHovered);

  const waypointPoints = n >= 3 ? props.points.slice(1, n - 1) : [];

  const hovSeg =
    hoveredSegIdx !== null && !inProgress ? segments[hoveredSegIdx] : null;
  const isNonZero =
    hovSeg !== null &&
    hovSeg &&
    (hovSeg.x1 !== hovSeg.x2 || hovSeg.y1 !== hovSeg.y2);
  const ghostX =
    hovSeg && isNonZero
      ? hovSeg.isHorizontal
        ? (hovSeg.x1 + hovSeg.x2) / 2
        : hovSeg.x1
      : 0;
  const ghostY =
    hovSeg && isNonZero
      ? hovSeg.isHorizontal
        ? hovSeg.y1
        : (hovSeg.y1 + hovSeg.y2) / 2
      : 0;
  const showGhost = isNonZero;

  const polylineClass = [
    'canvas-wire',
    inProgress ? 'canvas-wire--in-progress' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      onContextMenu={e => e.preventDefault()}
      onMouseLeave={() => setHoveredSegIdx(null)}
    >
      {isSelected && !inProgress && (
        <polyline className="canvas-wire__halo" points={ptStr} />
      )}

      {hovSeg && (
        <line
          className="canvas-wire__segment--hovered"
          x1={hovSeg.x1}
          y1={hovSeg.y1}
          x2={hovSeg.x2}
          y2={hovSeg.y2}
        />
      )}

      <polyline
        className={polylineClass}
        points={ptStr}
        style={{
          stroke: color,
          strokeWidth: CANVAS_STROKE_WIDTH,
          fill: 'none',
        }}
      />

      {showWaypoints &&
        waypointPoints.map((wp, i) => (
          <circle
            key={`wp-${i}`}
            className="canvas-wire__waypoint"
            cx={wp.x}
            cy={wp.y}
            r={WAYPOINT_R}
            style={{ fill: color }}
          />
        ))}

      {!inProgress &&
        segments.map(seg => {
          const cursorClass = isDraggable
            ? seg.isHorizontal
              ? 'canvas-wire__hit--ns'
              : 'canvas-wire__hit--ew'
            : '';
          return (
            <line
              key={seg.index}
              className={`canvas-wire__hit ${cursorClass}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              onMouseEnter={() => setHoveredSegIdx(seg.index)}
              onClick={e => {
                e.stopPropagation();
                props.onWireClick?.(e);
              }}
              onMouseDown={
                isDraggable
                  ? e => {
                      e.stopPropagation();
                      props.onSegmentMouseDown?.(
                        seg.index,
                        seg.isHorizontal,
                        e
                      );
                    }
                  : undefined
              }
              onContextMenu={e => {
                e.preventDefault();
                e.stopPropagation();
                props.onSegmentContextMenu?.(seg.index, e.clientX, e.clientY);
              }}
            />
          );
        })}

      {showGhost && hovSeg && (
        <circle
          className="canvas-wire__ghost"
          cx={ghostX}
          cy={ghostY}
          r={GHOST_R}
          onMouseDown={e => {
            e.stopPropagation();
            props.onGhostClick?.(hovSeg.index, ghostX, ghostY);
          }}
        />
      )}

      {showWaypoints &&
        waypointPoints.map((wp, i) => (
          <circle
            key={`wp-hit-${i}`}
            className="canvas-wire__waypoint-hit"
            cx={wp.x}
            cy={wp.y}
            r={WAYPOINT_HIT_R}
            onClick={e => {
              e.stopPropagation();
              props.onWaypointClick?.(i, e);
            }}
            onMouseDown={e => {
              e.stopPropagation();
              props.onWaypointMouseDown?.(i, e);
            }}
            onContextMenu={e => {
              e.preventDefault();
              e.stopPropagation();
              props.onWaypointContextMenu?.(i, e.clientX, e.clientY);
            }}
          />
        ))}
    </g>
  );
}
