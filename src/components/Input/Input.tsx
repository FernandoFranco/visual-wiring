import './Input.css';

import { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shows a red asterisk after the label */
  required?: boolean;
  error?: string;
  /** 'md' = large form style (default); 'sm' = compact inline style */
  size?: 'sm' | 'md';
  /** Places the label to the left of the field instead of above it */
  inline?: boolean;
}

export function Input(props: InputProps) {
  const {
    label,
    required,
    error,
    size = 'md',
    inline = false,
    className = '',
    id,
    ...rest
  } = props;

  return (
    <div
      className={`input-wrapper input-wrapper--${size}${
        inline ? ' input-wrapper--inline' : ''
      }`}
    >
      {label && (
        <label className={`input-label input-label--${size}`} htmlFor={id}>
          {label}
          {required && <span className="input-label__required"> *</span>}
        </label>
      )}
      <input
        id={id}
        className={`input-field input-field--${size} ${className}`}
        {...rest}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
