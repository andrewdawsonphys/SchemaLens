import { Handle, Position } from '@xyflow/react';
import { build_column_handle_id } from '../schema_utils';


export default function ErdNode({ data }) {
  const columns = data?.columns ?? [];
  const isHighlighted = data?.isHighlighted || false;
  
  return (
    <div className={`erd-node${isHighlighted ? ' erd-node--highlighted' : ''}`}>
      <div className="erd-node__header"> 
        <div>{data?.title ?? "table"}</div>
        <div className="erd-node__header__recommendation_count">
          <div className="erd-node__header__recommendation_count_item">{"1 ⚠️"}</div>
          <div className="erd-node__header__recommendation_count_item">{"3 💡"}</div>
        </div>
      </div>

    <div className="erd-node__body">
      {columns.map((column, index) => (
        <div
          key={`${data?.nodeId ?? data?.title ?? "table"}:${column.name ?? "col"}:${column.ordinalPosition ?? index}`}
          className="erd-node__column"
        >
          <span
            className={`erd-node__column-key${column.is_foreign_key && !column.is_primary_key ? ' fk' : ''}`}
            aria-label={column.is_primary_key ? 'Primary Key' : column.is_foreign_key ? 'Foreign Key' : ''}
          >
            {column.is_primary_key ? 'PK' : column.is_foreign_key ? 'FK' : ''}
          </span>
          <span className="erd-node__column-name">{column.name}</span>
          <span className="erd-node__column-type">{column.type}</span>
          <Handle
            type="target"
            position={Position.Left}
            id={build_column_handle_id(column.name)}
            className="erd-node__handle erd-node__handle--left"
          />
          <Handle
            type="source"
            position={Position.Right}
            id={build_column_handle_id(column.name)}
            className="erd-node__handle erd-node__handle--right"
          />
        </div>
      ))}
    </div>
    </div>
  );
}
