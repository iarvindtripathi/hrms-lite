import { Employee } from "../App";

interface Props {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onSelect: (employee: Employee) => void;
  onDelete: (id: number) => Promise<void>;
}

export function EmployeeTable({ employees, selectedEmployeeId, onSelect, onDelete }: Props) {
  if (!employees.length) {
    return null;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className={emp.id === selectedEmployeeId ? "selected" : ""}
              onClick={() => onSelect(emp)}
            >
              <td>{emp.employee_id}</td>
              <td>{emp.full_name}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
              <td>
                <button
                  className="link danger"
                  onClick={async (e) => {
                    e.stopPropagation();
                    // simple confirm for safety
                    // eslint-disable-next-line no-alert
                    if (window.confirm("Delete this employee and all attendance records?")) {
                      await onDelete(emp.id);
                    }
                  }}
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


