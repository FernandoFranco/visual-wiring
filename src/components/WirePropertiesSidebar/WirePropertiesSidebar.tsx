import './WirePropertiesSidebar.css';

import { X } from 'lucide-react';

import { IconButton } from '../IconButton';

const COLOR_SWATCHES = [
  '#1e293b',
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#06b6d4',
  '#f97316',
];

export interface WirePropertiesSidebarProps {
  wireId: string;
  startLabel: string;
  endLabel: string;
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function WirePropertiesSidebar({
  wireId,
  startLabel,
  endLabel,
  color,
  onColorChange,
  onClose,
}: WirePropertiesSidebarProps) {
  return (
    <aside
      className="wire-properties-sidebar"
      onClick={e => e.stopPropagation()}
    >
      <div className="wire-properties-sidebar__header">
        <span className="wire-properties-sidebar__title">Wire</span>
        <IconButton title="Close" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="wire-properties-sidebar__body">
        <div className="wire-properties-sidebar__field">
          <span className="wire-properties-sidebar__label">Color</span>
          <div className="wire-properties-sidebar__swatches">
            {COLOR_SWATCHES.map(c => (
              <button
                key={c}
                className={[
                  'wire-properties-sidebar__swatch',
                  c === color ? 'wire-properties-sidebar__swatch--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ background: c }}
                title={c}
                onClick={() => onColorChange(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="wire-properties-sidebar__footer">
        <div className="wire-properties-sidebar__connections">
          <div className="wire-properties-sidebar__connection">
            <span className="wire-properties-sidebar__connection-label">
              From
            </span>
            <span
              className="wire-properties-sidebar__connection-value"
              title={startLabel}
            >
              {startLabel}
            </span>
          </div>
          <div className="wire-properties-sidebar__connection">
            <span className="wire-properties-sidebar__connection-label">
              To
            </span>
            <span
              className="wire-properties-sidebar__connection-value"
              title={endLabel}
            >
              {endLabel}
            </span>
          </div>
        </div>

        <span className="wire-properties-sidebar__id" title={wireId}>
          id: {wireId.slice(0, 8)}…
        </span>
      </div>
    </aside>
  );
}
