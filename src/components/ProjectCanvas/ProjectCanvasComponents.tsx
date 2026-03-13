import type { MouseEvent } from 'react';

import type { Component } from '../../types/component';
import type { PlacedComponent } from '../../types/project';
import { ComponentBody } from '../ComponentEditorCanvas';
import type { DropPreview, MoveState } from './useProjectCanvasState';

export interface ProjectCanvasComponentsProps {
  placedComponents: PlacedComponent[];
  dropPreview: DropPreview | null;
  moveState: MoveState | null;
  hiddenInstanceId: string | null;
  selectedInstanceId: string | null;
  findComponent: (
    libraryId: string,
    componentId: string
  ) => Component | undefined;
  onComponentMouseDown: (placed: PlacedComponent, e: MouseEvent) => void;
  onComponentContextMenu: (
    placed: PlacedComponent,
    e: React.MouseEvent
  ) => void;
  onPinDown: (
    instanceId: string,
    pinId: string,
    e: React.MouseEvent<SVGGElement>
  ) => void;
}

export function ProjectCanvasComponents(props: ProjectCanvasComponentsProps) {
  return (
    <>
      {props.placedComponents.map(placed => {
        const comp = props.findComponent(placed.libraryId, placed.componentId);
        if (!comp) return null;
        const currentlyMoving =
          props.moveState?.instanceId === placed.instanceId;
        if (props.hiddenInstanceId === placed.instanceId) return null;
        const x = currentlyMoving ? props.moveState!.currentX : placed.x;
        const y = currentlyMoving ? props.moveState!.currentY : placed.y;
        const isSelected = placed.instanceId === props.selectedInstanceId;
        return (
          <ComponentBody
            key={placed.instanceId}
            component={comp}
            displayLabel={placed.alias || comp.name}
            labelPosition={placed.labelPosition}
            x={x}
            y={y}
            rotation={placed.rotation ?? 0}
            isDragging={currentlyMoving}
            isSelected={isSelected}
            onMouseDown={e => props.onComponentMouseDown(placed, e)}
            onContextMenu={e => props.onComponentContextMenu(placed, e)}
            onPinDown={(pinId, e) =>
              props.onPinDown(placed.instanceId, pinId, e)
            }
          />
        );
      })}

      {props.dropPreview &&
        (() => {
          const comp = props.findComponent(
            props.dropPreview.libraryId,
            props.dropPreview.componentId
          );
          if (!comp) return null;
          return (
            <ComponentBody
              component={comp}
              x={props.dropPreview.x}
              y={props.dropPreview.y}
              isDragging
            />
          );
        })()}
    </>
  );
}
