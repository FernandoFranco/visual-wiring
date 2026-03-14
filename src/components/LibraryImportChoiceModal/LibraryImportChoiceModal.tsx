import './LibraryImportChoiceModal.css';

import { BookCopy, Cloud } from 'lucide-react';

import type { Library } from '../../types/library';
import { Button } from '../Button';
import { Modal } from '../Modal';

export interface LibraryImportChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  library: Library | null;
  url?: string;
  onChoiceInternal: () => void;
  onChoiceExternal: () => void;
}

export function LibraryImportChoiceModal(props: LibraryImportChoiceModalProps) {
  if (!props.library) return null;

  const hasUrl = !!props.url;

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Import Library"
      subtitle="Choose how to add this library"
    >
      <div className="library-import-choice-content">
        <div className="library-import-choice-info">
          <p className="library-import-choice-library-name">
            {props.library.name}
          </p>
          <p className="library-import-choice-library-details">
            {props.library.components.length} component
            {props.library.components.length !== 1 ? 's' : ''}
          </p>
          {hasUrl && (
            <p className="library-import-choice-library-url">{props.url}</p>
          )}
        </div>

        <div className="library-import-choice-options">
          <button
            className="library-import-choice-option"
            onClick={() => {
              props.onChoiceInternal();
              props.onClose();
            }}
          >
            <div className="library-import-choice-option-icon">
              <BookCopy size={24} />
            </div>
            <div className="library-import-choice-option-content">
              <h3 className="library-import-choice-option-title">
                Internal Library
              </h3>
              <p className="library-import-choice-option-description">
                Copy the library into this project. You can edit components and
                the library will be saved in the project file.
              </p>
            </div>
          </button>

          {hasUrl && (
            <button
              className="library-import-choice-option"
              onClick={() => {
                props.onChoiceExternal();
                props.onClose();
              }}
            >
              <div className="library-import-choice-option-icon library-import-choice-option-icon--external">
                <Cloud size={24} />
              </div>
              <div className="library-import-choice-option-content">
                <h3 className="library-import-choice-option-title">
                  External Library
                </h3>
                <p className="library-import-choice-option-description">
                  Keep as reference by URL. Read-only, automatically reloaded
                  when opening the project. Falls back to cache if offline.
                </p>
              </div>
            </button>
          )}
        </div>

        <div className="library-import-choice-footer">
          <Button variant="secondary" onClick={props.onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
