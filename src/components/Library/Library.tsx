import './Library.css';

import { Pencil } from 'lucide-react';
import { useRef, useState } from 'react';

import type { Library as LibraryType } from '../../types/library';
import { ExpansionPanel } from '../ExpansionPanel';

export interface LibraryProps {
  library: LibraryType;
  onRename: (id: string, name: string) => void;
  query?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="library__highlight">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Library({ library, onRename, query = '' }: LibraryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? library.components.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : library.components;

  const effectiveIsOpen = query && filtered.length > 0 ? true : isOpen;

  const startRename = () => {
    setDraftName(library.name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== library.name) {
      onRename(library.id, trimmed);
    }
    setIsRenaming(false);
  };

  const cancelRename = () => {
    setIsRenaming(false);
  };

  const label = isRenaming ? (
    <input
      ref={inputRef}
      className="library__rename-input"
      value={draftName}
      onChange={e => setDraftName(e.target.value)}
      onBlur={commitRename}
      onKeyDown={e => {
        if (e.key === 'Enter') commitRename();
        if (e.key === 'Escape') cancelRename();
      }}
      autoFocus
    />
  ) : (
    <span
      className="library__name"
      onDoubleClick={startRename}
      title="Double-click to rename"
    >
      {library.name}
    </span>
  );

  const count = query
    ? `${filtered.length}/${library.components.length}`
    : library.components.length;

  const actions = !isRenaming ? (
    <button
      className="library__rename-btn"
      onClick={startRename}
      type="button"
      title="Rename library"
    >
      <Pencil size={11} />
    </button>
  ) : undefined;

  return (
    <div className="library">
      <ExpansionPanel
        label={label}
        count={count}
        actions={actions}
        isOpen={effectiveIsOpen}
        onToggle={() => setIsOpen(o => !o)}
      >
        {library.components.length === 0 ? (
          <p className="library__empty">No components yet</p>
        ) : filtered.length === 0 ? (
          <p className="library__empty">No matches</p>
        ) : (
          <ul className="library__components">
            {filtered.map(component => (
              <li key={component.id} className="library__component">
                <Highlight text={component.name} query={query} />
              </li>
            ))}
          </ul>
        )}
      </ExpansionPanel>
    </div>
  );
}
