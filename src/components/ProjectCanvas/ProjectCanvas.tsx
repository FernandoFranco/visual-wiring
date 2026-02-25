import './ProjectCanvas.css';

import type { Project } from '../../types/project';

export interface ProjectCanvasProps {
  project: Project;
}

export function ProjectCanvas({ project }: ProjectCanvasProps) {
  return (
    <div className="project-canvas">
      <div className="project-canvas__placeholder">
        <p className="project-canvas__title">Canvas</p>
        <p className="project-canvas__subtitle">
          Component editor will be implemented here
        </p>
        <div className="project-canvas__info">
          <p>
            <strong>Name:</strong> {project.name}
          </p>
          <p>
            <strong>Created:</strong>{' '}
            {new Date(project.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated:</strong>{' '}
            {new Date(project.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
