import type { Component } from '../../types/component';
import type { PlacedComponent } from '../../types/project';
import type { Wire } from '../../types/wire';
import { buildPreviewPoints } from '../../utils/wireRouting';
import { CanvasWire } from '../CanvasWire';
import type {
  WaypointDragState,
  WireCreationState,
  WireSegmentDragState,
} from './useProjectCanvasState';

const DEFAULT_WIRE_COLOR = '#00ffff';

export interface ProjectCanvasWiresProps {
  wires: Wire[];
  selectedWireId: string | null;
  wireSegDrag: WireSegmentDragState | null;
  waypointDrag: WaypointDragState | null;
  wireInProgress: WireCreationState | null;
  getWireEndpoints: (wire: Wire) => {
    startPlaced: PlacedComponent | null;
    endPlaced: PlacedComponent | null;
    startComp: Component | null;
    endComp: Component | null;
    startPt: { x: number; y: number };
    endPt: { x: number; y: number };
  } | null;
  onWireClick: (wireId: string, e: React.MouseEvent) => void;
  onSegmentMouseDown: (
    wireId: string,
    segIdx: number,
    isHoriz: boolean,
    e: React.MouseEvent
  ) => void;
  onWaypointMouseDown: (
    wireId: string,
    wpIdx: number,
    e: React.MouseEvent
  ) => void;
  onWaypointClick: (wireId: string, wpIdx: number, e: React.MouseEvent) => void;
  onGhostClick: (
    wireId: string,
    segIdx: number,
    gx: number,
    gy: number
  ) => void;
  onSegmentContextMenu: (
    wireId: string,
    segIdx: number,
    mx: number,
    my: number
  ) => void;
  onWaypointContextMenu: (
    wireId: string,
    wpIdx: number,
    mx: number,
    my: number
  ) => void;
}

export function ProjectCanvasWires(props: ProjectCanvasWiresProps) {
  return (
    <>
      {props.wires.map(wire => {
        const eps = props.getWireEndpoints(wire);
        if (!eps) return null;

        const points = [
          eps.startPt,
          ...(props.wireSegDrag?.wireId === wire.id
            ? props.wireSegDrag.liveWaypoints
            : props.waypointDrag?.wireId === wire.id
              ? props.waypointDrag.liveWaypoints
              : wire.waypoints),
          eps.endPt,
        ];

        return (
          <CanvasWire
            key={wire.id}
            color={wire.color ?? DEFAULT_WIRE_COLOR}
            isSelected={props.selectedWireId === wire.id}
            points={points}
            onWireClick={e => props.onWireClick(wire.id, e)}
            onSegmentMouseDown={(segIdx, isHoriz, e) =>
              props.onSegmentMouseDown(wire.id, segIdx, isHoriz, e)
            }
            onWaypointMouseDown={(wpIdx, e) =>
              props.onWaypointMouseDown(wire.id, wpIdx, e)
            }
            onWaypointClick={(wpIdx, e) =>
              props.onWaypointClick(wire.id, wpIdx, e)
            }
            onGhostClick={(segIdx, gx, gy) =>
              props.onGhostClick(wire.id, segIdx, gx, gy)
            }
            onSegmentContextMenu={(segIdx, mx, my) =>
              props.onSegmentContextMenu(wire.id, segIdx, mx, my)
            }
            onWaypointContextMenu={(wpIdx, mx, my) =>
              props.onWaypointContextMenu(wire.id, wpIdx, mx, my)
            }
          />
        );
      })}

      {props.wireInProgress &&
        (() => {
          const startPt = props.wireInProgress.startPosition;
          if (!startPt) return null;
          return (
            <CanvasWire
              inProgress
              points={buildPreviewPoints(
                startPt,
                props.wireInProgress.startPinSide,
                {
                  x: props.wireInProgress.previewX,
                  y: props.wireInProgress.previewY,
                }
              )}
              color={props.wireInProgress.color}
            />
          );
        })()}
    </>
  );
}
