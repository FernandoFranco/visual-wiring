import { type PropsWithChildren, useEffect, useState } from 'react';

import type { Component } from '../types/component';
import type { Project } from '../types/project';
import {
  addComponentToLibrary,
  createNewProject,
  loadProjectFromFile,
  movePlacedComponent,
  placeComponentOnCanvas,
  removePlacedComponent,
  renameProjectLibrary,
  saveProjectToFile,
  updateComponentInLibrary,
  updateProjectName,
} from '../utils/projectManager';
import { ProjectContext, type ProjectContextValue } from './ProjectContext';
import { useProjectStorage } from './useProjectStorage';

export function ProjectProvider({ children }: PropsWithChildren) {
  const storage = useProjectStorage();
  const [project, setProject] = useState<Project | null>(() => {
    return storage.loadProject();
  });

  useEffect(() => {
    if (project) {
      storage.saveProject(project);
    }
  }, [project, storage]);

  const createProject = (name: string) => {
    const newProject = createNewProject(name);
    setProject(newProject);
  };

  const loadProject = async (file: File) => {
    const loadedProject = await loadProjectFromFile(file);
    setProject(loadedProject);
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
  };

  const addComponent = (libraryId: string, component: Component) => {
    if (!project) return;
    setProject(addComponentToLibrary(project, libraryId, component));
  };

  const updateComponent = (libraryId: string, component: Component) => {
    if (!project) return;
    setProject(updateComponentInLibrary(project, libraryId, component));
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
    setProject(movePlacedComponent(project, instanceId, x, y));
  };

  const handleRemovePlaced = (instanceId: string) => {
    if (!project) return;
    setProject(removePlacedComponent(project, instanceId));
  };

  const value: ProjectContextValue = {
    project,
    isProjectLoaded: !!project,
    createProject,
    loadProject,
    saveProject,
    updateName,
    closeProject,
    renameLibrary,
    addComponent,
    updateComponent,
    placeComponent,
    movePlacedComponent: handleMovePlaced,
    removePlacedComponent: handleRemovePlaced,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
