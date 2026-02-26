import { type PropsWithChildren, useEffect, useState } from 'react';

import type { Project } from '../types/project';
import {
  createNewProject,
  loadProjectFromFile,
  renameProjectLibrary,
  saveProjectToFile,
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

  const renameLibrary = (id: string, name: string) => {
    if (!project) return;
    setProject(renameProjectLibrary(project, id, name));
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
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
