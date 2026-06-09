/**
 * StudentForm.tsx
 * -----------------------------------------------------------------------------
 * The form used to BOTH create a new student and edit an existing one. The parent
 * decides which mode we are in by passing `initialValues` (edit) or not (create).
 *
 * It owns the typed-in values, validates them on submit, and — only when valid —
 * hands the clean plaintext back to the parent via `onSubmit`. The parent is then
 * responsible for encrypting and sending them (see DashboardPage).
 */

import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Student, StudentFormData } from '../types/student';
import { validateStudent } from '../utils/validation';
import { FormField } from './FormField';

/** Properties accepted by the StudentForm component. */
interface StudentFormProps {
  /** When provided, the form starts pre-filled and runs in "edit" mode. */
  initialValues?: Student;
  /** Called with the validated plaintext form data when the user submits. */
  onSubmit: (data: StudentFormData) => void;
  /** Called when the user clicks "Cancel". */
  onCancel: () => void;
  /** True while a save request is in flight (disables the buttons). */
  submitting: boolean;
}

/** The blank starting values for a brand-new student. */
const EMPTY_FORM: StudentFormData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  course: '',
  password: '',
};

/** Options for the Gender dropdown. */
const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

/**
 * Renders the create/edit student form.
 *
 * @param props - See {@link StudentFormProps}.
 * @returns The JSX for the student form.
 */
export function StudentForm({ initialValues, onSubmit, onCancel, submitting }: StudentFormProps) {
  // We are editing if the parent handed us an existing student to start from.
  const isEdit = Boolean(initialValues);

  // Pre-fill the form when editing; otherwise start blank. We never echo the
  // existing password back into the form — the field stays empty and is optional
  // on edit (blank means "keep the current password").
  const [values, setValues] = useState<StudentFormData>(() =>
    initialValues ? { ...initialValues, password: '' } : EMPTY_FORM,
  );

  // Validation errors keyed by field name.
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  /**
   * Updates a single field's value as the user types/selects.
   * One handler serves every input because we key off the input's `name`.
   *
   * @param event - The change event from an input or select element.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  /**
   * Validates the form and, if valid, calls `onSubmit` with the plaintext data.
   *
   * @param event - The form submit event.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const validationErrors = validateStudent(values, { isEdit });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit(values);
  };

  return (
    <form className="card student-form" onSubmit={handleSubmit} noValidate>
      <h2 className="student-form__title">{isEdit ? 'Edit student' : 'Register new student'}</h2>

      {/* A two-column grid of fields (collapses to one column on small screens). */}
      <div className="student-form__grid">
        <FormField
          name="fullName"
          label="Full Name"
          value={values.fullName}
          onChange={handleChange}
          placeholder="Jane Doe"
          error={errors.fullName}
        />
        <FormField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          error={errors.email}
        />
        <FormField
          name="phone"
          label="Phone Number"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          placeholder="+15551234567"
          error={errors.phone}
        />
        <FormField
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={values.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
        />
        <FormField
          name="gender"
          label="Gender"
          value={values.gender}
          onChange={handleChange}
          options={GENDER_OPTIONS}
          error={errors.gender}
        />
        <FormField
          name="course"
          label="Course Enrolled"
          value={values.course}
          onChange={handleChange}
          placeholder="Computer Science"
          error={errors.course}
        />
        <FormField
          name="address"
          label="Address"
          value={values.address}
          onChange={handleChange}
          placeholder="221B Baker Street, London"
          error={errors.address}
        />
        <FormField
          name="password"
          label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
        />
      </div>

      {/* Action buttons. Both are disabled while a save is in progress. */}
      <div className="student-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Update student' : 'Create student'}
        </button>
      </div>
    </form>
  );
}
