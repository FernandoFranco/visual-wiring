import './SidebarSearch.css';

import { Search, X } from 'lucide-react';

export interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SidebarSearch(props: SidebarSearchProps) {
  return (
    <div className="sidebar-search">
      <Search size={13} className="sidebar-search__icon" />
      <input
        className="sidebar-search__input"
        type="text"
        placeholder={props.placeholder || 'Search...'}
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
      {props.value && (
        <button
          className="sidebar-search__clear"
          onClick={() => props.onChange('')}
          type="button"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
