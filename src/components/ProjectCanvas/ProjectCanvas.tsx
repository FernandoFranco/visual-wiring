import './ProjectCanvas.css';

import { Locate, RotateCw, Scissors, Trash2, X } from 'lucide-react';
import {
  type DragEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useProject } from '../../hooks/useProject';
import type { Component } from '../../types/component';
import type { PlacedComponent } from '../../types/project';
import type { Wire, WireEndpoint } from '../../types/wire';
import { centeredSnapPosition } from '../../utils/componentSize';
import { getComponentDragPayload } from '../../utils/dragState';
import { GRID, snapToGrid } from '../../utils/gridUtils';
import { getPinConnectionPoint, getPinSide } from '../../utils/pinPosition';
import {
  buildAutoRouteWaypoints,
  buildPreviewPoints,
  computeSegmentDragWaypoints,
  splitSegmentWaypoints,
} from '../../utils/wireRouting';
import { CanvasWire, DEFAULT_WIRE_COLOR } from '../CanvasWire';
import { ComponentBody } from '../ComponentEditorCanvas';
import { ComponentPropertiesSidebar } from '../ComponentPropertiesSidebar';
import { ContextMenu } from '../ContextMenu';
import { GridCanvas } from '../GridCanvas';
import { PillButton } from '../PillButton';
import { WirePropertiesSidebar } from '../WirePropertiesSidebar';

interface MoveState {
  instanceId: string;
  offsetX: number;
  offsetY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
}

interface DropPreview {
  x: number;
  y: number;
  componentId: string;
  libraryId: string;
}

interface WireCreationState {
  start: WireEndpoint;
  startPinSide: 'up' | 'down' | 'left' | 'right';
  startPosition: { x: number; y: number };
  previewX: number;
  previewY: number;
  color?: string;
}

interface WireSegmentDragState {
  wireId: string;
  segmentIndex: number;
  isHorizontal: boolean;
  startMouseX: number;
  startMouseY: number;
  originalWaypoints: { x: number; y: number }[];
  liveWaypoints: { x: number; y: number }[];
}

interface WaypointDragState {
  wireId: string;
  waypointIndex: number;
  startMouseX: number;
  startMouseY: number;
  originalWaypoints: { x: number; y: number }[];
  liveWaypoints: { x: number; y: number }[];
}

export function ProjectCanvas() {
  const {
    project,
    placeComponent,
    movePlacedComponent,
    removePlacedComponent,
    setPlacedComponentRotation,
    updatePlacedComponentInstance,
    addWire,
    removeWire,
    updateWireWaypoints,
    updateWireColor,
  } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [moveState, setMoveState] = useState<MoveState | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    instanceId: string;
  } | null>(null);
  const [wireCtxMenu, setWireCtxMenu] = useState<
    | {
        kind: 'segment';
        x: number;
        y: number;
        wireId: string;
        segmentIndex: number;
      }
    | {
        kind: 'waypoint';
        x: number;
        y: number;
        wireId: string;
        waypointIndex: number;
      }
    | null
  >(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const justDraggedWireRef = useRef(false);
  const [wireSegDrag, setWireSegDrag] = useState<WireSegmentDragState | null>(
    null
  );
  const [waypointDrag, setWaypointDrag] = useState<WaypointDragState | null>(
    null
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panDragRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const [wireInProgress, setWireInProgressState] =
    useState<WireCreationState | null>(null);
  const isDrawingWireRef = useRef(false);

  const setWireInProgress = useCallback((w: WireCreationState | null) => {
    isDrawingWireRef.current = w !== null;
    setWireInProgressState(w);
  }, []);

  const findComponent = useCallback(
    (libraryId: string, componentId: string) => {
      const lib = project?.libraries.find(l => l.id === libraryId);
      return lib?.components.find(c => c.id === componentId);
    },
    [project]
  );

  const getEndpointPosition = useCallback(
    (endpoint: WireEndpoint): { x: number; y: number } | null => {
      if (endpoint.type === 'pin') {
        const placed = project?.placedComponents?.find(
          p => p.instanceId === endpoint.instanceId
        );
        if (!placed) return null;
        const comp = findComponent(placed.libraryId, placed.componentId);
        if (!comp) return null;
        return getPinConnectionPoint(placed, comp, endpoint.pinId, GRID);
      } else {
        const wire = project?.wires?.find(w => w.id === endpoint.wireId);
        if (!wire) return null;
        const waypoint = wire.waypoints[endpoint.waypointIndex];
        return waypoint ?? null;
      }
    },
    [project, findComponent]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDrawingWireRef.current) setWireInProgress(null);
        setSelectedWireId(null);
        setSelectedInstanceId(null);
      }
      if (e.key === 'Delete') {
        if (selectedWireId) {
          removeWire(selectedWireId);
          setSelectedWireId(null);
        } else if (selectedInstanceId) {
          removePlacedComponent(selectedInstanceId);
          setSelectedInstanceId(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    setWireInProgress,
    selectedWireId,
    selectedInstanceId,
    removeWire,
    removePlacedComponent,
  ]);

  const getCenteredPos = useCallback(
    (
      clientX: number,
      clientY: number,
      libraryId: string,
      componentId: string
    ) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const cx = clientX - rect.left - pan.x;
      const cy = clientY - rect.top - pan.y;
      const comp = findComponent(libraryId, componentId);
      if (!comp) return { x: snapToGrid(cx), y: snapToGrid(cy) };
      return centeredSnapPosition(comp, GRID, cx, cy);
    },
    [findComponent, pan]
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
        setDropPreview(prev => {
          if (prev?.x === pos.x && prev?.y === pos.y) return prev;
          return { ...pos, ...payload };
        });
      }
    },
    [getCenteredPos]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setDropPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropPreview(null);
      const raw = e.dataTransfer.getData('application/x-component');
      if (!raw) return;
      const { componentId, libraryId } = JSON.parse(raw) as {
        componentId: string;
        libraryId: string;
      };
      const pos = getCenteredPos(e.clientX, e.clientY, libraryId, componentId);
      placeComponent(libraryId, componentId, pos.x, pos.y);
    },
    [getCenteredPos, placeComponent]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const canvasX = rect ? e.clientX - rect.left - pan.x : 0;
      const canvasY = rect ? e.clientY - rect.top - pan.y : 0;

      if (moveState && rect) {
        const rawX = canvasX - moveState.offsetX;
        const rawY = canvasY - moveState.offsetY;
        const nx = snapToGrid(rawX);
        const ny = snapToGrid(rawY);
        if (nx !== moveState.currentX || ny !== moveState.currentY) {
          setMoveState(s =>
            s ? { ...s, currentX: nx, currentY: ny, hasMoved: true } : null
          );
        }
        const trashRect = trashRef.current?.getBoundingClientRect();
        const over =
          !!trashRect &&
          e.clientX >= trashRect.left &&
          e.clientX <= trashRect.right &&
          e.clientY >= trashRect.top &&
          e.clientY <= trashRect.bottom;
        setIsOverTrash(over);
      }
      if (panDragRef.current) {
        const dx = e.clientX - panDragRef.current.startMouseX;
        const dy = e.clientY - panDragRef.current.startMouseY;
        setPan({
          x: panDragRef.current.startPanX + dx,
          y: panDragRef.current.startPanY + dy,
        });
      }
      if (isDrawingWireRef.current) {
        setWireInProgressState(w =>
          w
            ? {
                ...w,
                previewX: snapToGrid(canvasX),
                previewY: snapToGrid(canvasY),
              }
            : null
        );
      }
      if (wireSegDrag) {
        const dx = e.clientX - wireSegDrag.startMouseX;
        const dy = e.clientY - wireSegDrag.startMouseY;
        const delta = wireSegDrag.isHorizontal ? dy : dx;
        const newWaypoints = computeSegmentDragWaypoints(
          wireSegDrag.originalWaypoints,
          wireSegDrag.segmentIndex,
          wireSegDrag.isHorizontal,
          delta,
          snapToGrid
        );
        setWireSegDrag(s => (s ? { ...s, liveWaypoints: newWaypoints } : null));
      }
      if (waypointDrag) {
        const dx = e.clientX - waypointDrag.startMouseX;
        const dy = e.clientY - waypointDrag.startMouseY;
        const original =
          waypointDrag.originalWaypoints[waypointDrag.waypointIndex];
        if (original) {
          const newX = snapToGrid(original.x + dx);
          const newY = snapToGrid(original.y + dy);
          const newWaypoints = [...waypointDrag.liveWaypoints];
          newWaypoints[waypointDrag.waypointIndex] = { x: newX, y: newY };
          setWaypointDrag(s =>
            s ? { ...s, liveWaypoints: newWaypoints } : null
          );
        }
      }
    },
    [moveState, pan, wireSegDrag, waypointDrag]
  );

  const commitMove = useCallback(() => {
    panDragRef.current = null;
    setIsPanning(false);
    if (wireSegDrag) {
      const hasMoved =
        wireSegDrag.liveWaypoints.length !==
          wireSegDrag.originalWaypoints.length ||
        wireSegDrag.liveWaypoints.some(
          (wp, i) =>
            wp.x !== wireSegDrag.originalWaypoints[i]?.x ||
            wp.y !== wireSegDrag.originalWaypoints[i]?.y
        );
      updateWireWaypoints(wireSegDrag.wireId, wireSegDrag.liveWaypoints);
      setWireSegDrag(null);
      if (hasMoved) justDraggedWireRef.current = true;
      return;
    }
    if (waypointDrag) {
      const hasMoved = waypointDrag.liveWaypoints.some(
        (wp, i) =>
          wp.x !== waypointDrag.originalWaypoints[i]?.x ||
          wp.y !== waypointDrag.originalWaypoints[i]?.y
      );
      updateWireWaypoints(waypointDrag.wireId, waypointDrag.liveWaypoints);
      setWaypointDrag(null);
      if (hasMoved) justDraggedWireRef.current = true;
      return;
    }
    if (!moveState) return;
    if (isOverTrash) {
      removePlacedComponent(moveState.instanceId);
      setSelectedInstanceId(null);
    } else if (moveState.hasMoved) {
      movePlacedComponent(
        moveState.instanceId,
        moveState.currentX,
        moveState.currentY
      );
    } else {
      justSelectedRef.current = true;
      setSelectedInstanceId(moveState.instanceId);
      setSelectedWireId(null);
    }
    setMoveState(null);
    setIsOverTrash(false);
  }, [
    wireSegDrag,
    waypointDrag,
    updateWireWaypoints,
    moveState,
    isOverTrash,
    movePlacedComponent,
    removePlacedComponent,
  ]);

  const startMove = useCallback(
    (placed: PlacedComponent, e: MouseEvent) => {
      if (e.button !== 0) return;
      if (isDrawingWireRef.current) return;
      e.stopPropagation();
      panDragRef.current = null;
      setIsPanning(false);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMoveState({
        instanceId: placed.instanceId,
        offsetX: e.clientX - rect.left - pan.x - placed.x,
        offsetY: e.clientY - rect.top - pan.y - placed.y,
        currentX: placed.x,
        currentY: placed.y,
        hasMoved: false,
      });
    },
    [pan]
  );

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (isDrawingWireRef.current) return;
      panDragRef.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
      setIsPanning(true);
    },
    [pan]
  );

  const handleCanvasClick = useCallback(() => {
    if (isDrawingWireRef.current) {
      setWireInProgress(null);
      return;
    }
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    setSelectedInstanceId(null);
    setSelectedWireId(null);
    setContextMenu(null);
  }, [setWireInProgress]);

  const handleContextMenu = useCallback(
    (placed: PlacedComponent, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        instanceId: placed.instanceId,
      });
    },
    []
  );

  const handlePinDown = useCallback(
    (instanceId: string, pinId: string, e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      const canvasX = rect ? snapToGrid(e.clientX - rect.left - pan.x) : 0;
      const canvasY = rect ? snapToGrid(e.clientY - rect.top - pan.y) : 0;

      if (!isDrawingWireRef.current) {
        const placedForPin = project?.placedComponents?.find(
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

        setWireInProgress({
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
        setWireInProgressState(current => {
          if (!current) return null;

          if (
            current.start.type === 'pin' &&
            current.start.instanceId === instanceId &&
            current.start.pinId === pinId
          ) {
            isDrawingWireRef.current = false;
            return null;
          }

          let waypoints: { x: number; y: number }[] = [];
          if (project) {
            const placed = project.placedComponents ?? [];
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
                    current.startPosition,
                    current.startPinSide,
                    endPt,
                    snapToGrid
                  );
                }
              }
            }
          }

          const wire: Wire = {
            id: crypto.randomUUID(),
            start: current.start,
            end: {
              type: 'pin',
              instanceId,
              pinId,
            },
            waypoints,
            color: current.color,
          };
          addWire(wire);
          isDrawingWireRef.current = false;
          return null;
        });
      }
    },
    [pan, setWireInProgress, addWire, project, findComponent]
  );

  const handleWaypointClick = useCallback(
    (wireId: string, waypointIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      const canvasX = rect ? snapToGrid(e.clientX - rect.left - pan.x) : 0;
      const canvasY = rect ? snapToGrid(e.clientY - rect.top - pan.y) : 0;

      const sourceWire = project?.wires?.find(w => w.id === wireId);
      if (!sourceWire) return;

      const waypointPos = sourceWire.waypoints[waypointIndex];
      if (!waypointPos) return;

      if (!isDrawingWireRef.current) {
        setWireInProgress({
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
        setWireInProgressState(current => {
          if (!current) return null;

          if (
            current.start.type === 'waypoint' &&
            current.start.wireId === wireId &&
            current.start.waypointIndex === waypointIndex
          ) {
            isDrawingWireRef.current = false;
            return null;
          }

          const wire: Wire = {
            id: crypto.randomUUID(),
            start: current.start,
            end: {
              type: 'waypoint',
              wireId,
              waypointIndex,
            },
            waypoints: buildAutoRouteWaypoints(
              current.startPosition,
              current.startPinSide,
              waypointPos,
              snapToGrid
            ),
            color: current.color,
          };
          addWire(wire);
          isDrawingWireRef.current = false;
          return null;
        });
      }
    },
    [pan, setWireInProgress, addWire, project]
  );

  const handleSegmentMouseDown = useCallback(
    (
      wireId: string,
      segmentIndex: number,
      isHorizontal: boolean,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
      const wire = project?.wires?.find(w => w.id === wireId);
      if (!wire) return;
      setWireSegDrag({
        wireId,
        segmentIndex,
        isHorizontal,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        originalWaypoints: [...wire.waypoints],
        liveWaypoints: [...wire.waypoints],
      });
    },
    [project]
  );

  const handleWaypointMouseDown = useCallback(
    (wireId: string, waypointIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const wire = project?.wires?.find(w => w.id === wireId);
      if (!wire) return;
      setWaypointDrag({
        wireId,
        waypointIndex,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        originalWaypoints: [...wire.waypoints],
        liveWaypoints: [...wire.waypoints],
      });
    },
    [project]
  );

  const handleWireClick = useCallback((wireId: string, e: React.MouseEvent) => {
    if (isDrawingWireRef.current) return;
    if (justDraggedWireRef.current) {
      justDraggedWireRef.current = false;
      return;
    }
    e.stopPropagation();
    setSelectedWireId(wireId);
    setSelectedInstanceId(null);
  }, []);

  const getWireEndpoints = useCallback(
    (wire: Wire) => {
      const startPt = getEndpointPosition(wire.start);
      const endPt = getEndpointPosition(wire.end);
      if (!startPt || !endPt) return null;

      let startPlaced: PlacedComponent | undefined;
      let startComp: Component | undefined;
      let endPlaced: PlacedComponent | undefined;
      let endComp: Component | undefined;

      if (wire.start.type === 'pin') {
        const placed = project?.placedComponents ?? [];
        const instanceId = wire.start.instanceId;
        startPlaced = placed.find(p => p.instanceId === instanceId);
        if (startPlaced) {
          startComp = findComponent(
            startPlaced.libraryId,
            startPlaced.componentId
          );
        }
      }

      if (wire.end.type === 'pin') {
        const placed = project?.placedComponents ?? [];
        const instanceId = wire.end.instanceId;
        endPlaced = placed.find(p => p.instanceId === instanceId);
        if (endPlaced) {
          endComp = findComponent(endPlaced.libraryId, endPlaced.componentId);
        }
      }

      return { startPlaced, endPlaced, startComp, endComp, startPt, endPt };
    },
    [project, findComponent, getEndpointPosition]
  );

  const handleGhostClick = useCallback(
    (wireId: string, segmentIndex: number, ghostX: number, ghostY: number) => {
      if (isDrawingWireRef.current) return;
      const wire = project?.wires?.find(w => w.id === wireId);
      if (!wire) return;
      const eps = getWireEndpoints(wire);
      if (!eps) return;
      const newWaypoints = splitSegmentWaypoints(
        wire.waypoints,
        segmentIndex,
        eps.startPt,
        eps.endPt,
        ghostX,
        ghostY,
        snapToGrid
      );
      updateWireWaypoints(wireId, newWaypoints);
    },
    [project, getWireEndpoints, updateWireWaypoints]
  );

  if (!project) return null;

  const placedComponents = project.placedComponents ?? [];
  const isMoving = moveState !== null;
  const hiddenInstanceId = isOverTrash ? moveState?.instanceId : null;

  const selectedPlaced = selectedInstanceId
    ? placedComponents.find(p => p.instanceId === selectedInstanceId)
    : null;
  const selectedComp = selectedPlaced
    ? findComponent(selectedPlaced.libraryId, selectedPlaced.componentId)
    : null;

  return (
    <div
      ref={containerRef}
      className={[
        'project-canvas',
        isMoving || wireSegDrag ? 'project-canvas--moving' : '',
        isPanning ? 'project-canvas--panning' : '',
        wireInProgress ? 'project-canvas--drawing-wire' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={commitMove}
      onMouseLeave={commitMove}
      onClick={handleCanvasClick}
      onContextMenu={e => e.preventDefault()}
    >
      <GridCanvas grid={GRID} panX={pan.x} panY={pan.y}>
        {(project?.wires ?? []).map(wire => {
          const eps = getWireEndpoints(wire);
          if (!eps) return null;
          const { startPt, endPt } = eps;

          return (
            <CanvasWire
              key={wire.id}
              color={wire.color ?? DEFAULT_WIRE_COLOR}
              isSelected={selectedWireId === wire.id}
              points={[
                startPt,
                ...(wireSegDrag?.wireId === wire.id
                  ? wireSegDrag.liveWaypoints
                  : waypointDrag?.wireId === wire.id
                    ? waypointDrag.liveWaypoints
                    : wire.waypoints),
                endPt,
              ]}
              onWireClick={e => handleWireClick(wire.id, e)}
              onSegmentMouseDown={(segIdx, isHoriz, e) =>
                handleSegmentMouseDown(wire.id, segIdx, isHoriz, e)
              }
              onWaypointMouseDown={(wpIdx, e) =>
                handleWaypointMouseDown(wire.id, wpIdx, e)
              }
              onWaypointClick={(wpIdx, e) =>
                handleWaypointClick(wire.id, wpIdx, e)
              }
              onGhostClick={(segIdx, gx, gy) =>
                handleGhostClick(wire.id, segIdx, gx, gy)
              }
              onSegmentContextMenu={(segIdx, mx, my) =>
                setWireCtxMenu({
                  kind: 'segment',
                  x: mx,
                  y: my,
                  wireId: wire.id,
                  segmentIndex: segIdx,
                })
              }
              onWaypointContextMenu={(wpIdx, mx, my) =>
                setWireCtxMenu({
                  kind: 'waypoint',
                  x: mx,
                  y: my,
                  wireId: wire.id,
                  waypointIndex: wpIdx,
                })
              }
            />
          );
        })}

        {wireInProgress &&
          (() => {
            const startPt = wireInProgress.startPosition;
            if (!startPt) return null;
            return (
              <CanvasWire
                inProgress
                points={buildPreviewPoints(
                  startPt,
                  wireInProgress.startPinSide,
                  { x: wireInProgress.previewX, y: wireInProgress.previewY }
                )}
                color={wireInProgress.color}
              />
            );
          })()}

        {placedComponents.map(placed => {
          const comp = findComponent(placed.libraryId, placed.componentId);
          if (!comp) return null;
          const currentlyMoving = moveState?.instanceId === placed.instanceId;
          if (hiddenInstanceId === placed.instanceId) return null;
          const x = currentlyMoving ? moveState!.currentX : placed.x;
          const y = currentlyMoving ? moveState!.currentY : placed.y;
          const isSelected = placed.instanceId === selectedInstanceId;
          return (
            <ComponentBody
              key={placed.instanceId}
              component={comp}
              displayLabel={placed.alias || comp.name}
              labelPosition={placed.labelPosition}
              x={x}
              y={y}
              rotation={placed.rotation ?? 0}
              isDragging={currentlyMoving}
              isSelected={isSelected}
              onMouseDown={e => startMove(placed, e)}
              onContextMenu={e => handleContextMenu(placed, e)}
              onPinDown={(pinId, e) =>
                handlePinDown(placed.instanceId, pinId, e)
              }
            />
          );
        })}

        {dropPreview &&
          (() => {
            const comp = findComponent(
              dropPreview.libraryId,
              dropPreview.componentId
            );
            if (!comp) return null;
            return (
              <ComponentBody
                component={comp}
                x={dropPreview.x}
                y={dropPreview.y}
                isDragging
              />
            );
          })()}
      </GridCanvas>

      {placedComponents.length === 0 && !dropPreview && (
        <div className="project-canvas__empty">
          <p>Drag components from the library to place them here</p>
        </div>
      )}

      {wireInProgress && (
        <PillButton
          icon={<X size={14} />}
          className="project-canvas__cancel-wire"
          onClick={e => {
            e.stopPropagation();
            setWireInProgress(null);
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          Press Esc to cancel wire
        </PillButton>
      )}

      {(pan.x !== 0 || pan.y !== 0) && !isMoving && (
        <PillButton
          icon={<Locate size={14} />}
          className="project-canvas__reset-pan"
          onClick={e => {
            e.stopPropagation();
            setPan({ x: 0, y: 0 });
          }}
          onMouseDown={e => e.stopPropagation()}
          title="Reset view to origin"
        >
          Reset view
        </PillButton>
      )}

      {isMoving && (
        <div
          ref={trashRef}
          className={`project-canvas__trash${isOverTrash ? ' project-canvas__trash--active' : ''}`}
        >
          <Trash2 size={20} />
          <span>Drop to delete</span>
        </div>
      )}

      {selectedPlaced && selectedComp && (
        <ComponentPropertiesSidebar
          componentName={selectedComp.name}
          instanceId={selectedPlaced.instanceId}
          pinCount={selectedComp.pins.length}
          x={selectedPlaced.x}
          y={selectedPlaced.y}
          rotation={selectedPlaced.rotation ?? 0}
          onRotationChange={r =>
            setPlacedComponentRotation(selectedPlaced.instanceId, r)
          }
          alias={selectedPlaced.alias ?? ''}
          onAliasChange={a =>
            updatePlacedComponentInstance(selectedPlaced.instanceId, {
              alias: a,
            })
          }
          labelPosition={selectedPlaced.labelPosition ?? 'center'}
          onLabelPositionChange={pos =>
            updatePlacedComponentInstance(selectedPlaced.instanceId, {
              labelPosition: pos,
            })
          }
          onClose={() => setSelectedInstanceId(null)}
        />
      )}

      {selectedWireId &&
        (() => {
          const wire = project?.wires?.find(w => w.id === selectedWireId);
          if (!wire) return null;
          const eps = getWireEndpoints(wire);
          if (!eps) return null;

          let startLabel = 'Unknown';
          let endLabel = 'Unknown';

          if (wire.start.type === 'pin' && eps.startComp) {
            const pinId = wire.start.pinId;
            const startPin = eps.startComp.pins.find(
              (p: { id: string; name?: string }) => p.id === pinId
            );
            startLabel = `${eps.startComp.name} / ${startPin?.name ?? pinId}`;
          } else if (wire.start.type === 'waypoint') {
            const wireId = wire.start.wireId;
            const sourceWire = project?.wires?.find(w => w.id === wireId);
            startLabel = `Waypoint on Wire ${sourceWire ? sourceWire.id.substring(0, 8) : wireId}`;
          }

          if (wire.end.type === 'pin' && eps.endComp) {
            const pinId = wire.end.pinId;
            const endPin = eps.endComp.pins.find(
              (p: { id: string; name?: string }) => p.id === pinId
            );
            endLabel = `${eps.endComp.name} / ${endPin?.name ?? pinId}`;
          } else if (wire.end.type === 'waypoint') {
            const wireId = wire.end.wireId;
            const sourceWire = project?.wires?.find(w => w.id === wireId);
            endLabel = `Waypoint on Wire ${sourceWire ? sourceWire.id.substring(0, 8) : wireId}`;
          }

          return (
            <WirePropertiesSidebar
              wireId={wire.id}
              startLabel={startLabel}
              endLabel={endLabel}
              color={wire.color ?? DEFAULT_WIRE_COLOR}
              onColorChange={c => updateWireColor(wire.id, c)}
              onClose={() => setSelectedWireId(null)}
            />
          );
        })()}

      {wireCtxMenu?.kind === 'segment' && (
        <ContextMenu
          x={wireCtxMenu.x}
          y={wireCtxMenu.y}
          onClose={() => setWireCtxMenu(null)}
          items={[
            {
              label: 'Split here',
              icon: <Scissors size={13} />,
              onClick: () => {
                const wire = project.wires?.find(
                  w => w.id === wireCtxMenu.wireId
                );
                if (!wire) return;
                const eps = getWireEndpoints(wire);
                if (!eps) return;
                const allPts = [eps.startPt, ...wire.waypoints, eps.endPt];
                const seg = allPts[wireCtxMenu.segmentIndex];
                const nxt = allPts[wireCtxMenu.segmentIndex + 1];
                const isH = Math.abs(nxt.y - seg.y) <= Math.abs(nxt.x - seg.x);
                const mx = isH ? (seg.x + nxt.x) / 2 : seg.x;
                const my = isH ? seg.y : (seg.y + nxt.y) / 2;
                updateWireWaypoints(
                  wireCtxMenu.wireId,
                  splitSegmentWaypoints(
                    wire.waypoints,
                    wireCtxMenu.segmentIndex,
                    eps.startPt,
                    eps.endPt,
                    mx,
                    my,
                    snapToGrid
                  )
                );
                setWireCtxMenu(null);
              },
            },
            {
              label: 'Delete wire',
              icon: <Trash2 size={13} />,
              danger: true,
              shortcut: 'Del',
              onClick: () => {
                removeWire(wireCtxMenu.wireId);
                setSelectedWireId(null);
                setWireCtxMenu(null);
              },
            },
          ]}
        />
      )}

      {wireCtxMenu?.kind === 'waypoint' && (
        <ContextMenu
          x={wireCtxMenu.x}
          y={wireCtxMenu.y}
          onClose={() => setWireCtxMenu(null)}
          items={[
            {
              label: 'Remove waypoint',
              icon: <Trash2 size={13} />,
              danger: true,
              onClick: () => {
                const wire = project.wires?.find(
                  w => w.id === wireCtxMenu.wireId
                );
                if (!wire) return;
                updateWireWaypoints(
                  wireCtxMenu.wireId,
                  wire.waypoints.filter(
                    (_, i) => i !== wireCtxMenu.waypointIndex
                  )
                );
                setWireCtxMenu(null);
              },
            },
            {
              label: 'Delete wire',
              icon: <Trash2 size={13} />,
              danger: true,
              shortcut: 'Del',
              onClick: () => {
                removeWire(wireCtxMenu.wireId);
                setSelectedWireId(null);
                setWireCtxMenu(null);
              },
            },
          ]}
        />
      )}

      {contextMenu &&
        (() => {
          const target = placedComponents.find(
            p => p.instanceId === contextMenu.instanceId
          );
          if (!target) return null;
          return (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              items={[
                {
                  label: 'Rotation',
                  icon: <RotateCw size={13} />,
                  subItems: [
                    {
                      label: '0°',
                      active: (target.rotation ?? 0) === 0,
                      onClick: () =>
                        setPlacedComponentRotation(contextMenu.instanceId, 0),
                    },
                    {
                      label: '90°',
                      active: (target.rotation ?? 0) === 90,
                      onClick: () =>
                        setPlacedComponentRotation(contextMenu.instanceId, 90),
                    },
                    {
                      label: '180°',
                      active: (target.rotation ?? 0) === 180,
                      onClick: () =>
                        setPlacedComponentRotation(contextMenu.instanceId, 180),
                    },
                    {
                      label: '270°',
                      active: (target.rotation ?? 0) === 270,
                      onClick: () =>
                        setPlacedComponentRotation(contextMenu.instanceId, 270),
                    },
                  ],
                },
                {
                  label: 'Delete',
                  icon: <Trash2 size={13} />,
                  danger: true,
                  shortcut: 'Del',
                  onClick: () => {
                    removePlacedComponent(contextMenu.instanceId);
                    setSelectedInstanceId(null);
                  },
                },
              ]}
            />
          );
        })()}
    </div>
  );
}
