import './AppBar.css';

import { ArrowLeft } from 'lucide-react';
import { type PropsWithChildren } from 'react';

import { AppLogo } from '../AppLogo';
import { IconButton } from '../IconButton';

export interface AppBarProps {
  projectName: string;
  onGoHome: () => void;
  backMode?: boolean;
}

export function AppBar({
  projectName,
  onGoHome,
  backMode = false,
  children,
}: PropsWithChildren<AppBarProps>) {
  return (
    <header className="app-bar">
      <div className="app-bar__left">
        {backMode ? (
          <IconButton
            className="app-bar__back-btn"
            onClick={onGoHome}
            title="Back to project"
          >
            <ArrowLeft size={18} />
          </IconButton>
        ) : (
          <AppLogo size="sm" onClick={onGoHome} />
        )}
        <div className="app-bar__divider" />
        <span className="app-bar__project-name" title={projectName}>
          {projectName}
        </span>
      </div>

      {children && <div className="app-bar__right">{children}</div>}
    </header>
  );
}
