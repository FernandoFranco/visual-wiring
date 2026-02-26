import './AppBar.css';

import { Save } from 'lucide-react';

import { AppLogo } from '../AppLogo';

export interface AppBarProps {
  projectName: string;
  onGoHome: () => void;
  onSave: () => void;
}

export function AppBar({ projectName, onGoHome, onSave }: AppBarProps) {
  return (
    <header className="app-bar">
      <div className="app-bar__left">
        <AppLogo size="sm" onClick={onGoHome} />
        <div className="app-bar__divider" />
        <span className="app-bar__project-name" title={projectName}>
          {projectName}
        </span>
      </div>

      <div className="app-bar__right">
        <button
          className="app-bar__action-btn"
          onClick={onSave}
          title="Save project"
          type="button"
        >
          <Save size={17} />
        </button>
      </div>
    </header>
  );
}
