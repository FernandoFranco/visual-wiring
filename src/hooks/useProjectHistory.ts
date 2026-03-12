import { useCallback, useRef, useState } from 'react';

import type { Project } from '../types/project';

export interface HistoryEntry {
  project: Project;
  action: string;
  timestamp: number;
}

const MAX_HISTORY_SIZE = 50;

export function useProjectHistory() {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  const isUndoingRef = useRef(false);

  const addToHistory = useCallback((project: Project, action: string) => {
    if (isUndoingRef.current) {
      return;
    }

    const entry: HistoryEntry = {
      project: JSON.parse(JSON.stringify(project)),
      action,
      timestamp: Date.now(),
    };

    setPast(prev => {
      const newPast = [...prev, entry];
      if (newPast.length > MAX_HISTORY_SIZE) {
        return newPast.slice(newPast.length - MAX_HISTORY_SIZE);
      }
      return newPast;
    });

    setFuture([]);
  }, []);

  const undo = useCallback((): Project | null => {
    if (past.length === 0) return null;

    const lastEntry = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);
    setFuture(prev => [...prev, lastEntry]);

    isUndoingRef.current = true;
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 0);

    return lastEntry.project;
  }, [past]);

  const redo = useCallback((): Project | null => {
    if (future.length === 0) return null;

    const nextEntry = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    setFuture(newFuture);
    setPast(prev => [...prev, nextEntry]);

    isUndoingRef.current = true;
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 0);

    return nextEntry.project;
  }, [future]);

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  const restoreToPoint = useCallback(
    (index: number): Project | null => {
      if (index < 0 || index >= past.length) return null;

      const projectToRestore = past[index].project;
      setPast(past.slice(0, index));
      setFuture([]);

      isUndoingRef.current = true;
      setTimeout(() => {
        isUndoingRef.current = false;
      }, 0);

      return projectToRestore;
    },
    [past]
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    past,
    future,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    clear,
    restoreToPoint,
  };
}
