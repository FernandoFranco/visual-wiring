import './LibraryStatusIcon.css';

import { Cloud, CloudOff, HardDrive, Loader2 } from 'lucide-react';

import type { LibraryLoadStatus } from '../../types/librarySource';

export interface LibraryStatusIconProps {
  status: LibraryLoadStatus;
  url?: string;
  lastFetched?: string;
}

export function LibraryStatusIcon(props: LibraryStatusIconProps) {
  const getStatusInfo = () => {
    switch (props.status) {
      case 'online':
        return {
          icon: <Cloud size={14} />,
          className: 'library-status-icon--online',
          label: 'Online',
          description: 'Loaded from URL',
        };
      case 'cached':
        return {
          icon: <HardDrive size={14} />,
          className: 'library-status-icon--cached',
          label: 'Cached',
          description: 'Using cached version (offline)',
        };
      case 'unavailable':
        return {
          icon: <CloudOff size={14} />,
          className: 'library-status-icon--unavailable',
          label: 'Unavailable',
          description: 'Failed to load and no cache available',
        };
      case 'loading':
        return {
          icon: <Loader2 size={14} className="library-status-icon-spinner" />,
          className: 'library-status-icon--loading',
          label: 'Loading',
          description: 'Loading library from URL',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return null;
    }
  };

  const lastFetchedFormatted = formatDate(props.lastFetched);

  return (
    <div className={`library-status-icon ${statusInfo.className}`}>
      {statusInfo.icon}
      <div className="library-status-icon-tooltip">
        <div className="library-status-icon-tooltip-header">
          <strong>{statusInfo.label}</strong>
        </div>
        <p className="library-status-icon-tooltip-description">
          {statusInfo.description}
        </p>
        {props.url && (
          <p className="library-status-icon-tooltip-url">{props.url}</p>
        )}
        {lastFetchedFormatted && props.status !== 'loading' && (
          <p className="library-status-icon-tooltip-date">
            Last fetched: {lastFetchedFormatted}
          </p>
        )}
      </div>
    </div>
  );
}
