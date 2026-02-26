import { generatePath } from 'react-router-dom';

const COMPONENT_EDITOR_NEW = '/project/library/:libraryId/component/new';

const COMPONENT_EDITOR_EDIT =
  '/project/library/:libraryId/component/:componentId';

export const ROUTES = {
  HOME: '/',
  PROJECT: '/project',
  COMPONENT_EDITOR_NEW,
  COMPONENT_EDITOR_EDIT,

  toNewComponent: (libraryId: string) =>
    generatePath(COMPONENT_EDITOR_NEW, { libraryId }),

  toEditComponent: (libraryId: string, componentId: string) =>
    generatePath(COMPONENT_EDITOR_EDIT, { libraryId, componentId }),
} as const;
