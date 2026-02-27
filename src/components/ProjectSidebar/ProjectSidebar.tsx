import './ProjectSidebar.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProject } from '../../hooks/useProject';
import { ROUTES } from '../../routes';
import { Library } from '../Library';
import { SidebarSearch } from '../SidebarSearch';

export function ProjectSidebar() {
  const { project, renameLibrary } = useProject();
  const navigate = useNavigate();
  const libraries = project?.libraries ?? [];
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();

  const visibleLibraries = trimmedQuery
    ? libraries.filter(lib =>
        lib.components.some(c =>
          c.name.toLowerCase().includes(trimmedQuery.toLowerCase())
        )
      )
    : libraries;

  return (
    <aside className="project-sidebar">
      <div className="project-sidebar__header">
        <span className="project-sidebar__title">Libraries</span>
        <span className="project-sidebar__count">{libraries.length}</span>
      </div>

      <SidebarSearch
        value={query}
        onChange={setQuery}
        placeholder="Search components..."
      />

      <div className="project-sidebar__libraries">
        {visibleLibraries.length === 0 && trimmedQuery ? (
          <p className="project-sidebar__no-results">
            No components match &ldquo;{trimmedQuery}&rdquo;
          </p>
        ) : (
          visibleLibraries.map(library => (
            <Library
              key={library.id}
              library={library}
              onRename={renameLibrary}
              onAddComponent={() => navigate(ROUTES.toNewComponent(library.id))}
              onEditComponent={componentId =>
                navigate(ROUTES.toEditComponent(library.id, componentId))
              }
              query={trimmedQuery}
            />
          ))
        )}
      </div>
    </aside>
  );
}
