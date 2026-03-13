export interface HighlightProps {
  text: string;
  query: string;
}

export function Highlight(props: HighlightProps) {
  if (!props.query) return <>{props.text}</>;

  const idx = props.text.toLowerCase().indexOf(props.query.toLowerCase());
  if (idx === -1) return <>{props.text}</>;

  return (
    <>
      {props.text.slice(0, idx)}
      <mark className="library__highlight">
        {props.text.slice(idx, idx + props.query.length)}
      </mark>
      {props.text.slice(idx + props.query.length)}
    </>
  );
}
