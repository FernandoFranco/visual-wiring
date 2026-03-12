import { createContext, useContext } from 'react';

import { GRID } from '../../utils/gridUtils';

export interface GridCanvasContextValue {
  grid: number;
  canvasWidth: number;
  canvasHeight: number;
  panX: number;
  panY: number;
}

export const GridCanvasContext = createContext<GridCanvasContextValue>({
  grid: GRID,
  canvasWidth: 600,
  canvasHeight: 400,
  panX: 0,
  panY: 0,
});

export const useGridCanvas = () => useContext(GridCanvasContext);
