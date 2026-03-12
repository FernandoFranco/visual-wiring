import './ComponentEditorSidebar.css';

import type { Pin, PinSide } from '../../types/pin';
import type { LabelPosition } from '../../types/project';
import { ColorPicker } from '../ColorPicker';
import { Input } from '../Input';
import { LabelPositionPicker } from '../LabelPositionPicker';
import { PinSection } from '../PinSection';

export interface ComponentEditorSidebarProps {
  name: string;
  onNameChange: (value: string) => void;
  nameError?: string;
  minWidth: number;
  onMinWidthChange: (value: number) => void;
  minHeight: number;
  onMinHeightChange: (value: number) => void;
  color: string;
  colors: string[];
  onColorChange: (value: string) => void;
  onAddColor: (color: string) => void;
  onRemoveColor: (color: string) => void;
  defaultLabelPosition: LabelPosition;
  onDefaultLabelPositionChange: (value: LabelPosition) => void;
  pins: Pin[];
  onPinsChange: (pins: Pin[]) => void;
  onSave: () => void;
}

const PIN_SIDES: PinSide[] = ['up', 'down', 'left', 'right'];

export function ComponentEditorSidebar({
  name,
  onNameChange,
  nameError,
  minWidth,
  onMinWidthChange,
  minHeight,
  onMinHeightChange,
  color,
  colors,
  onColorChange,
  onAddColor,
  onRemoveColor,
  defaultLabelPosition,
  onDefaultLabelPositionChange,
  pins,
  onPinsChange,
}: ComponentEditorSidebarProps) {
  const pinsForSide = (side: PinSide) => pins.filter(p => p.side === side);

  const handleSideChange = (side: PinSide, updated: Pin[]) => {
    onPinsChange([...pins.filter(p => p.side !== side), ...updated]);
  };

  return (
    <aside className="component-editor-sidebar">
      <div className="component-editor-sidebar__section">
        <Input
          id="component-name"
          variant="sm"
          label="Name"
          required
          type="text"
          placeholder="Component name..."
          value={name}
          error={nameError}
          className={nameError ? 'input-field--error' : ''}
          onChange={e => onNameChange(e.target.value)}
          autoFocus
        />
      </div>

      <div className="component-editor-sidebar__section">
        <p className="component-editor-sidebar__label">
          Minimum size (grid units)
        </p>
        <div className="component-editor-sidebar__size-row">
          <div className="component-editor-sidebar__size-input">
            <Input
              id="min-width"
              variant="sm"
              inline
              label="W"
              type="number"
              min={1}
              value={minWidth}
              onChange={e =>
                onMinWidthChange(Math.max(1, Number(e.target.value)))
              }
            />
          </div>
          <div className="component-editor-sidebar__size-input">
            <Input
              id="min-height"
              variant="sm"
              inline
              label="H"
              type="number"
              min={1}
              value={minHeight}
              onChange={e =>
                onMinHeightChange(Math.max(1, Number(e.target.value)))
              }
            />
          </div>
        </div>
      </div>

      <div className="component-editor-sidebar__divider" />

      <div className="component-editor-sidebar__section">
        <ColorPicker
          label="Background color"
          value={color}
          colors={colors}
          onChange={onColorChange}
          onAddColor={onAddColor}
          onRemoveColor={onRemoveColor}
        />
      </div>

      <div className="component-editor-sidebar__divider" />

      <div className="component-editor-sidebar__section">
        <LabelPositionPicker
          label="Default label position"
          value={defaultLabelPosition}
          onChange={onDefaultLabelPositionChange}
        />
      </div>

      <div className="component-editor-sidebar__divider" />

      <div className="component-editor-sidebar__pins">
        <p className="component-editor-sidebar__pins-title">Pins</p>
        {PIN_SIDES.map(side => (
          <PinSection
            key={side}
            side={side}
            pins={pinsForSide(side)}
            onChange={updated => handleSideChange(side, updated)}
          />
        ))}
      </div>
    </aside>
  );
}
