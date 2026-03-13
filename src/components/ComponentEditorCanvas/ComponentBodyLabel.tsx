import type { LabelPosition } from '../../types/project';
import { textColorForBg } from '../../utils/colorUtils';

export interface ComponentBodyLabelProps {
  labelText: string;
  labelPosition: LabelPosition;
  getLabelPosition: (position: LabelPosition) => { x: number; y: number };
  color?: string;
}

export function ComponentBodyLabel(props: ComponentBodyLabelProps) {
  if (props.labelPosition === 'center') {
    return (
      <text
        x={props.getLabelPosition('center').x}
        y={props.getLabelPosition('center').y}
        className="cec-name"
        textAnchor="middle"
        dominantBaseline="middle"
        style={props.color ? { fill: textColorForBg(props.color) } : undefined}
      >
        {props.labelText}
      </text>
    );
  }

  if (props.labelPosition === 'top') {
    return (
      <text
        x={props.getLabelPosition('top').x}
        y={props.getLabelPosition('top').y}
        className="cec-name cec-name--external"
        textAnchor="middle"
        dominantBaseline="auto"
      >
        {props.labelText}
      </text>
    );
  }

  if (props.labelPosition === 'bottom') {
    return (
      <text
        x={props.getLabelPosition('bottom').x}
        y={props.getLabelPosition('bottom').y}
        className="cec-name cec-name--external"
        textAnchor="middle"
        dominantBaseline="hanging"
      >
        {props.labelText}
      </text>
    );
  }

  if (props.labelPosition === 'left') {
    return (
      <text
        x={props.getLabelPosition('left').x}
        y={props.getLabelPosition('left').y}
        className="cec-name cec-name--external"
        textAnchor="end"
        dominantBaseline="central"
      >
        {props.labelText}
      </text>
    );
  }

  if (props.labelPosition === 'right') {
    return (
      <text
        x={props.getLabelPosition('right').x}
        y={props.getLabelPosition('right').y}
        className="cec-name cec-name--external"
        textAnchor="start"
        dominantBaseline="central"
      >
        {props.labelText}
      </text>
    );
  }

  return null;
}
