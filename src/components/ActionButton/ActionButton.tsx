import './ActionButton.css';

import { ArrowRight } from 'lucide-react';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ActionButtonVariant = 'primary' | 'secondary';

export interface ActionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  title: string;
  subtitle: string;
  icon: ReactNode;
  variant?: ActionButtonVariant;
}

export function ActionButton(props: ActionButtonProps) {
  const {
    title,
    subtitle,
    icon,
    variant = 'primary',
    className = '',
    ...rest
  } = props;

  return (
    <button
      className={`action-button action-button-${variant} ${className}`}
      {...rest}
    >
      <div className="action-button-content">
        <div className={`action-button-icon-wrapper icon-${variant}`}>
          {icon}
        </div>
        <div className="action-button-text-wrapper">
          <p className="action-button-title">{title}</p>
          <p className="action-button-subtitle">{subtitle}</p>
        </div>
      </div>
      <ArrowRight size={20} className="action-button-arrow" />
    </button>
  );
}
