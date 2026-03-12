import './InputConfirmationModal.css';

import { AlertTriangle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

export interface InputConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmValue: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

const icons = {
  danger: <AlertTriangle size={20} />,
  warning: <AlertTriangle size={20} />,
  default: <HelpCircle size={20} />,
};

export function InputConfirmationModal(props: InputConfirmationModalProps) {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmValue,
    inputLabel = 'Type to confirm',
    inputPlaceholder = 'Type here',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
  } = props;

  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue === confirmValue) {
      onConfirm();
      setInputValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const isConfirmDisabled = inputValue !== confirmValue;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      icon={icons[variant]}
      showCloseButton={false}
    >
      <div className="input-confirmation-modal">
        <p className="input-confirmation-modal__message">{message}</p>
        <Input
          label={inputLabel}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={inputPlaceholder}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter' && !isConfirmDisabled) {
              handleConfirm();
            }
          }}
        />
        <div className="input-confirmation-modal__actions">
          <Button variant="cancel" onClick={handleClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
