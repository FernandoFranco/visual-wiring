import { DEFAULT_SWATCHES } from '../components/ColorPicker';
import type { Component } from '../types/component';
import type { Library } from '../types/library';
import type {
  ExternalLibraryReference,
  LibraryLoadStatus,
} from '../types/librarySource';
import type {
  ComponentRotation,
  LabelPosition,
  PlacedComponent,
  Project,
} from '../types/project';
import type { Wire } from '../types/wire';
import { sanitizeFilename, saveFile } from './fileHelper';
import {
  CURRENT_PROJECT_VERSION,
  getMigrationPath,
  migrateProject,
  needsMigration,
} from './projectMigrations';

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
    version: CURRENT_PROJECT_VERSION,
    colors: [...DEFAULT_SWATCHES],
    libraries: [createDefaultLibrary()],
  };
}

export function addColorToProject(project: Project, color: string): Project {
  if (project.colors.includes(color)) {
    return project;
  }

  return {
    ...project,
    colors: [...project.colors, color],
    updatedAt: new Date().toISOString(),
  };
}

export function removeColorFromProject(
  project: Project,
  color: string
): Project {
  const colors = project.colors.filter(c => c !== color);

  const wires = (project.wires ?? []).map(w =>
    w.color === color ? { ...w, color: '#000000' } : w
  );

  return {
    ...project,
    colors,
    wires,
    updatedAt: new Date().toISOString(),
  };
}

export function loadProjectFromFile(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        let project = JSON.parse(content) as Project;
        if (!project.name) {
          throw new Error('Invalid project format: missing name field');
        }
        if (!Array.isArray(project.libraries)) {
          project.libraries = [createDefaultLibrary()];
        }
        if (!Array.isArray(project.colors)) {
          project.colors = [...DEFAULT_SWATCHES];
        }

        if (needsMigration(project)) {
          const migrationPath = getMigrationPath(project);
          console.log(
            `Imported project needs migration from v${project.version ?? 0} to v${CURRENT_PROJECT_VERSION}`,
            `Path: ${migrationPath.join(' → ')}`
          );

          project = migrateProject(project);
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
  const projectToSave = {
    ...project,
    version: CURRENT_PROJECT_VERSION,
    updatedAt: new Date().toISOString(),
  };
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

export function placeComponentOnCanvas(
  project: Project,
  placed: PlacedComponent
): Project {
  const existing = project.placedComponents ?? [];
  return {
    ...project,
    placedComponents: [...existing, placed],
    updatedAt: new Date().toISOString(),
  };
}

export function movePlacedComponent(
  project: Project,
  instanceId: string,
  x: number,
  y: number
): Project {
  return {
    ...project,
    placedComponents: (project.placedComponents ?? []).map(p =>
      p.instanceId === instanceId ? { ...p, x, y } : p
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function rotatePlacedComponent(
  project: Project,
  instanceId: string
): Project {
  return {
    ...project,
    placedComponents: (project.placedComponents ?? []).map(p => {
      if (p.instanceId !== instanceId) return p;
      const current = p.rotation ?? 0;
      const next = ((current + 90) % 360) as ComponentRotation;
      return { ...p, rotation: next };
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function setPlacedComponentRotation(
  project: Project,
  instanceId: string,
  rotation: ComponentRotation
): Project {
  return {
    ...project,
    placedComponents: (project.placedComponents ?? []).map(p =>
      p.instanceId === instanceId ? { ...p, rotation } : p
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updatePlacedComponentInstance(
  project: Project,
  instanceId: string,
  updates: { alias?: string; labelPosition?: LabelPosition }
): Project {
  return {
    ...project,
    placedComponents: (project.placedComponents ?? []).map(p =>
      p.instanceId === instanceId ? { ...p, ...updates } : p
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function removePlacedComponent(
  project: Project,
  instanceId: string
): Project {
  return {
    ...project,
    placedComponents: (project.placedComponents ?? []).filter(
      p => p.instanceId !== instanceId
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateComponentInLibrary(
  project: Project,
  libraryId: string,
  component: Component
): Project {
  const updated = {
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
  if (component.color) {
    return addColorToProject(updated, component.color);
  }
  return updated;
}

export function addWire(project: Project, wire: Wire): Project {
  return {
    ...project,
    wires: [...(project.wires ?? []), wire],
    updatedAt: new Date().toISOString(),
  };
}

export function removeWire(project: Project, wireId: string): Project {
  return {
    ...project,
    wires: (project.wires ?? []).filter(w => w.id !== wireId),
    updatedAt: new Date().toISOString(),
  };
}

export function updateWireWaypoints(
  project: Project,
  wireId: string,
  waypoints: Wire['waypoints']
): Project {
  return {
    ...project,
    wires: (project.wires ?? []).map(w =>
      w.id === wireId ? { ...w, waypoints } : w
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateWireColor(
  project: Project,
  wireId: string,
  color: string
): Project {
  const wires = project.wires ?? [];

  const connectedWireIds = new Set<string>();
  const findConnectedWires = (currentWireId: string) => {
    if (connectedWireIds.has(currentWireId)) return;
    connectedWireIds.add(currentWireId);

    wires.forEach(w => {
      if (
        (w.start.type === 'waypoint' && w.start.wireId === currentWireId) ||
        (w.end.type === 'waypoint' && w.end.wireId === currentWireId)
      ) {
        findConnectedWires(w.id);
      }

      if (currentWireId !== w.id) {
        const currentWire = wires.find(wire => wire.id === currentWireId);
        if (currentWire) {
          if (
            (currentWire.start.type === 'waypoint' &&
              currentWire.start.wireId === w.id) ||
            (currentWire.end.type === 'waypoint' &&
              currentWire.end.wireId === w.id)
          ) {
            findConnectedWires(w.id);
          }
        }
      }
    });
  };

  findConnectedWires(wireId);

  const updated = {
    ...project,
    wires: wires.map(w => (connectedWireIds.has(w.id) ? { ...w, color } : w)),
    updatedAt: new Date().toISOString(),
  };
  return addColorToProject(updated, color);
}

export function removeComponentFromLibrary(
  project: Project,
  libraryId: string,
  componentId: string
): Project {
  const instancesToRemove = (project.placedComponents ?? [])
    .filter(p => p.libraryId === libraryId && p.componentId === componentId)
    .map(p => p.instanceId);

  const wiresToRemove = (project.wires ?? [])
    .filter(w => {
      const startInRemove =
        w.start.type === 'pin' &&
        instancesToRemove.includes(w.start.instanceId);
      const endInRemove =
        w.end.type === 'pin' && instancesToRemove.includes(w.end.instanceId);
      return startInRemove || endInRemove;
    })
    .map(w => w.id);

  return {
    ...project,
    libraries: project.libraries.map(lib =>
      lib.id === libraryId
        ? {
            ...lib,
            components: lib.components.filter(c => c.id !== componentId),
          }
        : lib
    ),
    placedComponents: (project.placedComponents ?? []).filter(
      p => !instancesToRemove.includes(p.instanceId)
    ),
    wires: (project.wires ?? []).filter(w => !wiresToRemove.includes(w.id)),
    updatedAt: new Date().toISOString(),
  };
}

export function exportLibrary(project: Project, libraryId: string): void {
  const library = project.libraries.find(lib => lib.id === libraryId);

  if (!library) {
    throw new Error(`Library with id ${libraryId} not found`);
  }

  const libraryToExport: Library = { ...library, sourceType: 'imported' };
  const json = JSON.stringify(libraryToExport, null, 2);
  saveFile(json, `${sanitizeFilename(library.name)}.json`);
}

export function addExternalLibrary(
  project: Project,
  url: string,
  libraryId?: string
): Project {
  const externalLibraries = project.externalLibraries ?? [];

  const exists = externalLibraries.some(lib => lib.url === url);
  if (exists) return project;

  const newReference: ExternalLibraryReference = {
    id: libraryId ?? crypto.randomUUID(),
    url,
    status: 'loading',
  };

  return {
    ...project,
    externalLibraries: [...externalLibraries, newReference],
    updatedAt: new Date().toISOString(),
  };
}

export function removeExternalLibrary(
  project: Project,
  libraryId: string
): Project {
  const externalLibraries = project.externalLibraries ?? [];

  return {
    ...project,
    externalLibraries: externalLibraries.filter(lib => lib.id !== libraryId),
    libraries: project.libraries.filter(
      lib => lib.id !== libraryId && lib.sourceType !== 'external'
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateExternalLibraryStatus(
  project: Project,
  libraryId: string,
  status: LibraryLoadStatus,
  lastFetched?: string
): Project {
  const externalLibraries = project.externalLibraries ?? [];

  return {
    ...project,
    externalLibraries: externalLibraries.map(lib =>
      lib.id === libraryId
        ? {
            ...lib,
            status,
            lastFetched: lastFetched ?? lib.lastFetched,
          }
        : lib
    ),
    updatedAt: new Date().toISOString(),
  };
}
