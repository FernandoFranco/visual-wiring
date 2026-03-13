import type { Library } from '../types/library';
import type { LibraryLoadStatus } from '../types/librarySource';
import {
  getCacheTimestamp,
  getLibraryCache,
  saveLibraryCache,
} from './libraryCache';
import { validateLibrary } from './typeValidators';

interface LoadResult {
  status: LibraryLoadStatus;
  library?: Library;
  error?: string;
  fromCache?: boolean;
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export function detectNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('networkerror')
    );
  }
  return false;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchLibraryFromURL(url: string): Promise<Library> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch library: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  validateLibrary(data);

  return data as Library;
}

export async function loadExternalLibrary(url: string): Promise<LoadResult> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const library = await fetchLibraryFromURL(url);
      saveLibraryCache(url, library);
      return { status: 'online', library, fromCache: false };
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === MAX_RETRIES - 1;
      if (isLastAttempt) break;
      if (!detectNetworkError(error)) break;

      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(
        `Network error loading library from ${url}, retrying in ${backoffMs}ms...`
      );
      await delay(backoffMs);
    }
  }

  const cachedLibrary = getLibraryCache(url);
  if (cachedLibrary) {
    const cacheTimestamp = getCacheTimestamp(url);
    console.warn(
      `Failed to load library from ${url}, using cached version from ${cacheTimestamp ? new Date(cacheTimestamp).toLocaleString() : 'unknown date'}`
    );

    return {
      status: 'cached',
      library: cachedLibrary,
      fromCache: true,
      error: lastError instanceof Error ? lastError.message : String(lastError),
    };
  }

  return {
    status: 'unavailable',
    error: lastError instanceof Error ? lastError.message : String(lastError),
  };
}

export async function loadMultipleExternalLibraries(
  urls: string[]
): Promise<Map<string, LoadResult>> {
  const results = new Map<string, LoadResult>();

  const promises = urls.map(async url => {
    const result = await loadExternalLibrary(url);
    results.set(url, result);
  });

  await Promise.all(promises);
  return results;
}
