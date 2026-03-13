import { Locate, RotateCw, Scissors, Trash2, X } from 'lucide-react';

import type { Component } from '../../types/component';
import type { PlacedComponent, Project } from '../../types/project';
import type { Wire } from '../../types/wire';
import { snapToGrid } from '../../utils/gridUtils';
import { splitSegmentWaypoints } from '../../utils/wireRouting';
import { ContextMenu } from '../ContextMenu';
import { PillButton } from '../PillButton';
import type {
  ContextMenuState,
  DropPreview,
  PanState,
  WireContextMenuState,
  WireCreationState,
} from './useProjectCanvasState';

export interface ProjectCanvasOverlayProps {
  project: Project | null;
  placedComponents: PlacedComponent[];
  dropPreview: DropPreview | null;
  wireInProgress: WireCreationState | null;
  isMoving: boolean;
  isOverTrash: boolean;
  pan: PanState;
  contextMenu: ContextMenuState | null;
  wireCtxMenu: WireContextMenuState | null;
  trashRef: React.RefObject<HTMLDivElement | null>;
  getWireEndpoints: (wire: Wire) => {
    startPlaced: PlacedComponent | null;
    endPlaced: PlacedComponent | null;
    startComp: Component | null;
    endComp: Component | null;
    startPt: { x: number; y: number };
    endPt: { x: number; y: number };
  } | null;
  onCancelWire: () => void;
  onResetPan: () => void;
  onCloseContextMenu: () => void;
  onCloseWireCtxMenu: () => void;
  onSetRotation: (instanceId: string, rotation: 0 | 90 | 180 | 270) => void;
  onRemovePlacedComponent: (instanceId: string) => void;
  onSetSelectedInstanceId: (id: string | null) => void;
  onUpdateWireWaypoints: (
    wireId: string,
    waypoints: { x: number; y: number }[]
  ) => void;
  onRemoveWire: (wireId: string) => void;
  onSetSelectedWireId: (id: string | null) => void;
}

export function ProjectCanvasOverlay(props: ProjectCanvasOverlayProps) {
  /* eslint-disable react-hooks/refs -- False positive: props contain state values (isMoving, isOverTrash,
     wireCtxMenu, contextMenu) that ESLint incorrectly flags as ref accesses. These are legitimate
     useState values passed as props, not refs. */
  return (
    <>
      {props.placedComponents.length === 0 && !props.dropPreview && (
        <div className="project-canvas__empty">
          <p>Drag components from the library to place them here</p>
        </div>
      )}

      {props.wireInProgress && (
        <PillButton
          icon={<X size={14} />}
          className="project-canvas__cancel-wire"
          onClick={e => {
            e.stopPropagation();
            props.onCancelWire();
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          Press Esc to cancel wire
        </PillButton>
      )}

      {(props.pan.x !== 0 || props.pan.y !== 0) && !props.isMoving && (
        <PillButton
          icon={<Locate size={14} />}
          className="project-canvas__reset-pan"
          onClick={e => {
            e.stopPropagation();
            props.onResetPan();
          }}
          onMouseDown={e => e.stopPropagation()}
          title="Reset view to origin"
        >
          Reset view
        </PillButton>
      )}

      {props.isMoving && (
        <div
          ref={props.trashRef}
          className={`project-canvas__trash${props.isOverTrash ? ' project-canvas__trash--active' : ''}`}
        >
          <Trash2 size={20} />
          <span>Drop to delete</span>
        </div>
      )}

      {props.wireCtxMenu?.kind === 'segment' && props.project && (
        <ContextMenu
          x={props.wireCtxMenu.x}
          y={props.wireCtxMenu.y}
          onClose={props.onCloseWireCtxMenu}
          items={[
            {
              label: 'Split here',
              icon: <Scissors size={13} />,
              onClick: () => {
                const wire = props.project!.wires?.find(
                  w => w.id === props.wireCtxMenu!.wireId
                );
                if (!wire) return;
                const eps = props.getWireEndpoints(wire);
                if (!eps) return;
                const allPts = [eps.startPt, ...wire.waypoints, eps.endPt];
                const seg = allPts[props.wireCtxMenu!.segmentIndex!];
                const nxt = allPts[props.wireCtxMenu!.segmentIndex! + 1];
                const isH = Math.abs(nxt.y - seg.y) <= Math.abs(nxt.x - seg.x);
                const mx = isH ? (seg.x + nxt.x) / 2 : seg.x;
                const my = isH ? seg.y : (seg.y + nxt.y) / 2;
                props.onUpdateWireWaypoints(
                  props.wireCtxMenu!.wireId,
                  splitSegmentWaypoints(
                    wire.waypoints,
                    props.wireCtxMenu!.segmentIndex!,
                    eps.startPt,
                    eps.endPt,
                    mx,
                    my,
                    snapToGrid
                  )
                );
                props.onCloseWireCtxMenu();
              },
            },
            {
              label: 'Delete wire',
              icon: <Trash2 size={13} />,
              danger: true,
              shortcut: 'Del',
              onClick: () => {
                props.onRemoveWire(props.wireCtxMenu!.wireId);
                props.onSetSelectedWireId(null);
                props.onCloseWireCtxMenu();
              },
            },
          ]}
        />
      )}

      {props.wireCtxMenu?.kind === 'waypoint' && props.project && (
        <ContextMenu
          x={props.wireCtxMenu.x}
          y={props.wireCtxMenu.y}
          onClose={props.onCloseWireCtxMenu}
          items={[
            {
              label: 'Remove waypoint',
              icon: <Trash2 size={13} />,
              danger: true,
              onClick: () => {
                const wire = props.project!.wires?.find(
                  w => w.id === props.wireCtxMenu!.wireId
                );
                if (!wire) return;
                props.onUpdateWireWaypoints(
                  props.wireCtxMenu!.wireId,
                  wire.waypoints.filter(
                    (_, i) => i !== props.wireCtxMenu!.waypointIndex
                  )
                );
                props.onCloseWireCtxMenu();
              },
            },
            {
              label: 'Delete wire',
              icon: <Trash2 size={13} />,
              danger: true,
              shortcut: 'Del',
              onClick: () => {
                props.onRemoveWire(props.wireCtxMenu!.wireId);
                props.onSetSelectedWireId(null);
                props.onCloseWireCtxMenu();
              },
            },
          ]}
        />
      )}

      {props.contextMenu &&
        (() => {
          const target = props.placedComponents.find(
            p => p.instanceId === props.contextMenu!.instanceId
          );
          if (!target) return null;
          return (
            <ContextMenu
              x={props.contextMenu.x}
              y={props.contextMenu.y}
              onClose={props.onCloseContextMenu}
              items={[
                {
                  label: 'Rotation',
                  icon: <RotateCw size={13} />,
                  subItems: [
                    {
                      label: '0°',
                      active: (target.rotation ?? 0) === 0,
                      onClick: () =>
                        props.onSetRotation(props.contextMenu!.instanceId, 0),
                    },
                    {
                      label: '90°',
                      active: (target.rotation ?? 0) === 90,
                      onClick: () =>
                        props.onSetRotation(props.contextMenu!.instanceId, 90),
                    },
                    {
                      label: '180°',
                      active: (target.rotation ?? 0) === 180,
                      onClick: () =>
                        props.onSetRotation(props.contextMenu!.instanceId, 180),
                    },
                    {
                      label: '270°',
                      active: (target.rotation ?? 0) === 270,
                      onClick: () =>
                        props.onSetRotation(props.contextMenu!.instanceId, 270),
                    },
                  ],
                },
                {
                  label: 'Delete',
                  icon: <Trash2 size={13} />,
                  danger: true,
                  shortcut: 'Del',
                  onClick: () => {
                    props.onRemovePlacedComponent(
                      props.contextMenu!.instanceId
                    );
                    props.onSetSelectedInstanceId(null);
                  },
                },
              ]}
            />
          );
        })()}
    </>
  );
  /* eslint-enable react-hooks/refs */
}
