import { FormEvent, useState } from "react";
import { api } from "../services/api";

interface Props {
  onCreated: () => void;
  onError: (msg: string | null) => void;
}

export function EmployeeForm({ onCreated, onError }: Props) {
  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      await api.post("/employees", {
        employee_id: employeeId.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        department: department.trim(),
      });
      setEmployeeId("");
      setFullName("");
      setEmail("");
      setDepartment("");
      await onCreated();
    } catch (err: any) {
      onError(err?.response?.data?.detail ?? "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label>Employee ID</label>
        <input
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="EMP001"
        />
      </div>
      <div className="field">
        <label>Full Name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
        />
      </div>
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
        />
      </div>
      <div className="field">
        <label>Department</label>
        <input
          required
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Engineering"
        />
      </div>
      <div className="actions">
        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Adding…" : "Add Employee"}
        </button>
      </div>
    </form>
  );
}


