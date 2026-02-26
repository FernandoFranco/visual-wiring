import './ConfirmationModal.css';

import { AlertTriangle, HelpCircle } from 'lucide-react';

import { Button } from '../Button';
import { Modal } from '../Modal';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

const icons = {
  danger: <AlertTriangle size={20} />,
  warning: <AlertTriangle size={20} />,
  default: <HelpCircle size={20} />,
};

export function ConfirmationModal(props: ConfirmationModalProps) {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
  } = props;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icons[variant]}
      showCloseButton={false}
    >
      <div className="confirmation-modal">
        <p className="confirmation-modal__message">{message}</p>
        <div className="confirmation-modal__actions">
          <Button variant="cancel" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
