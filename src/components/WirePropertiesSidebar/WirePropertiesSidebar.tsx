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

export function WirePropertiesSidebar(props: WirePropertiesSidebarProps) {
  const footer = (
    <>
      <div className="wire-properties-sidebar__connections">
        <div className="wire-properties-sidebar__connection">
          <span className="wire-properties-sidebar__connection-label">
            From
          </span>
          <span
            className="wire-properties-sidebar__connection-value"
            title={props.startLabel}
          >
            {props.startLabel}
          </span>
        </div>
        <div className="wire-properties-sidebar__connection">
          <span className="wire-properties-sidebar__connection-label">To</span>
          <span
            className="wire-properties-sidebar__connection-value"
            title={props.endLabel}
          >
            {props.endLabel}
          </span>
        </div>
      </div>

      <span className="wire-properties-sidebar__id" title={props.wireId}>
        id: {props.wireId}
      </span>
    </>
  );

  return (
    <PropertiesSidebar title="Wire" onClose={props.onClose} footer={footer}>
      <ColorPicker
        label="Color"
        value={props.color}
        colors={props.colors}
        onChange={props.onColorChange}
        onAddColor={props.onAddColor}
        onRemoveColor={props.onRemoveColor}
      />
    </PropertiesSidebar>
  );
}
