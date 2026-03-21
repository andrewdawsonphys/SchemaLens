/**
 * Custom hook for handling sidebar resize functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const SIDEBAR_WIDTH_KEY = 'schemalens-sidebar-width';
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 320;
const MAX_WIDTH = 800;

/**
 * Get initial sidebar width from localStorage
 */
function getInitialWidth() {
  if (typeof window === 'undefined') return DEFAULT_WIDTH;
  const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  return stored ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(stored, 10))) : DEFAULT_WIDTH;
}

/**
 * Hook for managing sidebar resize state and interactions
 */
export function useSidebarResize() {
  const [width, setWidth] = useState(getInitialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Persist width to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString());
  }, [width]);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // Add global cursor style
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const deltaX = startXRef.current - e.clientX; // Inverted because sidebar grows leftward
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidthRef.current + deltaX));
    
    setWidth(newWidth);
  }, [isResizing]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizing]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Reset to default width
  const resetWidth = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
  }, []);

  return {
    width,
    isResizing,
    handleMouseDown,
    resetWidth,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
  };
}