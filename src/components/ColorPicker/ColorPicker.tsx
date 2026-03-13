import './ColorPicker.css';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: string[];
  label?: string;
  onAddColor?: (color: string) => void;
  onRemoveColor?: (color: string) => void;
}

export function ColorPicker(props: ColorPickerProps) {
  const handleColorInputChange = (newColor: string) => {
    props.onChange(newColor);
    if (props.onAddColor && !props.colors.includes(newColor)) {
      props.onAddColor(newColor);
    }
  };

  return (
    <div className="color-picker">
      {props.label && <p className="color-picker__label">{props.label}</p>}
      <div className="color-picker__swatches">
        {props.colors.map(c => (
          <button
            key={c}
            type="button"
            className={[
              'color-picker__swatch',
              c === props.value ? 'color-picker__swatch--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ background: c }}
            title={c}
            onClick={() => props.onChange(c)}
            onContextMenu={e => {
              if (props.onRemoveColor) {
                e.preventDefault();
                props.onRemoveColor(c);
              }
            }}
          />
        ))}
      </div>
      <input
        type="color"
        className="color-picker__input"
        value={props.value || '#ffffff'}
        onChange={e => handleColorInputChange(e.target.value)}
        title="Custom color"
      />
    </div>
  );
}
