import './ComponentBody.css';

import type React from 'react';

import type { Component } from '../../types/component';
import type { Pin, PinSide } from '../../types/pin';
import type { LabelPosition } from '../../types/project';
import { CANVAS_STROKE_WIDTH } from '../../utils/canvasConstants';
import { hexToRgba, textColorForBg } from '../../utils/colorUtils';
import { snapToGridCeil } from '../../utils/gridUtils';
import { useGridCanvas } from '../GridCanvas';
import { CanvasPin } from './CanvasPin';

export interface ComponentBodyProps {
  component: Component;
  displayLabel?: string;
  labelPosition?: LabelPosition;
  x?: number;
  y?: number;
  rotation?: number;
  isSelected?: boolean;
  onMouseDown?: (e: React.MouseEvent<SVGGElement>) => void;
  onContextMenu?: (e: React.MouseEvent<SVGGElement>) => void;
  isDragging?: boolean;
  onPinDown?: (pinId: string, e: React.MouseEvent<SVGGElement>) => void;
  wireTargetPinIds?: string[];
}

function sidePins(pins: Pin[], side: PinSide): Pin[] {
  return pins.filter(p => p.side === side);
}

export function ComponentBody({
  component,
  displayLabel,
  labelPosition,
  x: propX,
  y: propY,
  rotation = 0,
  isSelected = false,
  onMouseDown,
  onContextMenu,
  isDragging = false,
  onPinDown,
  wireTargetPinIds = [],
}: ComponentBodyProps) {
  const { grid, canvasWidth, canvasHeight } = useGridCanvas();

  const { name, color, pins, minWidth = 4, minHeight = 4 } = component;
  const effectiveLabelPosition =
    labelPosition ?? component.defaultLabelPosition ?? 'center';

  const PIN_HALF = grid / 2;
  const PIN_SPACING = grid * 2;
  const BODY_PAD = grid;

  const topPins = sidePins(pins, 'up');
  const bottomPins = sidePins(pins, 'down');
  const leftPins = sidePins(pins, 'left');
  const rightPins = sidePins(pins, 'right');

  const hCount = Math.max(1, topPins.length, bottomPins.length);
  const vCount = Math.max(1, leftPins.length, rightPins.length);

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

  const displayName = displayLabel ?? name;
  const labelText = displayName.trim();
  const textColor = color ? textColorForBg(color) : undefined;

  const isWhiteColor = color?.toLowerCase() === '#ffffff';
  const bodyRectStyle: React.CSSProperties | undefined = color
    ? {
        fill: isWhiteColor ? '#ffffff' : hexToRgba(color, 0.86),
        stroke: isSelected ? '#3b82f6' : isWhiteColor ? '#1e293b' : color,
        strokeWidth: isSelected ? 2 : CANVAS_STROKE_WIDTH,
      }
    : undefined;

  const bodyCx = bx + bodyW / 2;
  const bodyCy = by + bodyH / 2;
  const rotateTransform = rotation
    ? ` rotate(${rotation}, ${bodyCx}, ${bodyCy})`
    : '';

  const getLabelPosition = (position: LabelPosition) => {
    const centerX = tx + bodyCx;
    const centerY = ty + bodyCy;

    const visualW = rotation === 90 || rotation === 270 ? bodyH : bodyW;
    const visualH = rotation === 90 || rotation === 270 ? bodyW : bodyH;

    switch (position) {
      case 'center':
        return { x: centerX, y: centerY };
      case 'top':
        return { x: centerX, y: centerY - visualH / 2 - grid };
      case 'bottom':
        return { x: centerX, y: centerY + visualH / 2 + grid };
      case 'left':
        return { x: centerX - visualW / 2 - grid / 2, y: centerY };
      case 'right':
        return { x: centerX + visualW / 2 + grid / 2, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  };

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
    <>
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
          style={bodyRectStyle}
        />

        {topPins.map((pin, i) => {
          const cx = hCx(i);
          const lx = cx;
          const ly = by + PIN_HALF + 2;
          return (
            <CanvasPin
              key={pin.id}
              rectX={cx - PIN_HALF}
              rectY={by - PIN_HALF}
              labelX={lx}
              labelY={ly}
              textAnchor={pinAnchor('middle')}
              dominantBaseline={pinBaseline('hanging')}
              name={pin.name}
              color={color}
              labelColor={textColor}
              textTransform={pinTf(lx, ly)}
              onPinDown={onPinDown ? e => onPinDown(pin.id, e) : undefined}
              isWireTarget={wireTargetPinIds.includes(pin.id)}
            />
          );
        })}

        {bottomPins.map((pin, i) => {
          const cx = hCx(i);
          const py = by + bodyH - PIN_HALF;
          const lx = cx;
          const ly = py - 2;
          return (
            <CanvasPin
              key={pin.id}
              rectX={cx - PIN_HALF}
              rectY={py}
              labelX={lx}
              labelY={ly}
              textAnchor={pinAnchor('middle')}
              dominantBaseline={pinBaseline('auto')}
              name={pin.name}
              color={color}
              labelColor={textColor}
              textTransform={pinTf(lx, ly)}
              onPinDown={onPinDown ? e => onPinDown(pin.id, e) : undefined}
              isWireTarget={wireTargetPinIds.includes(pin.id)}
            />
          );
        })}

        {leftPins.map((pin, i) => {
          const cy = vCy(i);
          const px = bx - PIN_HALF;
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
              color={color}
              labelColor={textColor}
              textTransform={pinTf(lx, ly)}
              onPinDown={onPinDown ? e => onPinDown(pin.id, e) : undefined}
              isWireTarget={wireTargetPinIds.includes(pin.id)}
            />
          );
        })}

        {rightPins.map((pin, i) => {
          const cy = vCy(i);
          const px = bx + bodyW - PIN_HALF;
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
              color={color}
              labelColor={textColor}
              textTransform={pinTf(lx, ly)}
              onPinDown={onPinDown ? e => onPinDown(pin.id, e) : undefined}
              isWireTarget={wireTargetPinIds.includes(pin.id)}
            />
          );
        })}
      </g>

      {effectiveLabelPosition === 'center' && (
        <text
          x={getLabelPosition('center').x}
          y={getLabelPosition('center').y}
          className="cec-name"
          textAnchor="middle"
          dominantBaseline="middle"
          style={color ? { fill: textColorForBg(color) } : undefined}
        >
          {labelText}
        </text>
      )}

      {effectiveLabelPosition === 'top' && (
        <text
          x={getLabelPosition('top').x}
          y={getLabelPosition('top').y}
          className="cec-name cec-name--external"
          textAnchor="middle"
          dominantBaseline="auto"
        >
          {labelText}
        </text>
      )}

      {effectiveLabelPosition === 'bottom' && (
        <text
          x={getLabelPosition('bottom').x}
          y={getLabelPosition('bottom').y}
          className="cec-name cec-name--external"
          textAnchor="middle"
          dominantBaseline="hanging"
        >
          {labelText}
        </text>
      )}

      {effectiveLabelPosition === 'left' && (
        <text
          x={getLabelPosition('left').x}
          y={getLabelPosition('left').y}
          className="cec-name cec-name--external"
          textAnchor="end"
          dominantBaseline="central"
        >
          {labelText}
        </text>
      )}

      {effectiveLabelPosition === 'right' && (
        <text
          x={getLabelPosition('right').x}
          y={getLabelPosition('right').y}
          className="cec-name cec-name--external"
          textAnchor="start"
          dominantBaseline="central"
        >
          {labelText}
        </text>
      )}
    </>
  );
}
