import './CreateProjectForm.css';

import { useState } from 'react';

import { Button } from '../Button';
import { Input } from '../Input';

export interface CreateProjectFormProps {
  onCancel: () => void;
  onCreate: (projectName: string) => void;
}

export function CreateProjectForm(props: CreateProjectFormProps) {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = () => {
    if (!projectName.trim()) return;
    props.onCreate(projectName.trim());
  };

  return (
    <div className="create-project-form">
      <Input
        label="Project Name"
        type="text"
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        placeholder="MY COMPONENT"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <div className="create-project-form-actions">
        <Button
          variant="cancel"
          onClick={props.onCancel}
          className="cancel-action"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!projectName.trim()}
          className="submit-action"
        >
          Create & Design
        </Button>
      </div>
    </div>
  );
}
