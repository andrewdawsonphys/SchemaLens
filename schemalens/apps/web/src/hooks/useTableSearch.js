/**
 * Custom hook for table search functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { findMatchingNode, filterNodesForSuggestions } from '../utils/searchUtils.js';

/**
 * Hook for managing table search state and interactions
 */
export function useTableSearch({ nodes = [], onNodeFound, maxSuggestions = 10 }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filteredTables, setFilteredTables] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update filtered suggestions when query or nodes change
  useEffect(() => {
    if (!query.trim()) {
      setFilteredTables([]);
      return;
    }

    const suggestions = filterNodesForSuggestions(nodes, query, maxSuggestions);
    setFilteredTables(suggestions);
  }, [query, nodes, maxSuggestions]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((value) => {
    setQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(Boolean(value.trim()));
  }, []);

  /**
   * Handle search submission
   */
  const handleSubmit = useCallback((searchQuery = query) => {
    if (!searchQuery.trim()) return null;

    const matchingNode = findMatchingNode(nodes, searchQuery);
    
    if (matchingNode && onNodeFound) {
      onNodeFound(matchingNode);
      setShowDropdown(false);
      return matchingNode;
    }

    return null;
  }, [query, nodes, onNodeFound]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event) => {
    if (!showDropdown || !filteredTables.length) {
      if (event.key === 'Enter') {
        handleSubmit();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredTables.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredTables.length) {
          const selectedNode = filteredTables[selectedIndex];
          handleSubmit(selectedNode.data.title);
        } else {
          handleSubmit();
        }
        break;

      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  }, [showDropdown, filteredTables, selectedIndex, handleSubmit]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((node) => {
    const tableName = node.data?.title || '';
    setQuery(tableName);
    handleSubmit(tableName);
  }, [handleSubmit]);

  /**
   * Focus the search input
   */
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Select all text in input
   */
  const selectAllText = useCallback(() => {
    inputRef.current?.select();
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    setFilteredTables([]);
  }, []);

  /**
   * Close dropdown
   */
  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, []);

  /**
   * Handle input focus
   */
  const handleFocus = useCallback(() => {
    if (query.trim()) {
      setShowDropdown(true);
    }
  }, [query]);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback((event) => {
    // Delay hiding dropdown to allow clicking on suggestions
    setTimeout(() => {
      if (!dropdownRef.current?.contains(event.relatedTarget)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  // Global slash shortcut for search
  useEffect(() => {
    const handleGlobalSlashShortcut = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const activeEl = document.activeElement;
      const isTypingContext =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable;

      if (isTypingContext) {
        return;
      }

      event.preventDefault();
      focusInput();
      selectAllText();
    };

    document.addEventListener('keydown', handleGlobalSlashShortcut);
    return () => document.removeEventListener('keydown', handleGlobalSlashShortcut);
  }, [focusInput, selectAllText]);

  return {
    // State
    query,
    showDropdown,
    selectedIndex,
    filteredTables,
    
    // Refs
    inputRef,
    dropdownRef,
    
    // Actions
    handleInputChange,
    handleSubmit,
    handleKeyDown,
    handleSuggestionClick,
    handleFocus,
    handleBlur,
    focusInput,
    selectAllText,
    clearSearch,
    closeDropdown,
    
    // Computed properties
    hasResults: filteredTables.length > 0,
    noResults: query.trim() && filteredTables.length === 0,
  };
}