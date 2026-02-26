import './ProjectPage.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBar } from '../components/AppBar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ProjectCanvas } from '../components/ProjectCanvas';
import { ProjectSidebar } from '../components/ProjectSidebar';
import { useProject } from '../hooks/useProject';

export function ProjectPage() {
  const navigate = useNavigate();
  const { project, saveProject, closeProject } = useProject();
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  if (!project) {
    return null;
  }

  const handleConfirmClose = () => {
    closeProject();
    navigate('/', { replace: true });
  };

  return (
    <div className="project-page">
      <AppBar
        projectName={project.name}
        onGoHome={() => setIsCloseConfirmOpen(true)}
        onSave={saveProject}
      />
      <div className="project-body">
        <ProjectSidebar />
        <ProjectCanvas project={project} />
      </div>

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
