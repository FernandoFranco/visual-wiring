import './Input.css';

import { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  variant?: 'sm' | 'md';
  inline?: boolean;
}

export function Input(props: InputProps) {
  const {
    label,
    required,
    error,
    variant = 'md',
    inline = false,
    className = '',
    id,
    ...rest
  } = props;

  return (
    <div
      className={`input-wrapper input-wrapper--${variant}${
        inline ? ' input-wrapper--inline' : ''
      }`}
    >
      {label && (
        <label className={`input-label input-label--${variant}`} htmlFor={id}>
          {label}
          {required && <span className="input-label__required"> *</span>}
        </label>
      )}
      <input
        id={id}
        className={`input-field input-field--${variant} ${className}`}
        {...rest}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
