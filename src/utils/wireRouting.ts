type Point = { x: number; y: number };

export function buildPreviewPoints(
  startPt: Point,
  startSide: 'up' | 'down' | 'left' | 'right',
  cursor: Point
): Point[] {
  const { x: sx, y: sy } = startPt;
  const { x: cx, y: cy } = cursor;
  if (startSide === 'left' || startSide === 'right') {
    if (sy === cy) return [startPt, cursor];
    return [startPt, { x: cx, y: sy }, cursor];
  } else {
    if (sx === cx) return [startPt, cursor];
    return [startPt, { x: sx, y: cy }, cursor];
  }
}

export function buildAutoRouteWaypoints(
  startPt: Point,
  startSide: 'up' | 'down' | 'left' | 'right',
  endPt: Point,
  snap: (v: number) => number
): Point[] {
  const { x: sx, y: sy } = startPt;
  const { x: ex, y: ey } = endPt;
  if (sx === ex || sy === ey) return [];
  if (startSide === 'left' || startSide === 'right') {
    const midX = snap((sx + ex) / 2);
    return [
      { x: midX, y: sy },
      { x: midX, y: ey },
    ];
  } else {
    const midY = snap((sy + ey) / 2);
    return [
      { x: sx, y: midY },
      { x: ex, y: midY },
    ];
  }
}

export function computeSegmentDragWaypoints(
  originalWaypoints: Point[],
  segmentIndex: number,
  isHorizontal: boolean,
  delta: number,
  snap: (v: number) => number
): Point[] {
  const n = originalWaypoints.length;
  const w = originalWaypoints.map(p => ({ ...p }));
  const i = segmentIndex;

  if (isHorizontal) {
    if (i >= 1 && i <= n)
      w[i - 1] = { ...w[i - 1], y: snap(originalWaypoints[i - 1].y + delta) };
    if (i >= 0 && i < n)
      w[i] = { ...w[i], y: snap(originalWaypoints[i].y + delta) };
  } else {
    if (i >= 1 && i <= n)
      w[i - 1] = { ...w[i - 1], x: snap(originalWaypoints[i - 1].x + delta) };
    if (i >= 0 && i < n)
      w[i] = { ...w[i], x: snap(originalWaypoints[i].x + delta) };
  }

  return w;
}

export function splitSegmentWaypoints(
  waypoints: Point[],
  segmentIndex: number,
  startPt: Point,
  endPt: Point,
  clickX: number,
  clickY: number,
  snap: (v: number) => number
): Point[] {
  const points = [startPt, ...waypoints, endPt];
  const seg = points[segmentIndex];
  const next = points[segmentIndex + 1];
  const dx = Math.abs(next.x - seg.x);
  const dy = Math.abs(next.y - seg.y);
  const isHorizontal = dy <= dx;

  const pt = isHorizontal
    ? { x: snap(clickX), y: seg.y }
    : { x: seg.x, y: snap(clickY) };

  const newWaypoints = [...waypoints];
  newWaypoints.splice(segmentIndex, 0, pt, { ...pt });
  return newWaypoints;
}
