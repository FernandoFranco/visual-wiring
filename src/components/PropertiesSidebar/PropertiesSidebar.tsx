import './PropertiesSidebar.css';

import { X } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

import { IconButton } from '../IconButton';

export interface PropertiesSidebarProps {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}

export function PropertiesSidebar(
  props: PropsWithChildren<PropertiesSidebarProps>
) {
  return (
    <aside
      className="properties-sidebar"
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onMouseMove={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      onContextMenu={e => e.stopPropagation()}
    >
      <div className="properties-sidebar__header">
        <span className="properties-sidebar__title" title={props.title}>
          {props.title}
        </span>
        <IconButton
          tooltip="Close"
          tooltipPosition="left"
          onClick={props.onClose}
        >
          <X size={14} />
        </IconButton>
      </div>

      <div className="properties-sidebar__body">{props.children}</div>

      {props.footer && (
        <div className="properties-sidebar__footer">{props.footer}</div>
      )}
    </aside>
  );
}
