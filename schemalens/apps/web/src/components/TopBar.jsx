import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function TopBar({ search, onOpenAllRecommendations, showMinimap, onToggleMinimap, onExport }) {
  const { theme, toggleTheme } = useTheme();
  
  const {
    query,
    showDropdown,
    selectedIndex,
    filteredTables,
    inputRef,
    dropdownRef,
    handleInputChange,
    handleSubmit,
    handleKeyDown,
    handleSuggestionClick,
    handleFocus,
    handleBlur,
    clearSearch,
  } = search;

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSubmit();
  };

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExportMenu]);

  return (
    <header className="app-topbar">
      <div className="app-brand">
        <span className="app-title">SchemaLens</span>
      </div>
      
      <form className="app-search" onSubmit={handleFormSubmit}>
        <span className="app-search__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        
        <input
          ref={inputRef}
          type="search"
          className="app-search__input"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search tables..."
          aria-label="Search tables"
          title="Press / to focus"
          autoComplete="off"
        />
        
        {!query && (
          <span className="app-search__shortcut" aria-hidden="true">
            /
          </span>
        )}
        
        {query && (
          <button
            type="button"
            className="app-search__clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        
        {showDropdown && filteredTables.length > 0 && (
          <div ref={dropdownRef} className="app-search__dropdown">
            {filteredTables.map((table, index) => {
              const tableName = table.data?.title || table.title || 'Unknown Table';
              const tableId = table.id || '';
              
              return (
                <div
                  key={table.id || index}
                  className={`app-search__dropdown-item${
                    index === selectedIndex ? ' app-search__dropdown-item--selected' : ''
                  }`}
                  onClick={() => handleSuggestionClick(table)}
                  onMouseEnter={() => {
                    // This would be handled by the search hook if needed
                    // For now we'll just rely on keyboard navigation
                  }}
                >
                  <div className="app-search__dropdown-item-title">{tableName}</div>
                  {tableId && tableId !== tableName && (
                    <div className="app-search__dropdown-item-id">{tableId}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </form>
      
      <div className="app-actions">
        <div className="app-actions__group" aria-label="Graph tools">
          {onToggleMinimap && (
            <span className="has-tooltip" data-tooltip={showMinimap ? 'Hide minimap' : 'Show minimap'}>
              <button
                type="button"
                className={`minimap-toggle-button${showMinimap ? ' is-active' : ''}`}
                onClick={onToggleMinimap}
                aria-label={showMinimap ? 'Hide minimap' : 'Show minimap'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <rect x="4" y="12" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" />
                </svg>
              </button>
            </span>
          )}

          {onExport && (
            <div className="export-menu-wrapper" ref={exportMenuRef} onMouseLeave={() => setShowExportMenu(false)}>
              <span className="has-tooltip" data-tooltip="Export schema">
                <button
                  type="button"
                  className={`topbar-action-button${showExportMenu ? ' is-active' : ''}`}
                  onClick={() => setShowExportMenu(prev => !prev)}
                  aria-label="Export schema"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </span>
              {showExportMenu && (
                <div className="export-menu">
                  <div className="export-menu__dropdown">
                    <button className="export-menu__item" onClick={() => { onExport('png'); setShowExportMenu(false); }}>
                      <span className="export-menu__ext">PNG</span>
                      <span className="export-menu__desc">Raster image</span>
                    </button>
                    <button className="export-menu__item" onClick={() => { onExport('jpeg'); setShowExportMenu(false); }}>
                      <span className="export-menu__ext">JPEG</span>
                      <span className="export-menu__desc">Compressed image</span>
                    </button>
                    <button className="export-menu__item" onClick={() => { onExport('svg'); setShowExportMenu(false); }}>
                      <span className="export-menu__ext">SVG</span>
                      <span className="export-menu__desc">Vector graphic</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <span className="has-tooltip" data-tooltip={`Switch to ${nextTheme} mode`}>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${nextTheme} mode`}
            >
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </span>
        </div>

        <span className="app-actions__divider" aria-hidden="true" />

        <div className="app-actions__group" aria-label="Panel tools">
          {onOpenAllRecommendations && (
            <span className="has-tooltip" data-tooltip="Recommendations">
              <button
                type="button"
                className="recommendations-button"
                onClick={onOpenAllRecommendations}
                aria-label="View all schema recommendations"
              > 
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>
                </svg>
              </button>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}