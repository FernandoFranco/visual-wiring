import type { Pin } from './pin';

export interface Component {
  id: string;
  name: string;
  pins: Pin[];
}
