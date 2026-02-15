import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [status, setStatus] = useState("Checking API...");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((response) => response.json())
      .then((data) => setStatus(`API status: ${data.status}`))
      .catch(() => setStatus("API is unreachable"));
  }, []);

  return (
    <main>
      <h1>SchemaLens</h1>
      <p>Container-first frontend is running.</p>
      <p>{status}</p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
