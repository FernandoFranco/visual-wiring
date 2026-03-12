import type { Pin } from './pin';
import type { LabelPosition } from './project';

export interface Component {
  id: string;
  name: string;
  color?: string;
  defaultLabelPosition?: LabelPosition;
  minWidth?: number;
  minHeight?: number;
  pins: Pin[];
}
