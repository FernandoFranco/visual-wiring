import type { Library } from '../types/library';

const CACHE_PREFIX = 'visual-wiring:lib-cache:';

interface CachedLibrary {
  url: string;
  library: Library;
  timestamp: number;
}

export function saveLibraryCache(url: string, library: Library): void {
  const cacheKey = CACHE_PREFIX + url;
  const cached: CachedLibrary = {
    url,
    library,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to save library to cache:', error);
  }
}

export function getLibraryCache(url: string): Library | null {
  const cacheKey = CACHE_PREFIX + url;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }

    const parsed: CachedLibrary = JSON.parse(cached);
    return parsed.library;
  } catch (error) {
    console.warn('Failed to read library from cache:', error);
    return null;
  }
}

export function clearLibraryCache(url: string): void {
  const cacheKey = CACHE_PREFIX + url;

  try {
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to clear library cache:', error);
  }
}

export function listCaches(): string[] {
  const caches: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const url = key.substring(CACHE_PREFIX.length);
        caches.push(url);
      }
    }
  } catch (error) {
    console.warn('Failed to list library caches:', error);
  }

  return caches;
}

export function clearAllCaches(): void {
  const caches = listCaches();

  for (const url of caches) {
    clearLibraryCache(url);
  }
}

export function getCacheTimestamp(url: string): number | null {
  const cacheKey = CACHE_PREFIX + url;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }

    const parsed: CachedLibrary = JSON.parse(cached);
    return parsed.timestamp;
  } catch (error) {
    console.warn('Failed to get cache timestamp:', error);
    return null;
  }
}
