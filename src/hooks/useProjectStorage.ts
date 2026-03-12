import type { Project } from '../types/project';
import { createDefaultLibrary } from '../utils/projectManager';
import {
  CURRENT_PROJECT_VERSION,
  getMigrationPath,
  migrateProject,
  needsMigration,
} from '../utils/projectMigrations';

const STORAGE_KEY = 'project';

export function useProjectStorage() {
  const saveProject = (project: Project | null) => {
    if (project) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadProject = (): Project | null => {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const project = JSON.parse(stored) as Project;
        if (!Array.isArray(project.libraries)) {
          project.libraries = [createDefaultLibrary()];
        }

        if (needsMigration(project)) {
          const migrationPath = getMigrationPath(project);
          console.log(
            `Project needs migration from v${project.version ?? 0} to v${CURRENT_PROJECT_VERSION}`,
            `Path: ${migrationPath.join(' → ')}`
          );

          const migratedProject = migrateProject(project);

          saveProject(migratedProject);

          return migratedProject;
        }

        return project;
      } catch (error) {
        console.error('Failed to parse stored project:', error);
        return null;
      }
    }

    return null;
  };

  const clearProject = () => {
    saveProject(null);
  };

  return {
    saveProject,
    loadProject,
    clearProject,
  };
}
