/**
 * main.tsx
 * -----------------------------------------------------------------------------
 * The JavaScript entry point. The browser loads this first (via index.html). Its
 * job is to mount the React application into the page and wrap it in the two
 * "providers" the whole app depends on:
 *   - <BrowserRouter>: enables client-side routing (changing pages without reloads).
 *   - <AuthProvider>:  supplies the login/logout state everywhere.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';

// Find the <div id="root"> from index.html. We assert it exists because the app
// cannot run without it (and TypeScript would otherwise warn it might be null).
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found in index.html.');
}

// Create the React root and render the app tree into it.
createRoot(rootElement).render(
  // <StrictMode> activates extra development-time checks that flag potential bugs.
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
