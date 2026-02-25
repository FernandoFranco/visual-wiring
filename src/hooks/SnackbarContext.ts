import { createContext } from 'react';

export type SnackbarSeverity = 'error' | 'success' | 'info';

export interface SnackbarMessage {
  id: number;
  message: string;
  severity: SnackbarSeverity;
}

export interface SnackbarContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined
);
