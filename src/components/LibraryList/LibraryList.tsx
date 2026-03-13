import './LibraryList.css';

import { Download, Import, Pencil, Trash2 } from 'lucide-react';

import type { Library } from '../../types/library';
import { IconButton } from '../IconButton';
import { LibraryStatusIcon } from '../LibraryStatusIcon';

export interface LibraryTypeInfo {
  type: 'internal' | 'imported' | 'external';
  label: string;
  className: string;
  icon: React.ReactNode;
  statusInfo?: {
    status: 'online' | 'cached' | 'unavailable' | 'loading';
    url: string;
    lastFetched?: string;
  };
}

export interface LibraryListProps {
  libraries: Library[];
  onExport: (libraryId: string) => void;
  onRemove: (libraryId: string) => void;
  onConvertToInternal?: (libraryId: string) => void;
  onRename?: (libraryId: string) => void;
  getLibraryTypeInfo: (libraryId: string) => LibraryTypeInfo | null;
  emptyMessage?: string;
}

export function LibraryList(props: LibraryListProps) {
  if (props.libraries.length === 0) {
    return (
      <div className="library-list__empty">
        <p>{props.emptyMessage || 'No libraries available.'}</p>
      </div>
    );
  }

  return (
    <ul className="library-list">
      {props.libraries.map(library => {
        const typeInfo = props.getLibraryTypeInfo(library.id);
        if (!typeInfo) return null;

        return (
          <li key={library.id} className="library-list-item">
            <div className="library-list-item__info">
              <div className="library-list-item__header">
                <span className="library-list-item__name">{library.name}</span>
                {props.onRename &&
                  (typeInfo.type === 'internal' ||
                    typeInfo.type === 'imported') && (
                    <IconButton
                      onClick={() => props.onRename?.(library.id)}
                      tooltip="Rename library"
                      className="library-list-item__rename-btn"
                    >
                      <Pencil size={12} />
                    </IconButton>
                  )}
                <span
                  className={`library-list-item__badge ${typeInfo.className}`}
                >
                  {typeInfo.icon}
                  {typeInfo.label}
                </span>
                {typeInfo.statusInfo && (
                  <LibraryStatusIcon
                    status={typeInfo.statusInfo.status}
                    url={typeInfo.statusInfo.url}
                    lastFetched={typeInfo.statusInfo.lastFetched}
                  />
                )}
              </div>
              <div className="library-list-item__meta">
                <span className="library-list-item__component-count">
                  {library.components.length}{' '}
                  {library.components.length === 1 ? 'component' : 'components'}
                </span>
                {library.sourceUrl && (
                  <span className="library-list-item__url">
                    {library.sourceUrl}
                  </span>
                )}
              </div>
            </div>

            <div className="library-list-item__actions">
              <IconButton
                onClick={() => props.onExport(library.id)}
                tooltip="Export library"
              >
                <Download size={14} />
              </IconButton>

              {typeInfo.type === 'external' && props.onConvertToInternal && (
                <IconButton
                  onClick={() => props.onConvertToInternal?.(library.id)}
                  tooltip="Convert to internal"
                >
                  <Import size={14} />
                </IconButton>
              )}

              <IconButton
                onClick={() => props.onRemove(library.id)}
                tooltip="Remove library"
                className="library-list-item__remove-btn"
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
