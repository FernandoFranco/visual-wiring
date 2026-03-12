import './WirePropertiesSidebar.css';

import { ColorPicker } from '../ColorPicker';
import { PropertiesSidebar } from '../PropertiesSidebar';

export interface WirePropertiesSidebarProps {
  wireId: string;
  startLabel: string;
  endLabel: string;
  color: string;
  colors: string[];
  onColorChange: (color: string) => void;
  onAddColor: (color: string) => void;
  onRemoveColor: (color: string) => void;
  onClose: () => void;
}

export function WirePropertiesSidebar({
  wireId,
  startLabel,
  endLabel,
  color,
  colors,
  onColorChange,
  onAddColor,
  onRemoveColor,
  onClose,
}: WirePropertiesSidebarProps) {
  const footer = (
    <>
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
          <span className="wire-properties-sidebar__connection-label">To</span>
          <span
            className="wire-properties-sidebar__connection-value"
            title={endLabel}
          >
            {endLabel}
          </span>
        </div>
      </div>

      <span className="wire-properties-sidebar__id" title={wireId}>
        id: {wireId}
      </span>
    </>
  );

  return (
    <PropertiesSidebar title="Wire" onClose={onClose} footer={footer}>
      <ColorPicker
        label="Color"
        value={color}
        colors={colors}
        onChange={onColorChange}
        onAddColor={onAddColor}
        onRemoveColor={onRemoveColor}
      />
    </PropertiesSidebar>
  );
}
