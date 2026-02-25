import { useContext } from 'react';

import { ProjectContext } from './ProjectContext';

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject deve ser usado dentro de um ProjectProvider');
  }
  return context;
}
