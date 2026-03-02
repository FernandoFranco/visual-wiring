import { createContext, useContext } from 'react';

export interface GridCanvasContextValue {
  grid: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const GridCanvasContext = createContext<GridCanvasContextValue>({
  grid: 10,
  canvasWidth: 600,
  canvasHeight: 400,
});

export const useGridCanvas = () => useContext(GridCanvasContext);
