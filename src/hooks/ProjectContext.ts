import { createContext } from 'react';

import type { Component } from '../types/component';
import type { LabelPosition, Project } from '../types/project';
import type { Wire } from '../types/wire';
import type { HistoryEntry } from './useProjectHistory';

export interface ProjectContextValue {
  project: Project | null;
  isProjectLoaded: boolean;

  createProject: (name: string) => void;
  loadProject: (file: File) => Promise<void>;
  saveProject: () => void;
  updateName: (name: string) => void;
  closeProject: () => void;
  renameLibrary: (id: string, name: string) => void;
  addComponent: (libraryId: string, component: Component) => void;
  updateComponent: (libraryId: string, component: Component) => void;
  removeComponent: (libraryId: string, componentId: string) => void;
  placeComponent: (
    libraryId: string,
    componentId: string,
    x: number,
    y: number
  ) => void;
  movePlacedComponent: (instanceId: string, x: number, y: number) => void;
  removePlacedComponent: (instanceId: string) => void;
  rotatePlacedComponent: (instanceId: string) => void;
  setPlacedComponentRotation: (
    instanceId: string,
    rotation: 0 | 90 | 180 | 270
  ) => void;
  updatePlacedComponentInstance: (
    instanceId: string,
    updates: { alias?: string; labelPosition?: LabelPosition }
  ) => void;
  addWire: (wire: Wire) => void;
  removeWire: (wireId: string) => void;
  updateWireWaypoints: (wireId: string, waypoints: Wire['waypoints']) => void;
  updateWireColor: (wireId: string, color: string) => void;

  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  restoreToPoint: (index: number) => void;
  past: HistoryEntry[];
  future: HistoryEntry[];
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);
