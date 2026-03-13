import { useCallback, useState } from 'react';

import type { Library } from '../types/library';
import { validateLibrary } from '../utils/typeValidators';
import type { LoadFromURLResult } from './useLoadFromURL';
import { useLoadFromURL } from './useLoadFromURL';

export interface LibraryImportResult {
  library: Library;
  filename: string;
}

export interface UseLibraryImportOptions {
  showSuccessMessage?: boolean;
  onSuccess?: (result: LibraryImportResult) => void;
  onError?: (error: Error) => void;
}

export function useLibraryImport(options: UseLibraryImportOptions = {}) {
  const [importedLibrary, setImportedLibrary] = useState<Library | null>(null);
  const [importFilename, setImportFilename] = useState<string>('');

  const { loadFromURL, isLoading: isLoadingFromURL } = useLoadFromURL({
    showSuccessMessage: options.showSuccessMessage,
    successMessage: 'Library loaded successfully from URL',
    validator: validateLibrary,
    onSuccess: (result: LoadFromURLResult) => {
      const library = result.data as Library;
      setImportedLibrary(library);
      setImportFilename(result.filename);

      if (options.onSuccess) {
        options.onSuccess({ library, filename: result.filename });
      }
    },
    onError: options.onError,
  });

  const importFromURL = useCallback(
    async (url: string): Promise<LibraryImportResult> => {
      const result = await loadFromURL(url);
      return {
        library: result.data as Library,
        filename: result.filename,
      };
    },
    [loadFromURL]
  );

  const importFromFile = useCallback(
    (file: File): Promise<LibraryImportResult> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => {
          try {
            const content = event.target?.result as string;
            const data = JSON.parse(content) as Library;

            validateLibrary(data);

            const result: LibraryImportResult = {
              library: data,
              filename: file.name,
            };

            setImportedLibrary(data);
            setImportFilename(file.name);

            if (options.onSuccess) {
              options.onSuccess(result);
            }

            resolve(result);
          } catch (error) {
            const err =
              error instanceof Error
                ? error
                : new Error('Failed to import library');

            if (options.onError) {
              options.onError(err);
            }

            reject(err);
          }
        };

        reader.onerror = () => {
          const error = new Error('Failed to read file');
          if (options.onError) {
            options.onError(error);
          }
          reject(error);
        };

        reader.readAsText(file);
      });
    },
    [options]
  );

  const clearImportedLibrary = useCallback(() => {
    setImportedLibrary(null);
    setImportFilename('');
  }, []);

  return {
    importFromURL,
    importFromFile,
    importedLibrary,
    importFilename,
    isLoadingFromURL,
    clearImportedLibrary,
  };
}
