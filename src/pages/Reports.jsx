import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getAuth } from "firebase/auth";

// Example SVG icons (replace with your icon library if needed)
const BackIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
  </svg>
);

const reportList = [
  { title: "Attendance Report", key: "attendance" },
  { title: "Learning Milestone", key: "milestone" },
  { title: "Annual Report", key: "annual" }
];

const Reports = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Fetch students for this parent
  useEffect(() => {
    const fetchStudents = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.phoneNumber) return;
      let phone = user.phoneNumber;
      if (phone.startsWith("+91")) phone = phone.slice(3);
      else if (phone.startsWith("+")) phone = phone.slice(1);

      const res = await fetch(`http://localhost:5000/get-students-by-contact/${phone}`);
      const data = await res.json();
      setStudents(data);
      // Optionally auto-select first student if only one
      if (data.length === 1) setSelectedStudentId(data[0].student_id);
    };
    fetchStudents();
  }, []);

  // Handler for Attendance Report click
  const handleAttendanceReportClick = () => {
    if (!selectedStudentId) {
      alert("Please select a child.");
      return;
    }
    navigate(`/attendance-report/${selectedStudentId}`);
  };

  return (
    <div style={styles.bg}>
      <style>{`
        @media (max-width: 600px) {
          .reports-header { padding: 26px 0 14px 0; }
          .reports-title { font-size: 17px; }
          .search-row { padding: 14px 12px 0 12px; }
          .report-cards { padding: 22px 12px 0 12px; }
          .report-card-btn { font-size: 15px; padding: 16px 14px; }
          .bottom-nav { height: 60px; }
        }
        @media (min-width: 601px) {
          .reports-header { padding: 32px 0 18px 0; }
          .reports-title { font-size: 18px; }
          .search-row { padding: 18px 18px 0 18px; }
          .report-cards { padding: 26px 18px 0 18px; }
          .report-card-btn { font-size: 16px; padding: 18px 18px; }
          .bottom-nav { height: 62px; }
        }
      `}</style>
      {/* Header */}
      <div className="reports-header" style={styles.header}>
        <button
          style={styles.backBtn}
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <BackIcon />
        </button>
        <span className="reports-title" style={styles.headerTitle}>Reports</span>
        <span style={{ width: 24 }} /> {/* Placeholder for right space */}
      </div>

      {/* Search Bar */}
      <div className="search-row" style={styles.searchRow}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}><SearchIcon /></span>
          <input
            style={styles.searchInput}
            placeholder="Search"
            type="text"
          />
        </div>
        <button style={styles.filterBtn} aria-label="Filter">
          <FilterIcon />
        </button>
      </div>

      {/* Student selection dropdown */}
      <div style={{ margin: "16px 18px" }}>
        <select
          value={selectedStudentId}
          onChange={e => setSelectedStudentId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: 16,
            marginBottom: 18
          }}
          required
        >
          <option value="">Select child</option>
          {students.map(stu => (
            <option key={stu.student_id} value={stu.student_id}>
              {stu.name} ({stu.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Report Cards */}
      <div className="report-cards" style={styles.cardsWrap}>
        <button
          className="report-card-btn"
          style={styles.cardBtn}
          onClick={handleAttendanceReportClick}
        >
          <span>Attendance Report</span>
          <span style={styles.cardArrow}>&#8250;</span>
        </button>
        <button
  className="report-card-btn"
  style={styles.cardBtn}
  onClick={() => navigate('/coming-soon')}
>
  <span>Learning Milestone</span>
  <span style={styles.cardArrow}>&#8250;</span>
</button>

        <button
  className="report-card-btn"
  style={styles.cardBtn}
  onClick={() => navigate('/coming-soon')}
>
  <span>Annual Report</span>
  <span style={styles.cardArrow}>&#8250;</span>
</button>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#fff",
    fontFamily: "Inter, Arial, sans-serif",
    paddingBottom: 70,
    boxSizing: "border-box",
    maxWidth: 480,
    margin: "0 auto"
  },
  header: {
    background: "#E6E6E6",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative"
  },
  backBtn: {
    background: "none",
    border: "none",
    marginLeft: 12,
    cursor: "pointer",
    padding: 0,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    fontWeight: 600,
    color: "#444",
    flex: 1,
    textAlign: "center"
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  searchBox: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none"
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 15,
    color: "#444",
    background: "#fff",
    outline: "none"
  },
  filterBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  cardsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  cardBtn: {
    width: "100%",
    background: "#C8C7CC",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    color: "#444",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontWeight: 500,
    boxShadow: "none",
    transition: "background .15s"
  },
  cardArrow: {
    fontSize: 24,
    color: "#888"
  },
  bottomNav: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    background: "#E6E6E6",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 100,
    maxWidth: 480,
    margin: "0 auto"
  },
  navItem: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 0"
  },
  navItemActive: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 0",
    background: "none"
  }
};

export default Reports;
