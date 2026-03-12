import './ComponentPropertiesSidebar.css';

import type { LabelPosition } from '../../types/project';
import { Input } from '../Input';
import { LabelPositionPicker } from '../LabelPositionPicker';
import { PropertiesSidebar } from '../PropertiesSidebar';
import { RotationPicker } from '../RotationPicker';

export interface ComponentPropertiesSidebarProps {
  componentName: string;
  instanceId: string;
  pinCount: number;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  onRotationChange: (rotation: 0 | 90 | 180 | 270) => void;
  alias: string;
  onAliasChange: (alias: string) => void;
  labelPosition: LabelPosition;
  onLabelPositionChange: (pos: LabelPosition) => void;
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
  alias,
  onAliasChange,
  labelPosition,
  onLabelPositionChange,
  onClose,
}: ComponentPropertiesSidebarProps) {
  const footer = (
    <>
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
        id: {instanceId}
      </span>
    </>
  );

  return (
    <PropertiesSidebar title={componentName} onClose={onClose} footer={footer}>
      <Input
        id="component-alias"
        variant="sm"
        label="Alias"
        type="text"
        placeholder={componentName}
        value={alias}
        onChange={e => onAliasChange(e.target.value)}
      />
      <RotationPicker
        label="Rotation"
        value={rotation}
        onChange={onRotationChange}
      />
      <LabelPositionPicker
        label="Label position"
        value={labelPosition}
        onChange={onLabelPositionChange}
      />
    </PropertiesSidebar>
  );
}
