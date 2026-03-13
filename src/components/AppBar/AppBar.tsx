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

export function AppBar(props: PropsWithChildren<AppBarProps>) {
  const backMode = props.backMode || false;

  return (
    <header className="app-bar">
      <div className="app-bar__left">
        {backMode ? (
          <IconButton
            className="app-bar__back-btn"
            onClick={props.onGoHome}
            tooltip="Back to project"
            tooltipPosition="bottom"
          >
            <ArrowLeft size={18} />
          </IconButton>
        ) : (
          <AppLogo size="sm" onClick={props.onGoHome} />
        )}
        <div className="app-bar__divider" />
        <span className="app-bar__project-name" title={props.projectName}>
          {props.projectName}
        </span>
      </div>

      {props.children && <div className="app-bar__right">{props.children}</div>}
    </header>
  );
}
