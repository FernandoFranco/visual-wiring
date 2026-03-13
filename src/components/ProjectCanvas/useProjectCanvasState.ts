import { useCallback, useRef, useState } from 'react';

import type { WireEndpoint } from '../../types/wire';

export interface MoveState {
  instanceId: string;
  offsetX: number;
  offsetY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
}

export interface DropPreview {
  x: number;
  y: number;
  componentId: string;
  libraryId: string;
}

export interface WireCreationState {
  start: WireEndpoint;
  startPinSide: 'up' | 'down' | 'left' | 'right';
  startPosition: { x: number; y: number };
  previewX: number;
  previewY: number;
  color?: string;
}

export interface WireSegmentDragState {
  wireId: string;
  segmentIndex: number;
  isHorizontal: boolean;
  startMouseX: number;
  startMouseY: number;
  originalWaypoints: { x: number; y: number }[];
  liveWaypoints: { x: number; y: number }[];
}

export interface WaypointDragState {
  wireId: string;
  waypointIndex: number;
  startMouseX: number;
  startMouseY: number;
  originalWaypoints: { x: number; y: number }[];
  liveWaypoints: { x: number; y: number }[];
}

export interface ContextMenuState {
  x: number;
  y: number;
  instanceId: string;
}

export interface WireContextMenuState {
  kind: 'segment' | 'waypoint';
  x: number;
  y: number;
  wireId: string;
  segmentIndex?: number;
  waypointIndex?: number;
}

export interface PanState {
  x: number;
  y: number;
}

export function useProjectCanvasState() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);
  const justDraggedWireRef = useRef(false);
  const isDrawingWireRef = useRef(false);
  const panDragRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [moveState, setMoveState] = useState<MoveState | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [wireCtxMenu, setWireCtxMenu] = useState<WireContextMenuState | null>(
    null
  );
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [wireSegDrag, setWireSegDrag] = useState<WireSegmentDragState | null>(
    null
  );
  const [waypointDrag, setWaypointDrag] = useState<WaypointDragState | null>(
    null
  );
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [wireInProgress, setWireInProgressState] =
    useState<WireCreationState | null>(null);

  const setWireInProgress = useCallback(
    (
      w:
        | WireCreationState
        | null
        | ((prev: WireCreationState | null) => WireCreationState | null)
    ) => {
      if (typeof w === 'function') {
        setWireInProgressState(prev => {
          const next = w(prev);
          isDrawingWireRef.current = next !== null;
          return next;
        });
      } else {
        isDrawingWireRef.current = w !== null;
        setWireInProgressState(w);
      }
    },
    []
  );

  return {
    containerRef,
    trashRef,
    justSelectedRef,
    justDraggedWireRef,
    isDrawingWireRef,
    panDragRef,
    dropPreview,
    setDropPreview,
    moveState,
    setMoveState,
    isOverTrash,
    setIsOverTrash,
    selectedInstanceId,
    setSelectedInstanceId,
    contextMenu,
    setContextMenu,
    wireCtxMenu,
    setWireCtxMenu,
    selectedWireId,
    setSelectedWireId,
    wireSegDrag,
    setWireSegDrag,
    waypointDrag,
    setWaypointDrag,
    pan,
    setPan,
    isPanning,
    setIsPanning,
    wireInProgress,
    setWireInProgress,
  };
}
