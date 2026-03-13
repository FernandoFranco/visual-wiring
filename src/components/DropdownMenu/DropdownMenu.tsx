import './DropdownMenu.css';

import { type ReactNode, useEffect, useRef, useState } from 'react';

export interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
}

export function DropdownMenu(props: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const align = props.align || 'right';

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="dropdown-menu" ref={containerRef}>
      <div onClick={() => setIsOpen(o => !o)}>{props.trigger}</div>

      {isOpen && (
        <div className={`dropdown-menu__list dropdown-menu__list--${align}`}>
          {props.items.map((item, i) => (
            <button
              key={i}
              type="button"
              className="dropdown-menu__item"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && (
                <span className="dropdown-menu__item-icon">{item.icon}</span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
