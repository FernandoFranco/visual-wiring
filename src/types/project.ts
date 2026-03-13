import type { Library } from './library';
import type { ExternalLibraryReference } from './librarySource';
import type { Wire } from './wire';

export type LabelPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type ComponentRotation = 0 | 90 | 180 | 270;

export interface PlacedComponent {
  instanceId: string;
  componentId: string;
  libraryId: string;
  x: number;
  y: number;
  rotation?: ComponentRotation;
  alias?: string;
  labelPosition?: LabelPosition;
}

export interface Project {
  name: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
  colors: string[];
  libraries: Library[];
  externalLibraries?: ExternalLibraryReference[];
  placedComponents?: PlacedComponent[];
  wires?: Wire[];
}
