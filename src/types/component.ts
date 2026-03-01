import type { Pin } from './pin';

export interface Component {
  id: string;
  name: string;
  minWidth?: number;
  minHeight?: number;
  pins: Pin[];
}
