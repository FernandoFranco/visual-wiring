import { Pencil, Plus } from 'lucide-react';

import type { LibraryLoadStatus } from '../../types/librarySource';
import { IconButton } from '../IconButton';
import { LibraryStatusIcon } from '../LibraryStatusIcon';

export interface LibraryHeaderProps {
  libraryName: string;
  isRenaming: boolean;
  draftName: string;
  onDraftNameChange: (name: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onAddComponent?: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  readOnly?: boolean;
  statusInfo?: {
    status: LibraryLoadStatus;
    url: string;
    lastFetched?: string;
  };
}

export function LibraryHeader(props: LibraryHeaderProps) {
  const label = props.isRenaming ? (
    <input
      ref={props.inputRef}
      className="library__rename-input"
      value={props.draftName}
      onChange={e => props.onDraftNameChange(e.target.value)}
      onBlur={props.onCommitRename}
      onKeyDown={e => {
        if (e.key === 'Enter') props.onCommitRename();
        if (e.key === 'Escape') props.onCancelRename();
      }}
      autoFocus
    />
  ) : (
    <span className="library__name-wrapper">
      <span
        className="library__name"
        onDoubleClick={props.readOnly ? undefined : props.onStartRename}
        title={props.readOnly ? undefined : 'Double-click to rename'}
      >
        {props.libraryName}
      </span>
      {props.statusInfo && (
        <LibraryStatusIcon
          status={props.statusInfo.status}
          url={props.statusInfo.url}
          lastFetched={props.statusInfo.lastFetched}
        />
      )}
    </span>
  );

  const actions =
    !props.isRenaming && !props.readOnly ? (
      <>
        <IconButton
          className="library__add-btn"
          onClick={e => {
            e.stopPropagation();
            props.onAddComponent?.();
          }}
          title="Add component"
        >
          <Plus size={11} />
        </IconButton>
        <IconButton
          className="library__rename-btn"
          onClick={props.onStartRename}
          title="Rename library"
        >
          <Pencil size={11} />
        </IconButton>
      </>
    ) : undefined;

  return { label, actions };
}
