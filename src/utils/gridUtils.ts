export const GRID = 10;

export function snapToGrid(value: number, gridSize: number = GRID): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapToGridCeil(value: number, gridSize: number): number {
  return Math.ceil(value / gridSize) * gridSize;
}
