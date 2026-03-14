import type { Library } from '../../types/library';
import { validateLibrary } from '../../utils/typeValidators';
import { ImportFromSourceModal } from '../ImportFromSourceModal';

export interface ImportLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (library: Library, filename: string, url?: string) => void;
}

export function ImportLibraryModal(props: ImportLibraryModalProps) {
  const handleFileImport = async (file: File): Promise<Library> => {
    const text = await file.text();
    const data = JSON.parse(text);
    validateLibrary(data);
    return data as Library;
  };

  const handleUrlImport = async (url: string): Promise<Library> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    validateLibrary(data);
    return data as Library;
  };

  const handleSuccess = (library: Library, filename: string, url?: string) => {
    props.onImportSuccess(library, filename, url);
  };

  return (
    <ImportFromSourceModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Import Library"
      subtitle="From file or URL"
      urlPlaceholder="HTTPS://EXAMPLE.COM/LIBRARY.JSON"
      onFileImport={handleFileImport}
      onUrlImport={handleUrlImport}
      onSuccess={handleSuccess}
    />
  );
}
