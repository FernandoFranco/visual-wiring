import './LibraryManager.css';

import { BookCopy, Cloud, FolderInput } from 'lucide-react';
import { useState } from 'react';

import { useProject } from '../../hooks/useProject';
import { Button } from '../Button';
import { ConfirmationModal } from '../ConfirmationModal';
import { Input } from '../Input';
import type { LibraryTypeInfo } from '../LibraryList';
import { LibraryList } from '../LibraryList';
import { Modal } from '../Modal';

export interface LibraryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LibraryManager(props: LibraryManagerProps) {
  const {
    project,
    exportLibrary,
    removeLibrary,
    convertExternalToInternal,
    renameLibrary,
    externalLibrariesStatus,
  } = useProject();

  const [isRenameLibraryModalOpen, setIsRenameLibraryModalOpen] =
    useState(false);
  const [libraryToRename, setLibraryToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  if (!project) return null;

  const libraries = project.libraries || [];

  const getLibraryTypeInfo = (libraryId: string): LibraryTypeInfo | null => {
    const library = libraries.find(lib => lib.id === libraryId);
    if (!library) return null;

    const sourceType = library.sourceType || 'internal';

    switch (sourceType) {
      case 'external': {
        const statusEntry = externalLibrariesStatus.find(
          s => s.url === library.sourceUrl
        );
        return {
          type: 'external',
          label: 'External',
          icon: <Cloud size={14} />,
          className: 'library-list-item__badge--external',
          statusInfo: statusEntry
            ? {
                status: statusEntry.status,
                url: statusEntry.url,
                lastFetched: library.lastFetched,
              }
            : undefined,
        };
      }
      case 'imported':
        return {
          type: 'imported',
          label: 'Imported',
          icon: <FolderInput size={14} />,
          className: 'library-list-item__badge--imported',
        };
      case 'internal':
      default:
        return {
          type: 'internal',
          label: 'Internal',
          icon: <BookCopy size={14} />,
          className: 'library-list-item__badge--internal',
        };
    }
  };

  const handleExport = (libraryId: string) => {
    exportLibrary(libraryId);
  };

  const handleRemove = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId);
    if (!library) return;

    setConfirmModal({
      isOpen: true,
      title: 'Remove Library',
      message: `Are you sure you want to remove the library "${library.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: () => {
        removeLibrary(libraryId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleConvertToInternal = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId);
    if (!library) return;

    setConfirmModal({
      isOpen: true,
      title: 'Convert to Internal Library',
      message: `Convert "${library.name}" to an internal library? This will create an editable copy with new component IDs. The external reference will be removed.`,
      variant: 'warning',
      onConfirm: () => {
        convertExternalToInternal(libraryId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRenameLibraryClick = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId);
    if (!library) return;

    setLibraryToRename({ id: library.id, name: library.name });
    setIsRenameLibraryModalOpen(true);
  };

  const handleRenameLibrary = () => {
    if (libraryToRename && libraryToRename.name.trim()) {
      renameLibrary(libraryToRename.id, libraryToRename.name.trim());
      setIsRenameLibraryModalOpen(false);
      setLibraryToRename(null);
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Library Manager"
    >
      <div className="library-manager">
        <div className="library-manager__header">
          <p className="library-manager__description">
            Manage all libraries in your project. Export, remove, or convert
            external libraries to internal.
          </p>
        </div>

        <LibraryList
          libraries={libraries}
          onExport={handleExport}
          onRemove={handleRemove}
          onConvertToInternal={handleConvertToInternal}
          onRename={handleRenameLibraryClick}
          getLibraryTypeInfo={getLibraryTypeInfo}
          emptyMessage="No libraries in this project yet."
        />

        <div className="library-manager__footer">
          <Button onClick={props.onClose}>Close</Button>
        </div>
      </div>

      <Modal
        isOpen={isRenameLibraryModalOpen}
        onClose={() => {
          setIsRenameLibraryModalOpen(false);
          setLibraryToRename(null);
        }}
        title="Rename Library"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Enter a new name for the library:
          </p>
          <Input
            value={libraryToRename?.name || ''}
            onChange={e =>
              setLibraryToRename(
                prev => prev && { ...prev, name: e.target.value }
              )
            }
            placeholder="Library Name"
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameLibrary();
            }}
            autoFocus
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setIsRenameLibraryModalOpen(false);
                setLibraryToRename(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameLibrary}
              disabled={!libraryToRename?.name.trim()}
            >
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />
    </Modal>
  );
}
