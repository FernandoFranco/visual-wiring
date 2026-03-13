import { ToggleGroup } from '../ToggleGroup';

export interface RotationPickerProps {
  value: 0 | 90 | 180 | 270;
  onChange: (rotation: 0 | 90 | 180 | 270) => void;
  label?: string;
}

const OPTIONS = [
  { value: '0', label: '0°' },
  { value: '90', label: '90°' },
  { value: '180', label: '180°' },
  { value: '270', label: '270°' },
];

export function RotationPicker(props: RotationPickerProps) {
  return (
    <ToggleGroup
      options={OPTIONS}
      value={String(props.value)}
      onChange={v => props.onChange(Number(v) as 0 | 90 | 180 | 270)}
      label={props.label}
    />
  );
}
