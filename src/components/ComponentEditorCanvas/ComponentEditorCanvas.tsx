import './ComponentEditorCanvas.css';

import type { Component } from '../../types/component';
import { GRID } from '../../utils/gridUtils';
import { GridCanvas } from '../GridCanvas';
import { ComponentBody } from './ComponentBody';

export interface ComponentEditorCanvasProps {
  component: Component;
}

export function ComponentEditorCanvas({
  component,
}: ComponentEditorCanvasProps) {
  return (
    <div className="component-editor-canvas">
      <GridCanvas grid={GRID}>
        <ComponentBody component={component} />
      </GridCanvas>
      <div className="component-editor-canvas__badge">COMPONENT PREVIEW</div>
    </div>
  );
}
