import { useState, useEffect } from "react";

export default function TopBar() {

  const [apiStatus, setApiStatus] = useState("checking");
  const [theme, setTheme] = useState("light");

  const statusLabel = apiStatus === "healthy"
    ? "API healthy"
    : apiStatus === "unhealthy"
      ? "API unavailable"
      : "Checking API";

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

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        let response = await fetch("http://localhost:8000/health");

        if (!response.ok) {
          response = await fetch("http://localhost:8000/api/v1");
        }

        if (!response.ok) {
          throw new Error(`Health API Error: ${response.status}`);
        }

        if (active) {
          setApiStatus("healthy");
        }
      } catch (error) {
        if (active) {
          setApiStatus("unhealthy");
        }
      }
    }

    checkHealth();
    const intervalId = setInterval(checkHealth, 60_000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return <>
    <header className="app-topbar">
      <div className="app-brand">
        <span className="app-title">SchemaLens</span>
      </div>
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
        <div className="app-status" aria-live="polite">
          <span className={`status-dot status-dot--${apiStatus}`} aria-hidden="true" />
          <span className="status-text">{statusLabel}</span>
        </div>
      </div>
    </header>
  </>
}