import './ProjectPage.css';

import { ArrowLeft, Download, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useProject } from '../hooks/useProject';

export function ProjectPage() {
  const navigate = useNavigate();
  const { project, saveProject, updateName, closeProject } = useProject();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  if (!project) {
    return null;
  }

  const handleSaveProject = () => {
    saveProject();
  };

  const handleCloseProject = () => {
    if (
      confirm(
        'Are you sure you want to close this project? Make sure to save before closing.'
      )
    ) {
      closeProject();
      navigate('/', { replace: true });
    }
  };

  const handleStartEditName = () => {
    setNewName(project.name);
    setIsEditingName(true);
  };

  const handleSaveNewName = () => {
    if (newName.trim()) {
      updateName(newName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNewName('');
  };

  return (
    <div className="project-page">
      <header className="project-header">
        <div className="project-header-left">
          <button onClick={handleCloseProject} className="back-button">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>

          {isEditingName ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveNewName();
                  if (e.key === 'Escape') handleCancelEditName();
                }}
                autoFocus
                style={{ width: '300px' }}
              />
              <Button variant="primary" onClick={handleSaveNewName}>
                Save
              </Button>
              <Button variant="secondary" onClick={handleCancelEditName}>
                Cancel
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <h1 className="project-title">{project.name}</h1>
              <button
                onClick={handleStartEditName}
                className="icon-button"
                title="Edit project name"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.6,
                }}
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="project-header-right">
          <Button
            variant="primary"
            onClick={handleSaveProject}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Download size={16} />
            Save Project
          </Button>
        </div>
      </header>

      <main className="project-main">
        <div className="project-canvas">
          <div className="canvas-placeholder">
            <p className="placeholder-text">Canvas Area</p>
            <p className="placeholder-subtext">
              Component editor will be implemented here
            </p>
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '8px',
              }}
            >
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                <strong>Loaded Project:</strong>
              </p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Name: {project.name}
              </p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Created: {new Date(project.createdAt).toLocaleString()}
              </p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Updated: {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
