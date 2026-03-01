import './GridCanvas.css';

import {
  type PropsWithChildren,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import {
  GridCanvasContext,
  type GridCanvasContextValue,
} from './GridCanvasContext';

export type { GridCanvasContextValue };

export interface GridCanvasProps {
  grid?: number;
  noBackground?: boolean;
}

export function GridCanvas({
  grid = 10,
  noBackground = false,
  children,
}: PropsWithChildren<GridCanvasProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(600);
  const [ch, setCh] = useState(400);

  const uid = useId().replace(/:/g, '');
  const patternId = `gc-dots-${uid}`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCw(entry.contentRect.width);
      setCh(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <GridCanvasContext.Provider
      value={{ grid, canvasWidth: cw, canvasHeight: ch }}
    >
      <div
        className="grid-canvas"
        ref={containerRef}
        style={{ '--gc-grid': `${grid}px` } as { [key: `--${string}`]: string }}
      >
        <svg className="grid-canvas__svg" width={cw} height={ch}>
          {!noBackground && (
            <>
              <defs>
                <pattern
                  id={patternId}
                  x="0"
                  y="0"
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
                width={cw}
                height={ch}
                className="grid-canvas__bg"
              />
              <rect
                x="0"
                y="0"
                width={cw}
                height={ch}
                fill={`url(#${patternId})`}
              />
            </>
          )}
          {children}
        </svg>
      </div>
    </GridCanvasContext.Provider>
  );
}
