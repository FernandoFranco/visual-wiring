import './ExpansionPanel.css';

import { ChevronRight } from 'lucide-react';
import { type PropsWithChildren, type ReactNode } from 'react';

export interface ExpansionPanelProps {
  label: ReactNode;
  count?: string | number;
  actions?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function ExpansionPanel(props: PropsWithChildren<ExpansionPanelProps>) {
  return (
    <div className="expansion-panel">
      <div className="expansion-panel__header">
        <button
          className="expansion-panel__toggle"
          onClick={props.onToggle}
          type="button"
          aria-expanded={props.isOpen}
        >
          <ChevronRight
            size={14}
            className={`expansion-panel__chevron${props.isOpen ? ' expansion-panel__chevron--open' : ''}`}
          />
        </button>

        <div className="expansion-panel__label">{props.label}</div>

        {props.actions !== undefined && (
          <div className="expansion-panel__actions">{props.actions}</div>
        )}

        {props.count !== undefined && (
          <span className="expansion-panel__count">{props.count}</span>
        )}
      </div>

      <div
        className={`expansion-panel__body${props.isOpen ? ' expansion-panel__body--open' : ''}`}
      >
        <div className="expansion-panel__body-inner">{props.children}</div>
      </div>
    </div>
  );
}
