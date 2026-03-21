import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function TopBar({ search, onOpenAllRecommendations }) {
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
        {onOpenAllRecommendations && (
          <button
            type="button"
            className="recommendations-button"
            onClick={onOpenAllRecommendations}
            aria-label="View all schema recommendations"
            title="View all schema recommendations"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-4"/>
              <path d="M19 3H9a2 2 0 0 0-2 2v4"/>
              <circle cx="13.5" cy="6.5" r=".5"/>
              <circle cx="17.5" cy="10.5" r=".5"/>
              <circle cx="8.5" cy="7.5" r=".5"/>
              <circle cx="15" cy="8" r=".5"/>
            </svg>
          </button>
        )}
        
        <button
          type="button"
          className={`theme-toggle-switch ${theme === "dark" ? "is-dark" : "is-light"}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${nextTheme} mode`}
          role="switch"
          aria-checked={theme === "dark"}
        >
          <span className="theme-toggle-icon theme-toggle-icon--sun" aria-hidden="true">☀️</span>
          <span className="theme-toggle-icon theme-toggle-icon--moon" aria-hidden="true">🌙</span>
          <span className="theme-toggle-thumb" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}