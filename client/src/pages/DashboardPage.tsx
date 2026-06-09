/**
 * DashboardPage.tsx
 * -----------------------------------------------------------------------------
 * The main protected screen. It ties everything together:
 *   - loads the student list on first render,
 *   - shows the create/edit form,
 *   - performs Create / Update / Delete via the student service,
 *   - and refreshes the list after every change.
 *
 * This is the only "smart" component that talks to the service layer; the form
 * and list components stay simple and reusable.
 */

import { useEffect, useState, useCallback } from 'react';
import { StudentForm } from '../components/StudentForm';
import { StudentList } from '../components/StudentList';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../services/studentService';
import type { Student, StudentFormData } from '../types/student';

/**
 * Renders the student-management dashboard.
 *
 * @returns The JSX for the dashboard page.
 */
export function DashboardPage() {
  const { logout } = useAuth();

  // ----- Component state ------------------------------------------------------
  const [students, setStudents] = useState<Student[]>([]); // The list to display.
  const [loading, setLoading] = useState(true); // True during the initial load.
  const [error, setError] = useState(''); // Any error message to show in a banner.
  const [showForm, setShowForm] = useState(false); // Whether the form is open.
  const [editing, setEditing] = useState<Student | null>(null); // Student being edited (if any).
  const [submitting, setSubmitting] = useState(false); // True while saving.

  /**
   * Fetches the latest student list from the API and stores it in state.
   * Wrapped in `useCallback` so its identity is stable for the effect below.
   */
  const loadStudents = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the list once, right after the page first renders.
  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  /** Opens the form in "create" mode (no existing student). */
  const handleAddClick = (): void => {
    setEditing(null);
    setShowForm(true);
  };

  /**
   * Opens the form in "edit" mode, pre-filled with the chosen student.
   *
   * @param student - The student to edit.
   */
  const handleEditClick = (student: Student): void => {
    setEditing(student);
    setShowForm(true);
  };

  /** Closes the form without saving. */
  const handleCancel = (): void => {
    setShowForm(false);
    setEditing(null);
  };

  /**
   * Handles a form submission for BOTH create and edit. It chooses the right
   * service call based on whether we are currently editing a student.
   *
   * @param formData - The validated plaintext student data from the form.
   */
  const handleSubmit = async (formData: StudentFormData): Promise<void> => {
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        await updateStudent(editing.id, formData); // UPDATE existing.
      } else {
        await createStudent(formData); // CREATE new.
      }
      setShowForm(false);
      setEditing(null);
      await loadStudents(); // Refresh the table so the change is visible.
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Deletes a student after a confirmation prompt, then refreshes the list.
   *
   * @param id - The id of the student to delete.
   */
  const handleDelete = async (id: string): Promise<void> => {
    // A simple confirm dialog guards against accidental deletions.
    if (!window.confirm('Delete this student? This cannot be undone.')) return;

    setError('');
    try {
      await deleteStudent(id);
      await loadStudents();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="dashboard">
      {/* ----- Top bar: title + actions ------------------------------------- */}
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Student Management</h1>
          <p className="muted">Securely manage student records with two-level encryption.</p>
        </div>
        <div className="dashboard__header-actions">
          {!showForm && (
            <button type="button" className="btn btn--primary" onClick={handleAddClick}>
              + Add student
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {/* ----- Error banner (only when something went wrong) ----------------- */}
      {error && <div className="banner banner--error">{error}</div>}

      {/* ----- The create/edit form (shown on demand) ------------------------ */}
      {showForm && (
        <StudentForm
          // `key` forces React to rebuild the form when switching between
          // create and different edit targets, so old values never linger.
          key={editing?.id ?? 'new'}
          initialValues={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      )}

      {/* ----- The student table -------------------------------------------- */}
      <section className="card">
        <StudentList
          students={students}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
