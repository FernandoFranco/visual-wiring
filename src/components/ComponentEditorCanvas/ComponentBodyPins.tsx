import type React from 'react';

import type { Pin } from '../../types/pin';
import { CanvasPin } from './CanvasPin';

export interface ComponentBodyPinsProps {
  topPins: Pin[];
  bottomPins: Pin[];
  leftPins: Pin[];
  rightPins: Pin[];
  getHorizontalPinX: (index: number) => number;
  getVerticalPinY: (index: number) => number;
  bodyX: number;
  bodyY: number;
  bodyWidth: number;
  bodyHeight: number;
  pinHalfSize: number;
  grid: number;
  rotation: number;
  color?: string;
  labelColor?: string;
  wireTargetPinIds: string[];
  onPinDown?: (pinId: string, e: React.MouseEvent<SVGGElement>) => void;
}

function getPinTransform(lx: number, ly: number, rotation: number) {
  return rotation === 180 ? `rotate(-180, ${lx}, ${ly})` : undefined;
}

function getPinAnchor(
  anchor: 'start' | 'middle' | 'end',
  rotation: number
): 'start' | 'middle' | 'end' {
  if (rotation !== 180) return anchor;
  return anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : 'middle';
}

function getPinBaseline(
  baseline: 'auto' | 'hanging' | 'middle' | 'central',
  rotation: number
): 'auto' | 'hanging' | 'middle' | 'central' {
  if (rotation !== 180) return baseline;
  return baseline === 'auto'
    ? 'hanging'
    : baseline === 'hanging'
      ? 'auto'
      : baseline;
}

export function ComponentBodyPins(props: ComponentBodyPinsProps) {
  return (
    <>
      {props.topPins.map((pin, i) => {
        const cx = props.getHorizontalPinX(i);
        const lx = cx;
        const ly = props.bodyY + props.pinHalfSize + 2;
        return (
          <CanvasPin
            key={pin.id}
            rectX={cx - props.pinHalfSize}
            rectY={props.bodyY - props.pinHalfSize}
            labelX={lx}
            labelY={ly}
            textAnchor={getPinAnchor('middle', props.rotation)}
            dominantBaseline={getPinBaseline('hanging', props.rotation)}
            name={pin.name}
            color={props.color}
            labelColor={props.labelColor}
            textTransform={getPinTransform(lx, ly, props.rotation)}
            onPinDown={
              props.onPinDown ? e => props.onPinDown!(pin.id, e) : undefined
            }
            isWireTarget={props.wireTargetPinIds.includes(pin.id)}
          />
        );
      })}

      {props.bottomPins.map((pin, i) => {
        const cx = props.getHorizontalPinX(i);
        const py = props.bodyY + props.bodyHeight - props.pinHalfSize;
        const lx = cx;
        const ly = py - 2;
        return (
          <CanvasPin
            key={pin.id}
            rectX={cx - props.pinHalfSize}
            rectY={py}
            labelX={lx}
            labelY={ly}
            textAnchor={getPinAnchor('middle', props.rotation)}
            dominantBaseline={getPinBaseline('auto', props.rotation)}
            name={pin.name}
            color={props.color}
            labelColor={props.labelColor}
            textTransform={getPinTransform(lx, ly, props.rotation)}
            onPinDown={
              props.onPinDown ? e => props.onPinDown!(pin.id, e) : undefined
            }
            isWireTarget={props.wireTargetPinIds.includes(pin.id)}
          />
        );
      })}

      {props.leftPins.map((pin, i) => {
        const cy = props.getVerticalPinY(i);
        const px = props.bodyX - props.pinHalfSize;
        const lx = px + props.grid + 2;
        const ly = cy;
        return (
          <CanvasPin
            key={pin.id}
            rectX={px}
            rectY={cy - props.pinHalfSize}
            labelX={lx}
            labelY={ly}
            textAnchor={getPinAnchor('start', props.rotation)}
            dominantBaseline={getPinBaseline('central', props.rotation)}
            name={pin.name}
            color={props.color}
            labelColor={props.labelColor}
            textTransform={getPinTransform(lx, ly, props.rotation)}
            onPinDown={
              props.onPinDown ? e => props.onPinDown!(pin.id, e) : undefined
            }
            isWireTarget={props.wireTargetPinIds.includes(pin.id)}
          />
        );
      })}

      {props.rightPins.map((pin, i) => {
        const cy = props.getVerticalPinY(i);
        const px = props.bodyX + props.bodyWidth - props.pinHalfSize;
        const lx = px - 2;
        const ly = cy;
        return (
          <CanvasPin
            key={pin.id}
            rectX={px}
            rectY={cy - props.pinHalfSize}
            labelX={lx}
            labelY={ly}
            textAnchor={getPinAnchor('end', props.rotation)}
            dominantBaseline={getPinBaseline('central', props.rotation)}
            name={pin.name}
            color={props.color}
            labelColor={props.labelColor}
            textTransform={getPinTransform(lx, ly, props.rotation)}
            onPinDown={
              props.onPinDown ? e => props.onPinDown!(pin.id, e) : undefined
            }
            isWireTarget={props.wireTargetPinIds.includes(pin.id)}
          />
        );
      })}
    </>
  );
}
