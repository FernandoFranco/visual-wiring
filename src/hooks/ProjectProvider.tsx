import { type PropsWithChildren, useEffect, useState } from 'react';

import type { Component } from '../types/component';
import type { Project } from '../types/project';
import type { Wire } from '../types/wire';
import {
  addColorToProject,
  addComponentToLibrary,
  addWire,
  createNewProject,
  loadProjectFromFile,
  movePlacedComponent,
  placeComponentOnCanvas,
  removeColorFromProject,
  removeComponentFromLibrary,
  removePlacedComponent,
  removeWire,
  renameProjectLibrary,
  rotatePlacedComponent,
  saveProjectToFile,
  setPlacedComponentRotation,
  updateComponentInLibrary,
  updatePlacedComponentInstance,
  updateProjectName,
  updateWireColor,
  updateWireWaypoints,
} from '../utils/projectManager';
import { ProjectContext, type ProjectContextValue } from './ProjectContext';
import { useProjectHistory } from './useProjectHistory';
import { useProjectStorage } from './useProjectStorage';

export function ProjectProvider(props: PropsWithChildren) {
  const storage = useProjectStorage();
  const [project, setProject] = useState<Project | null>(() => {
    return storage.loadProject();
  });

  const history = useProjectHistory();

  useEffect(() => {
    if (project) {
      storage.saveProject(project);
    }
  }, [project, storage]);

  const createProject = (name: string) => {
    const newProject = createNewProject(name);
    setProject(newProject);
    history.clear();
  };

  const loadProject = async (file: File) => {
    const loadedProject = await loadProjectFromFile(file);
    setProject(loadedProject);
    history.clear();
  };

  const saveProject = () => {
    if (project) {
      saveProjectToFile(project);
    }
  };

  const updateName = (name: string) => {
    if (project) {
      const updatedProject = updateProjectName(project, name);
      setProject(updatedProject);
    }
  };

  const closeProject = () => {
    setProject(null);
    storage.clearProject();
    history.clear();
  };

  const addComponent = (libraryId: string, component: Component) => {
    if (!project) return;
    setProject(addComponentToLibrary(project, libraryId, component));
  };

  const updateComponent = (libraryId: string, component: Component) => {
    if (!project) return;
    setProject(updateComponentInLibrary(project, libraryId, component));
  };

  const removeComponent = (libraryId: string, componentId: string) => {
    if (!project) return;
    setProject(removeComponentFromLibrary(project, libraryId, componentId));
  };

  const renameLibrary = (id: string, name: string) => {
    if (!project) return;
    setProject(renameProjectLibrary(project, id, name));
  };

  const placeComponent = (
    libraryId: string,
    componentId: string,
    x: number,
    y: number
  ) => {
    if (!project) return;
    history.addToHistory(project, 'Place component');
    setProject(
      placeComponentOnCanvas(project, {
        instanceId: crypto.randomUUID(),
        componentId,
        libraryId,
        x,
        y,
      })
    );
  };

  const handleMovePlaced = (instanceId: string, x: number, y: number) => {
    if (!project) return;
    history.addToHistory(project, 'Move component');
    setProject(movePlacedComponent(project, instanceId, x, y));
  };

  const handleRemovePlaced = (instanceId: string) => {
    if (!project) return;
    history.addToHistory(project, 'Remove component');
    setProject(removePlacedComponent(project, instanceId));
  };

  const handleRotatePlaced = (instanceId: string) => {
    if (!project) return;
    history.addToHistory(project, 'Rotate component');
    setProject(rotatePlacedComponent(project, instanceId));
  };

  const handleSetRotation = (
    instanceId: string,
    rotation: 0 | 90 | 180 | 270
  ) => {
    if (!project) return;
    history.addToHistory(project, 'Set rotation');
    setProject(setPlacedComponentRotation(project, instanceId, rotation));
  };

  const handleUpdatePlacedInstance = (
    instanceId: string,
    updates: {
      alias?: string;
      labelPosition?: import('../types/project').LabelPosition;
    }
  ) => {
    if (!project) return;
    history.addToHistory(project, 'Update component properties');
    setProject(updatePlacedComponentInstance(project, instanceId, updates));
  };

  const handleAddWire = (wire: Wire) => {
    if (!project) return;
    history.addToHistory(project, 'Add wire');
    setProject(addWire(project, wire));
  };

  const handleRemoveWire = (wireId: string) => {
    if (!project) return;
    history.addToHistory(project, 'Remove wire');
    setProject(removeWire(project, wireId));
  };

  const handleUpdateWireWaypoints = (
    wireId: string,
    waypoints: Wire['waypoints']
  ) => {
    if (!project) return;
    history.addToHistory(project, 'Update wire waypoints');
    setProject(updateWireWaypoints(project, wireId, waypoints));
  };

  const handleUpdateWireColor = (wireId: string, color: string) => {
    if (!project) return;
    history.addToHistory(project, 'Change wire color');
    setProject(updateWireColor(project, wireId, color));
  };

  const handleAddColor = (color: string) => {
    if (!project) return;
    setProject(addColorToProject(project, color));
  };

  const handleRemoveColor = (color: string) => {
    if (!project) return;
    setProject(removeColorFromProject(project, color));
  };

  const handleUndo = () => {
    const previousProject = history.undo();
    if (previousProject) {
      setProject(previousProject);
    }
  };

  const handleRedo = () => {
    const nextProject = history.redo();
    if (nextProject) {
      setProject(nextProject);
    }
  };

  const handleRestoreToPoint = (index: number) => {
    const restoredProject = history.restoreToPoint(index);
    if (restoredProject) {
      setProject(restoredProject);
    }
  };

  const value: ProjectContextValue = {
    project,
    isProjectLoaded: !!project,
    createProject,
    loadProject,
    saveProject,
    removeComponent,
    updateName,
    closeProject,
    renameLibrary,
    addComponent,
    updateComponent,
    placeComponent,
    movePlacedComponent: handleMovePlaced,
    removePlacedComponent: handleRemovePlaced,
    rotatePlacedComponent: handleRotatePlaced,
    setPlacedComponentRotation: handleSetRotation,
    updatePlacedComponentInstance: handleUpdatePlacedInstance,
    addWire: handleAddWire,
    removeWire: handleRemoveWire,
    updateWireWaypoints: handleUpdateWireWaypoints,
    updateWireColor: handleUpdateWireColor,
    addColor: handleAddColor,
    removeColor: handleRemoveColor,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: handleUndo,
    redo: handleRedo,
    restoreToPoint: handleRestoreToPoint,
    past: history.past,
    future: history.future,
  };

  return (
    <ProjectContext.Provider value={value}>
      {props.children}
    </ProjectContext.Provider>
  );
}
