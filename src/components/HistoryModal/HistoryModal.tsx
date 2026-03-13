import './HistoryModal.css';

import { useState } from 'react';

import type { HistoryEntry } from '../../hooks/useProjectHistory';
import { ConfirmationModal } from '../ConfirmationModal';
import { Modal } from '../Modal';

export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  past: HistoryEntry[];
  onRestoreToPoint: (index: number) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString();
  }
}

export function HistoryModal(props: HistoryModalProps) {
  const [confirmRestore, setConfirmRestore] = useState<{
    index: number;
    action: string;
    undoCount: number;
  } | null>(null);

  const hasHistory = props.past.length > 0;

  const handleEntryClick = (originalIndex: number, action: string) => {
    const undoCount = props.past.length - originalIndex;
    setConfirmRestore({ index: originalIndex, action, undoCount });
  };

  const handleConfirmRestore = () => {
    if (confirmRestore !== null) {
      props.onRestoreToPoint(confirmRestore.index);
      setConfirmRestore(null);
      props.onClose();
    }
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="History">
      {!hasHistory ? (
        <div className="history-modal__empty">
          No history available. Start making changes to see them here.
        </div>
      ) : (
        <>
          <ul className="history-modal__timeline">
            {[...props.past].reverse().map((entry, displayIndex) => {
              const originalIndex = props.past.length - 1 - displayIndex;
              const undoCount = props.past.length - originalIndex;

              return (
                <li
                  key={`${entry.timestamp}-${originalIndex}`}
                  className="history-modal__entry"
                  onClick={() => handleEntryClick(originalIndex, entry.action)}
                  title={`Click to undo ${undoCount} action${undoCount !== 1 ? 's' : ''}`}
                >
                  <div className="history-modal__marker" />
                  <div className="history-modal__content">
                    <p className="history-modal__action">{entry.action}</p>
                    <p className="history-modal__timestamp">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="history-modal__footer">
            <div className="history-modal__shortcuts">
              <div className="history-modal__shortcut">
                <span className="history-modal__key">Ctrl</span>
                <span>+</span>
                <span className="history-modal__key">Z</span>
                <span>to undo</span>
              </div>
            </div>
            <div>
              {props.past.length} action{props.past.length !== 1 ? 's' : ''} in
              history
            </div>
          </div>
        </>
      )}
      <ConfirmationModal
        isOpen={confirmRestore !== null}
        onClose={() => setConfirmRestore(null)}
        onConfirm={handleConfirmRestore}
        title="Undo changes?"
        message={
          confirmRestore
            ? `This will undo ${confirmRestore.undoCount} action${confirmRestore.undoCount !== 1 ? 's' : ''}, including "${confirmRestore.action}". You won't be able to redo them.`
            : ''
        }
        confirmLabel="Undo"
      />
    </Modal>
  );
}
