import './IconButton.css';

import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';

import { Tooltip } from '../Tooltip';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  title?: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function IconButton(props: PropsWithChildren<IconButtonProps>) {
  const { className = '', children, tooltip, tooltipPosition, ...rest } = props;

  const button = (
    <button type="button" className={`icon-btn ${className}`} {...rest}>
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
