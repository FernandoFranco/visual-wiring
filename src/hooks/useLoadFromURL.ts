import { useCallback, useState } from 'react';

import { useSnackbar } from './useSnackbar';

export interface LoadFromURLResult {
  data: unknown;
  filename: string;
}

export interface UseLoadFromURLOptions {
  showSuccessMessage?: boolean;
  successMessage?: string;
  validator?: (data: unknown) => void;
  onSuccess?: (result: LoadFromURLResult) => void;
  onError?: (error: Error) => void;
}

export function useLoadFromURL(options: UseLoadFromURLOptions = {}) {
  const { showError, showSuccess } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const loadFromURL = useCallback(
    async (url: string): Promise<LoadFromURLResult> => {
      if (!url.startsWith('http')) {
        const error = new Error(
          'Please enter a valid URL starting with http:// or https://'
        );
        showError(error.message);
        if (options.onError) options.onError(error);
        throw error;
      }

      setIsLoading(true);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const filename = url.split('/').pop() || 'imported.json';

        // Valida o dado se um validador for fornecido
        if (options.validator) {
          options.validator(data);
        }

        const result: LoadFromURLResult = { data, filename };

        if (options.showSuccessMessage) {
          showSuccess(
            options.successMessage || 'Data loaded successfully from URL'
          );
        }

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        let errorMessage: string;

        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage =
            'Could not reach the URL. This may be caused by a CORS restriction on the server.';
        } else {
          errorMessage =
            err instanceof Error ? err.message : 'Failed to fetch from URL';
        }

        showError(errorMessage);

        const error = err instanceof Error ? err : new Error(errorMessage);
        if (options.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [showError, showSuccess, options]
  );

  return {
    loadFromURL,
    isLoading,
  };
}
