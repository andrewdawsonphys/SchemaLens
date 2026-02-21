import { Handle, Position } from '@xyflow/react';

function buildColumnHandleId(columnName) {
  const value = String(columnName ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `col-${value || "unknown"}`;
}

export function ErdNode({ data }) {
  const columns = data?.columns ?? [];

  return (
    <div className="erd-node">
      <div className="erd-node__header">{data?.title ?? "table"}</div>

    <div className="erd-node__body">
      {columns.map((column, index) => (
        <div
          key={`${data?.nodeId ?? data?.title ?? "table"}:${column.name ?? "col"}:${column.ordinalPosition ?? index}`}
          className="erd-node__column"
        >
          <Handle
            type="target"
            position={Position.Left}
            id={buildColumnHandleId(column.name)}
            className="erd-node__handle erd-node__handle--left"
          />
          <span className="erd-node__column-name">{column.name}</span>
          <span className="erd-node__column-type">{column.type}</span>
          <Handle
            type="source"
            position={Position.Right}
            id={buildColumnHandleId(column.name)}
            className="erd-node__handle erd-node__handle--right"
          />
        </div>
      ))}
    </div>
    </div>
  );
}
