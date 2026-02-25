import type { Project } from '../types/project';
import { sanitizeFilename, saveFile } from './fileHelper';

export function createNewProject(name: string): Project {
  const now = new Date().toISOString();
  return { name, createdAt: now, updatedAt: now };
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
