import { useEffect, useState } from "react";
import { EmployeeForm } from "./components/EmployeeForm";
import { EmployeeTable } from "./components/EmployeeTable";
import { AttendancePanel } from "./components/AttendancePanel";
import { api } from "./services/api";

export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  status: string;
}

export function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Employee[]>("/employees");
      setEmployees(res.data);
      if (res.data.length && !selectedEmployee) {
        setSelectedEmployee(res.data[0]);
      } else if (!res.data.length) {
        setSelectedEmployee(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>HRMS Lite</h1>
          <p className="subtitle">A small HR toolkit to manage employees and their daily attendance</p>
        </div>
      </header>

      <main className="app-main">
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Employees</h2>
              <p className="muted">Manage employee directory</p>
            </div>
          </div>

          <EmployeeForm
            onCreated={fetchEmployees}
            onError={setError}
          />

          {loading && <div className="info state">Loading employees…</div>}
          {error && (
            <div className="error state">
              {error}
              <button onClick={fetchEmployees}>Retry</button>
            </div>
          )}
          {!loading && !employees.length && <div className="empty state">No employees yet. Add your first employee.</div>}

          {!!employees.length && (
            <EmployeeTable
              employees={employees}
              selectedEmployeeId={selectedEmployee?.id ?? null}
              onSelect={setSelectedEmployee}
              onDelete={async (id) => {
                try {
                  await api.delete(`/employees/${id}`);
                  await fetchEmployees();
                } catch (err: any) {
                  setError(err?.response?.data?.detail ?? "Failed to delete employee");
                }
              }}
            />
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Attendance</h2>
              <p className="muted">Track daily presence</p>
            </div>
          </div>
          {!selectedEmployee ? (
            <div className="empty state">Select or create an employee to view attendance.</div>
          ) : (
            <AttendancePanel
              employee={selectedEmployee}
              onError={setError}
            />
          )}
        </section>
      </main>
      <footer className="app-footer">
        <span>HRMS Lite &middot; Built by Arvin as a full‑stack assignment</span>
      </footer>
    </div>
  );
}


