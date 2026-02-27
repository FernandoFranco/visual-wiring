import type { Component } from '../types/component';
import type { Library } from '../types/library';
import type { Project } from '../types/project';
import { sanitizeFilename, saveFile } from './fileHelper';

export function createDefaultLibrary(): Library {
  return {
    id: crypto.randomUUID(),
    name: 'My Library',
    components: [],
  };
}

export function createNewProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    name,
    createdAt: now,
    updatedAt: now,
    libraries: [createDefaultLibrary()],
  };
}

export function loadProjectFromFile(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const project = JSON.parse(content) as Project;
        if (!project.name) {
          throw new Error('Invalid project format: missing name field');
        }
        if (!Array.isArray(project.libraries)) {
          project.libraries = [createDefaultLibrary()];
        }
        resolve(project);
      } catch (error) {
        reject(
          error instanceof Error ? error : new Error('Failed to load project')
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export function saveProjectToFile(project: Project): void {
  const projectToSave = { ...project, updatedAt: new Date().toISOString() };
  const json = JSON.stringify(projectToSave, null, 2);
  saveFile(json, `${sanitizeFilename(project.name)}.json`);
}

export function updateProjectName(project: Project, name: string): Project {
  return {
    ...project,
    name,
    updatedAt: new Date().toISOString(),
  };
}

export function renameProjectLibrary(
  project: Project,
  id: string,
  name: string
): Project {
  return {
    ...project,
    libraries: project.libraries.map(lib =>
      lib.id === id ? { ...lib, name } : lib
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function addComponentToLibrary(
  project: Project,
  libraryId: string,
  component: Component
): Project {
  return {
    ...project,
    libraries: project.libraries.map(lib =>
      lib.id === libraryId
        ? { ...lib, components: [...lib.components, component] }
        : lib
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateComponentInLibrary(
  project: Project,
  libraryId: string,
  component: Component
): Project {
  return {
    ...project,
    libraries: project.libraries.map(lib =>
      lib.id === libraryId
        ? {
            ...lib,
            components: lib.components.map(c =>
              c.id === component.id ? component : c
            ),
          }
        : lib
    ),
    updatedAt: new Date().toISOString(),
  };
}
