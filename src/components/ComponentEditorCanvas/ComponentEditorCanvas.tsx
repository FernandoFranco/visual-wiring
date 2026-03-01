import './ComponentEditorCanvas.css';

import type { Pin } from '../../types/pin';
import { GridCanvas } from '../GridCanvas';
import { ComponentBody } from './ComponentBody';

export interface ComponentEditorCanvasProps {
  name: string;
  minWidth?: number;
  minHeight?: number;
  pins: Pin[];
}

const GRID = 10;

export function ComponentEditorCanvas({
  name,
  pins,
  minWidth,
  minHeight,
}: ComponentEditorCanvasProps) {
  return (
    <div className="component-editor-canvas">
      <GridCanvas grid={GRID}>
        <ComponentBody
          name={name}
          pins={pins}
          minWidth={minWidth}
          minHeight={minHeight}
        />
      </GridCanvas>
      <div className="component-editor-canvas__badge">COMPONENT PREVIEW</div>
    </div>
  );
}
