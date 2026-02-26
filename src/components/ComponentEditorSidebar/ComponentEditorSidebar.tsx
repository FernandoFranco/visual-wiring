import './ComponentEditorSidebar.css';

import type { Pin, PinSide } from '../../types/pin';
import { PinSection } from '../PinSection';

export interface ComponentEditorSidebarProps {
  name: string;
  onNameChange: (value: string) => void;
  nameError?: string;
  pins: Pin[];
  onPinsChange: (pins: Pin[]) => void;
  onSave: () => void;
}

const PIN_SIDES: PinSide[] = ['up', 'down', 'left', 'right'];

export function ComponentEditorSidebar({
  name,
  onNameChange,
  nameError,
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
        <label
          className="component-editor-sidebar__label"
          htmlFor="component-name"
        >
          Name <span className="component-editor-sidebar__required">*</span>
        </label>
        <input
          id="component-name"
          className={`component-editor-sidebar__name-input${nameError ? ' component-editor-sidebar__name-input--error' : ''}`}
          type="text"
          placeholder="Component name..."
          value={name}
          onChange={e => onNameChange(e.target.value)}
          autoFocus
        />
        {nameError && (
          <p className="component-editor-sidebar__error">{nameError}</p>
        )}
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
