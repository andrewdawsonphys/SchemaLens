import { useState, useEffect } from "react";

export default function TopBar({ onSearchSubmit, onSearchChange }) {

  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("");

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
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearchSubmit?.(query.trim());
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
          type="search"
          className="app-search__input"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search tables..."
          aria-label="Search tables"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="app-search__clear"
            onClick={() => { setQuery(""); onSearchChange?.(""); }}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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