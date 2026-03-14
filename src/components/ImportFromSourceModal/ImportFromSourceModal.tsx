import './ImportFromSourceModal.css';

import { FileJson, Globe } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../Button';
import { FileDropZone } from '../FileDropZone';
import { Modal } from '../Modal';

export interface ImportFromSourceModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  urlPlaceholder: string;
  onFileImport: (file: File) => Promise<T>;
  onUrlImport: (url: string) => Promise<T>;
  onSuccess: (data: T, filename: string, url?: string) => void;
}

export function ImportFromSourceModal<T>(props: ImportFromSourceModalProps<T>) {
  const [importUrl, setImportUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);
    try {
      const result = await props.onFileImport(file);
      props.onSuccess(result, file.name);
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    }
  };

  const handleUrlImport = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await props.onUrlImport(importUrl);
      props.onSuccess(
        result,
        importUrl.split('/').pop() || 'imported.json',
        importUrl
      );
      setImportUrl('');
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch from URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={props.title}
      subtitle={props.subtitle}
      icon={<FileJson size={20} />}
    >
      <div className="import-from-source-modal-content">
        <section className="import-from-source-modal-section">
          <label className="import-from-source-modal-section-label">
            File Upload
          </label>
          <FileDropZone onFileSelect={handleFileSelect} />
        </section>

        <section className="import-from-source-modal-section">
          <label className="import-from-source-modal-section-label">
            Import from URL
          </label>
          <div className="import-from-source-modal-url-form">
            <div className="import-from-source-modal-url-input-wrapper">
              <Globe className="import-from-source-modal-url-icon" size={14} />
              <input
                type="text"
                placeholder={props.urlPlaceholder}
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                className="import-from-source-modal-url-input"
              />
            </div>
            <Button
              variant="primary"
              disabled={isLoading || !importUrl.startsWith('http')}
              onClick={handleUrlImport}
              className="import-from-source-modal-fetch-btn"
            >
              {isLoading ? '...' : 'Fetch'}
            </Button>
          </div>
        </section>

        {error && (
          <div className="import-from-source-modal-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
