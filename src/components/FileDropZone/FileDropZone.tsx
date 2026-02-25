import './FileDropZone.css';

import { Upload } from 'lucide-react';
import { type ChangeEvent, useRef } from 'react';

export interface FileDropZoneProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  label?: string;
  description?: string;
}

export function FileDropZone(props: FileDropZoneProps) {
  const { accept = '.json', onFileSelect, label, description } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-drop-zone" onClick={handleClick}>
      <div className="file-drop-zone-icon">
        <Upload size={24} />
      </div>
      <div className="file-drop-zone-text">
        <p className="file-drop-zone-label">
          {label || 'Click to upload JSON'}
        </p>
        <p className="file-drop-zone-description">
          {description || 'Supports .json files'}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="file-drop-zone-input"
        onChange={handleChange}
      />
    </div>
  );
}
