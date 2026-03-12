import type { Project } from '../types/project';
import { getComputedStyles } from './domStyles';

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

function getCanvasSVG(): SVGSVGElement | null {
  return document.querySelector('#project-grid > svg') as SVGSVGElement | null;
}

function normalizeCanvasSVG(originalSVG: SVGSVGElement): SVGSVGElement {
  const svg = originalSVG.cloneNode(true) as SVGSVGElement;

  svg.querySelectorAll('defs')?.forEach(def => def.remove());
  svg.querySelectorAll('rect.grid-canvas__bg')?.forEach(rect => rect.remove());
  svg
    .querySelectorAll('rect[fill^="url(#grid-pattern"]')
    ?.forEach(rect => rect.remove());

  svg.querySelectorAll('.canvas-wire__hit')?.forEach(hit => hit.remove());

  const originalTexts = originalSVG.querySelectorAll('text');
  const texts = svg.querySelectorAll('text');
  if (originalTexts.length !== texts.length) {
    console.warn(
      'Mismatch in text elements count between original and cloned SVG'
    );
  }

  Array.from(texts).forEach((t, index) => {
    const original = originalTexts[index];
    if (!original) return;

    const computedStyles = getComputedStyles(original, [
      'font-family',
      'font-size',
      'font-weight',
    ]) as Record<string, string>;

    t.style.fontFamily = computedStyles?.['font-family'];
    t.style.fontSize = computedStyles?.['font-size'];
    t.style.fontWeight = computedStyles?.['font-weight'];
  });

  return svg;
}

function calculateContentBounds(svg: SVGSVGElement): Bounds {
  const mainGroup = svg.querySelector('g[transform]') as SVGGElement | null;
  if (!mainGroup) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  try {
    const bbox = mainGroup.getBBox();
    const padding = 40;

    return {
      minX: bbox.x - padding,
      minY: bbox.y - padding,
      maxX: bbox.x + bbox.width + padding,
      maxY: bbox.y + bbox.height + padding,
      width: bbox.width + padding * 2,
      height: bbox.height + padding * 2,
    };
  } catch (e) {
    console.error('Error calculating bounds:', e);
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }
}

function createObjectURLFromProject(originalSVG: SVGSVGElement): {
  url: string;
  bounds: Bounds;
} {
  const svg = normalizeCanvasSVG(originalSVG);
  const bounds = calculateContentBounds(originalSVG);
  svg.setAttribute(
    'viewBox',
    `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`
  );
  svg.setAttribute('width', bounds.width.toString());
  svg.setAttribute('height', bounds.height.toString());

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  return { url, bounds };
}

export function exportProjectAsSVG(project: Project): void {
  const originalSVG = getCanvasSVG();
  if (!originalSVG) return;

  const { url } = createObjectURLFromProject(originalSVG);
  const link = document.createElement('a');
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportProjectAsImage(project: Project): void {
  const originalSVG = getCanvasSVG();
  if (!originalSVG) return;

  const { url, bounds } = createObjectURLFromProject(originalSVG);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.png`;
          link.href = pngUrl;
          link.click();
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = e => {
    console.error('Failed to load SVG image:', e);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
