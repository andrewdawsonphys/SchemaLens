import '@xyflow/react/dist/style.css';
import "./styles.css";
import { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import { createRoot } from "react-dom/client";
import ErdNode from "./components/ErdNode.jsx";
import ErdEdge from "./components/ErdEdge";
import TopBar from "./components/TopBar.jsx";
import { load_schema } from "./schema_utils.jsx"

function FlowContent() {
  const [flow, setFlow] = useState({ nodes: [], edges: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [recommendationsCollapsed, setRecommendationsCollapsed] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);

  const { setCenter } = useReactFlow();

  const onNodesChange = (changes) => {
    setFlow((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes),
    }));
  };

  // Search functionality
  const handleSearchChange = useCallback((query) => {
    // Real-time search feedback could be added here if needed
  }, []);

  const handleSearchSubmit = useCallback((query) => {
    if (!query.trim()) return;

    const searchTerm = query.toLowerCase();
    const matchingNode = flow.nodes.find((node) => {
      const tableName = node.data?.title?.toLowerCase() || "";
      const nodeId = node.id?.toLowerCase() || "";
      
      return tableName.includes(searchTerm) || nodeId.includes(searchTerm);
    });

    if (matchingNode) {
      // Highlight the node with animation
      setHighlightedNodeId(matchingNode.id);
      
      // Smoothly pan to the matching table
      setCenter(matchingNode.position.x + 180, matchingNode.position.y + 110, {
        zoom: 1.2,
        duration: 800,
      });

      // Remove highlight after animation completes
      setTimeout(() => {
        setHighlightedNodeId(null);
      }, 2500);
    }
  }, [flow.nodes, setCenter]);

  useEffect(() => {
    load_schema(setFlow);
  }, []);

  return (
    <>
      <TopBar 
        onSearchSubmit={handleSearchSubmit}
        onSearchChange={handleSearchChange}
        tables={flow.nodes}
      />
      <div className="app-content">
        <div className="graph-container">
          <ReactFlow
            nodeTypes={{ erdNode: ErdNode }}
            edgeTypes={{ erdEdge: ErdEdge }}
            nodes={flow.nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                isHighlighted: highlightedNodeId === node.id
              }
            }))}
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
  );
}

function App() {
  return (
    <div className="app-shell">
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);