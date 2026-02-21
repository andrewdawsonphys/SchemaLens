import { useState, useEffect } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { createRoot } from "react-dom/client";
import dagre from "dagre";
import "./styles.css";
import { ErdNode } from "./components/ErdNode";
import TopBar from "./components/TopBar";

const LAYOUT_DIRECTION = "LR";
const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 64;
const COLUMN_ROW_HEIGHT = 32;

function getNodeSize(node) {
  const columnCount = node?.data?.columns?.length ?? 0;
  return {
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT + columnCount * COLUMN_ROW_HEIGHT,
  };
}

function applyAutoLayout(nodes, edges) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: LAYOUT_DIRECTION,
    nodesep: 40,
    ranksep: 140,
    marginx: 24,
    marginy: 24,
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeSize(node);
    graph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const { width, height } = getNodeSize(node);
    const layoutNode = graph.node(node.id);

    if (!layoutNode) {
      return node;
    }

    return {
      ...node,
      position: {
        x: layoutNode.x - width / 2,
        y: layoutNode.y - height / 2,
      },
    };
  });
}

function buildColumnHandleId(columnName) {
  const value = String(columnName ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `col-${value || "unknown"}`;
}

function mapSchemaToFlow(schema, constraints = []) {

  const tables = Array.isArray(schema) ? schema : schema.tables;

  const nodes = tables.map((table, i) => {
    const tableName = table.table_name
    const schemaName = table.table_schema
    const nodeId = `${schemaName}.${tableName}`;

    return {
      id: nodeId,
      type: 'erdNode',
      position: { x: 80 + (i % 3) * 360, y: 40 + Math.floor(i / 3) * 220 },
      data: {
        nodeId,
        title: tableName,
        columns: (table.columns ?? []).map((col) => ({
          name: col.column_name,
          type: col.formatted_type,
          ordinalPosition: col.ordinal_position
        })),
      },
    };
  });

  const constraintRows = Array.isArray(constraints)
    ? constraints
    : (constraints?.constraints ?? constraints?.data?.constraints ?? []);

  const edges = constraintRows
    .map((row) => {

      const source = `${row.source_schema}.${row.source_table}`.toLowerCase();
      const target = `${row.target_schema}.${row.target_table}`.toLowerCase();

      const constraintName = row.name;
      const sourceHandle = buildColumnHandleId(row.source_column);
      const targetHandle = buildColumnHandleId(row.target_column)

      const id = `edge-${row.source_schema}.${row.target_schema}.${row.source_table}.${row.target_table}`

      return {
        id: id,
        source,
        target,
        sourceHandle,
        targetHandle,
        label: constraintName,
        type: "smoothstep",
      };
    })
    .filter(Boolean);

  return { nodes: applyAutoLayout(nodes, edges), edges };
}

const nodeTypes = {
  erdNode: ErdNode,
};

function App() {

  const [flow, setFlow] = useState({ nodes: [], edges: [] });

  const onNodesChange = (changes) => {
    setFlow((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes),
    }));
  };


  useEffect(() => {

    async function loadSchema() {
      try {
        const schemaResponse = await fetch("http://localhost:8000/api/v1/schema");
        if (!schemaResponse.ok) throw new Error(`API Error: ${schemaResponse.status}`);

        const schemaData = await schemaResponse.json();

        let constraintsData = [];

        try {
          const constraintsResponse = await fetch("http://localhost:8000/api/v1/constraints");
          if (constraintsResponse.ok) {
            const parsed = await constraintsResponse.json();

            if (!parsed?.message) {
              constraintsData = parsed;
            }
          }
        } catch (error) {
          console.warn("Constraints endpoint unavailable, continuing without edges", error);
        }

        const mapped = mapSchemaToFlow(schemaData, constraintsData);
        setFlow(mapped);
      } catch (error) {
        console.error("Failed to load schema", error);
      }

    }


    loadSchema();
  }, []);

  return <>
    <div className="app-shell">
      <TopBar/>
      <div className="graph-container">
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={flow.nodes}
          edges={flow.edges}
          onNodesChange={onNodesChange}
          nodesDraggable={true}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  </>
}

createRoot(document.getElementById("root")).render(<App />);
