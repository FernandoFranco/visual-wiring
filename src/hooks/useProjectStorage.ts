import type { Project } from '../types/project';

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
        return JSON.parse(stored) as Project;
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
