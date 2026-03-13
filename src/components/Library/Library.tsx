import './Library.css';

import { useRef, useState } from 'react';

import type { Library as LibraryType } from '../../types/library';
import type { PlacedComponent } from '../../types/project';
import { ExpansionPanel } from '../ExpansionPanel';
import { LibraryComponentItem } from './LibraryComponentItem';
import {
  type DeleteModalState,
  LibraryDeleteModals,
} from './LibraryDeleteModals';
import { LibraryHeader } from './LibraryHeader';

export interface LibraryProps {
  library: LibraryType;
  placedComponents?: PlacedComponent[];
  onRename: (id: string, name: string) => void;
  onAddComponent?: () => void;
  onEditComponent?: (componentId: string) => void;
  onRemoveComponent?: (componentId: string) => void;
  query?: string;
}

export function Library(props: LibraryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placedComponents = props.placedComponents || [];
  const query = props.query || '';

  const filtered = query
    ? props.library.components.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : props.library.components;

  const effectiveIsOpen = query && filtered.length > 0 ? true : isOpen;

  const startRename = () => {
    setDraftName(props.library.name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== props.library.name) {
      props.onRename(props.library.id, trimmed);
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setIsRenaming(false);
  };

  const handleDeleteClick = (componentId: string, componentName: string) => {
    const isUsed = placedComponents.some(
      p => p.libraryId === props.library.id && p.componentId === componentId
    );
    setDeleteModal({ componentId, componentName, isUsed });
  };

  const handleConfirmDelete = () => {
    if (deleteModal) {
      props.onRemoveComponent?.(deleteModal.componentId);
      setDeleteModal(null);
    }
  };

  const headerResult = LibraryHeader({
    libraryName: props.library.name,
    isRenaming,
    draftName,
    onDraftNameChange: setDraftName,
    onStartRename: startRename,
    onCommitRename: commitRename,
    onCancelRename: cancelRename,
    onAddComponent: props.onAddComponent,
    inputRef,
  });

  const count = query
    ? `${filtered.length}/${props.library.components.length}`
    : props.library.components.length;

  return (
    <div className="library">
      <ExpansionPanel
        label={headerResult.label}
        count={count}
        actions={headerResult.actions}
        isOpen={effectiveIsOpen}
        onToggle={() => setIsOpen(o => !o)}
      >
        {props.library.components.length === 0 ? (
          <p className="library__empty">No components yet</p>
        ) : filtered.length === 0 ? (
          <p className="library__empty">No matches</p>
        ) : (
          <ul className="library__components">
            {filtered.map(component => (
              <LibraryComponentItem
                key={component.id}
                component={component}
                libraryId={props.library.id}
                query={query}
                onEdit={props.onEditComponent}
                onDelete={handleDeleteClick}
              />
            ))}
          </ul>
        )}
      </ExpansionPanel>

      <LibraryDeleteModals
        deleteModal={deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
