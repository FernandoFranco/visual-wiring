import './ComponentEditorPage.css';

import { Braces, Save, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppBar } from '../components/AppBar';
import { DEFAULT_SWATCHES } from '../components/ColorPicker';
import { ComponentEditorCanvas } from '../components/ComponentEditorCanvas';
import { ComponentEditorSidebar } from '../components/ComponentEditorSidebar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { IconButton } from '../components/IconButton';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { useProject } from '../hooks/useProject';
import { ROUTES } from '../routes';
import type { Pin } from '../types/pin';
import type { LabelPosition } from '../types/project';

export function ComponentEditorPage() {
  const navigate = useNavigate();
  const { libraryId = '', componentId } = useParams<{
    libraryId: string;
    componentId?: string;
  }>();
  const isEditMode = !!componentId;

  const { project, addComponent, updateComponent } = useProject();

  const library = project?.libraries.find(l => l.id === libraryId);
  const existingComponent = isEditMode
    ? library?.components.find(c => c.id === componentId)
    : undefined;

  const [name, setName] = useState(existingComponent?.name ?? '');
  const [nameError, setNameError] = useState('');
  const [pins, setPins] = useState<Pin[]>(existingComponent?.pins ?? []);
  const [minWidth, setMinWidth] = useState(existingComponent?.minWidth ?? 4);
  const [minHeight, setMinHeight] = useState(existingComponent?.minHeight ?? 4);
  const [color, setColor] = useState(
    existingComponent?.color ?? DEFAULT_SWATCHES[0]
  );
  const [defaultLabelPosition, setDefaultLabelPosition] =
    useState<LabelPosition>(
      existingComponent?.defaultLabelPosition ?? 'center'
    );
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  if (!project || !library || (isEditMode && !existingComponent)) {
    navigate(ROUTES.PROJECT, { replace: true });
    return null;
  }

  const hasChanges = isEditMode
    ? name.trim() !== existingComponent!.name ||
      JSON.stringify(pins) !== JSON.stringify(existingComponent!.pins) ||
      minWidth !== (existingComponent!.minWidth ?? 4) ||
      minHeight !== (existingComponent!.minHeight ?? 4) ||
      color !== (existingComponent!.color ?? '') ||
      defaultLabelPosition !==
        (existingComponent!.defaultLabelPosition ?? 'center')
    : name.trim() !== '' || pins.length > 0;

  const handleBack = () => {
    if (hasChanges) {
      setIsDiscardOpen(true);
    } else {
      navigate(ROUTES.PROJECT);
    }
  };

  const handleDiscard = () => {
    navigate(ROUTES.PROJECT);
  };

  const previewComponent = {
    id: componentId ?? 'preview',
    name,
    pins,
    minWidth,
    minHeight,
    color: color || undefined,
    defaultLabelPosition,
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Component name is required.');
      return;
    }

    if (isEditMode && componentId) {
      updateComponent(libraryId, {
        id: componentId,
        name: trimmedName,
        pins,
        minWidth,
        minHeight,
        color: color || undefined,
        defaultLabelPosition,
      });
    } else {
      addComponent(libraryId, {
        id: crypto.randomUUID(),
        name: trimmedName,
        pins,
        minWidth,
        minHeight,
        color: color || undefined,
        defaultLabelPosition,
      });
    }

    navigate(ROUTES.PROJECT);
  };

  const appBarTitle = isEditMode
    ? `${library.name}  /  ${existingComponent!.name}`
    : `${library.name}  /  New Component`;

  return (
    <div className="component-editor-page">
      <AppBar projectName={appBarTitle} onGoHome={handleBack} backMode>
        <IconButton
          className="app-bar__action-btn"
          onClick={handleSave}
          title={isEditMode ? 'Save changes' : 'Save component'}
        >
          <Save size={17} />
        </IconButton>
        <DropdownMenu
          trigger={
            <IconButton className="app-bar__action-btn" title="Settings">
              <Settings size={17} />
            </IconButton>
          }
          items={[
            {
              label: 'View JSON',
              icon: <Braces size={14} />,
              onClick: () => setIsJsonModalOpen(true),
            },
          ]}
        />
      </AppBar>

      <div className="component-editor-page__body">
        <ComponentEditorSidebar
          name={name}
          onNameChange={value => {
            setName(value);
            if (value.trim()) setNameError('');
          }}
          nameError={nameError}
          minWidth={minWidth}
          onMinWidthChange={setMinWidth}
          minHeight={minHeight}
          onMinHeightChange={setMinHeight}
          color={color}
          onColorChange={setColor}
          defaultLabelPosition={defaultLabelPosition}
          onDefaultLabelPositionChange={setDefaultLabelPosition}
          pins={pins}
          onPinsChange={setPins}
          onSave={handleSave}
        />
        <ComponentEditorCanvas component={previewComponent} />
      </div>

      <ConfirmationModal
        isOpen={isDiscardOpen}
        onClose={() => setIsDiscardOpen(false)}
        onConfirm={handleDiscard}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="warning"
      />

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        title="Component JSON"
        data={{
          id: componentId || '(unsaved)',
          name,
          pins,
          minWidth,
          minHeight,
        }}
        defaultExpandDepth={2}
      />
    </div>
  );
}
