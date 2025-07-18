import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AttendanceReport() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await fetch(`https://mkfeez.mimansakids.com/get-all-attendance/${studentId}`);
      const data = await res.json();
      setRecords(data.records || []);
      setLoading(false);
    };
    fetchAttendance();
  }, [studentId]);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 20, background: "#fff", minHeight: "100vh" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16, fontSize: 18 }}>‹ Back</button>
      <h2 style={{ marginBottom: 18 }}>Attendance Report</h2>
      {loading ? (
        <div>Loading...</div>
      ) : records.length === 0 ? (
        <div>No attendance records found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Date</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Status</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>In</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Out</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.date}>
                <td style={{ padding: 8 }}>{r.date}</td>
                <td style={{ padding: 8 }}>{r.status}</td>
                <td style={{ padding: 8 }}>{r.time_in || "--"}</td>
                <td style={{ padding: 8 }}>{r.time_out || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
