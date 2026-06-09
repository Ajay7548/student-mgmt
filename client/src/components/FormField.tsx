/**
 * FormField.tsx
 * -----------------------------------------------------------------------------
 * A small, reusable building block for form inputs. It renders a label, an input
 * (or a <select> for dropdowns), and an error message — all wired together with
 * matching `id`/`htmlFor` for accessibility. Using one component for every field
 * keeps the forms short, consistent, and easy to read.
 */

import type { ChangeEvent } from 'react';

/** The properties (inputs) this component accepts. */
interface FormFieldProps {
  /** Unique field name; also used as the input's id and `name` attribute. */
  name: string;
  /** The visible label text shown above the input. */
  label: string;
  /** The current value of the field (controlled input). */
  value: string;
  /** Called whenever the user types or selects a new value. */
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** The input type (e.g. "text", "email", "password", "date", "tel"). */
  type?: string;
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** An error message to display under the field (omit when the field is valid). */
  error?: string;
  /** When provided, the field renders as a dropdown with these options. */
  options?: { label: string; value: string }[];
}

/**
 * Renders one labelled form field with optional validation error.
 *
 * @param props - See {@link FormFieldProps}.
 * @returns The JSX for a single form field.
 */
export function FormField({
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  options,
}: FormFieldProps) {
  return (
    <div className="field">
      {/* `htmlFor` links the label to the input so clicking the label focuses it. */}
      <label htmlFor={name} className="field__label">
        {label}
      </label>

      {options ? (
        // Render a dropdown when a list of options was supplied (e.g. Gender).
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`field__input${error ? ' field__input--error' : ''}`}
        >
          <option value="">Select…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        // Otherwise render a normal text-style input.
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`field__input${error ? ' field__input--error' : ''}`}
        />
      )}

      {/* Show the validation message only when there is an error. */}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
