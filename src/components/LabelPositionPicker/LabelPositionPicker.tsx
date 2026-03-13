import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
} from 'lucide-react';

import type { LabelPosition } from '../../types/project';
import { ToggleGroup } from '../ToggleGroup';

export interface LabelPositionPickerProps {
  value: LabelPosition;
  onChange: (position: LabelPosition) => void;
  label?: string;
}

const OPTIONS = [
  { value: 'center', label: <Crosshair size={13} /> },
  { value: 'top', label: <ArrowUp size={13} /> },
  { value: 'bottom', label: <ArrowDown size={13} /> },
  { value: 'left', label: <ArrowLeft size={13} /> },
  { value: 'right', label: <ArrowRight size={13} /> },
];

export function LabelPositionPicker(props: LabelPositionPickerProps) {
  return (
    <ToggleGroup
      options={OPTIONS}
      value={props.value}
      onChange={v => props.onChange(v as LabelPosition)}
      label={props.label}
    />
  );
}
