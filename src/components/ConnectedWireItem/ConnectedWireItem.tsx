import './ConnectedWireItem.css';

import type { PinSide } from '../../types/pin';

export interface ConnectedWireItemProps {
  wireId: string;
  pinName: string;
  pinSide: PinSide;
  color?: string;
  onClick: (wireId: string) => void;
}

const PIN_SIDE_LABELS: Record<PinSide, string> = {
  up: 'Top',
  down: 'Bottom',
  left: 'Left',
  right: 'Right',
};

export function ConnectedWireItem(props: ConnectedWireItemProps) {
  return (
    <li
      className="connected-wire-item"
      onClick={() => props.onClick(props.wireId)}
      title="Click to select wire"
    >
      <div
        className="connected-wire-item__color"
        style={{ backgroundColor: props.color || '#0f172a' }}
      />
      <div className="connected-wire-item__info">
        <span className="connected-wire-item__pin">{props.pinName}</span>
        <span className="connected-wire-item__side">
          {PIN_SIDE_LABELS[props.pinSide]}
        </span>
      </div>
    </li>
  );
}
