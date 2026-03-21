/**
 * Custom hook for managing React Flow graph state
 */

import { useState, useEffect, useCallback } from 'react';
import { applyNodeChanges } from '@xyflow/react';
import { fetchAllSchemaData } from '../services/api.js';
import { mapSchemaToFlow } from '../utils/schemaTransform.js';

/**
 * Hook for managing flow graph state and operations
 */
export function useFlowGraph() {
  const [flow, setFlow] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);

  // Load initial schema data
  useEffect(() => {
    loadSchema();
  }, []);

  /**
   * Load schema data from API and convert to flow format
   */
  const loadSchema = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { schema, relationships, recommendations, errors } = await fetchAllSchemaData();

      if (!schema) {
        throw new Error('Failed to load schema data');
      }

      const flowData = mapSchemaToFlow(schema, relationships, recommendations);
      setFlow(flowData);

      // Log any non-critical errors from parallel requests
      if (errors.length > 0) {
        console.warn('Some data could not be loaded:', errors);
      }

    } catch (err) {
      console.error('Failed to load schema:', err);
      setError(err.message || 'Failed to load schema');
      setFlow({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle node changes (drag, select, etc.)
   */
  const onNodesChange = useCallback((changes) => {
    setFlow((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes),
    }));
  }, []);

  /**
   * Update node data while preserving position
   */
  const updateNodeData = useCallback((nodeId, dataUpdates) => {
    setFlow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            ...dataUpdates,
          },
        };
      }),
    }));
  }, []);

  /**
   * Add or update recommendations for a specific node
   */
  const updateNodeRecommendations = useCallback((nodeId, recommendations) => {
    updateNodeData(nodeId, {
      recommendations: {
        items: recommendations,
        counts: {
          error: recommendations.filter(item => item.type === 'error').length,
          warning: recommendations.filter(item => item.type === 'warning').length,
          info: recommendations.filter(item => item.type === 'info').length,
        },
      },
    });
  }, [updateNodeData]);

  /**
   * Highlight a specific node (for search results)
   */
  const highlightNode = useCallback((nodeId, duration = 2500) => {
    setHighlightedNodeId(nodeId);
    
    if (duration > 0) {
      setTimeout(() => {
        setHighlightedNodeId(null);
      }, duration);
    }
  }, []);

  /**
   * Clear node highlighting
   */
  const clearHighlighting = useCallback(() => {
    setHighlightedNodeId(null);
  }, []);

  /**
   * Get enhanced nodes with highlighting and interaction data
   */
  const getEnhancedNodes = useCallback((onRecommendationClick) => {
    return flow.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted: highlightedNodeId === node.id,
        onRecommendationClick,
      }
    }));
  }, [flow.nodes, highlightedNodeId]);

  /**
   * Find node by table name or ID
   */
  const findNode = useCallback((searchTerm) => {
    if (!searchTerm?.trim()) return null;

    const term = searchTerm.toLowerCase();
    return flow.nodes.find((node) => {
      const tableName = node.data?.title?.toLowerCase() || "";
      const nodeId = node.id?.toLowerCase() || "";
      return tableName.includes(term) || nodeId.includes(term);
    });
  }, [flow.nodes]);

  /**
   * Refresh schema data
   */
  const refreshSchema = useCallback(() => {
    loadSchema();
  }, [loadSchema]);

  return {
    // State
    flow,
    loading,
    error,
    highlightedNodeId,
    
    // Actions
    onNodesChange,
    updateNodeData,
    updateNodeRecommendations,
    highlightNode,
    clearHighlighting,
    refreshSchema,
    
    // Derived data
    getEnhancedNodes,
    findNode,
    
    // Direct access to arrays
    nodes: flow.nodes,
    edges: flow.edges,
  };
}