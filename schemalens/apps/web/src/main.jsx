import { useEffect, useState, useCallback } from "react";
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [status, setStatus] = useState("Checking API...");
  

  useEffect(() => {
    fetch("http://localhost:8000/api/v1")
      .then((response) => response.json())
      .then((data) => setStatus(`API status: ${data.message}`))
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
