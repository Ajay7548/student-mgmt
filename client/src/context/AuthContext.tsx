/**
 * AuthContext.tsx
 * -----------------------------------------------------------------------------
 * A lightweight authentication layer for the Login page. It exposes whether the
 * user is signed in, plus `login` and `logout` actions, to the whole app via
 * React Context (so any component can read the auth state without "prop drilling").
 *
 * SCOPE NOTE (read me): the task specifies a "Login form with email & password
 * validation" but lists no login API route — the four documented routes are all
 * for student CRUD. So authentication here is intentionally a CLIENT-SIDE GATE
 * that checks the form against demo credentials from the environment. It is NOT
 * production-grade security. The README's "Authentication" section explains how
 * you would extend this to real, token-based auth.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

/** The shape of the value provided to consumers of the auth context. */
interface AuthContextValue {
  /** True when the user has passed the login gate. */
  isAuthenticated: boolean;
  /**
   * Attempts to log in with the given credentials.
   * @returns `true` on success, or an error message string on failure.
   */
  login: (email: string, password: string) => true | string;
  /** Signs the user out and clears the saved session flag. */
  logout: () => void;
}

// The key under which we remember "this user is logged in" for the browser session.
const SESSION_KEY = 'student-mgmt-auth';

// Create the context. It is `undefined` until a provider supplies a value, which
// lets the `useAuth` hook below detect misuse outside the provider.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Wraps the app and supplies the authentication state + actions to everything
 * inside it. Rendered once near the root of the component tree (see App.tsx).
 *
 * @param props.children - The rest of the app that should have access to auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from sessionStorage so a page refresh doesn't log the user out.
  // `sessionStorage` is cleared when the tab closes — reasonable for a demo gate.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === 'true',
  );

  /**
   * Checks the submitted credentials against the demo values from the .env file.
   *
   * @param email    - The email entered on the login form.
   * @param password - The password entered on the login form.
   * @returns `true` if they match; otherwise a message explaining the failure.
   */
  const login = (email: string, password: string): true | string => {
    const expectedEmail = import.meta.env.VITE_DEMO_EMAIL;
    const expectedPassword = import.meta.env.VITE_DEMO_PASSWORD;

    if (email.trim().toLowerCase() === expectedEmail?.toLowerCase() && password === expectedPassword) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return 'Invalid email or password.';
  };

  /** Clears the session and marks the user as logged out. */
  const logout = (): void => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Convenience hook to read the auth context from any component:
 *   const { isAuthenticated, login, logout } = useAuth();
 *
 * @returns The current auth context value.
 * @throws If used outside of an <AuthProvider> (a programming mistake).
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}
