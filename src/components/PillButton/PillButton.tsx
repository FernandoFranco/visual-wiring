import './PillButton.css';

import {
  type ButtonHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export function PillButton(props: PropsWithChildren<PillButtonProps>) {
  const { icon, children, className = '', ...rest } = props;

  return (
    <button type="button" className={`pill-btn ${className}`} {...rest}>
      {icon && <span className="pill-btn__icon">{icon}</span>}
      {children && <span className="pill-btn__label">{children}</span>}
    </button>
  );
}
