import './ExternalLibrariesLoadingModal.css';

import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';

import type { ExternalLibraryStatus } from '../../hooks/ProjectContext';
import { Modal } from '../Modal';

export interface ExternalLibrariesLoadingModalProps {
  isLoading: boolean;
  statuses: ExternalLibraryStatus[];
  onClose: () => void;
}

export function ExternalLibrariesLoadingModal(
  props: PropsWithChildren<ExternalLibrariesLoadingModalProps>
) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (props.isLoading && props.statuses.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
  }, [props.isLoading, props.statuses.length]);

  useEffect(() => {
    if (!props.isLoading && isOpen) {
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [props.isLoading, isOpen]);

  if (!isOpen) return null;

  const onlineCount = props.statuses.filter(s => s.status === 'online').length;
  const cachedCount = props.statuses.filter(s => s.status === 'cached').length;
  const errorCount = props.statuses.filter(
    s => s.status === 'unavailable'
  ).length;
  const totalCount = props.statuses.length;

  const getStatusIcon = (status: ExternalLibraryStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="status-icon status-online" />;
      case 'cached':
        return <Database className="status-icon status-cached" />;
      case 'unavailable':
        return <AlertCircle className="status-icon status-error" />;
      case 'loading':
        return <Loader2 className="status-icon status-loading" />;
    }
  };

  const getStatusLabel = (status: ExternalLibraryStatus['status']) => {
    switch (status) {
      case 'online':
        return 'Carregada';
      case 'cached':
        return 'Cache';
      case 'unavailable':
        return 'Erro';
      case 'loading':
        return 'Carregando...';
    }
  };

  const getLibraryName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      const filename = parts[parts.length - 1];
      return filename || url;
    } catch {
      return url;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={props.onClose}
      title="Carregando Bibliotecas Externas"
      subtitle={
        props.isLoading
          ? `Carregando ${totalCount} ${totalCount === 1 ? 'biblioteca' : 'bibliotecas'}...`
          : `${onlineCount} carregadas, ${cachedCount} em cache, ${errorCount} com erro`
      }
      showCloseButton={!props.isLoading}
      className="external-libraries-loading-modal"
    >
      <div className="loading-status-list">
        {props.statuses.map(status => (
          <div key={status.url} className="loading-status-item">
            {getStatusIcon(status.status)}
            <div className="loading-status-info">
              <div className="loading-status-name">
                {getLibraryName(status.url)}
              </div>
              <div className="loading-status-url">{status.url}</div>
              {status.error && (
                <div className="loading-status-error">{status.error}</div>
              )}
            </div>
            <div className="loading-status-label">
              {getStatusLabel(status.status)}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
