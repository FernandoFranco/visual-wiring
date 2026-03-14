import { validateProject } from '../../utils/typeValidators';
import { ImportFromSourceModal } from '../ImportFromSourceModal';

export interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown, filename: string) => Promise<void> | void;
}

export function ImportProjectModal(props: ImportProjectModalProps) {
  const handleFileImport = async (file: File): Promise<unknown> => {
    const text = await file.text();
    const data = JSON.parse(text);
    validateProject(data);
    return data;
  };

  const handleUrlImport = async (url: string): Promise<unknown> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    validateProject(data);
    return data;
  };

  const handleSuccess = async (data: unknown, filename: string) => {
    await props.onImport(data, filename);
  };

  return (
    <ImportFromSourceModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Import Data"
      subtitle="Libraries or Projects"
      urlPlaceholder="HTTPS://EXAMPLE.COM/DATA.JSON"
      onFileImport={handleFileImport}
      onUrlImport={handleUrlImport}
      onSuccess={handleSuccess}
    />
  );
}
