import { Pencil, Trash2 } from 'lucide-react';

import type { Component } from '../../types/component';
import { computeComponentCanvasSize } from '../../utils/componentSize';
import {
  clearComponentDragPayload,
  setComponentDragPayload,
} from '../../utils/dragState';
import { GRID } from '../../utils/gridUtils';
import { ComponentBody } from '../ComponentEditorCanvas';
import { GridCanvas } from '../GridCanvas';
import { IconButton } from '../IconButton';
import { Highlight } from './Highlight';

export interface LibraryComponentItemProps {
  component: Component;
  libraryId: string;
  query: string;
  onEdit?: (componentId: string) => void;
  onDelete: (componentId: string, componentName: string) => void;
  readOnly?: boolean;
}

export function LibraryComponentItem(props: LibraryComponentItemProps) {
  const viewBox = computeComponentCanvasSize(props.component, GRID);

  return (
    <li
      key={props.component.id}
      className="library__component library__component--draggable"
      draggable
      onDragStart={e => {
        setComponentDragPayload({
          componentId: props.component.id,
          libraryId: props.libraryId,
        });
        e.dataTransfer.setData(
          'application/x-component',
          JSON.stringify({
            componentId: props.component.id,
            libraryId: props.libraryId,
          })
        );
        e.dataTransfer.effectAllowed = 'copy';

        const ghost = document.createElement('div');
        ghost.style.cssText =
          'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        requestAnimationFrame(() => ghost.remove());
      }}
      onDragEnd={() => clearComponentDragPayload()}
    >
      <div className="library__component__header">
        <span className="library__component__header-name">
          <Highlight text={props.component.name} query={props.query} />
        </span>
        {!props.readOnly && (
          <div className="library__component__header-actions">
            <IconButton
              className="library__component__header-edit-btn"
              tooltip="Edit component"
              onClick={() => props.onEdit?.(props.component.id)}
            >
              <Pencil size={10} />
            </IconButton>
            <IconButton
              className="library__component__header-delete-btn"
              tooltip="Delete component"
              onClick={e => {
                e.stopPropagation();
                props.onDelete(props.component.id, props.component.name);
              }}
            >
              <Trash2 size={10} />
            </IconButton>
          </div>
        )}
      </div>

      <div className="library__component__preview">
        <GridCanvas grid={GRID} noBackground viewBox={viewBox}>
          <ComponentBody component={props.component} />
        </GridCanvas>
      </div>
    </li>
  );
}
