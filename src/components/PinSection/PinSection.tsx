import './PinSection.css';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Pin, PinSide } from '../../types/pin';
import { ExpansionPanel } from '../ExpansionPanel';
import { IconButton } from '../IconButton';

export interface PinSectionProps {
  side: PinSide;
  pins: Pin[];
  onChange: (pins: Pin[]) => void;
}

const SIDE_LABELS: Record<PinSide, string> = {
  up: 'Top',
  down: 'Bottom',
  left: 'Left',
  right: 'Right',
};

export function PinSection({ side, pins, onChange }: PinSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  const startEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setDraftName(pin.name);
    setOriginalName(pin.name);
  };

  const commitAndClose = () => {
    if (!editingId) return;
    const trimmed = draftName.trim();
    if (trimmed) {
      onChange(
        pins.map(p => (p.id === editingId ? { ...p, name: trimmed } : p))
      );
    } else {
      onChange(pins.filter(p => p.id !== editingId));
    }
    setEditingId(null);
  };

  const commitAndContinue = () => {
    if (!editingId) return;
    const trimmed = draftName.trim();
    let updatedPins = pins;
    if (trimmed) {
      updatedPins = pins.map(p =>
        p.id === editingId ? { ...p, name: trimmed } : p
      );
    } else {
      updatedPins = pins.filter(p => p.id !== editingId);
    }
    const newPin: Pin = { id: crypto.randomUUID(), name: '', side };
    onChange([...updatedPins, newPin]);
    setEditingId(newPin.id);
    setDraftName('');
    setOriginalName('');
  };

  const cancel = () => {
    if (!editingId) return;
    if (originalName === '') {
      onChange(pins.filter(p => p.id !== editingId));
    } else {
      onChange(
        pins.map(p => (p.id === editingId ? { ...p, name: originalName } : p))
      );
    }
    setEditingId(null);
  };

  const addPin = () => {
    const newPin: Pin = { id: crypto.randomUUID(), name: '', side };
    onChange([...pins, newPin]);
    startEdit(newPin);
  };

  const deletePin = (id: string) => {
    if (editingId === id) setEditingId(null);
    onChange(pins.filter(p => p.id !== id));
  };

  const label = <span className="pin-section__label">{SIDE_LABELS[side]}</span>;

  const count = pins.length > 0 ? pins.length : undefined;

  const actions = (
    <IconButton
      className="pin-section__add-btn"
      title={`Add ${SIDE_LABELS[side]} pin`}
      onClick={e => {
        e.stopPropagation();
        if (!isOpen) setIsOpen(true);
        addPin();
      }}
    >
      <Plus size={11} />
    </IconButton>
  );

  return (
    <div className="pin-section">
      <ExpansionPanel
        label={label}
        count={count}
        actions={actions}
        isOpen={isOpen}
        onToggle={() => setIsOpen(o => !o)}
      >
        {pins.length === 0 ? (
          <p className="pin-section__empty">No pins yet</p>
        ) : (
          <ul className="pin-section__list">
            {pins.map(pin => (
              <li key={pin.id} className="pin-section__item">
                {editingId === pin.id ? (
                  <input
                    ref={inputRef}
                    className="pin-section__input"
                    value={draftName}
                    placeholder="Pin name..."
                    onChange={e => setDraftName(e.target.value)}
                    onBlur={commitAndClose}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitAndContinue();
                      if (e.key === 'Escape') cancel();
                    }}
                  />
                ) : (
                  <span
                    className="pin-section__name"
                    onDoubleClick={() => startEdit(pin)}
                    title="Double-click to rename"
                  >
                    {pin.name}
                  </span>
                )}
                <IconButton
                  className="pin-section__delete-btn"
                  title="Delete pin"
                  onClick={() => deletePin(pin.id)}
                >
                  <Trash2 size={11} />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </ExpansionPanel>
    </div>
  );
}
