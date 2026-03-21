import '@xyflow/react/dist/style.css';
import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import SchemaExplorer from './pages/SchemaExplorer.jsx';

function App() {
  return (
    <div className="app-shell">
      <ThemeProvider>
        <ReactFlowProvider>
          <SchemaExplorer />
        </ReactFlowProvider>
      </ThemeProvider>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);