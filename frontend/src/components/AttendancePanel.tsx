import { FormEvent, useEffect, useState } from "react";
import { Attendance, Employee } from "../App";
import { api } from "../services/api";

interface Props {
  employee: Employee;
  onError: (msg: string | null) => void;
}

export function AttendancePanel({ employee, onError }: Props) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [status, setStatus] = useState<"Present" | "Absent">("Present");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [loadingMark, setLoadingMark] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      onError(null);
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get<Attendance[]>(`/employees/${employee.id}/attendance`, {
        params,
      });
      setRecords(res.data);
    } catch (err: any) {
      onError(err?.response?.data?.detail ?? "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRecords([]);
    setStartDate("");
    setEndDate("");
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onError(null);
    setLoadingMark(true);
    try {
      await api.post("/attendance", {
        employee_id: employee.id,
        date,
        status,
      });
      await fetchAttendance();
    } catch (err: any) {
      onError(err?.response?.data?.detail ?? "Failed to mark attendance");
    } finally {
      setLoadingMark(false);
    }
  };

  const totalPresent = records.filter((r) => r.status === "Present").length;

  return (
    <div className="attendance-panel">
      <div className="employee-summary">
        <h3>{employee.full_name}</h3>
        <p className="muted">
          {employee.employee_id} &middot; {employee.department}
        </p>
        <p className="muted small">Total present days: {totalPresent}</p>
      </div>

      <form
        className="form-inline"
        onSubmit={handleSubmit}
      >
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "Present" | "Absent")}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
        <div className="actions">
          <button
            type="submit"
            disabled={loadingMark}
          >
            {loadingMark ? "Saving…" : "Mark Attendance"}
          </button>
        </div>
      </form>

      <div className="filters">
        <div className="field">
          <label>From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="actions">
          <button
            type="button"
            onClick={fetchAttendance}
          >
            Apply Filter
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="info state">Loading attendance…</div>
        ) : !records.length ? (
          <div className="empty state">No attendance records yet.</div>
        ) : (
          <table className="table compact">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>
                    <span className={r.status === "Present" ? "badge success" : "badge danger"}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


