/**
 * Custom hook for managing recommendations sidebar state
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchRecommendations } from '../services/api.js';
import { filter_recommendations_by_type } from '../utils/recommendationHelpers.js';

const SIDEBAR_STORAGE_KEY = "schemalens-recommendations-sidebar-open";

/**
 * Get initial sidebar open state from localStorage
 */
function getInitialSidebarOpenState() {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

/**
 * Hook for managing recommendations sidebar state
 */
export function useSidebarState() {
  const [state, setState] = useState({
    isOpen: getInitialSidebarOpenState(),
    loading: false,
    error: '',
    items: [],
    tableSchema: 'public',
    tableName: '',
    selectedType: '',
    viewMode: 'table', // 'table' or 'all'
  });

  // Persist sidebar open state to localStorage
  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(state.isOpen));
  }, [state.isOpen]);

  /**
   * Open sidebar and load recommendations for all schemas
   */
  const openAllRecommendations = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      loading: true,
      error: '',
      items: [],
      viewMode: 'all',
      tableSchema: '',
      tableName: '',
      selectedType: '',
    }));

    try {
      const allItems = await fetchRecommendations(); // Fetch all recommendations

      setState(prev => ({
        ...prev,
        loading: false,
        items: allItems,
      }));

    } catch (error) {
      console.warn('Failed to fetch all recommendations:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load recommendations from API.',
      }));
    }
  }, []);

  /**
   * Toggle sidebar with all recommendations - close if open, open if closed
   */
  const toggleAllRecommendations = useCallback(async () => {
    if (state.isOpen) {
      // If sidebar is open, close it
      setState(prev => ({
        ...prev,
        isOpen: false,
      }));
    } else {
      // If sidebar is closed, open it with all recommendations
      await openAllRecommendations();
    }
  }, [state.isOpen, openAllRecommendations]);

  /**
   * Open sidebar and load recommendations for a table
   */
  const openSidebar = useCallback(async ({ nodeId, tableName, type }) => {
    const [tableSchema = 'public', parsedTableName = tableName || ''] = String(nodeId || '').split('.');
    const effectiveTableName = parsedTableName || tableName || '';

    if (!effectiveTableName) {
      console.warn('Cannot open sidebar: missing table name');
      return;
    }

    setState(prev => ({
      ...prev,
      isOpen: true,
      loading: true,
      error: '',
      items: [],
      viewMode: 'table',
      tableSchema,
      tableName: effectiveTableName,
      selectedType: type || '',
    }));

    try {
      const allItems = await fetchRecommendations({ 
        table_name: effectiveTableName, 
        table_schema: tableSchema 
      });

      const filteredItems = filter_recommendations_by_type(allItems, type);

      setState(prev => ({
        ...prev,
        loading: false,
        items: filteredItems,
      }));

    } catch (error) {
      console.warn('Failed to fetch sidebar recommendations:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load recommendations from API.',
      }));
    }
  }, []);

  /**
   * Close sidebar
   */
  const closeSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  /**
   * Toggle sidebar open/closed state
   */
  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  /**
   * Update recommendations without changing other state
   */
  const updateRecommendations = useCallback((items, selectedType = '') => {
    const filteredItems = filter_recommendations_by_type(items, selectedType);
    
    setState(prev => ({
      ...prev,
      items: filteredItems,
      selectedType,
      loading: false,
      error: '',
    }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading) => {
    setState(prev => ({
      ...prev,
      loading,
    }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  /**
   * Clear all recommendations
   */
  const clearRecommendations = useCallback(() => {
    setState(prev => ({
      ...prev,
      items: [],
      error: '',
    }));
  }, []);

  // Auto-load recommendations if sidebar was open on page refresh
  useEffect(() => {
    if (state.isOpen && state.items.length === 0 && !state.loading) {
      // If sidebar is open but no data loaded, load all recommendations
      openAllRecommendations();
    }
  }, []); // Only run on mount

  return {
    // State
    ...state,
    
    // Actions
    openSidebar,
    openAllRecommendations,
    toggleAllRecommendations,
    closeSidebar,
    toggleSidebar,
    updateRecommendations,
    setLoading,
    setError,
    clearRecommendations,
    
    // Computed properties
    hasItems: state.items.length > 0,
    hasError: Boolean(state.error),
    isEmpty: !state.loading && state.items.length === 0 && !state.error,
  };
}