import type { Library } from './library';

export interface Project {
  name: string;
  createdAt: string;
  updatedAt: string;
  libraries: Library[];
}
