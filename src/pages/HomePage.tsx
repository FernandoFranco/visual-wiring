import './HomePage.css';

import { Plus, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import packageJson from '../../package.json';
import { ActionButton } from '../components/ActionButton';
import { AppLogo } from '../components/AppLogo';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { ImportProjectModal } from '../components/ImportProjectModal';
import { useLoadFromURL } from '../hooks/useLoadFromURL';
import { useProject } from '../hooks/useProject';
import { useSnackbar } from '../hooks/useSnackbar';
import { validateProject } from '../utils/typeValidators';

export function HomePage() {
  const { createProject, loadProject } = useProject();
  const { showError } = useSnackbar();
  const [isCreating, setIsCreating] = useState(false);
  const [isImportProjectModalOpen, setIsImportProjectModalOpen] =
    useState(false);
  const hasLoadedFromURL = useRef(false);

  const { loadFromURL, isLoading: isLoadingFromURL } = useLoadFromURL({
    showSuccessMessage: true,
    successMessage: 'Project loaded successfully from URL',
    validator: validateProject,
    onSuccess: async result => {
      const blob = new Blob([JSON.stringify(result.data)], {
        type: 'application/json',
      });
      const file = new File([blob], result.filename, {
        type: 'application/json',
      });
      await loadProject(file);
      window.history.replaceState({}, '', window.location.pathname);
    },
    onError: () => {
      hasLoadedFromURL.current = false;
    },
  });

  useEffect(() => {
    const loadProjectFromQueryString = async () => {
      const params = new URLSearchParams(window.location.search);
      const projectURL = params.get('project');

      if (projectURL && !hasLoadedFromURL.current) {
        hasLoadedFromURL.current = true;
        await loadFromURL(projectURL);
      }
    };

    loadProjectFromQueryString();
  }, [loadFromURL]);

  const handleNewProject = (name: string) => {
    try {
      createProject(name);
    } catch {
      showError('Failed to create project. Please try again.');
    }
  };

  const handleLoadProject = () => {
    setIsImportProjectModalOpen(true);
  };

  const handleImport = async (data: unknown, filename: string) => {
    try {
      validateProject(data);
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      const file = new File([blob], filename, { type: 'application/json' });

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
          {isLoadingFromURL ? (
            <div className="loading-container">
              <p>Loading project from URL...</p>
            </div>
          ) : !isCreating ? (
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

      <ImportProjectModal
        isOpen={isImportProjectModalOpen}
        onClose={() => setIsImportProjectModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
