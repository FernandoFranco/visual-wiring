import './ContextMenu.css';

import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface ContextMenuSubItem {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  subItems?: ContextMenuSubItem[];
  danger?: boolean;
  shortcut?: string;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const MENU_WIDTH = 168;
const ITEM_HEIGHT = 33;
const MENU_PADDING = 8;

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);

  const estimatedH = items.length * ITEM_HEIGHT + MENU_PADDING;
  const ax =
    x + MENU_WIDTH > window.innerWidth ? Math.max(0, x - MENU_WIDTH) : x;
  const ay =
    y + estimatedH > window.innerHeight ? Math.max(0, y - estimatedH) : y;

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div ref={menuRef} className="context-menu" style={{ left: ax, top: ay }}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`context-menu__item${item.danger ? ' context-menu__item--danger' : ''}${item.subItems ? ' context-menu__item--has-sub' : ''}`}
          onMouseEnter={() => setOpenSubIndex(item.subItems ? i : null)}
          onMouseLeave={() =>
            setOpenSubIndex(prev => (prev === i ? null : prev))
          }
          onClick={() => {
            if (!item.subItems) {
              item.onClick?.();
              onClose();
            }
          }}
        >
          {item.icon && <span className="context-menu__icon">{item.icon}</span>}
          <span className="context-menu__label">{item.label}</span>
          {item.shortcut && (
            <span className="context-menu__shortcut">{item.shortcut}</span>
          )}
          {item.subItems && (
            <ChevronRight size={12} className="context-menu__chevron" />
          )}

          {item.subItems && openSubIndex === i && (
            <div className="context-menu__submenu">
              {item.subItems.map((sub, j) => (
                <div
                  key={j}
                  className={`context-menu__item${sub.active ? ' context-menu__item--active' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    sub.onClick();
                    onClose();
                  }}
                >
                  <span className="context-menu__item-check">
                    {sub.active ? '✓' : ''}
                  </span>
                  <span className="context-menu__label">{sub.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
