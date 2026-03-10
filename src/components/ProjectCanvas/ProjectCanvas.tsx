import './ProjectCanvas.css';

import { RotateCw, Trash2 } from 'lucide-react';
import {
  type DragEvent,
  type MouseEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

import { useProject } from '../../hooks/useProject';
import type { PlacedComponent } from '../../types/project';
import { centeredSnapPosition } from '../../utils/componentSize';
import { getComponentDragPayload } from '../../utils/dragState';
import { ComponentBody } from '../ComponentEditorCanvas';
import { ComponentPropertiesSidebar } from '../ComponentPropertiesSidebar';
import { ContextMenu } from '../ContextMenu';
import { GridCanvas } from '../GridCanvas';

const GRID = 10;
const snap = (v: number) => Math.round(v / GRID) * GRID;

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

export function ProjectCanvas() {
  const {
    project,
    placeComponent,
    movePlacedComponent,
    removePlacedComponent,
    setPlacedComponentRotation,
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

  const findComponent = useCallback(
    (libraryId: string, componentId: string) => {
      const lib = project?.libraries.find(l => l.id === libraryId);
      return lib?.components.find(c => c.id === componentId);
    },
    [project]
  );

  const getCenteredPos = useCallback(
    (
      clientX: number,
      clientY: number,
      libraryId: string,
      componentId: string
    ) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const comp = findComponent(libraryId, componentId);
      if (!comp)
        return { x: snap(clientX - rect.left), y: snap(clientY - rect.top) };
      return centeredSnapPosition(
        comp,
        GRID,
        clientX - rect.left,
        clientY - rect.top
      );
    },
    [findComponent]
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
      if (!moveState) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const rawX = e.clientX - rect.left - moveState.offsetX;
      const rawY = e.clientY - rect.top - moveState.offsetY;
      const nx = snap(rawX);
      const ny = snap(rawY);
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
    },
    [moveState]
  );

  const commitMove = useCallback(() => {
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
    }
    setMoveState(null);
    setIsOverTrash(false);
  }, [moveState, isOverTrash, movePlacedComponent, removePlacedComponent]);

  const startMove = useCallback((placed: PlacedComponent, e: MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    justSelectedRef.current = true;
    setSelectedInstanceId(placed.instanceId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMoveState({
      instanceId: placed.instanceId,
      offsetX: e.clientX - rect.left - placed.x,
      offsetY: e.clientY - rect.top - placed.y,
      currentX: placed.x,
      currentY: placed.y,
      hasMoved: false,
    });
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    setSelectedInstanceId(null);
    setContextMenu(null);
  }, []);

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
      className={`project-canvas${isMoving ? ' project-canvas--moving' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={commitMove}
      onMouseLeave={commitMove}
      onClick={handleCanvasClick}
      onContextMenu={e => e.preventDefault()}
    >
      <GridCanvas grid={GRID}>
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
              name={comp.name}
              pins={comp.pins}
              minWidth={comp.minWidth}
              minHeight={comp.minHeight}
              x={x}
              y={y}
              rotation={placed.rotation ?? 0}
              isDragging={currentlyMoving}
              isSelected={isSelected}
              onMouseDown={e => startMove(placed, e)}
              onContextMenu={e => handleContextMenu(placed, e)}
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
                name={comp.name}
                pins={comp.pins}
                minWidth={comp.minWidth}
                minHeight={comp.minHeight}
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
          rotation={selectedPlaced.rotation ?? 0}
          onRotationChange={r =>
            setPlacedComponentRotation(selectedPlaced.instanceId, r)
          }
          onClose={() => setSelectedInstanceId(null)}
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
