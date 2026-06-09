/**
 * App.tsx
 * -----------------------------------------------------------------------------
 * The root component. It defines the app's routes (which URL shows which page)
 * and protects the dashboard so only signed-in users can reach it.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

/**
 * A wrapper that only renders its child page if the user is logged in; otherwise
 * it bounces them to the login screen. This is how we "protect" the dashboard.
 *
 * @param props.children - The page to show when the user is authenticated.
 * @returns The protected page, or a redirect to "/login".
 */
function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Declares every route in the application.
 *
 * @returns The routing table as JSX.
 */
export default function App() {
  return (
    <Routes>
      {/* Public route: the login page. */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected route: the dashboard is only reachable once signed in. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Default: send the root URL to the dashboard (which itself redirects to
          login if the user isn't authenticated). */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all: any unknown URL falls back to the dashboard. */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
