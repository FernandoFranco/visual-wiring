import './ComponentPropertiesSidebar.css';

import type { PinSide } from '../../types/pin';
import type { ComponentRotation, LabelPosition } from '../../types/project';
import { ConnectedWireItem } from '../ConnectedWireItem';
import { Input } from '../Input';
import { LabelPositionPicker } from '../LabelPositionPicker';
import { PropertiesSidebar } from '../PropertiesSidebar';
import { RotationPicker } from '../RotationPicker';

interface ConnectedWire {
  wireId: string;
  pinId: string;
  pinName: string;
  pinSide: PinSide;
  color?: string;
}

export interface ComponentPropertiesSidebarProps {
  componentName: string;
  instanceId: string;
  pinCount: number;
  x: number;
  y: number;
  rotation: ComponentRotation;
  onRotationChange: (rotation: ComponentRotation) => void;
  alias: string;
  onAliasChange: (alias: string) => void;
  labelPosition: LabelPosition;
  onLabelPositionChange: (pos: LabelPosition) => void;
  connectedWires: ConnectedWire[];
  onWireClick: (wireId: string) => void;
  onClose: () => void;
}

export function ComponentPropertiesSidebar(
  props: ComponentPropertiesSidebarProps
) {
  const footer = (
    <>
      <div className="component-properties-sidebar__info-row">
        <span className="component-properties-sidebar__info-label">Pins</span>
        <span className="component-properties-sidebar__info-value">
          {props.pinCount}
        </span>
      </div>
      <div className="component-properties-sidebar__info-row">
        <span className="component-properties-sidebar__info-label">
          Position
        </span>
        <span className="component-properties-sidebar__info-value">
          {props.x}, {props.y}
        </span>
      </div>
      <span
        className="component-properties-sidebar__id"
        title={props.instanceId}
      >
        id: {props.instanceId}
      </span>
    </>
  );

  return (
    <PropertiesSidebar
      title={props.componentName}
      onClose={props.onClose}
      footer={footer}
    >
      <Input
        id="component-alias"
        variant="sm"
        label="Alias"
        type="text"
        placeholder={props.componentName}
        value={props.alias}
        onChange={e => props.onAliasChange(e.target.value)}
      />
      <RotationPicker
        label="Rotation"
        value={props.rotation}
        onChange={props.onRotationChange}
      />
      <LabelPositionPicker
        label="Label position"
        value={props.labelPosition}
        onChange={props.onLabelPositionChange}
      />

      {props.connectedWires.length > 0 && (
        <div className="component-properties-sidebar__section">
          <label className="component-properties-sidebar__label">
            Connected wires ({props.connectedWires.length})
          </label>
          <ul className="component-properties-sidebar__wires">
            {props.connectedWires.map(wire => (
              <ConnectedWireItem
                key={wire.wireId}
                wireId={wire.wireId}
                pinName={wire.pinName}
                pinSide={wire.pinSide}
                color={wire.color}
                onClick={props.onWireClick}
              />
            ))}
          </ul>
        </div>
      )}
    </PropertiesSidebar>
  );
}
