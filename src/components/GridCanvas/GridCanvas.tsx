import './GridCanvas.css';

import {
  type PropsWithChildren,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { GRID } from '../../utils/gridUtils';
import {
  GridCanvasContext,
  type GridCanvasContextValue,
} from './GridCanvasContext';

export type { GridCanvasContextValue };

export interface GridCanvasProps {
  grid?: number;
  noBackground?: boolean;
  panX?: number;
  panY?: number;
  viewBox?: { width: number; height: number };
}

export function GridCanvas({
  grid = GRID,
  noBackground = false,
  panX = 0,
  panY = 0,
  viewBox,
  children,
}: PropsWithChildren<GridCanvasProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);

  const uid = useId().replace(/:/g, '');
  const patternId = `gc-dots-${uid}`;

  useEffect(() => {
    if (viewBox) return; // Não precisa do ResizeObserver quando usa viewBox
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCw(entry.contentRect.width);
      setCh(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewBox]);

  const svgWidth = viewBox ? '100%' : cw;
  const svgHeight = viewBox ? '100%' : ch;
  const svgViewBox = viewBox
    ? `0 0 ${viewBox.width} ${viewBox.height}`
    : undefined;
  const displayWidth = viewBox ? viewBox.width : cw;
  const displayHeight = viewBox ? viewBox.height : ch;

  return (
    <GridCanvasContext.Provider
      value={{
        grid,
        canvasWidth: displayWidth,
        canvasHeight: displayHeight,
        panX,
        panY,
      }}
    >
      <div
        className="grid-canvas"
        ref={containerRef}
        style={{ '--gc-grid': `${grid}px` } as { [key: `--${string}`]: string }}
      >
        <svg
          className="grid-canvas__svg"
          width={svgWidth}
          height={svgHeight}
          viewBox={svgViewBox}
          preserveAspectRatio={viewBox ? 'xMidYMid meet' : undefined}
        >
          {!noBackground && (
            <>
              <defs>
                <pattern
                  id={patternId}
                  x={((panX % grid) + grid) % grid}
                  y={((panY % grid) + grid) % grid}
                  width={grid}
                  height={grid}
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="0" cy="0" r="0.75" fill="#c7d2e0" />
                </pattern>
              </defs>
              <rect
                x="0"
                y="0"
                width={displayWidth}
                height={displayHeight}
                className="grid-canvas__bg"
              />
              <rect
                x="0"
                y="0"
                width={displayWidth}
                height={displayHeight}
                fill={`url(#${patternId})`}
              />
            </>
          )}
          <g transform={`translate(${panX}, ${panY})`}>{children}</g>
        </svg>
      </div>
    </GridCanvasContext.Provider>
  );
}
