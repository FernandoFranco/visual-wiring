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

export function ToggleGroup({
  options,
  value,
  onChange,
  label,
}: ToggleGroupProps) {
  return (
    <div className="toggle-group">
      {label && <span className="toggle-group__label">{label}</span>}
      <div className="toggle-group__buttons" role="group">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`toggle-group__btn${value === opt.value ? ' toggle-group__btn--active' : ''}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
