import './ProjectPage.css';

import { Braces, Download, FileImage, History, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBar } from '../components/AppBar';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { HistoryModal } from '../components/HistoryModal';
import { IconButton } from '../components/IconButton';
import { ImportLibraryModal } from '../components/ImportLibraryModal';
import { Input } from '../components/Input';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { LibraryImportChoiceModal } from '../components/LibraryImportChoiceModal';
import { LibraryManager } from '../components/LibraryManager';
import { Modal } from '../components/Modal';
import { ProjectCanvas } from '../components/ProjectCanvas';
import { ProjectSidebar } from '../components/ProjectSidebar';
import { useProject } from '../hooks/useProject';
import { ROUTES } from '../routes';
import type { Library } from '../types/library';
import {
  exportProjectAsImage,
  exportProjectAsSVG,
} from '../utils/projectExport';

export function ProjectPage() {
  const navigate = useNavigate();
  const {
    project,
    saveProject,
    closeProject,
    undo,
    canUndo,
    past,
    restoreToPoint,
    createLibrary,
    importLibrary,
  } = useProject();
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLibraryManagerOpen, setIsLibraryManagerOpen] = useState(false);
  const [isCreateLibraryModalOpen, setIsCreateLibraryModalOpen] =
    useState(false);
  const [isImportLibraryModalOpen, setIsImportLibraryModalOpen] =
    useState(false);
  const [isLibraryChoiceModalOpen, setIsLibraryChoiceModalOpen] =
    useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [importedLibrary, setImportedLibrary] = useState<Library | null>(null);
  const [importedLibraryUrl, setImportedLibraryUrl] = useState<
    string | undefined
  >();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, canUndo]);

  if (!project) {
    return null;
  }

  const handleConfirmClose = () => {
    closeProject();
    navigate(ROUTES.HOME, { replace: true });
  };

  const handleCreateLibrary = () => {
    if (newLibraryName.trim()) {
      createLibrary(newLibraryName.trim());
      setNewLibraryName('');
      setIsCreateLibraryModalOpen(false);
    }
  };

  const handleImportLibrary = (
    library: Library,
    _filename: string,
    url?: string
  ) => {
    setImportedLibrary(library);
    setImportedLibraryUrl(url);
    setIsImportLibraryModalOpen(false);
    setIsLibraryChoiceModalOpen(true);
  };

  const handleChoiceInternal = () => {
    if (importedLibrary) {
      importLibrary(importedLibrary, false, importedLibraryUrl);
    }
    setIsLibraryChoiceModalOpen(false);
    setImportedLibrary(null);
    setImportedLibraryUrl(undefined);
  };

  const handleChoiceExternal = () => {
    if (importedLibrary && importedLibraryUrl) {
      importLibrary(importedLibrary, true, importedLibraryUrl);
    }
    setIsLibraryChoiceModalOpen(false);
    setImportedLibrary(null);
    setImportedLibraryUrl(undefined);
  };

  return (
    <div className="project-page">
      <AppBar
        projectName={project.name}
        onGoHome={() => setIsCloseConfirmOpen(true)}
      >
        <DropdownMenu
          trigger={
            <IconButton
              className="app-bar__action-btn"
              tooltip="Download"
              tooltipPosition="bottom"
            >
              <Download size={17} />
            </IconButton>
          }
          items={[
            {
              label: 'Download JSON',
              icon: <Braces size={14} />,
              onClick: saveProject,
            },
            {
              label: 'Download as PNG',
              icon: <FileImage size={14} />,
              onClick: () => exportProjectAsImage(project),
            },
            {
              label: 'Download as SVG',
              icon: <FileImage size={14} />,
              onClick: () => exportProjectAsSVG(project),
            },
          ]}
        />
        <DropdownMenu
          trigger={
            <IconButton
              className="app-bar__action-btn"
              tooltip="Settings"
              tooltipPosition="bottom"
            >
              <Settings size={17} />
            </IconButton>
          }
          items={[
            {
              label: 'View History',
              icon: <History size={14} />,
              onClick: () => setIsHistoryModalOpen(true),
            },
            {
              label: 'View JSON',
              icon: <Braces size={14} />,
              onClick: () => setIsJsonModalOpen(true),
            },
          ]}
        />
      </AppBar>
      <div className="project-body">
        <ProjectSidebar
          onCreateLibrary={() => setIsCreateLibraryModalOpen(true)}
          onImportLibrary={() => setIsImportLibraryModalOpen(true)}
          onOpenLibraryManager={() => setIsLibraryManagerOpen(true)}
        />
        <ProjectCanvas />
      </div>

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        title="Project JSON"
        data={project}
        defaultExpandDepth={2}
      />

      <LibraryManager
        isOpen={isLibraryManagerOpen}
        onClose={() => setIsLibraryManagerOpen(false)}
      />

      <Modal
        isOpen={isCreateLibraryModalOpen}
        onClose={() => {
          setIsCreateLibraryModalOpen(false);
          setNewLibraryName('');
        }}
        title="Create New Library"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Enter a name for the new library:
          </p>
          <Input
            value={newLibraryName}
            onChange={e => setNewLibraryName(e.target.value)}
            placeholder="My Library"
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateLibrary();
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
                setIsCreateLibraryModalOpen(false);
                setNewLibraryName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLibrary}
              disabled={!newLibraryName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <ImportLibraryModal
        isOpen={isImportLibraryModalOpen}
        onClose={() => setIsImportLibraryModalOpen(false)}
        onImportSuccess={handleImportLibrary}
      />

      <LibraryImportChoiceModal
        isOpen={isLibraryChoiceModalOpen}
        onClose={() => setIsLibraryChoiceModalOpen(false)}
        library={importedLibrary}
        url={importedLibraryUrl}
        onChoiceInternal={handleChoiceInternal}
        onChoiceExternal={handleChoiceExternal}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        past={past}
        onRestoreToPoint={restoreToPoint}
      />

      <ConfirmationModal
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        onConfirm={handleConfirmClose}
        title="Close Project"
        message="Are you sure you want to close this project? Make sure to save your work before leaving."
        confirmLabel="Close"
        cancelLabel="Stay"
        variant="warning"
      />
    </div>
  );
}
