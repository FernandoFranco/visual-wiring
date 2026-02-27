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

export function JsonViewerModal({
  isOpen,
  onClose,
  title,
  data,
  defaultExpandDepth = 1,
}: JsonViewerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="json-viewer-modal"
    >
      <JsonViewer data={data} defaultExpandDepth={defaultExpandDepth} />
    </Modal>
  );
}
