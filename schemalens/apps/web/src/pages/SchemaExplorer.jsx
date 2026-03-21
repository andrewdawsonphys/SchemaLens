/**
 * Main schema explorer page component
 */

import React from 'react';
import { ReactFlow, Background, Controls, useReactFlow } from '@xyflow/react';
import TopBar from '../components/TopBar.jsx';
import EnhancedRecommendationsSidebar from '../components/EnhancedRecommendationsSidebar.jsx';
import ErdNode from '../components/ErdNode.jsx';
import ErdEdge from '../components/ErdEdge.jsx';
import { FullScreenLoader } from '../components/ui/LoadingSpinner.jsx';
import { FullScreenError } from '../components/ui/ErrorMessage.jsx';
import { useFlowGraph } from '../hooks/useFlowGraph.js';
import { useSidebarState } from '../hooks/useSidebarState.js';
import { useTableSearch } from '../hooks/useTableSearch.js';
import { fetchRecommendations } from '../services/api.js';

/**
 * Schema Explorer page component
 */
export default function SchemaExplorer() {
  const { setCenter } = useReactFlow();
  
  // Graph state management
  const {
    flow,
    loading: graphLoading,
    error: graphError,
    onNodesChange,
    updateNodeRecommendations,
    highlightNode,
    getEnhancedNodes,
    findNode,
  } = useFlowGraph();

  // Sidebar state management
  const sidebarState = useSidebarState();

  // Handle recommendation icon clicks
  const handleRecommendationIconClick = async ({ type, nodeId, tableName }) => {
    await sidebarState.openSidebar({ nodeId, tableName, type });
  };

  // Handle search node found
  const handleSearchNodeFound = async (matchingNode) => {
    // Highlight the node with animation
    highlightNode(matchingNode.id, 2500);
    
    // Smoothly pan to the matching table
    setCenter(matchingNode.position.x + 180, matchingNode.position.y + 110, {
      zoom: 1.2,
      duration: 800,
    });

    // Load fresh recommendations for the found node
    const [tableSchema = 'public', tableName = ''] = String(matchingNode.id || '').split('.');
    if (tableName) {
      try {
        const tableRecommendations = await fetchRecommendations({ 
          table_name: tableName, 
          table_schema: tableSchema 
        });
        
        updateNodeRecommendations(matchingNode.id, tableRecommendations);
      } catch (error) {
        console.warn('Failed to fetch filtered recommendations', error);
      }
    }
  };

  // Search functionality
  const tableSearch = useTableSearch({
    nodes: flow.nodes,
    onNodeFound: handleSearchNodeFound,
  });

  // Enhanced nodes with interaction handlers
  const enhancedNodes = getEnhancedNodes(handleRecommendationIconClick);

  // Loading state
  if (graphLoading) {
    return <FullScreenLoader message="Loading schema..." />;
  }

  // Error state  
  if (graphError) {
    return (
      <FullScreenError 
        title="Failed to Load Schema"
        message={graphError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <TopBar 
        search={tableSearch} 
        onOpenAllRecommendations={sidebarState.openAllRecommendations}
      />
      
      <div className="app-content">
        <div className="graph-container">
          <ReactFlow
            nodeTypes={{ erdNode: ErdNode }}
            edgeTypes={{ erdEdge: ErdEdge }}
            nodes={enhancedNodes}
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

        <EnhancedRecommendationsSidebar
          isOpen={sidebarState.isOpen}
          loading={sidebarState.loading}
          error={sidebarState.error}
          items={sidebarState.items}
          tableSchema={sidebarState.tableSchema}
          tableName={sidebarState.tableName}
          selectedType={sidebarState.selectedType}
          onClose={sidebarState.closeSidebar}
        />
      </div>
    </>
  );
}