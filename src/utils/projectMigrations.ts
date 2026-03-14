import { DEFAULT_SWATCHES } from '../components/ColorPicker';
import type { Library } from '../types/library';
import type { Project } from '../types/project';
import type { Wire } from '../types/wire';

export const CURRENT_PROJECT_VERSION = 3;

interface LegacyWireEndpoint {
  instanceId: string;
  pinId: string;
}

interface LegacyWire {
  id: string;
  start: LegacyWireEndpoint;
  end: LegacyWireEndpoint;
  waypoints: { x: number; y: number }[];
  color?: string;
}

function migrateV0toV1(project: Project): Project {
  if (!project.wires) {
    return { ...project, version: 1 };
  }

  const migratedWires: Wire[] = (project.wires as unknown as LegacyWire[]).map(
    wire => ({
      ...wire,
      start: {
        type: 'pin' as const,
        instanceId: wire.start.instanceId,
        pinId: wire.start.pinId,
      },
      end: {
        type: 'pin' as const,
        instanceId: wire.end.instanceId,
        pinId: wire.end.pinId,
      },
    })
  );

  return {
    ...project,
    version: 1,
    wires: migratedWires,
  };
}

function migrateV1toV2(project: Project): Project {
  if (!Array.isArray(project.colors)) {
    return {
      ...project,
      version: 2,
      colors: [...DEFAULT_SWATCHES],
    };
  }

  return {
    ...project,
    version: 2,
  };
}

function migrateV2toV3(project: Project): Project {
  const migratedLibraries: Library[] = project.libraries.map(lib => {
    if (lib.sourceType) {
      return lib;
    }

    return {
      ...lib,
      sourceType: 'internal' as const,
    };
  });

  return {
    ...project,
    version: 3,
    libraries: migratedLibraries,
    externalLibraries: project.externalLibraries ?? [],
  };
}

const MIGRATIONS: Record<number, (project: Project) => Project> = {
  1: migrateV0toV1,
  2: migrateV1toV2,
  3: migrateV2toV3,
};

export function migrateProject(project: Project): Project {
  const projectVersion = project.version ?? 0;

  if (projectVersion === CURRENT_PROJECT_VERSION) {
    return project;
  }

  if (projectVersion > CURRENT_PROJECT_VERSION) {
    console.warn(
      `Project version ${projectVersion} is newer than supported version ${CURRENT_PROJECT_VERSION}. Some features may not work correctly.`
    );
    return project;
  }

  let migratedProject = project;
  for (
    let version = projectVersion + 1;
    version <= CURRENT_PROJECT_VERSION;
    version++
  ) {
    const migrationFn = MIGRATIONS[version];
    if (!migrationFn) {
      throw new Error(
        `Missing migration function for version ${version - 1} to ${version}`
      );
    }

    console.log(`Migrating project from v${version - 1} to v${version}`);
    migratedProject = migrationFn(migratedProject);
  }

  return migratedProject;
}

export function needsMigration(project: Project): boolean {
  const projectVersion = project.version ?? 0;
  return projectVersion < CURRENT_PROJECT_VERSION;
}

export function getMigrationPath(project: Project): number[] {
  const projectVersion = project.version ?? 0;
  const path: number[] = [];

  for (
    let version = projectVersion + 1;
    version <= CURRENT_PROJECT_VERSION;
    version++
  ) {
    path.push(version);
  }

  return path;
}
