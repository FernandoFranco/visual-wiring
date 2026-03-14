import './LibraryStatusIcon.css';

import { Cloud, CloudOff, HardDrive, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { LibraryLoadStatus } from '../../types/librarySource';

export interface LibraryStatusIconProps {
  status: LibraryLoadStatus;
  url?: string;
  lastFetched?: string;
}

export function LibraryStatusIcon(props: LibraryStatusIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipPosition(null);
  };
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
    <>
      <div
        ref={iconRef}
        className={`library-status-icon ${statusInfo.className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {statusInfo.icon}
      </div>
      {tooltipPosition && (
        <div
          className="library-status-icon-tooltip library-status-icon-tooltip--visible"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
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
      )}
    </>
  );
}
