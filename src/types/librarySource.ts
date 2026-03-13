import type { Library } from './library';

export type LibrarySourceType = 'internal' | 'imported' | 'external';

export type LibraryLoadStatus = 'online' | 'cached' | 'unavailable' | 'loading';

export interface ExternalLibraryReference {
  id: string;
  url: string;
  lastFetched?: string;
  status?: LibraryLoadStatus;
}

export interface LibraryLoadResult {
  library: Library;
  source: 'online' | 'cached';
  timestamp: string;
}

export interface LibraryLoadError {
  url: string;
  error: Error;
  isOffline: boolean;
}

export interface ExternalLibrariesLoadResult {
  loaded: LibraryLoadResult[];
  errors: LibraryLoadError[];
  summary: {
    total: number;
    online: number;
    cached: number;
    failed: number;
    isUserOffline: boolean;
  };
}
