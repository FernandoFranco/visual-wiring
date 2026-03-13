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
  const handleConfirm = () => {
    props.onConfirm();
    props.onClose();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={props.title}
      icon={icons[props.variant ?? 'default']}
      showCloseButton={false}
    >
      <div className="confirmation-modal">
        <p className="confirmation-modal__message">{props.message}</p>
        <div className="confirmation-modal__actions">
          <Button variant="cancel" onClick={props.onClose}>
            {props.cancelLabel ?? 'Cancel'}
          </Button>
          <Button
            variant={
              (props.variant ?? 'default') === 'danger' ? 'danger' : 'primary'
            }
            onClick={handleConfirm}
          >
            {props.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
