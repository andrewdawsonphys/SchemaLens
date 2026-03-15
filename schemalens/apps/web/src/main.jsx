import '@xyflow/react/dist/style.css';
import "./styles.css";
import dagre from "dagre";
import { useState, useEffect } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges } from '@xyflow/react';
import { createRoot } from "react-dom/client";
import "./styles.css";
import ErdNode from "./components/ErdNode.jsx";
import ErdEdge from "./components/ErdEdge";
import TopBar from "./components/TopBar.jsx";
import { LayoutHandler } from "./layout_handler.jsx";

const API_BASE_URL = "http://localhost:8000/api/v1";
const layoutHandler = new LayoutHandler();

const nodeTypes = {
  erdNode: ErdNode,
};

const edgeTypes = {
  erdEdge: ErdEdge,
};


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

function mapSchemaToFlow(schema, relationships = []) {

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

  const relationshipRows = Array.isArray(relationships)
    ? relationships
    : (relationships?.relationships ?? relationships?.data?.relationships ?? []);

  const edges = relationshipRows
    .map((row) => {

      const referencing_id = `${row.referencing_table_schema}.${row.referencing_table_name}`.toLowerCase();
      const referenced_id = `${row.referenced_table_schema}.${row.referenced_table_name}`.toLowerCase();

      const constraint_name = row.constraint_name;
      const referencing_column_name = buildColumnHandleId(row.referencing_column_name);
      const referenced_column_name = buildColumnHandleId(row.referenced_column_name);
      const relationship_type = row.relationship_type;

      const id = `edge-${row.referencing_table_schema}.${row.referenced_table_schema}.${row.referencing_table_name}.${row.referenced_table_name}`

      return {
        id: id,
        source: referencing_id,
        target: referenced_id,
        sourceHandle: referencing_column_name,
        targetHandle: referenced_column_name,
        type: "erdEdge",
        data: {
          constraintName: constraint_name,
          relationshipType: relationship_type,
        },
      };
    })
    .filter(Boolean);

  return { nodes: layoutHandler.applyAutoLayout(nodes, edges), edges };
}



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
        const schemaResponse = await fetch(`${API_BASE_URL}/schema`);
        if (!schemaResponse.ok) throw new Error(`API Error: ${schemaResponse.status}`);

        const schemaData = await schemaResponse.json();

        let relationshipsData = [];

        try {
          const relationshipsResponse = await fetch(`${API_BASE_URL}/relationships`);
          if (relationshipsResponse.ok) {
            const parsed = await relationshipsResponse.json();

            if (!parsed?.message) {
              relationshipsData = parsed;
            }
          }
        } catch (error) {
          console.warn("Relationships endpoint unavailable, continuing without edges", error);
        }

        const mapped = mapSchemaToFlow(schemaData, relationshipsData);
        console.log("Loaded relationships:", relationshipsData);
        console.log("Mapped flow:", mapped);
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
      <div className="app-content">
        <div className="graph-container">
          <ReactFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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
    </div>
  </>
}

createRoot(document.getElementById("root")).render(<App />);
