import './JsonViewerModal.css';

import { JsonViewer } from '../JsonViewer';
import { Modal } from '../Modal';

export interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: unknown;
  defaultExpandDepth?: number;
}

export function JsonViewerModal(props: JsonViewerModalProps) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title={props.title}>
      <JsonViewer
        data={props.data}
        defaultExpandDepth={props.defaultExpandDepth || 1}
      />
    </Modal>
  );
}
