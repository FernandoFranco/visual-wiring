import { type DragEvent, type MouseEvent, useCallback, useEffect } from 'react';

import type { PlacedComponent, Project } from '../../types/project';
import type { Wire } from '../../types/wire';
import { centeredSnapPosition } from '../../utils/componentSize';
import { getComponentDragPayload } from '../../utils/dragState';
import { snapToGrid } from '../../utils/gridUtils';
import { getPinConnectionPoint, getPinSide } from '../../utils/pinPosition';
import {
  buildAutoRouteWaypoints,
  computeSegmentDragWaypoints,
} from '../../utils/wireRouting';
import type {
  ContextMenuState,
  DropPreview,
  MoveState,
  PanState,
  WaypointDragState,
  WireContextMenuState,
  WireCreationState,
  WireSegmentDragState,
} from './useProjectCanvasState';

const GRID = 10;

interface ProjectCanvasHandlersProps {
  project: Project | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  trashRef: React.RefObject<HTMLDivElement | null>;
  justSelectedRef: React.MutableRefObject<boolean>;
  justDraggedWireRef: React.MutableRefObject<boolean>;
  isDrawingWireRef: React.MutableRefObject<boolean>;
  panDragRef: React.MutableRefObject<{
    startMouseX: number;
    startMouseY: number;
    startPanX: number;
    startPanY: number;
  } | null>;
  dropPreview: DropPreview | null;
  setDropPreview: React.Dispatch<React.SetStateAction<DropPreview | null>>;
  moveState: MoveState | null;
  setMoveState: React.Dispatch<React.SetStateAction<MoveState | null>>;
  isOverTrash: boolean;
  setIsOverTrash: React.Dispatch<React.SetStateAction<boolean>>;
  selectedInstanceId: string | null;
  setSelectedInstanceId: React.Dispatch<React.SetStateAction<string | null>>;
  contextMenu: ContextMenuState | null;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState | null>>;
  wireCtxMenu: WireContextMenuState | null;
  setWireCtxMenu: React.Dispatch<
    React.SetStateAction<WireContextMenuState | null>
  >;
  selectedWireId: string | null;
  setSelectedWireId: React.Dispatch<React.SetStateAction<string | null>>;
  wireSegDrag: WireSegmentDragState | null;
  setWireSegDrag: React.Dispatch<
    React.SetStateAction<WireSegmentDragState | null>
  >;
  waypointDrag: WaypointDragState | null;
  setWaypointDrag: React.Dispatch<
    React.SetStateAction<WaypointDragState | null>
  >;
  pan: PanState;
  setPan: React.Dispatch<React.SetStateAction<PanState>>;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  wireInProgress: WireCreationState | null;
  setWireInProgress: React.Dispatch<
    React.SetStateAction<WireCreationState | null>
  >;
  placeComponent: (
    libraryId: string,
    componentId: string,
    x: number,
    y: number
  ) => void;
  movePlacedComponent: (instanceId: string, x: number, y: number) => void;
  removePlacedComponent: (instanceId: string) => void;
  addWire: (wire: Wire) => void;
  removeWire: (wireId: string) => void;
  updateWireWaypoints: (
    wireId: string,
    waypoints: { x: number; y: number }[]
  ) => void;
}

export function useProjectCanvasHandlers(props: ProjectCanvasHandlersProps) {
  // Extract refs to local variables to avoid ESLint react-hooks/immutability errors
  const justSelectedRef = props.justSelectedRef;
  const justDraggedWireRef = props.justDraggedWireRef;
  const isDrawingWireRef = props.isDrawingWireRef;
  const panDragRef = props.panDragRef;

  const findComponent = useCallback(
    (libraryId: string, componentId: string) => {
      const lib = props.project?.libraries.find(l => l.id === libraryId);
      return lib?.components.find(c => c.id === componentId);
    },
    [props.project]
  );

  const getCenteredPos = useCallback(
    (
      clientX: number,
      clientY: number,
      libraryId: string,
      componentId: string
    ) => {
      const rect = props.containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const cx = clientX - rect.left - props.pan.x;
      const cy = clientY - rect.top - props.pan.y;
      const comp = findComponent(libraryId, componentId);
      if (!comp) return { x: snapToGrid(cx), y: snapToGrid(cy) };
      return centeredSnapPosition(comp, GRID, cx, cy);
    },
    [findComponent, props.containerRef, props.pan]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (!e.dataTransfer.types.includes('application/x-component')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      const payload = getComponentDragPayload();
      if (payload) {
        const pos = getCenteredPos(
          e.clientX,
          e.clientY,
          payload.libraryId,
          payload.componentId
        );
        props.setDropPreview((prev: DropPreview | null) => {
          if (prev?.x === pos.x && prev?.y === pos.y) return prev;
          return { ...pos, ...payload };
        });
      }
    },
    [getCenteredPos, props]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (!props.containerRef.current?.contains(e.relatedTarget as Node)) {
        props.setDropPreview(null);
      }
    },
    [props]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      props.setDropPreview(null);
      const raw = e.dataTransfer.getData('application/x-component');
      if (!raw) return;
      const parsedData = JSON.parse(raw) as {
        componentId: string;
        libraryId: string;
      };
      const pos = getCenteredPos(
        e.clientX,
        e.clientY,
        parsedData.libraryId,
        parsedData.componentId
      );
      props.placeComponent(
        parsedData.libraryId,
        parsedData.componentId,
        pos.x,
        pos.y
      );
    },
    [getCenteredPos, props]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const rect = props.containerRef.current?.getBoundingClientRect();
      const canvasX = rect ? e.clientX - rect.left - props.pan.x : 0;
      const canvasY = rect ? e.clientY - rect.top - props.pan.y : 0;

      if (props.moveState && rect) {
        const rawX = canvasX - props.moveState.offsetX;
        const rawY = canvasY - props.moveState.offsetY;
        const nx = snapToGrid(rawX);
        const ny = snapToGrid(rawY);
        if (
          nx !== props.moveState.currentX ||
          ny !== props.moveState.currentY
        ) {
          props.setMoveState(s =>
            s ? { ...s, currentX: nx, currentY: ny, hasMoved: true } : null
          );
        }
        const trashRect = props.trashRef.current?.getBoundingClientRect();
        const over =
          !!trashRect &&
          e.clientX >= trashRect.left &&
          e.clientX <= trashRect.right &&
          e.clientY >= trashRect.top &&
          e.clientY <= trashRect.bottom;
        props.setIsOverTrash(over);
      }
      if (panDragRef.current) {
        const dx = e.clientX - panDragRef.current.startMouseX;
        const dy = e.clientY - panDragRef.current.startMouseY;
        props.setPan({
          x: panDragRef.current.startPanX + dx,
          y: panDragRef.current.startPanY + dy,
        });
      }
      if (isDrawingWireRef.current) {
        props.setWireInProgress(w =>
          w
            ? {
                ...w,
                previewX: snapToGrid(canvasX),
                previewY: snapToGrid(canvasY),
              }
            : null
        );
      }
      if (props.wireSegDrag) {
        const dx = e.clientX - props.wireSegDrag.startMouseX;
        const dy = e.clientY - props.wireSegDrag.startMouseY;
        const delta = props.wireSegDrag.isHorizontal ? dy : dx;
        const newWaypoints = computeSegmentDragWaypoints(
          props.wireSegDrag.originalWaypoints,
          props.wireSegDrag.segmentIndex,
          props.wireSegDrag.isHorizontal,
          delta,
          snapToGrid
        );
        props.setWireSegDrag(s =>
          s ? { ...s, liveWaypoints: newWaypoints } : null
        );
      }
      if (props.waypointDrag) {
        const dx = e.clientX - props.waypointDrag.startMouseX;
        const dy = e.clientY - props.waypointDrag.startMouseY;
        const original =
          props.waypointDrag.originalWaypoints[
            props.waypointDrag.waypointIndex
          ];
        if (original) {
          const newX = snapToGrid(original.x + dx);
          const newY = snapToGrid(original.y + dy);
          const newWaypoints = [...props.waypointDrag.liveWaypoints];
          newWaypoints[props.waypointDrag.waypointIndex] = { x: newX, y: newY };
          props.setWaypointDrag(s =>
            s ? { ...s, liveWaypoints: newWaypoints } : null
          );
        }
      }
    },
    [props, isDrawingWireRef, panDragRef]
  );

  const commitMove = useCallback(() => {
    panDragRef.current = null;
    props.setIsPanning(false);
    if (props.wireSegDrag) {
      const hasMoved =
        props.wireSegDrag.liveWaypoints.length !==
          props.wireSegDrag.originalWaypoints.length ||
        props.wireSegDrag.liveWaypoints.some(
          (wp, i) =>
            wp.x !== props.wireSegDrag!.originalWaypoints[i]?.x ||
            wp.y !== props.wireSegDrag!.originalWaypoints[i]?.y
        );
      props.updateWireWaypoints(
        props.wireSegDrag.wireId,
        props.wireSegDrag.liveWaypoints
      );
      props.setWireSegDrag(null);
      if (hasMoved) justDraggedWireRef.current = true;
      return;
    }
    if (props.waypointDrag) {
      const hasMoved = props.waypointDrag.liveWaypoints.some(
        (wp, i) =>
          wp.x !== props.waypointDrag!.originalWaypoints[i]?.x ||
          wp.y !== props.waypointDrag!.originalWaypoints[i]?.y
      );
      props.updateWireWaypoints(
        props.waypointDrag.wireId,
        props.waypointDrag.liveWaypoints
      );
      props.setWaypointDrag(null);
      if (hasMoved) justDraggedWireRef.current = true;
      return;
    }
    if (!props.moveState) return;
    if (props.isOverTrash) {
      props.removePlacedComponent(props.moveState.instanceId);
      props.setSelectedInstanceId(null);
    } else if (props.moveState.hasMoved) {
      props.movePlacedComponent(
        props.moveState.instanceId,
        props.moveState.currentX,
        props.moveState.currentY
      );
    } else {
      justSelectedRef.current = true;
      props.setSelectedInstanceId(props.moveState.instanceId);
      props.setSelectedWireId(null);
    }
    props.setMoveState(null);
    props.setIsOverTrash(false);
  }, [justDraggedWireRef, justSelectedRef, panDragRef, props]);

  const startMove = useCallback(
    (placed: PlacedComponent, e: MouseEvent) => {
      if (e.button !== 0) return;
      if (isDrawingWireRef.current) return;
      e.stopPropagation();
      panDragRef.current = null;
      props.setIsPanning(false);
      const rect = props.containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      props.setMoveState({
        instanceId: placed.instanceId,
        offsetX: e.clientX - rect.left - props.pan.x - placed.x,
        offsetY: e.clientY - rect.top - props.pan.y - placed.y,
        currentX: placed.x,
        currentY: placed.y,
        hasMoved: false,
      });
    },
    [props, isDrawingWireRef, panDragRef]
  );

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (isDrawingWireRef.current) return;
      panDragRef.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPanX: props.pan.x,
        startPanY: props.pan.y,
      };
      props.setIsPanning(true);
    },
    [props, isDrawingWireRef, panDragRef]
  );

  const handleCanvasClick = useCallback(() => {
    if (isDrawingWireRef.current) {
      props.setWireInProgress(null);
      return;
    }
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    props.setSelectedInstanceId(null);
    props.setSelectedWireId(null);
    props.setContextMenu(null);
  }, [isDrawingWireRef, justSelectedRef, props]);

  const handleContextMenu = useCallback(
    (placed: PlacedComponent, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      props.setContextMenu({
        x: e.clientX,
        y: e.clientY,
        instanceId: placed.instanceId,
      });
    },
    [props]
  );

  const handlePinDown = useCallback(
    (instanceId: string, pinId: string, e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      const rect = props.containerRef.current?.getBoundingClientRect();
      const canvasX = rect
        ? snapToGrid(e.clientX - rect.left - props.pan.x)
        : 0;
      const canvasY = rect ? snapToGrid(e.clientY - rect.top - props.pan.y) : 0;

      if (!isDrawingWireRef.current) {
        const placedForPin = props.project?.placedComponents?.find(
          p => p.instanceId === instanceId
        );
        const compForPin = placedForPin
          ? findComponent(placedForPin.libraryId, placedForPin.componentId)
          : null;
        const pinSide = compForPin ? getPinSide(compForPin, pinId) : null;
        const startPosition =
          compForPin && placedForPin
            ? getPinConnectionPoint(placedForPin, compForPin, pinId, GRID)
            : null;

        if (!startPosition) return;

        props.setWireInProgress({
          start: {
            type: 'pin',
            instanceId,
            pinId,
          },
          startPinSide: pinSide ?? 'right',
          startPosition,
          previewX: canvasX,
          previewY: canvasY,
        });
      } else {
        const currentWire = props.wireInProgress;
        if (!currentWire) return;

        if (
          currentWire.start.type === 'pin' &&
          currentWire.start.instanceId === instanceId &&
          currentWire.start.pinId === pinId
        ) {
          isDrawingWireRef.current = false;
          props.setWireInProgress(null);
          return;
        }

        let waypoints: { x: number; y: number }[] = [];
        if (props.project) {
          const placed = props.project.placedComponents ?? [];
          const endPlaced = placed.find(p => p.instanceId === instanceId);
          if (endPlaced) {
            const endComp = findComponent(
              endPlaced.libraryId,
              endPlaced.componentId
            );
            if (endComp) {
              const endPt = getPinConnectionPoint(
                endPlaced,
                endComp,
                pinId,
                GRID
              );
              if (endPt) {
                waypoints = buildAutoRouteWaypoints(
                  currentWire.startPosition,
                  currentWire.startPinSide,
                  endPt,
                  snapToGrid
                );
              }
            }
          }
        }

        const wire: Wire = {
          id: crypto.randomUUID(),
          start: currentWire.start,
          end: {
            type: 'pin',
            instanceId,
            pinId,
          },
          waypoints,
          color: currentWire.color,
        };
        props.addWire(wire);
        isDrawingWireRef.current = false;
        props.setWireInProgress(null);
      }
    },
    [props, isDrawingWireRef, findComponent]
  );

  const handleWaypointClick = useCallback(
    (wireId: string, waypointIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const rect = props.containerRef.current?.getBoundingClientRect();
      const canvasX = rect
        ? snapToGrid(e.clientX - rect.left - props.pan.x)
        : 0;
      const canvasY = rect ? snapToGrid(e.clientY - rect.top - props.pan.y) : 0;

      const sourceWire = props.project?.wires?.find(w => w.id === wireId);
      if (!sourceWire) return;

      const waypointPos = sourceWire.waypoints[waypointIndex];
      if (!waypointPos) return;

      if (!isDrawingWireRef.current) {
        props.setWireInProgress({
          start: {
            type: 'waypoint',
            wireId,
            waypointIndex,
          },
          startPinSide: 'right',
          startPosition: waypointPos,
          previewX: canvasX,
          previewY: canvasY,
          color: sourceWire.color,
        });
      } else {
        const currentWire = props.wireInProgress;
        if (!currentWire) return;

        if (
          currentWire.start.type === 'waypoint' &&
          currentWire.start.wireId === wireId &&
          currentWire.start.waypointIndex === waypointIndex
        ) {
          isDrawingWireRef.current = false;
          props.setWireInProgress(null);
          return;
        }

        const wire: Wire = {
          id: crypto.randomUUID(),
          start: currentWire.start,
          end: {
            type: 'waypoint',
            wireId,
            waypointIndex,
          },
          waypoints: buildAutoRouteWaypoints(
            currentWire.startPosition,
            currentWire.startPinSide,
            waypointPos,
            snapToGrid
          ),
          color: currentWire.color,
        };
        props.addWire(wire);
        isDrawingWireRef.current = false;
        props.setWireInProgress(null);
      }
    },
    [props, isDrawingWireRef]
  );

  const handleSegmentMouseDown = useCallback(
    (
      wireId: string,
      segmentIndex: number,
      isHorizontal: boolean,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
      const wire = props.project?.wires?.find(w => w.id === wireId);
      if (!wire) return;
      props.setWireSegDrag({
        wireId,
        segmentIndex,
        isHorizontal,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        originalWaypoints: [...wire.waypoints],
        liveWaypoints: [...wire.waypoints],
      });
    },
    [props]
  );

  const handleWaypointMouseDown = useCallback(
    (wireId: string, waypointIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const wire = props.project?.wires?.find(w => w.id === wireId);
      if (!wire) return;
      props.setWaypointDrag({
        wireId,
        waypointIndex,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        originalWaypoints: [...wire.waypoints],
        liveWaypoints: [...wire.waypoints],
      });
    },
    [props]
  );

  const handleWireClick = useCallback(
    (wireId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (justDraggedWireRef.current) {
        justDraggedWireRef.current = false;
        return;
      }
      props.setSelectedWireId(wireId);
      props.setSelectedInstanceId(null);
    },
    [props, justDraggedWireRef]
  );

  const handleSegmentContextMenu = useCallback(
    (wireId: string, segmentIndex: number, mouseX: number, mouseY: number) => {
      props.setWireCtxMenu({
        kind: 'segment',
        x: mouseX,
        y: mouseY,
        wireId,
        segmentIndex,
      });
    },
    [props]
  );

  const handleWaypointContextMenu = useCallback(
    (wireId: string, waypointIndex: number, mouseX: number, mouseY: number) => {
      props.setWireCtxMenu({
        kind: 'waypoint',
        x: mouseX,
        y: mouseY,
        wireId,
        waypointIndex,
      });
    },
    [props]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDrawingWireRef.current) props.setWireInProgress(null);
        props.setSelectedWireId(null);
        props.setSelectedInstanceId(null);
      }
      if (e.key === 'Delete') {
        if (props.selectedWireId) {
          props.removeWire(props.selectedWireId);
          props.setSelectedWireId(null);
        } else if (props.selectedInstanceId) {
          props.removePlacedComponent(props.selectedInstanceId);
          props.setSelectedInstanceId(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable and don't need to be in deps
  }, [props]);

  return {
    findComponent,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleMouseMove,
    commitMove,
    startMove,
    handleCanvasMouseDown,
    handleCanvasClick,
    handleContextMenu,
    handlePinDown,
    handleWaypointClick,
    handleSegmentMouseDown,
    handleWaypointMouseDown,
    handleWireClick,
    handleSegmentContextMenu,
    handleWaypointContextMenu,
  };
}
