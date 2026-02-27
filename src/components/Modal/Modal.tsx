import './Modal.css';

import { X } from 'lucide-react';
import { type PropsWithChildren, type ReactNode, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal(props: PropsWithChildren<ModalProps>) {
  const {
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    showCloseButton = true,
    className,
    children,
  } = props;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content${className ? ` ${className}` : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {(title || icon || showCloseButton) && (
          <div className="modal-header">
            {icon || title ? (
              <div className="modal-header-content">
                {icon && <div className="modal-icon">{icon}</div>}
                {title && (
                  <div>
                    <h2 className="modal-title">{title}</h2>
                    {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                  </div>
                )}
              </div>
            ) : null}
            {showCloseButton && (
              <button onClick={onClose} className="modal-close-btn">
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
