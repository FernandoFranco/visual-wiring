import './HomePage.css';

import { Plus, Upload } from 'lucide-react';
import { useState } from 'react';

import packageJson from '../../package.json';
import { ActionButton } from '../components/ActionButton';
import { AppLogo } from '../components/AppLogo';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { ImportModal } from '../components/ImportModal';
import { useProject } from '../hooks/useProject';
import { useSnackbar } from '../hooks/useSnackbar';

export function HomePage() {
  const { createProject, loadProject } = useProject();
  const { showError } = useSnackbar();
  const [isCreating, setIsCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleNewProject = (name: string) => {
    try {
      createProject(name);
    } catch {
      showError('Failed to create project. Please try again.');
    }
  };

  const handleLoadProject = () => {
    setIsImportModalOpen(true);
  };

  const handleImport = async (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });

    try {
      await loadProject(file);
    } catch (err) {
      showError(
        err instanceof Error
          ? `Failed to load project: ${err.message}`
          : 'Failed to load project. Make sure the file is a valid project.'
      );
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-left">
          <AppLogo size="lg" />

          <div className="hero-section">
            <h2 className="hero-title">
              Connect your <br />
              <span className="hero-subtitle-text">Components</span> <br />
              Visually.
            </h2>
            <p className="hero-description">
              Design electronic components with custom pins and wire them
              together. Build interactive circuit diagrams with ease.
            </p>
          </div>
        </div>

        <div className="home-right">
          {!isCreating ? (
            <div className="action-buttons">
              <ActionButton
                title="Create New Project"
                subtitle="Start with an empty workspace"
                icon={<Plus size={24} />}
                variant="primary"
                onClick={() => setIsCreating(true)}
              />

              <ActionButton
                title="Load Project"
                subtitle="Import an existing project file"
                icon={<Upload size={24} />}
                variant="secondary"
                onClick={handleLoadProject}
              />
            </div>
          ) : (
            <CreateProjectForm
              onCancel={() => setIsCreating(false)}
              onCreate={handleNewProject}
            />
          )}

          <div className="home-footer">
            <p className="footer-text">
              Visual Wiring v{packageJson.version} • Built for Hardware Design
            </p>
          </div>
        </div>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
