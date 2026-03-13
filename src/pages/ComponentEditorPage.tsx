import './ComponentEditorPage.css';

import { Braces, Save, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppBar } from '../components/AppBar';
import { ComponentEditorCanvas } from '../components/ComponentEditorCanvas';
import { ComponentEditorSidebar } from '../components/ComponentEditorSidebar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DropdownMenu } from '../components/DropdownMenu';
import { IconButton } from '../components/IconButton';
import { JsonViewerModal } from '../components/JsonViewerModal';
import { useComponentEditor } from '../hooks/useComponentEditor';
import { useProject } from '../hooks/useProject';
import { ROUTES } from '../routes';

export function ComponentEditorPage() {
  const navigate = useNavigate();
  const { libraryId = '', componentId } = useParams<{
    libraryId: string;
    componentId?: string;
  }>();

  const { project, addComponent, updateComponent, addColor, removeColor } =
    useProject();

  const library = project?.libraries.find(l => l.id === libraryId);
  const existingComponent = componentId
    ? library?.components.find(c => c.id === componentId)
    : undefined;

  const editor = useComponentEditor({
    library,
    libraryId,
    componentId,
    existingComponent,
    addComponent,
    updateComponent,
  });

  if (!project || !library || (editor.isEditMode && !existingComponent)) {
    navigate(ROUTES.PROJECT, { replace: true });
    return null;
  }

  return (
    <div className="component-editor-page">
      <AppBar
        projectName={editor.appBarTitle}
        onGoHome={editor.handleBack}
        backMode
      >
        <IconButton
          className="app-bar__action-btn"
          onClick={editor.handleSave}
          title={editor.isEditMode ? 'Save changes' : 'Save component'}
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
              onClick: () => editor.setIsJsonModalOpen(true),
            },
          ]}
        />
      </AppBar>

      <div className="component-editor-page__body">
        <ComponentEditorSidebar
          name={editor.name}
          onNameChange={value => {
            editor.setName(value);
            if (value.trim()) editor.setNameError('');
          }}
          nameError={editor.nameError}
          minWidth={editor.minWidth}
          onMinWidthChange={editor.setMinWidth}
          minHeight={editor.minHeight}
          onMinHeightChange={editor.setMinHeight}
          color={editor.color}
          colors={project?.colors ?? []}
          onColorChange={editor.setColor}
          onAddColor={addColor}
          onRemoveColor={removeColor}
          defaultLabelPosition={editor.defaultLabelPosition}
          onDefaultLabelPositionChange={editor.setDefaultLabelPosition}
          pins={editor.pins}
          onPinsChange={editor.setPins}
          onSave={editor.handleSave}
        />
        <ComponentEditorCanvas component={editor.previewComponent} />
      </div>

      <ConfirmationModal
        isOpen={editor.isDiscardOpen}
        onClose={() => editor.setIsDiscardOpen(false)}
        onConfirm={editor.handleDiscard}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="warning"
      />

      <JsonViewerModal
        isOpen={editor.isJsonModalOpen}
        onClose={() => editor.setIsJsonModalOpen(false)}
        title="Component JSON"
        data={{
          id: componentId || '(unsaved)',
          name: editor.name,
          pins: editor.pins,
          minWidth: editor.minWidth,
          minHeight: editor.minHeight,
        }}
        defaultExpandDepth={2}
      />
    </div>
  );
}
