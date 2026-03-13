import { useMemo } from 'react';

import type { Component } from '../../types/component';
import type { PinSide } from '../../types/pin';
import type { Project } from '../../types/project';
import type { Wire, WireEndpoint } from '../../types/wire';

export function useConnectedWires(
  project: Project | null,
  selectedInstanceId: string | null,
  selectedComp: Component | null
) {
  const connectedWires = useMemo(() => {
    if (!selectedInstanceId || !selectedComp) return [];

    return (project?.wires ?? [])
      .filter((wire: Wire) => {
        const isStartConnected =
          wire.start.type === 'pin' &&
          wire.start.instanceId === selectedInstanceId;
        const isEndConnected =
          wire.end.type === 'pin' && wire.end.instanceId === selectedInstanceId;
        return isStartConnected || isEndConnected;
      })
      .map((wire: Wire) => {
        const isStartPin =
          wire.start.type === 'pin' &&
          wire.start.instanceId === selectedInstanceId;
        const pinId = isStartPin
          ? (wire.start as Extract<WireEndpoint, { type: 'pin' }>).pinId
          : (wire.end as Extract<WireEndpoint, { type: 'pin' }>).pinId;
        const pin = selectedComp.pins.find(p => p.id === pinId);
        return {
          wireId: wire.id,
          pinId,
          pinName: pin?.name || 'Unknown',
          pinSide: (pin?.side || 'up') as PinSide,
          color: wire.color,
        };
      });
  }, [project, selectedInstanceId, selectedComp]);

  return connectedWires;
}
