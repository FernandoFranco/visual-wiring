import type { Component } from '../../types/component';
import type { PinSide } from '../../types/pin';
import type {
  LabelPosition,
  PlacedComponent,
  Project,
} from '../../types/project';
import type { Wire } from '../../types/wire';
import { DEFAULT_WIRE_COLOR } from '../CanvasWire';
import { ComponentPropertiesSidebar } from '../ComponentPropertiesSidebar';
import { WirePropertiesSidebar } from '../WirePropertiesSidebar';

export interface ProjectCanvasSidebarsProps {
  project: Project | null;
  selectedInstanceId: string | null;
  selectedPlaced: PlacedComponent | null;
  selectedComp: Component | null;
  selectedWireId: string | null;
  connectedWires: Array<{
    wireId: string;
    pinId: string;
    pinName: string;
    pinSide: PinSide;
    color?: string;
  }>;
  getWireEndpoints: (wire: Wire) => {
    startPlaced: PlacedComponent | null;
    endPlaced: PlacedComponent | null;
    startComp: Component | null;
    endComp: Component | null;
    startPt: { x: number; y: number };
    endPt: { x: number; y: number };
  } | null;
  onRotationChange: (instanceId: string, rotation: number) => void;
  onAliasChange: (instanceId: string, alias: string) => void;
  onLabelPositionChange: (instanceId: string, position: LabelPosition) => void;
  onWireColorChange: (wireId: string, color: string | undefined) => void;
  onAddColor: (color: string) => void;
  onRemoveColor: (color: string) => void;
  onWireClick: (wireId: string) => void;
  onCloseComponent: () => void;
  onCloseWire: () => void;
}

export function ProjectCanvasSidebars(props: ProjectCanvasSidebarsProps) {
  if (props.selectedPlaced && props.selectedComp) {
    return (
      <ComponentPropertiesSidebar
        componentName={props.selectedComp.name}
        instanceId={props.selectedPlaced.instanceId}
        pinCount={props.selectedComp.pins.length}
        x={props.selectedPlaced.x}
        y={props.selectedPlaced.y}
        rotation={props.selectedPlaced.rotation ?? 0}
        onRotationChange={r =>
          props.onRotationChange(props.selectedPlaced!.instanceId, r)
        }
        alias={props.selectedPlaced.alias ?? ''}
        onAliasChange={a =>
          props.onAliasChange(props.selectedPlaced!.instanceId, a)
        }
        labelPosition={props.selectedPlaced.labelPosition ?? 'center'}
        onLabelPositionChange={pos =>
          props.onLabelPositionChange(props.selectedPlaced!.instanceId, pos)
        }
        connectedWires={props.connectedWires}
        onWireClick={props.onWireClick}
        onClose={props.onCloseComponent}
      />
    );
  }

  if (props.selectedWireId && props.project) {
    const wire = props.project.wires?.find(w => w.id === props.selectedWireId);
    if (!wire) return null;
    const eps = props.getWireEndpoints(wire);
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
      const sourceWire = props.project.wires?.find(w => w.id === wireId);
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
      const sourceWire = props.project.wires?.find(w => w.id === wireId);
      endLabel = `Waypoint on Wire ${sourceWire ? sourceWire.id.substring(0, 8) : wireId}`;
    }

    return (
      <WirePropertiesSidebar
        wireId={wire.id}
        startLabel={startLabel}
        endLabel={endLabel}
        color={wire.color ?? DEFAULT_WIRE_COLOR}
        colors={props.project.colors ?? []}
        onColorChange={c => props.onWireColorChange(wire.id, c)}
        onAddColor={props.onAddColor}
        onRemoveColor={props.onRemoveColor}
        onClose={props.onCloseWire}
      />
    );
  }

  return null;
}
