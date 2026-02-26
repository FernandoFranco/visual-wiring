import './ProjectPage.css';

import { Braces, Download, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBar } from '../components/AppBar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { IconButton } from '../components/IconButton';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { ProjectCanvas } from '../components/ProjectCanvas';
import { ProjectSidebar } from '../components/ProjectSidebar';
import { useProject } from '../hooks/useProject';
import { ROUTES } from '../routes';

export function ProjectPage() {
  const navigate = useNavigate();
  const { project, saveProject, closeProject } = useProject();
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

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
        <IconButton
          className="app-bar__action-btn"
          onClick={saveProject}
          title="Save project"
        >
          <Download size={17} />
        </IconButton>
        <DropdownMenu
          trigger={
            <IconButton className="app-bar__action-btn" title="Settings">
              <Settings size={17} />
            </IconButton>
          }
          items={[
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
        <ProjectCanvas project={project} />
      </div>

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        title="Project JSON"
        data={project}
        defaultExpandDepth={2}
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
