import { useState, useEffect } from "react";
import { ReactFlow, Background, Controls, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { createRoot } from "react-dom/client";
import "./styles.css";


export function ErdNode({ data }) {
  const columns = data?.columns ?? [];

  return (
    <div className="erd-node">
      <Handle type="target" position={Position.Top} />

      <div className="erd-node__header">{data?.title ?? "table"}</div>

    <div className="erd-node__body">
      {columns.map((column, index) => (
        <div
          key={`${data?.nodeId ?? data?.title ?? "table"}:${column.name ?? "col"}:${column.ordinalPosition ?? index}`}
          className="erd-node__column"
        >
          <span className="erd-node__column-name">{column.name}</span>
          <span className="erd-node__column-type">{column.type}</span>
        </div>
      ))}
    </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function mapSchemaToNodes(schema) {

  const tables = Array.isArray(schema) 
  ? schema
  : (schema?.tables ?? schema?.data?.tables ?? []);

  const nodes = tables.map((table, i) => {
    const tableName = table.name ?? table.table_name ?? `table_${i}`;
    const schemaName = table.schema ?? table.table_schema ?? "public";
    const nodeId = `${schemaName}.${tableName}.${i}`;

    return {
      id: nodeId,
      type: 'erdNode',
      position: { x: 80 + (i % 3) * 360, y: 40 + Math.floor(i / 3) * 220 },
      data: {
        nodeId,
        title: tableName,
        columns: (table.columns ?? []).map((col, columnIndex) => ({
          name: col.column_name ?? col.name ?? `column_${columnIndex}`,
          type: col.formatted_type ?? col.type ?? "unknown",
          ordinalPosition: col.ordinal_position ?? columnIndex,
        })),
      },
    };
  });

  const edges = [];
  return { nodes, edges };
}

const nodeTypes = {
  erdNode: ErdNode,
};

function App() {

  const [flow, setFlow] = useState({ nodes: [], edges: [] });

  useEffect(() => {

    async function loadSchema() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/schema");
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const mapped = mapSchemaToNodes(data);
        setFlow(mapped);
      } catch (error) {
        console.error("Failed to load schema", error);
      }

    }

    loadSchema();
  }, []);

  return <>
    <div className="graph-container">
      <ReactFlow nodeTypes={nodeTypes} nodes={flow.nodes} edges={flow.edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  </>
}

createRoot(document.getElementById("root")).render(<App />);
