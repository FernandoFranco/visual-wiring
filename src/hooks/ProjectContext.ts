import { createContext } from 'react';

import type { Project } from '../types/project';

export interface ProjectContextValue {
  project: Project | null;
  isProjectLoaded: boolean;

  createProject: (name: string) => void;
  loadProject: (file: File) => Promise<void>;
  saveProject: () => void;
  updateName: (name: string) => void;
  closeProject: () => void;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);
