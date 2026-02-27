import './IconButton.css';

import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  title: string;
}

export function IconButton(props: PropsWithChildren<IconButtonProps>) {
  const { className = '', children, ...rest } = props;

  return (
    <button type="button" className={`icon-btn ${className}`} {...rest}>
      {children}
    </button>
  );
}
