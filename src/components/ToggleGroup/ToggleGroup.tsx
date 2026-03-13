import './ToggleGroup.css';

export interface ToggleGroupOption {
  value: string;
  label: React.ReactNode;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ToggleGroup(props: ToggleGroupProps) {
  return (
    <div className="toggle-group">
      {props.label && (
        <span className="toggle-group__label">{props.label}</span>
      )}
      <div className="toggle-group__buttons" role="group">
        {props.options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`toggle-group__btn${props.value === opt.value ? ' toggle-group__btn--active' : ''}`}
            onClick={() => props.onChange(opt.value)}
            aria-pressed={props.value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
