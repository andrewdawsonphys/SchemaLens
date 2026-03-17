import { useState, useEffect, useRef } from "react";

export default function TopBar({ onSearchSubmit, onSearchChange, tables = [] }) {

  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filteredTables, setFilteredTables] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("schemalens-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("schemalens-theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  const handleSearchChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    onSearchChange?.(nextQuery);

    // Filter tables for dropdown
    if (nextQuery.trim()) {
      const filtered = tables.filter((table) => {
        const tableName = (table.data?.title || table.title || "").toLowerCase();
        const tableId = (table.id || "").toLowerCase();
        const searchTerm = nextQuery.toLowerCase();
        return tableName.includes(searchTerm) || tableId.includes(searchTerm);
      }).slice(0, 10); // Limit to 10 results
      
      setFilteredTables(filtered);
      setShowDropdown(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredTables([]);
      setShowDropdown(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const targetQuery = selectedIndex >= 0 && filteredTables[selectedIndex] 
      ? (filteredTables[selectedIndex].data?.title || filteredTables[selectedIndex].title || query.trim())
      : query.trim();
    
    onSearchSubmit?.(targetQuery);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!showDropdown || filteredTables.length === 0) {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = selectedIndex < filteredTables.length - 1 ? selectedIndex + 1 : 0;
        setSelectedIndex(nextIndex);
        // Update search input with selected item
        const nextTable = filteredTables[nextIndex];
        const nextTableName = nextTable?.data?.title || nextTable?.title || '';
        setQuery(nextTableName);
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredTables.length - 1;
        setSelectedIndex(prevIndex);
        // Update search input with selected item
        const prevTable = filteredTables[prevIndex];
        const prevTableName = prevTable?.data?.title || prevTable?.title || '';
        setQuery(prevTableName);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          const selectedTable = filteredTables[selectedIndex];
          const tableName = selectedTable.data?.title || selectedTable.title || '';
          setQuery(tableName);
          onSearchSubmit?.(tableName);
        } else {
          onSearchSubmit?.(query.trim());
        }
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleDropdownItemClick = (table) => {
    const tableName = table.data?.title || table.title || '';
    setQuery(tableName);
    onSearchSubmit?.(tableName);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (query.trim() && filteredTables.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = (event) => {
    // Delay hiding dropdown to allow clicking on items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  return <>
    <header className="app-topbar">
      <div className="app-brand">
        <span className="app-title">SchemaLens</span>
      </div>
      <form className="app-search" onSubmit={handleSearchSubmit}>
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
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Search tables..."
          aria-label="Search tables"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="app-search__clear"
            onClick={() => { 
              setQuery(""); 
              onSearchChange?.(""); 
              setShowDropdown(false);
              setFilteredTables([]);
            }}
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
                  onClick={() => handleDropdownItemClick(table)}
                  onMouseEnter={() => setSelectedIndex(index)}
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
        <button
          type="button"
          className={`theme-toggle-switch ${theme === "dark" ? "is-dark" : "is-light"}`}
          onClick={() => setTheme(nextTheme)}
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
  </>
}