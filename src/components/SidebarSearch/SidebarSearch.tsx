import './SidebarSearch.css';

import { Search, X } from 'lucide-react';

export interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SidebarSearch({
  value,
  onChange,
  placeholder = 'Search...',
}: SidebarSearchProps) {
  return (
    <div className="sidebar-search">
      <Search size={13} className="sidebar-search__icon" />
      <input
        className="sidebar-search__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          className="sidebar-search__clear"
          onClick={() => onChange('')}
          type="button"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
