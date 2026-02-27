export type PinSide = 'up' | 'down' | 'left' | 'right';

export interface Pin {
  id: string;
  name: string;
  side: PinSide;
}
