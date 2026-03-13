import './ImportModal.css';

import { FileJson, Globe } from 'lucide-react';
import { useState } from 'react';

import { useLoadFromURL } from '../../hooks/useLoadFromURL';
import { validateProject } from '../../utils/typeValidators';
import { Button } from '../Button';
import { FileDropZone } from '../FileDropZone';
import { Modal } from '../Modal';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown, filename: string) => Promise<void> | void;
}

export function ImportModal(props: ImportModalProps) {
  const [importUrl, setImportUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { loadFromURL, isLoading } = useLoadFromURL({
    validator: validateProject,
    onSuccess: async result => {
      await props.onImport(result.data, result.filename);
      setImportUrl('');
      props.onClose();
    },
    onError: err => {
      setError(err.message);
    },
  });

  const handleFileSelect = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      validateProject(data);
      await props.onImport(data, file.name);
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    }
  };

  const handleUrlImport = async () => {
    setError(null);
    await loadFromURL(importUrl);
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Import Data"
      subtitle="Components, Libraries or Projects"
      icon={<FileJson size={20} />}
    >
      <div className="import-modal-content">
        <section className="import-modal-section">
          <label className="import-modal-section-label">File Upload</label>
          <FileDropZone onFileSelect={handleFileSelect} />
        </section>

        <section className="import-modal-section">
          <label className="import-modal-section-label">Import from URL</label>
          <div className="import-modal-url-form">
            <div className="import-modal-url-input-wrapper">
              <Globe className="import-modal-url-icon" size={14} />
              <input
                type="text"
                placeholder="HTTPS://EXAMPLE.COM/DATA.JSON"
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                className="import-modal-url-input"
              />
            </div>
            <Button
              variant="primary"
              disabled={isLoading || !importUrl.startsWith('http')}
              onClick={handleUrlImport}
              className="import-modal-fetch-btn"
            >
              {isLoading ? '...' : 'Fetch'}
            </Button>
          </div>
        </section>

        {error && (
          <div className="import-modal-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
