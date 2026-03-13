import { type PropsWithChildren, useEffect, useState } from 'react';

import type { Component } from '../types/component';
import type { Library } from '../types/library';
import type { ComponentRotation, Project } from '../types/project';
import type { Wire } from '../types/wire';
import {
  loadExternalLibrary,
  loadMultipleExternalLibraries,
} from '../utils/externalLibraryLoader';
import {
  addColorToProject,
  addComponentToLibrary,
  addExternalLibrary,
  addWire,
  createNewProject,
  exportLibrary,
  loadProjectFromFile,
  movePlacedComponent,
  placeComponentOnCanvas,
  removeColorFromProject,
  removeComponentFromLibrary,
  removeExternalLibrary,
  removePlacedComponent,
  removeWire,
  renameProjectLibrary,
  rotatePlacedComponent,
  saveProjectToFile,
  setPlacedComponentRotation,
  updateComponentInLibrary,
  updateExternalLibraryStatus,
  updatePlacedComponentInstance,
  updateProjectName,
  updateWireColor,
  updateWireWaypoints,
} from '../utils/projectManager';
import {
  type ExternalLibraryStatus,
  ProjectContext,
  type ProjectContextValue,
} from './ProjectContext';
import { useProjectHistory } from './useProjectHistory';
import { useProjectStorage } from './useProjectStorage';

export function ProjectProvider(props: PropsWithChildren) {
  const storage = useProjectStorage();
  const [project, setProject] = useState<Project | null>(() => {
    return storage.loadProject();
  });

  const [externalLibrariesStatus, setExternalLibrariesStatus] = useState<
    ExternalLibraryStatus[]
  >([]);
  const [isLoadingExternalLibraries, setIsLoadingExternalLibraries] =
    useState(false);

  const history = useProjectHistory();

  useEffect(() => {
    if (project) {
      storage.saveProject(project);
    }
  }, [project, storage]);

  useEffect(() => {
    const loadExternalLibs = async () => {
      if (!project || !project.externalLibraries) {
        setExternalLibrariesStatus([]);
        return;
      }

      const externalRefs = project.externalLibraries;
      if (externalRefs.length === 0) {
        setExternalLibrariesStatus([]);
        return;
      }

      setIsLoadingExternalLibraries(true);

      const urls = externalRefs.map(ref => ref.url);
      const results = await loadMultipleExternalLibraries(urls);

      const statusList: ExternalLibraryStatus[] = [];
      let updatedProject = project;

      for (const ref of externalRefs) {
        const result = results.get(ref.url);

        if (result) {
          statusList.push({
            url: ref.url,
            status: result.status,
            error: result.error,
          });

          updatedProject = updateExternalLibraryStatus(
            updatedProject,
            ref.id,
            result.status,
            result.status === 'online' ? new Date().toISOString() : undefined
          );

          if (result.library) {
            const libraryWithMetadata: Library = {
              ...result.library,
              id: ref.id,
              sourceType: 'external',
              sourceUrl: ref.url,
              lastFetched:
                result.status === 'online'
                  ? new Date().toISOString()
                  : ref.lastFetched,
            };

            const existingLibIndex = updatedProject.libraries.findIndex(
              lib => lib.id === ref.id
            );

            if (existingLibIndex >= 0) {
              updatedProject = {
                ...updatedProject,
                libraries: updatedProject.libraries.map(lib =>
                  lib.id === ref.id ? libraryWithMetadata : lib
                ),
              };
            } else {
              updatedProject = {
                ...updatedProject,
                libraries: [...updatedProject.libraries, libraryWithMetadata],
              };
            }
          }
        }
      }

      setExternalLibrariesStatus(statusList);
      if (updatedProject !== project) {
        setProject(updatedProject);
      }

      setIsLoadingExternalLibraries(false);
    };

    loadExternalLibs();
  }, [project, project?.externalLibraries]);

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
    rotation: ComponentRotation
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

  const handleExportLibrary = (libraryId: string) => {
    if (!project) return;
    exportLibrary(project, libraryId);
  };

  const handleImportLibrary = (
    library: Library,
    asExternal: boolean,
    url?: string
  ) => {
    if (!project) return;

    if (asExternal && url) {
      const updatedProject = addExternalLibrary(project, url, library.id);
      setProject(updatedProject);
    } else {
      const libraryToAdd: Library = {
        ...library,
        sourceType: 'imported',
        sourceUrl: url,
      };

      const updatedProject = {
        ...project,
        libraries: [...project.libraries, libraryToAdd],
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
    }
  };

  const handleAddExternalLibraryByUrl = async (url: string) => {
    if (!project) return;

    const tempId = crypto.randomUUID();
    let updatedProject = addExternalLibrary(project, url, tempId);
    setProject(updatedProject);

    const result = await loadExternalLibrary(url);

    if (result.library) {
      const libraryWithMetadata: Library = {
        ...result.library,
        id: tempId,
        sourceType: 'external',
        sourceUrl: url,
      };

      updatedProject = {
        ...updatedProject,
        libraries: [...updatedProject.libraries, libraryWithMetadata],
      };
    }

    updatedProject = updateExternalLibraryStatus(
      updatedProject,
      tempId,
      result.status,
      result.status === 'online' ? new Date().toISOString() : undefined
    );

    setProject(updatedProject);

    setExternalLibrariesStatus(prev => [
      ...prev,
      {
        url,
        status: result.status,
        error: result.error,
      },
    ]);
  };

  const handleRemoveLibrary = (libraryId: string) => {
    if (!project) return;

    const library = project.libraries.find(lib => lib.id === libraryId);

    if (library?.sourceType === 'external') {
      const updatedProject = removeExternalLibrary(project, libraryId);
      setProject(updatedProject);

      setExternalLibrariesStatus(prev =>
        prev.filter(status => status.url !== library.sourceUrl)
      );
    } else {
      const updatedProject = {
        ...project,
        libraries: project.libraries.filter(lib => lib.id !== libraryId),
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
    }
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
    externalLibrariesStatus,
    isLoadingExternalLibraries,
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
    exportLibrary: handleExportLibrary,
    importLibrary: handleImportLibrary,
    addExternalLibraryByUrl: handleAddExternalLibraryByUrl,
    removeLibrary: handleRemoveLibrary,
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
