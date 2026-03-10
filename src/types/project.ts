import type { Library } from './library';

export interface PlacedComponent {
  instanceId: string;
  componentId: string;
  libraryId: string;
  x: number;
  y: number;
  rotation?: 0 | 90 | 180 | 270;
}

export interface Project {
  name: string;
  createdAt: string;
  updatedAt: string;
  libraries: Library[];
  placedComponents?: PlacedComponent[];
}
