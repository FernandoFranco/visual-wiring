import type { Library } from './library';
import type { Wire } from './wire';

export type LabelPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface PlacedComponent {
  instanceId: string;
  componentId: string;
  libraryId: string;
  x: number;
  y: number;
  rotation?: 0 | 90 | 180 | 270;
  alias?: string;
  labelPosition?: LabelPosition;
}

export interface Project {
  name: string;
  createdAt: string;
  updatedAt: string;
  libraries: Library[];
  placedComponents?: PlacedComponent[];
  wires?: Wire[];
}
