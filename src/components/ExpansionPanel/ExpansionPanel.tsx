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

export function ExpansionPanel({
  label,
  count,
  actions,
  isOpen,
  onToggle,
  children,
}: PropsWithChildren<ExpansionPanelProps>) {
  return (
    <div className="expansion-panel">
      <div className="expansion-panel__header">
        <button
          className="expansion-panel__toggle"
          onClick={onToggle}
          type="button"
          aria-expanded={isOpen}
        >
          <ChevronRight
            size={14}
            className={`expansion-panel__chevron${isOpen ? ' expansion-panel__chevron--open' : ''}`}
          />
        </button>

        <div className="expansion-panel__label">{label}</div>

        {count !== undefined && (
          <span className="expansion-panel__count">{count}</span>
        )}

        {actions !== undefined && (
          <div className="expansion-panel__actions">{actions}</div>
        )}
      </div>

      <div
        className={`expansion-panel__body${isOpen ? ' expansion-panel__body--open' : ''}`}
      >
        <div className="expansion-panel__body-inner">{children}</div>
      </div>
    </div>
  );
}
