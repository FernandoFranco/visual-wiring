import './ProjectPage.css';

import { Braces, Download, FileImage, History, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBar } from '../components/AppBar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { HistoryModal } from '../components/HistoryModal';
import { IconButton } from '../components/IconButton';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { ProjectCanvas } from '../components/ProjectCanvas';
import { ProjectSidebar } from '../components/ProjectSidebar';
import { useProject } from '../hooks/useProject';
import { ROUTES } from '../routes';
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
  } = useProject();
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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

  return (
    <div className="project-page">
      <AppBar
        projectName={project.name}
        onGoHome={() => setIsCloseConfirmOpen(true)}
      >
        <DropdownMenu
          trigger={
            <IconButton className="app-bar__action-btn" title="Download">
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
            <IconButton className="app-bar__action-btn" title="Settings">
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
        <ProjectSidebar />
        <ProjectCanvas />
      </div>

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        title="Project JSON"
        data={project}
        defaultExpandDepth={2}
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
