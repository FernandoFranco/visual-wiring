import './ProjectSidebar.css';

import { Plus, Settings, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProject } from '../../hooks/useProject';
import { ROUTES } from '../../routes';
import { IconButton } from '../IconButton';
import { Library } from '../Library';
import { SidebarSearch } from '../SidebarSearch';

export interface ProjectSidebarProps {
  onCreateLibrary: () => void;
  onImportLibrary: () => void;
  onOpenLibraryManager: () => void;
}

export function ProjectSidebar(props: ProjectSidebarProps) {
  const { project, renameLibrary, removeComponent, externalLibrariesStatus } =
    useProject();
  const navigate = useNavigate();
  const libraries = project?.libraries ?? [];
  const placedComponents = project?.placedComponents ?? [];
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();

  const visibleLibraries = trimmedQuery
    ? libraries.filter(lib =>
        lib.components.some(c =>
          c.name.toLowerCase().includes(trimmedQuery.toLowerCase())
        )
      )
    : libraries;

  const getLibraryInfo = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId);
    const isExternal = library?.sourceType === 'external';
    const statusEntry = externalLibrariesStatus.find(
      s => s.url === library?.sourceUrl
    );

    return {
      readOnly: isExternal,
      statusInfo:
        isExternal && statusEntry
          ? {
              status: statusEntry.status,
              url: statusEntry.url,
              lastFetched: library?.lastFetched,
            }
          : undefined,
    };
  };

  return (
    <aside className="project-sidebar">
      <div className="project-sidebar__header">
        <span className="project-sidebar__title">Libraries</span>
        <div className="project-sidebar__header-actions">
          <IconButton
            onClick={props.onCreateLibrary}
            tooltip="Create Library"
            tooltipPosition="bottom"
          >
            <Plus size={14} />
          </IconButton>
          <IconButton
            onClick={props.onImportLibrary}
            tooltip="Import Library"
            tooltipPosition="bottom"
          >
            <Upload size={14} />
          </IconButton>
          <IconButton
            onClick={props.onOpenLibraryManager}
            tooltip="Library Manager"
            tooltipPosition="bottom"
          >
            <Settings size={14} />
          </IconButton>
          <span className="project-sidebar__count">{libraries.length}</span>
        </div>
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
          visibleLibraries.map(library => {
            const libraryInfo = getLibraryInfo(library.id);
            return (
              <Library
                key={library.id}
                library={library}
                placedComponents={placedComponents}
                onRename={renameLibrary}
                onAddComponent={() =>
                  navigate(ROUTES.toNewComponent(library.id))
                }
                onEditComponent={componentId =>
                  navigate(ROUTES.toEditComponent(library.id, componentId))
                }
                onRemoveComponent={componentId =>
                  removeComponent(library.id, componentId)
                }
                query={trimmedQuery}
                readOnly={libraryInfo.readOnly}
                statusInfo={libraryInfo.statusInfo}
              />
            );
          })
        )}
      </div>
    </aside>
  );
}
