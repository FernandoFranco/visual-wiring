import './JsonViewer.css';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface JsonViewerProps {
  data: unknown;
  defaultExpandDepth?: number;
}

interface JsonNodeProps {
  value: unknown;
  depth: number;
  defaultExpandDepth: number;
  isLast: boolean;
}

function PrimitiveToken({ value }: { value: unknown }) {
  if (value === null) return <span className="jv-null">null</span>;
  if (typeof value === 'boolean')
    return <span className="jv-boolean">{String(value)}</span>;
  if (typeof value === 'number')
    return <span className="jv-number">{value}</span>;
  return <span className="jv-string">&quot;{String(value)}&quot;</span>;
}

function JsonNode({ value, depth, defaultExpandDepth, isLast }: JsonNodeProps) {
  const isExpandable = typeof value === 'object' && value !== null;
  const [isOpen, setIsOpen] = useState(depth <= defaultExpandDepth);

  if (!isExpandable) {
    return (
      <>
        <PrimitiveToken value={value} />
        {!isLast && <span className="jv-comma">,</span>}
      </>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  if (entries.length === 0) {
    return (
      <>
        <span className="jv-bracket">
          {openBracket}
          {closeBracket}
        </span>
        {!isLast && <span className="jv-comma">,</span>}
      </>
    );
  }

  if (!isOpen) {
    return (
      <span className="jv-node jv-node--collapsed">
        <button
          className="jv-toggle"
          type="button"
          title="Expand"
          onClick={() => setIsOpen(true)}
        >
          <ChevronRight size={11} className="jv-toggle__icon" />
        </button>
        <span className="jv-bracket">{openBracket}</span>
        <span className="jv-summary">
          {isArray
            ? `${entries.length} item${entries.length !== 1 ? 's' : ''}`
            : `${entries.length} key${entries.length !== 1 ? 's' : ''}`}
        </span>
        <span className="jv-bracket">{closeBracket}</span>
        {!isLast && <span className="jv-comma">,</span>}
      </span>
    );
  }

  return (
    <span className="jv-node jv-node--expanded">
      <button
        className="jv-toggle jv-toggle--open"
        type="button"
        title="Collapse"
        onClick={() => setIsOpen(false)}
      >
        <ChevronRight
          size={11}
          className="jv-toggle__icon jv-toggle__icon--open"
        />
      </button>
      <span className="jv-bracket">{openBracket}</span>
      <div className="jv-children">
        {entries.map(([k, v], i) => (
          <div key={k} className="jv-entry">
            {!isArray && (
              <>
                <span className="jv-key">&quot;{k}&quot;</span>
                <span className="jv-colon">: </span>
              </>
            )}
            <JsonNode
              value={v}
              depth={depth + 1}
              defaultExpandDepth={defaultExpandDepth}
              isLast={i === entries.length - 1}
            />
          </div>
        ))}
      </div>
      <span className="jv-closing">
        <span className="jv-bracket">{closeBracket}</span>
        {!isLast && <span className="jv-comma">,</span>}
      </span>
    </span>
  );
}

export function JsonViewer({ data, defaultExpandDepth = 1 }: JsonViewerProps) {
  return (
    <div className="json-viewer">
      <JsonNode
        value={data}
        depth={0}
        defaultExpandDepth={defaultExpandDepth}
        isLast={true}
      />
    </div>
  );
}
