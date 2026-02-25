import './Input.css';

import { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input(props: InputProps) {
  const { label, error, className = '', ...rest } = props;

  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <input className={`input-field ${className}`} {...rest} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
