/**
 * validation.ts
 * -----------------------------------------------------------------------------
 * Pure, reusable form-validation helpers. "Pure" means each function only looks
 * at its inputs and returns a result — it never touches the screen or the network,
 * which makes the rules easy to read and to test.
 *
 * The pattern: each `validateX` function returns an `errors` object. An EMPTY
 * object means "everything is valid"; otherwise each key holds a human-readable
 * message describing what is wrong with that field.
 */

import type { StudentFormData } from '../types/student';

/** Matches a typical email address such as "jane.doe@example.com". */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches a phone number of 7–15 digits, optionally starting with "+". */
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

/**
 * Validates an email address.
 *
 * @param email - The email string to check.
 * @returns An error message, or `null` when the email is valid.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validates a password against a clear strength policy:
 *   - at least 8 characters long
 *   - contains at least one letter
 *   - contains at least one number
 *
 * @param password - The password string to check.
 * @returns An error message, or `null` when the password is valid.
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Za-z]/.test(password)) return 'Password must include at least one letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  return null;
}

/**
 * Validates the LOGIN form (email + password). Per the task requirements, the
 * login form's job is to validate these two fields.
 *
 * @param values - The email and password entered on the login form.
 * @returns A map of field name → error message (empty when the form is valid).
 */
export function validateLogin(values: {
  email: string;
  password: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  // For login we only require a password to be present (the strength policy is
  // enforced at registration time, not every time someone signs in).
  if (!values.password) errors.password = 'Password is required.';

  return errors;
}

/**
 * Validates the full STUDENT registration / edit form.
 *
 * @param values        - The student form values to validate.
 * @param options       - Extra options.
 * @param options.isEdit- When true, the password may be left blank to keep the
 *                        existing one (handy when editing a student).
 * @returns A map of field name → error message (empty when the form is valid).
 */
export function validateStudent(
  values: StudentFormData,
  options: { isEdit?: boolean } = {},
): Partial<Record<keyof StudentFormData, string>> {
  const errors: Partial<Record<keyof StudentFormData, string>> = {};

  // Full name: required, at least 2 characters.
  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name looks too short.';
  }

  // Email: required + valid format.
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  // Phone: required + valid format.
  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!PHONE_REGEX.test(values.phone)) {
    errors.phone = 'Enter a valid phone number (7–15 digits, optional leading +).';
  }

  // Date of birth: required and not in the future.
  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else if (new Date(values.dateOfBirth) > new Date()) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.';
  }

  // Gender: required (chosen from a dropdown).
  if (!values.gender) errors.gender = 'Please select a gender.';

  // Address: required.
  if (!values.address.trim()) errors.address = 'Address is required.';

  // Course: required.
  if (!values.course.trim()) errors.course = 'Course enrolled is required.';

  // Password: required on create; optional on edit (blank = keep current).
  if (!(options.isEdit && !values.password)) {
    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;
  }

  return errors;
}
