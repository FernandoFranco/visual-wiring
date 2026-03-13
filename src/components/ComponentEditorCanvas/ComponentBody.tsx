import './ComponentBody.css';

import type React from 'react';

import type { Component } from '../../types/component';
import type { LabelPosition } from '../../types/project';
import { textColorForBg } from '../../utils/colorUtils';
import { useGridCanvas } from '../GridCanvas';
import { ComponentBodyLabel } from './ComponentBodyLabel';
import { ComponentBodyPins } from './ComponentBodyPins';
import { ComponentBodyRect } from './ComponentBodyRect';
import { useComponentBodyLayout } from './useComponentBodyLayout';

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

export function ComponentBody(props: ComponentBodyProps) {
  const { grid, canvasWidth, canvasHeight } = useGridCanvas();

  const rotation = props.rotation || 0;
  const isSelected = props.isSelected || false;
  const isDragging = props.isDragging || false;
  const wireTargetPinIds = props.wireTargetPinIds || [];

  const layout = useComponentBodyLayout({
    component: props.component,
    grid,
    canvasWidth,
    canvasHeight,
    x: props.x,
    y: props.y,
    rotation,
    labelPosition: props.labelPosition,
  });

  const { name, color } = props.component;
  const displayName = props.displayLabel ?? name;
  const labelText = displayName.trim();
  const textColor = color ? textColorForBg(color) : undefined;

  return (
    <>
      <g
        transform={`translate(${layout.translateX}, ${layout.translateY})${layout.rotateTransform}`}
        className={`component-body${isDragging ? ' component-body--dragging' : ''}${isSelected ? ' component-body--selected' : ''}`}
        onMouseDown={props.onMouseDown}
        onContextMenu={props.onContextMenu}
        style={props.onMouseDown ? { cursor: 'grab' } : undefined}
      >
        <ComponentBodyRect
          x={layout.bodyX}
          y={layout.bodyY}
          width={layout.bodyWidth}
          height={layout.bodyHeight}
          color={color}
          isSelected={isSelected}
        />

        <ComponentBodyPins
          topPins={layout.topPins}
          bottomPins={layout.bottomPins}
          leftPins={layout.leftPins}
          rightPins={layout.rightPins}
          getHorizontalPinX={layout.getHorizontalPinX}
          getVerticalPinY={layout.getVerticalPinY}
          bodyX={layout.bodyX}
          bodyY={layout.bodyY}
          bodyWidth={layout.bodyWidth}
          bodyHeight={layout.bodyHeight}
          pinHalfSize={layout.pinHalfSize}
          grid={grid}
          rotation={rotation}
          color={color}
          labelColor={textColor}
          wireTargetPinIds={wireTargetPinIds}
          onPinDown={props.onPinDown}
        />
      </g>

      <ComponentBodyLabel
        labelText={labelText}
        labelPosition={layout.effectiveLabelPosition}
        getLabelPosition={layout.getLabelPosition}
        color={color}
      />
    </>
  );
}
