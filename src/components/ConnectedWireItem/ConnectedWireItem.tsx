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

export function ConnectedWireItem({
  wireId,
  pinName,
  pinSide,
  color,
  onClick,
}: ConnectedWireItemProps) {
  return (
    <li
      className="connected-wire-item"
      onClick={() => onClick(wireId)}
      title="Click to select wire"
    >
      <div
        className="connected-wire-item__color"
        style={{ backgroundColor: color || '#0f172a' }}
      />
      <div className="connected-wire-item__info">
        <span className="connected-wire-item__pin">{pinName}</span>
        <span className="connected-wire-item__side">
          {PIN_SIDE_LABELS[pinSide]}
        </span>
      </div>
    </li>
  );
}
