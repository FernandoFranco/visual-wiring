import './ComponentPropertiesSidebar.css';

import { X } from 'lucide-react';

import { IconButton } from '../IconButton';
import { ToggleGroup } from '../ToggleGroup';

const ROTATION_OPTIONS = [
  { value: '0', label: '0°' },
  { value: '90', label: '90°' },
  { value: '180', label: '180°' },
  { value: '270', label: '270°' },
];

export interface ComponentPropertiesSidebarProps {
  componentName: string;
  instanceId: string;
  pinCount: number;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  onRotationChange: (rotation: 0 | 90 | 180 | 270) => void;
  onClose: () => void;
}

export function ComponentPropertiesSidebar({
  componentName,
  instanceId,
  pinCount,
  x,
  y,
  rotation,
  onRotationChange,
  onClose,
}: ComponentPropertiesSidebarProps) {
  const handleRotationChange = (value: string) => {
    onRotationChange(Number(value) as 0 | 90 | 180 | 270);
  };

  return (
    <aside
      className="component-properties-sidebar"
      onClick={e => e.stopPropagation()}
    >
      <div className="component-properties-sidebar__header">
        <span
          className="component-properties-sidebar__title"
          title={componentName}
        >
          {componentName}
        </span>
        <IconButton title="Close properties" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="component-properties-sidebar__body">
        <ToggleGroup
          label="Rotation"
          options={ROTATION_OPTIONS}
          value={String(rotation)}
          onChange={handleRotationChange}
        />
      </div>

      <div className="component-properties-sidebar__footer">
        <div className="component-properties-sidebar__info-row">
          <span className="component-properties-sidebar__info-label">Pins</span>
          <span className="component-properties-sidebar__info-value">
            {pinCount}
          </span>
        </div>
        <div className="component-properties-sidebar__info-row">
          <span className="component-properties-sidebar__info-label">
            Position
          </span>
          <span className="component-properties-sidebar__info-value">
            {x}, {y}
          </span>
        </div>
        <span className="component-properties-sidebar__id" title={instanceId}>
          id: {instanceId.slice(0, 8)}…
        </span>
      </div>
    </aside>
  );
}
