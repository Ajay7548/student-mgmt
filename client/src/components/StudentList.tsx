/**
 * StudentList.tsx
 * -----------------------------------------------------------------------------
 * Displays all students in a table and exposes "Edit" and "Delete" buttons for
 * each row. It is a "presentational" component: it does not fetch or change data
 * itself — it just shows what it is given and reports clicks back to the parent
 * via the `onEdit` / `onDelete` callbacks.
 */

import type { Student } from '../types/student';

/** Properties accepted by the StudentList component. */
interface StudentListProps {
  /** The students to display (already decrypted by the service layer). */
  students: Student[];
  /** True while the initial list is loading. */
  loading: boolean;
  /** Called with a student when its "Edit" button is clicked. */
  onEdit: (student: Student) => void;
  /** Called with a student id when its "Delete" button is clicked. */
  onDelete: (id: string) => void;
}

/**
 * Formats an ISO date string into a short, readable date (e.g. "20 May 2001").
 * Falls back to a dash when the value is missing or unparseable.
 *
 * @param iso - An ISO date string such as "2001-05-20".
 * @returns A human-friendly date, or "—" when not available.
 */
function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Renders the student table (or friendly empty/loading states).
 *
 * @param props - See {@link StudentListProps}.
 * @returns The JSX for the student list.
 */
export function StudentList({ students, loading, onEdit, onDelete }: StudentListProps) {
  // While the first fetch is in progress, show a simple loading message.
  if (loading) {
    return <p className="muted">Loading students…</p>;
  }

  // When there are no students yet, guide the user toward adding one.
  if (students.length === 0) {
    return <p className="muted">No students yet. Click “Add student” to create the first one.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Course</th>
            <th className="table__actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Render one row per student. `key` helps React update the list efficiently. */}
          {students.map((student) => (
            <tr key={student.id}>
              <td data-label="Full Name">{student.fullName}</td>
              <td data-label="Email">{student.email}</td>
              <td data-label="Phone">{student.phone}</td>
              <td data-label="Date of Birth">{formatDate(student.dateOfBirth)}</td>
              <td data-label="Gender">{student.gender}</td>
              <td data-label="Course">{student.course}</td>
              <td data-label="Actions" className="table__actions">
                <button
                  type="button"
                  className="btn btn--small btn--ghost"
                  onClick={() => onEdit(student)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn--small btn--danger"
                  onClick={() => onDelete(student.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
