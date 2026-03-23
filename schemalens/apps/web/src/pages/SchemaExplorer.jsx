/**
 * Main schema explorer page component
 */

import { useState, useCallback } from 'react';
import { ReactFlow, Background, useReactFlow, MiniMap, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import TopBar from '../components/TopBar.jsx';
import EnhancedRecommendationsSidebar from '../components/EnhancedRecommendationsSidebar.jsx';
import ErdNode from '../components/ErdNode.jsx';
import ErdEdge from '../components/ErdEdge.jsx';
import SchemaGroup from '../components/SchemaGroup.jsx';
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

  // Minimap visibility
  const [showMinimap, setShowMinimap] = useState(true);

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

  // Handle view table navigation from recommendations
  const handleViewTable = (schema, tableName) => {
    // Try multiple possible node ID formats since schema may be omitted
    const candidates = [
      `${schema}.${tableName}`,
      `public.${tableName}`,
      tableName,
    ];

    let targetNode = null;
    for (const id of candidates) {
      targetNode = findNode(id);
      if (targetNode) break;
    }

    if (targetNode) {
      highlightNode(targetNode.id, 2500);
      setCenter(targetNode.position.x + 180, targetNode.position.y + 110, {
        zoom: 1.2,
        duration: 800,
      });
    } else {
      console.warn(`Table ${schema}.${tableName} not found in ERD`);
    }
  };

  // Search functionality
  const tableSearch = useTableSearch({
    nodes: flow.nodes,
    onNodeFound: handleSearchNodeFound,
  });

  // Enhanced nodes with interaction handlers
  const enhancedNodes = getEnhancedNodes(handleRecommendationIconClick);

  // Schema export
  const handleExport = useCallback((format) => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    const nodesBounds = getNodesBounds(enhancedNodes);
    const padding = 50;
    const width = nodesBounds.width + padding * 2;
    const height = nodesBounds.height + padding * 2;
    const { x, y, zoom } = getViewportForBounds(nodesBounds, width, height, 0.5, 2, padding);

    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f8fafc';
    const options = {
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      },
    };

    const exporters = {
      png: () => toPng(viewport, { ...options, backgroundColor: bgColor }),
      jpeg: () => toJpeg(viewport, { ...options, backgroundColor: bgColor, quality: 0.95 }),
      svg: () => toSvg(viewport, { ...options, backgroundColor: bgColor }),
    };

    const ext = format || 'png';
    const exporter = exporters[ext];
    if (!exporter) return;

    exporter().then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', `schema.${ext}`);
      a.setAttribute('href', dataUrl);
      a.click();
    });
  }, [enhancedNodes]);

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
        onOpenAllRecommendations={sidebarState.toggleAllRecommendations}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap(prev => !prev)}
        onExport={handleExport}
      />
      
      <div className="app-content">
        <div className="graph-container">
          <ReactFlow
            nodeTypes={{ erdNode: ErdNode, schemaGroup: SchemaGroup }}
            edgeTypes={{ erdEdge: ErdEdge }}
            nodes={enhancedNodes}
            edges={flow.edges}
            onNodesChange={onNodesChange}
            nodesDraggable={false}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            {showMinimap && (
              <MiniMap
                position="bottom-left"
                nodeStrokeWidth={2}
                nodeColor={(node) => {
                  if (node.type === 'schemaGroup') return 'transparent';
                  const rec = node.data?.recommendations?.counts;
                  if (rec?.error > 0) return '#ef4444';
                  if (rec?.warning > 0) return '#f59e0b';
                  return 'var(--surface-strong)';
                }}
                maskColor="var(--bg)"
                style={{ width: 180, height: 130 }}
              />
            )}
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
          viewMode={sidebarState.viewMode}
          onClose={sidebarState.closeSidebar}
          onViewTable={handleViewTable}
        />
      </div>
    </>
  );
}