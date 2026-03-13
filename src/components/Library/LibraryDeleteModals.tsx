import { ConfirmationModal } from '../ConfirmationModal';
import { InputConfirmationModal } from '../InputConfirmationModal';

export interface DeleteModalState {
  componentId: string;
  componentName: string;
  isUsed: boolean;
}

export interface LibraryDeleteModalsProps {
  deleteModal: DeleteModalState | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function LibraryDeleteModals(props: LibraryDeleteModalsProps) {
  if (!props.deleteModal) return null;

  if (!props.deleteModal.isUsed) {
    return (
      <ConfirmationModal
        isOpen={true}
        onClose={props.onClose}
        onConfirm={props.onConfirm}
        title="Delete Component"
        message={`Are you sure you want to delete "${props.deleteModal.componentName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    );
  }

  return (
    <InputConfirmationModal
      isOpen={true}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      title="Delete Component in Use"
      message={`Component "${props.deleteModal.componentName}" is currently being used in the project. Deleting it will remove all placed instances and connected wires. To confirm, type the component ID below: ${props.deleteModal.componentId}`}
      confirmValue={props.deleteModal.componentId}
      inputLabel="Component ID"
      inputPlaceholder="Type component ID to confirm"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
    />
  );
}
