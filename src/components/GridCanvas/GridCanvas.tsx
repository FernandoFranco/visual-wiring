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
  id?: string;
  grid?: number;
  noBackground?: boolean;
  panX?: number;
  panY?: number;
  viewBox?: { width: number; height: number };
}

export function GridCanvas(props: PropsWithChildren<GridCanvasProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);

  const grid = props.grid || GRID;
  const noBackground = props.noBackground || false;
  const panX = props.panX || 0;
  const panY = props.panY || 0;

  const uid = useId().replace(/:/g, '');
  const patternId = `gc-dots-${uid}`;

  useEffect(() => {
    if (props.viewBox) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCw(entry.contentRect.width);
      setCh(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [props.viewBox]);

  const svgWidth = props.viewBox ? '100%' : cw;
  const svgHeight = props.viewBox ? props.viewBox.height : ch;
  const svgViewBox = props.viewBox
    ? `0 0 ${props.viewBox.width} ${props.viewBox.height}`
    : undefined;
  const displayWidth = props.viewBox ? props.viewBox.width : cw;
  const displayHeight = props.viewBox ? props.viewBox.height : ch;

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
        id={props.id}
        className="grid-canvas"
        ref={containerRef}
        style={{ '--gc-grid': `${grid}px` } as { [key: `--${string}`]: string }}
      >
        <svg
          className={`grid-canvas__svg ${props.viewBox ? 'grid-canvas__svg--fit' : 'grid-canvas__svg--fill'}`}
          width={svgWidth}
          height={svgHeight}
          viewBox={svgViewBox}
          preserveAspectRatio={props.viewBox ? 'xMidYMid meet' : undefined}
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
          <g transform={`translate(${panX}, ${panY})`}>{props.children}</g>
        </svg>
      </div>
    </GridCanvasContext.Provider>
  );
}
