import './ColorPicker.css';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: string[];
  label?: string;
  onAddColor?: (color: string) => void;
  onRemoveColor?: (color: string) => void;
}

export function ColorPicker({
  value,
  onChange,
  colors,
  label,
  onAddColor,
  onRemoveColor,
}: ColorPickerProps) {
  const handleColorInputChange = (newColor: string) => {
    onChange(newColor);
    if (onAddColor && !colors.includes(newColor)) {
      onAddColor(newColor);
    }
  };

  return (
    <div className="color-picker">
      {label && <p className="color-picker__label">{label}</p>}
      <div className="color-picker__swatches">
        {colors.map(c => (
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
            onContextMenu={e => {
              if (onRemoveColor) {
                e.preventDefault();
                onRemoveColor(c);
              }
            }}
          />
        ))}
      </div>
      <input
        type="color"
        className="color-picker__input"
        value={value || '#ffffff'}
        onChange={e => handleColorInputChange(e.target.value)}
        title="Custom color"
      />
    </div>
  );
}
