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
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue === props.confirmValue) {
      props.onConfirm();
      setInputValue('');
      props.onClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    props.onClose();
  };

  const isConfirmDisabled = inputValue !== props.confirmValue;

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={handleClose}
      title={props.title}
      icon={icons[props.variant ?? 'default']}
      showCloseButton={false}
    >
      <div className="input-confirmation-modal">
        <p className="input-confirmation-modal__message">{props.message}</p>
        <Input
          label={props.inputLabel ?? 'Type to confirm'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={props.inputPlaceholder ?? 'Type here'}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter' && !isConfirmDisabled) {
              handleConfirm();
            }
          }}
        />
        <div className="input-confirmation-modal__actions">
          <Button variant="cancel" onClick={handleClose}>
            {props.cancelLabel ?? 'Cancel'}
          </Button>
          <Button
            variant={
              (props.variant ?? 'default') === 'danger' ? 'danger' : 'primary'
            }
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {props.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
