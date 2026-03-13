import './Snackbar.css';

import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

import type { SnackbarMessage } from '../../hooks/SnackbarContext';

export interface SnackbarProps {
  messages: SnackbarMessage[];
  onDismiss: (id: number) => void;
}

const ICONS = {
  error: <AlertCircle size={18} />,
  success: <CheckCircle size={18} />,
  info: <Info size={18} />,
};

export function Snackbar(props: SnackbarProps) {
  if (props.messages.length === 0) return null;

  return (
    <div className="snackbar-container">
      {props.messages.map(msg => (
        <div key={msg.id} className={`snackbar snackbar--${msg.severity}`}>
          <span className="snackbar-icon">{ICONS[msg.severity]}</span>
          <span className="snackbar-message">{msg.message}</span>
          <button
            className="snackbar-close"
            onClick={() => props.onDismiss(msg.id)}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
