import type { Library } from './library';

export interface PlacedComponent {
  instanceId: string;
  componentId: string;
  libraryId: string;
  x: number;
  y: number;
}

export interface Project {
  name: string;
  createdAt: string;
  updatedAt: string;
  libraries: Library[];
  placedComponents?: PlacedComponent[];
}
