import './ColorPicker.css';

import { DEFAULT_SWATCHES } from './constants';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  swatches?: string[];
  label?: string;
  allowNone?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  swatches = DEFAULT_SWATCHES,
  label,
}: ColorPickerProps) {
  return (
    <div className="color-picker">
      {label && <p className="color-picker__label">{label}</p>}
      <div className="color-picker__swatches">
        {swatches.map(c => (
          <button
            key={c}
            type="button"
            className={[
              'color-picker__swatch',
              c === value ? 'color-picker__swatch--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ background: c }}
            title={c}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <input
        type="color"
        className="color-picker__input"
        value={value || '#ffffff'}
        onChange={e => onChange(e.target.value)}
        title="Custom color"
      />
    </div>
  );
}
