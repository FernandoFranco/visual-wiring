export interface ComponentDragPayload {
  componentId: string;
  libraryId: string;
}

let _payload: ComponentDragPayload | null = null;

export function setComponentDragPayload(payload: ComponentDragPayload) {
  _payload = payload;
}

export function getComponentDragPayload(): ComponentDragPayload | null {
  return _payload;
}

export function clearComponentDragPayload() {
  _payload = null;
}
