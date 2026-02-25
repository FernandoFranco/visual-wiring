import './ProjectPage.css';

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProjectPage() {
  const navigate = useNavigate();

  return (
    <div className="project-page">
      <header className="project-header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <h1 className="project-title">Project Canvas</h1>
      </header>

      <main className="project-main">
        <div className="project-canvas">
          <div className="canvas-placeholder">
            <p className="placeholder-text">Canvas Area</p>
            <p className="placeholder-subtext">
              Component editor will be implemented here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
