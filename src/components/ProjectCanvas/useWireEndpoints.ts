import { useCallback } from 'react';

import type { Component } from '../../types/component';
import type { Project } from '../../types/project';
import type { PlacedComponent } from '../../types/project';
import type { Wire, WireEndpoint } from '../../types/wire';
import { GRID } from '../../utils/gridUtils';
import { getPinConnectionPoint } from '../../utils/pinPosition';

export function useWireEndpoints(
  project: Project | null,
  findComponent: (
    libraryId: string,
    componentId: string
  ) => Component | undefined
) {
  const getEndpointPosition = useCallback(
    (endpoint: WireEndpoint): { x: number; y: number } | null => {
      if (endpoint.type === 'pin') {
        const placed = project?.placedComponents?.find(
          p => p.instanceId === endpoint.instanceId
        );
        if (!placed) return null;
        const comp = findComponent(placed.libraryId, placed.componentId);
        if (!comp) return null;
        return getPinConnectionPoint(placed, comp, endpoint.pinId, GRID);
      } else {
        const wire = project?.wires?.find(w => w.id === endpoint.wireId);
        if (!wire) return null;
        const waypoint = wire.waypoints[endpoint.waypointIndex];
        return waypoint ?? null;
      }
    },
    [project, findComponent]
  );

  const getWireEndpoints = useCallback(
    (wire: Wire) => {
      const startPt = getEndpointPosition(wire.start);
      const endPt = getEndpointPosition(wire.end);
      if (!startPt || !endPt) return null;

      let startPlaced: PlacedComponent | null = null;
      let startComp: Component | null = null;
      let endPlaced: PlacedComponent | null = null;
      let endComp: Component | null = null;

      if (wire.start.type === 'pin') {
        const placed = project?.placedComponents ?? [];
        const instanceId = wire.start.instanceId;
        startPlaced = placed.find(p => p.instanceId === instanceId) ?? null;
        if (startPlaced) {
          startComp =
            findComponent(startPlaced.libraryId, startPlaced.componentId) ??
            null;
        }
      }

      if (wire.end.type === 'pin') {
        const placed = project?.placedComponents ?? [];
        const instanceId = wire.end.instanceId;
        endPlaced = placed.find(p => p.instanceId === instanceId) ?? null;
        if (endPlaced) {
          endComp =
            findComponent(endPlaced.libraryId, endPlaced.componentId) ?? null;
        }
      }

      return { startPlaced, endPlaced, startComp, endComp, startPt, endPt };
    },
    [project, findComponent, getEndpointPosition]
  );

  return { getWireEndpoints };
}
