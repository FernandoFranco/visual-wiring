import './ImportModal.css';

import { FileJson, Globe } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../Button';
import { FileDropZone } from '../FileDropZone';
import { Modal } from '../Modal';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown, filename: string) => Promise<void> | void;
}

export function ImportModal(props: ImportModalProps) {
  const { isOpen, onClose, onImport } = props;
  const [importUrl, setImportUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await onImport(data, file.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(importUrl);
      if (!response.ok)
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`
        );
      const data = await response.json();
      const filename = importUrl.split('/').pop() || 'imported.json';
      await onImport(data, filename);
      setImportUrl('');
      onClose();
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(
          'Could not reach the URL. This may be caused by a CORS restriction on the server.'
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch from URL'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
