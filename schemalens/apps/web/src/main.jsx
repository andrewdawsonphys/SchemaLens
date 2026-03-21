import '@xyflow/react/dist/style.css';
import "./styles.css";
import { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import { createRoot } from "react-dom/client";
import ErdNode from "./components/ErdNode.jsx";
import ErdEdge from "./components/ErdEdge";
import TopBar from "./components/TopBar.jsx";
import RecommendationsSidebar from "./components/RecommendationsSidebar.jsx";
import { load_schema, fetchRecommendations } from "./schema_utils.jsx"

const SIDEBAR_OPEN_STORAGE_KEY = "schemalens-recommendations-sidebar-open";

function getInitialSidebarOpenState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY) === "true";
}

function buildRecommendationCounts(items = []) {
  return {
    error: items.filter((item) => item.type === "error").length,
    warning: items.filter((item) => item.type === "warning").length,
    info: items.filter((item) => item.type === "info").length,
  };
}

function FlowContent() {
  const [flow, setFlow] = useState({ nodes: [], edges: [] });
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [sidebarState, setSidebarState] = useState({
    isOpen: getInitialSidebarOpenState(),
    loading: false,
    error: "",
    items: [],
    tableSchema: "public",
    tableName: "",
    selectedType: "",
  });

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

      const [tableSchema = "public", tableName = ""] = String(matchingNode.id || "").split(".");
      if (tableName) {
        fetchRecommendations({ table_name: tableName, table_schema: tableSchema })
          .then((tableRecommendations) => {
            setFlow((prev) => ({
              ...prev,
              nodes: prev.nodes.map((node) => {
                if (node.id !== matchingNode.id) {
                  return node;
                }

                return {
                  ...node,
                  data: {
                    ...node.data,
                    recommendations: {
                      items: tableRecommendations,
                      counts: buildRecommendationCounts(tableRecommendations),
                    },
                  },
                };
              }),
            }));
          })
          .catch((error) => {
            console.warn("Failed to fetch filtered recommendations", error);
          });
      }

      // Remove highlight after animation completes
      setTimeout(() => {
        setHighlightedNodeId(null);
      }, 2500);
    }
  }, [flow.nodes, setCenter]);

  const handleRecommendationIconClick = useCallback(({ type, nodeId, tableName }) => {
    const [tableSchema = "public", parsedTableName = tableName || ""] = String(nodeId || "").split(".");
    const effectiveTableName = parsedTableName || tableName || "";

    if (!effectiveTableName) {
      return;
    }

    setSidebarState((prev) => ({
      ...prev,
      isOpen: true,
      loading: true,
      error: "",
      items: [],
      tableSchema,
      tableName: effectiveTableName,
      selectedType: type || "",
    }));

    fetchRecommendations({ table_name: effectiveTableName, table_schema: tableSchema })
      .then((allItems) => {
        const filteredItems = type ? allItems.filter((item) => item.type === type) : allItems;

        setSidebarState((prev) => ({
          ...prev,
          loading: false,
          items: filteredItems,
        }));
      })
      .catch((error) => {
        setSidebarState((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to load recommendations from API.",
        }));
        console.warn("Failed to fetch sidebar recommendations", error);
      });
  }, []);

  useEffect(() => {
    load_schema(setFlow);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, String(sidebarState.isOpen));
  }, [sidebarState.isOpen]);

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
                isHighlighted: highlightedNodeId === node.id,
                onRecommendationClick: handleRecommendationIconClick,
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
        <RecommendationsSidebar
          isOpen={sidebarState.isOpen}
          loading={sidebarState.loading}
          error={sidebarState.error}
          items={sidebarState.items}
          tableSchema={sidebarState.tableSchema}
          tableName={sidebarState.tableName}
          selectedType={sidebarState.selectedType}
          onClose={() => setSidebarState((prev) => ({ ...prev, isOpen: false }))}
        />
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