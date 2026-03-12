export type WireEndpoint =
  | {
      type: 'pin';
      instanceId: string;
      pinId: string;
    }
  | {
      type: 'waypoint';
      wireId: string;
      waypointIndex: number;
    };

export interface Wire {
  id: string;
  start: WireEndpoint;
  end: WireEndpoint;
  waypoints: { x: number; y: number }[];
  color?: string;
}
