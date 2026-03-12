import './Library.css';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { Library as LibraryType } from '../../types/library';
import type { PlacedComponent } from '../../types/project';
import { computeComponentCanvasSize } from '../../utils/componentSize';
import {
  clearComponentDragPayload,
  setComponentDragPayload,
} from '../../utils/dragState';
import { GRID } from '../../utils/gridUtils';
import { ComponentBody } from '../ComponentEditorCanvas';
import { ConfirmationModal } from '../ConfirmationModal';
import { ExpansionPanel } from '../ExpansionPanel';
import { GridCanvas } from '../GridCanvas';
import { IconButton } from '../IconButton';
import { InputConfirmationModal } from '../InputConfirmationModal';

export interface LibraryProps {
  library: LibraryType;
  placedComponents?: PlacedComponent[];
  onRename: (id: string, name: string) => void;
  onAddComponent?: () => void;
  onEditComponent?: (componentId: string) => void;
  onRemoveComponent?: (componentId: string) => void;
  query?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="library__highlight">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Library({
  library,
  placedComponents = [],
  onRename,
  onAddComponent,
  onEditComponent,
  onRemoveComponent,
  query = '',
}: LibraryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    componentId: string;
    componentName: string;
    isUsed: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? library.components.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : library.components;

  const effectiveIsOpen = query && filtered.length > 0 ? true : isOpen;

  const startRename = () => {
    setDraftName(library.name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== library.name) {
      onRename(library.id, trimmed);
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setIsRenaming(false);
  };

  const handleDeleteClick = (componentId: string, componentName: string) => {
    const isUsed = placedComponents.some(
      p => p.libraryId === library.id && p.componentId === componentId
    );
    setDeleteModal({ componentId, componentName, isUsed });
  };

  const handleConfirmDelete = () => {
    if (deleteModal) {
      onRemoveComponent?.(deleteModal.componentId);
      setDeleteModal(null);
    }
  };

  const label = isRenaming ? (
    <input
      ref={inputRef}
      className="library__rename-input"
      value={draftName}
      onChange={e => setDraftName(e.target.value)}
      onBlur={commitRename}
      onKeyDown={e => {
        if (e.key === 'Enter') commitRename();
        if (e.key === 'Escape') cancelRename();
      }}
      autoFocus
    />
  ) : (
    <span
      className="library__name"
      onDoubleClick={startRename}
      title="Double-click to rename"
    >
      {library.name}
    </span>
  );

  const count = query
    ? `${filtered.length}/${library.components.length}`
    : library.components.length;

  const actions = !isRenaming ? (
    <>
      <IconButton
        className="library__add-btn"
        onClick={e => {
          e.stopPropagation();
          onAddComponent?.();
        }}
        title="Add component"
      >
        <Plus size={11} />
      </IconButton>
      <IconButton
        className="library__rename-btn"
        onClick={startRename}
        title="Rename library"
      >
        <Pencil size={11} />
      </IconButton>
    </>
  ) : undefined;

  return (
    <div className="library">
      <ExpansionPanel
        label={label}
        count={count}
        actions={actions}
        isOpen={effectiveIsOpen}
        onToggle={() => setIsOpen(o => !o)}
      >
        {library.components.length === 0 ? (
          <p className="library__empty">No components yet</p>
        ) : filtered.length === 0 ? (
          <p className="library__empty">No matches</p>
        ) : (
          <ul className="library__components">
            {filtered.map(component => {
              const viewBox = computeComponentCanvasSize(component, GRID);
              return (
                <li
                  key={component.id}
                  className="library__component library__component--draggable"
                  draggable
                  onDragStart={e => {
                    setComponentDragPayload({
                      componentId: component.id,
                      libraryId: library.id,
                    });
                    e.dataTransfer.setData(
                      'application/x-component',
                      JSON.stringify({
                        componentId: component.id,
                        libraryId: library.id,
                      })
                    );
                    e.dataTransfer.effectAllowed = 'copy';

                    const ghost = document.createElement('div');
                    ghost.style.cssText =
                      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
                    document.body.appendChild(ghost);
                    e.dataTransfer.setDragImage(ghost, 0, 0);
                    requestAnimationFrame(() => ghost.remove());
                  }}
                  onDragEnd={() => clearComponentDragPayload()}
                >
                  <div className="library__component__header">
                    <span className="library__component__header-name">
                      <Highlight text={component.name} query={query} />
                    </span>
                    <div className="library__component__header-actions">
                      <IconButton
                        className="library__component__header-edit-btn"
                        title="Edit component"
                        onClick={() => onEditComponent?.(component.id)}
                      >
                        <Pencil size={10} />
                      </IconButton>
                      <IconButton
                        className="library__component__header-delete-btn"
                        title="Delete component"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(component.id, component.name);
                        }}
                      >
                        <Trash2 size={10} />
                      </IconButton>
                    </div>
                  </div>

                  <div className="library__component__preview">
                    <GridCanvas grid={GRID} noBackground viewBox={viewBox}>
                      <ComponentBody component={component} />
                    </GridCanvas>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ExpansionPanel>

      {deleteModal && !deleteModal.isUsed && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Component"
          message={`Are you sure you want to delete "${deleteModal.componentName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}

      {deleteModal && deleteModal.isUsed && (
        <InputConfirmationModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Component in Use"
          message={`Component "${deleteModal.componentName}" is currently being used in the project. Deleting it will remove all placed instances and connected wires. To confirm, type the component ID below: ${deleteModal.componentId}`}
          confirmValue={deleteModal.componentId}
          inputLabel="Component ID"
          inputPlaceholder="Type component ID to confirm"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}
