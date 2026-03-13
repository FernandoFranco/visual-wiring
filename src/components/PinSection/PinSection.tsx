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

export function PinSection(props: PinSectionProps) {
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
      props.onChange(
        props.pins.map(p => (p.id === editingId ? { ...p, name: trimmed } : p))
      );
    } else {
      props.onChange(props.pins.filter(p => p.id !== editingId));
    }
    setEditingId(null);
  };

  const commitAndContinue = () => {
    if (!editingId) return;
    const trimmed = draftName.trim();
    let updatedPins = props.pins;
    if (trimmed) {
      updatedPins = props.pins.map(p =>
        p.id === editingId ? { ...p, name: trimmed } : p
      );
    } else {
      updatedPins = props.pins.filter(p => p.id !== editingId);
    }
    const newPin: Pin = { id: crypto.randomUUID(), name: '', side: props.side };
    props.onChange([...updatedPins, newPin]);
    setEditingId(newPin.id);
    setDraftName('');
    setOriginalName('');
  };

  const cancel = () => {
    if (!editingId) return;
    if (originalName === '') {
      props.onChange(props.pins.filter(p => p.id !== editingId));
    } else {
      props.onChange(
        props.pins.map(p =>
          p.id === editingId ? { ...p, name: originalName } : p
        )
      );
    }
    setEditingId(null);
  };

  const addPin = () => {
    const newPin: Pin = { id: crypto.randomUUID(), name: '', side: props.side };
    props.onChange([...props.pins, newPin]);
    startEdit(newPin);
  };

  const deletePin = (id: string) => {
    if (editingId === id) setEditingId(null);
    props.onChange(props.pins.filter(p => p.id !== id));
  };

  const label = (
    <span className="pin-section__label">{SIDE_LABELS[props.side]}</span>
  );

  const count = props.pins.length > 0 ? props.pins.length : undefined;

  const actions = (
    <IconButton
      className="pin-section__add-btn"
      title={`Add ${SIDE_LABELS[props.side]} pin`}
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
        <div className="pin-section__content">
          {props.pins.length === 0 ? (
            <p className="pin-section__empty">No pins yet</p>
          ) : (
            <ul className="pin-section__list">
              {props.pins.map(pin => (
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
        </div>
      </ExpansionPanel>
    </div>
  );
}
