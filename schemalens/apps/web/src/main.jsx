import '@xyflow/react/dist/style.css';
import "./styles.css";
import { useState, useEffect } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges } from '@xyflow/react';
import { createRoot } from "react-dom/client";
import ErdNode from "./components/ErdNode.jsx";
import ErdEdge from "./components/ErdEdge";
import TopBar from "./components/TopBar.jsx";
import { load_schema } from "./schema_utils.jsx"


function App() {

  const [flow, setFlow] = useState({ nodes: [], edges: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [recommendationsCollapsed, setRecommendationsCollapsed] = useState(false);

  const onNodesChange = (changes) => {
    setFlow((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes),
    }));
  };

  useEffect(() => {load_schema(setFlow);}, []);

  return <>
    <div className="app-shell">
      <TopBar/>
      <div className="app-content">
        <div className="graph-container">
          <ReactFlow
            nodeTypes={{ erdNode: ErdNode }}
            edgeTypes={{ erdEdge: ErdEdge }}
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
