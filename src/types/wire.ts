export interface WireEndpoint {
  instanceId: string;
  pinId: string;
}

export interface Wire {
  id: string;
  start: WireEndpoint;
  end: WireEndpoint;
  waypoints: { x: number; y: number }[];
  color?: string;
}
