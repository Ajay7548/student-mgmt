/**
 * LoginPage.tsx
 * -----------------------------------------------------------------------------
 * The full-screen page that hosts the <LoginForm>. It also redirects users who
 * are ALREADY logged in straight to the dashboard, so they don't see the login
 * screen again unnecessarily.
 */

import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

/**
 * Renders the login page.
 *
 * @returns Either a redirect (if already signed in) or the login layout.
 */
export function LoginPage() {
  const { isAuthenticated } = useAuth();

  // If the user is already authenticated, skip the form and go to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="centered-page">
      <LoginForm />

      {/* A small hint so a reviewer can sign in quickly. The actual values come
          from the .env file (VITE_DEMO_EMAIL / VITE_DEMO_PASSWORD). */}
      <p className="demo-hint">
        Demo login → <strong>{import.meta.env.VITE_DEMO_EMAIL}</strong> /{' '}
        <strong>{import.meta.env.VITE_DEMO_PASSWORD}</strong>
      </p>
    </div>
  );
}
