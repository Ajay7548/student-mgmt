/**
 * LoginForm.tsx
 * -----------------------------------------------------------------------------
 * The sign-in form. It validates the email and password (the core requirement),
 * then asks the auth context to log the user in. On success the parent page
 * redirects to the student dashboard.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validation';
import { FormField } from './FormField';

/**
 * Renders the login form and handles its submission.
 *
 * @returns The JSX for the login form.
 */
export function LoginForm() {
  // `useNavigate` lets us programmatically move to another route after login.
  const navigate = useNavigate();
  const { login } = useAuth();

  // Local state for the two inputs.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Per-field validation errors, keyed by field name.
  const [errors, setErrors] = useState<Record<string, string>>({});
  // A general error shown when the credentials are wrong.
  const [formError, setFormError] = useState('');

  /**
   * Handles the form submission: validate first, then attempt to log in.
   *
   * @param event - The form submit event (we prevent the default page reload).
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError('');

    // 1. Validate the inputs. If anything is invalid, show the messages and stop.
    const validationErrors = validateLogin({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // 2. Attempt login. `login` returns `true` on success or an error message.
    const result = login(email, password);
    if (result === true) {
      navigate('/dashboard'); // Success → go to the protected dashboard.
    } else {
      setFormError(result); // Failure → show "Invalid email or password."
    }
  };

  return (
    <form className="card auth-card" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-card__title">Welcome back</h1>
      <p className="auth-card__subtitle">Sign in to manage student records.</p>

      <FormField
        name="email"
        label="Email"
        type="email"
        value={email}
        placeholder="admin@example.com"
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <FormField
        name="password"
        label="Password"
        type="password"
        value={password}
        placeholder="••••••••"
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      {/* Show the "wrong credentials" message, if any. */}
      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" className="btn btn--primary btn--block">
        Sign in
      </button>
    </form>
  );
}
