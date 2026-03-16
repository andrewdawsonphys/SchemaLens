import { useState, useEffect } from "react";

export default function TopBar() {

  const [theme, setTheme] = useState("light");

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
      </div>
    </header>
  </>
}