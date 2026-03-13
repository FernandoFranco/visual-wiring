import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../routes';
import type { Component } from '../types/component';
import type { Library } from '../types/library';
import type { Pin } from '../types/pin';
import type { LabelPosition } from '../types/project';

export interface UseComponentEditorParams {
  library: Library | undefined;
  libraryId: string;
  componentId?: string;
  existingComponent?: Component;
  addComponent: (libraryId: string, component: Component) => void;
  updateComponent: (libraryId: string, component: Component) => void;
}

export interface UseComponentEditorReturn {
  name: string;
  setName: (value: string) => void;
  nameError: string;
  setNameError: (value: string) => void;
  pins: Pin[];
  setPins: (pins: Pin[]) => void;
  minWidth: number;
  setMinWidth: (value: number) => void;
  minHeight: number;
  setMinHeight: (value: number) => void;
  color: string;
  setColor: (value: string) => void;
  defaultLabelPosition: LabelPosition;
  setDefaultLabelPosition: (position: LabelPosition) => void;
  isDiscardOpen: boolean;
  setIsDiscardOpen: (open: boolean) => void;
  isJsonModalOpen: boolean;
  setIsJsonModalOpen: (open: boolean) => void;
  hasChanges: boolean;
  previewComponent: Component;
  appBarTitle: string;
  isEditMode: boolean;
  handleBack: () => void;
  handleDiscard: () => void;
  handleSave: () => void;
}

export function useComponentEditor(
  params: UseComponentEditorParams
): UseComponentEditorReturn {
  const {
    library,
    libraryId,
    componentId,
    existingComponent,
    addComponent,
    updateComponent,
  } = params;
  const navigate = useNavigate();
  const isEditMode = !!componentId;

  const [name, setName] = useState(existingComponent?.name ?? '');
  const [nameError, setNameError] = useState('');
  const [pins, setPins] = useState<Pin[]>(existingComponent?.pins ?? []);
  const [minWidth, setMinWidth] = useState(existingComponent?.minWidth ?? 4);
  const [minHeight, setMinHeight] = useState(existingComponent?.minHeight ?? 4);
  const [color, setColor] = useState(existingComponent?.color ?? '#1e293b');
  const [defaultLabelPosition, setDefaultLabelPosition] =
    useState<LabelPosition>(
      existingComponent?.defaultLabelPosition ?? 'center'
    );
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

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

  const previewComponent: Component = {
    id: componentId ?? 'preview',
    name,
    pins,
    minWidth,
    minHeight,
    color: color || undefined,
    defaultLabelPosition,
  };

  const appBarTitle = isEditMode
    ? `${library?.name ?? ''}  /  ${existingComponent?.name ?? ''}`
    : `${library?.name ?? ''}  /  New Component`;

  return {
    name,
    setName,
    nameError,
    setNameError,
    pins,
    setPins,
    minWidth,
    setMinWidth,
    minHeight,
    setMinHeight,
    color,
    setColor,
    defaultLabelPosition,
    setDefaultLabelPosition,
    isDiscardOpen,
    setIsDiscardOpen,
    isJsonModalOpen,
    setIsJsonModalOpen,
    hasChanges,
    previewComponent,
    appBarTitle,
    isEditMode,
    handleBack,
    handleDiscard,
    handleSave,
  };
}
