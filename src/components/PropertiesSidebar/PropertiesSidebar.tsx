import './PropertiesSidebar.css';

import { X } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

import { IconButton } from '../IconButton';

export interface PropertiesSidebarProps {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}

export function PropertiesSidebar({
  title,
  onClose,
  footer,
  children,
}: PropsWithChildren<PropertiesSidebarProps>) {
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
        <span className="properties-sidebar__title" title={title}>
          {title}
        </span>
        <IconButton title="Close" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="properties-sidebar__body">{children}</div>

      {footer && <div className="properties-sidebar__footer">{footer}</div>}
    </aside>
  );
}
