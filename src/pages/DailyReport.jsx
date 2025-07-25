import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext'; // Add this import

// ✅ Import the already-initialized Firestore DB
import { db } from '../firebase/firebase';

import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

// 🧮 Helper functions (keep existing ones)
const formatDateToYYYYMMDD = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function generateDaysArray(selectedDate) {
  const daysArr = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - i);
    daysArr.push({
      num: d.toLocaleDateString("en-US", { day: "2-digit" }),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: new Date(d),
      active: d.toDateString() === selectedDate.toDateString()
    });
  }
  return daysArr;
}

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateDDMMYYYY = (date) => {
  return date.toLocaleDateString("en-GB");
};

export default function ParentReport() { // Renamed from RithikReport
  const navigate = useNavigate();
  const { studentId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dateParam = queryParams.get("date");
  const { parentPhone } = useAuth(); // Get parent's phone number

  const getDefaultDate = () => {
    if (dateParam) return parseLocalDate(dateParam);
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [days, setDays] = useState(generateDaysArray(getDefaultDate()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New states for student management
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // ✅ Fetch students associated with parent's phone number
  useEffect(() => {
    const fetchStudents = async () => {
      if (!parentPhone) return;
      
      setStudentsLoading(true);
      try {
        // Query students where contact, father_contact, or mother_contact matches parentPhone
        const studentsQuery = query(
          collection(db, "students"),
          where("contact", "==", parentPhone)
        );
        
        const fatherQuery = query(
          collection(db, "students"),
          where("father_contact", "==", parentPhone)
        );
        
        const motherQuery = query(
          collection(db, "students"),
          where("mother_contact", "==", parentPhone)
        );

        // Execute all queries
        const [contactSnap, fatherSnap, motherSnap] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(fatherQuery),
          getDocs(motherQuery)
        ]);

        // Combine results and remove duplicates
        const allStudents = [];
        const studentIds = new Set();

        [contactSnap, fatherSnap, motherSnap].forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            const studentData = { id: doc.id, ...doc.data() };
            if (!studentIds.has(studentData.student_id)) {
              allStudents.push(studentData);
              studentIds.add(studentData.student_id);
            }
          });
        });

        setStudents(allStudents);

        // If studentId is provided in URL, find and select that student
        if (studentId) {
          const student = allStudents.find(s => s.student_id === studentId);
          if (student) {
            setSelectedStudent(student);
          }
        } else if (allStudents.length === 1) {
          // If only one student, auto-select
          setSelectedStudent(allStudents[0]);
          navigate(`/daily-report/${allStudents[0].student_id}${location.search}`, { replace: true });
        } else if (allStudents.length > 1) {
          // If multiple students, show dropdown
          setShowStudentDropdown(true);
        }

      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [parentPhone, studentId, navigate, location.search]);

  // ✅ FIREBASE-BASED DATA FETCH (keep existing logic but use selectedStudent)
  useEffect(() => {
    if (!selectedStudent) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      const formatted = formatDateToYYYYMMDD(selectedDate);
      try {
        // 🟡 Check holidays
        const holidayDoc = await getDoc(doc(db, "holidays", formatted));
        if (holidayDoc.exists()) {
          setReport({ status: "holiday", holiday_name: holidayDoc.data().name || "" });
          setLoading(false);
          return;
        }

        // 🟠 Check attendance
        const attQuery = query(
          collection(db, "attendance_records"),
          where("student_id", "==", selectedStudent.student_id),
          where("date", "==", formatted)
        );
        const attSnap = await getDocs(attQuery);
        const attDoc = attSnap.docs[0];
        if (!attDoc) {
          setReport({ status: "absent" });
          setLoading(false);
          return;
        }

        const isPresent = attDoc.data().isPresent;
        if (!isPresent) {
          setReport({ status: "leave", reason: attDoc.data().reason || "" });
          setLoading(false);
          return;
        }

        // ✅ Fetch daily report
        const drQuery = query(
          collection(db, "daily_reports"),
          where("student_id", "==", selectedStudent.student_id),
          where("date", "==", formatted)
        );
        const drSnap = await getDocs(drQuery);
        if (!drSnap.empty) {
          const reportData = drSnap.docs[0].data();
          setReport({ status: "present", time_in: reportData?.time_in || "--", time_out: reportData?.time_out || "--" });
        } else {
          setReport({ status: "present", time_in: "--", time_out: "--" });
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setReport({ status: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedDate, selectedStudent]);

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowStudentDropdown(false);
    navigate(`/daily-report/${student.student_id}${location.search}`, { replace: true });
  };

  // Rest of your existing handlers (keep them the same)
  const updateURLWithDate = (newDate) => {
    if (!selectedStudent) return;
    const formatted = formatDateToYYYYMMDD(newDate);
    navigate(`/daily-report/${selectedStudent.student_id}?date=${formatted}`, { replace: true });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setDays(generateDaysArray(date));
    updateURLWithDate(date);
  };

  const handleDayClick = (index) => {
    const newDate = days[index].date;
    setSelectedDate(newDate);
    const updatedDays = days.map((d, i) => ({ ...d, active: i === index }));
    setDays(updatedDays);
    updateURLWithDate(newDate);
  };

  const handleBackClick = () => {
    navigate("/parent-dashboard");
  };

  // Show loading screen while fetching students
  if (studentsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: 18, color: '#666' }}>Loading students...</div>
      </div>
    );
  }

  // Show student selection if multiple students
  if (showStudentDropdown && students.length > 1) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '30px', color: '#333' }}>Select Your Child</h2>
          {students.map((student) => (
            <div
              key={student.student_id}
              onClick={() => handleStudentSelect(student)}
              style={{
                padding: '15px',
                margin: '10px 0',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid #e9ecef',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                {student.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                Grade: {student.grade} | ID: {student.student_id}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show message if no students found
  if (students.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, color: '#666', marginBottom: '20px' }}>
            No students found for this phone number
          </div>
          <button
            onClick={handleBackClick}
            style={{
              backgroundColor: '#3b2f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Your existing report content logic (keep the same)
  const status = report?.status;
  const { time_in = "--", time_out = "--" } = report || {};

  let reportContent;

  if (loading) {
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 16, color: '#444' }}>Loading...</div>
      </div>
    );
  } else if (status === "present") {
    reportContent = (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button
            onClick={() =>
              navigate(`/daily-report/${selectedStudent.student_id}/details?date=${formatDateToYYYYMMDD(selectedDate)}`)
            }
            style={{
              backgroundColor: "#3b2f2f",
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              padding: "10px 24px",
              fontSize: 15,
              cursor: "pointer"
            }}
          >
            View Detailed Report
          </button>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 18
        }}></div>
      </>
    );
  } else if (status === "leave") {
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          Student on Leave
        </div>
        <div style={{ color: '#666', marginBottom: 32 }}>
          {report?.reason ? `Reason: ${report.reason}` : "Your child was on leave for the selected date."}
        </div>
        <button
          style={{
            background: '#3b2f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => setShowDatePicker(true)}
        >
          Select Another Date
        </button>
      </div>
    );
  } else if (status === "holiday") {
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          School Holiday
        </div>
        <div style={{ color: '#666', marginBottom: 32 }}>
          {report?.holiday_name ? `The school was closed for ${report.holiday_name}.` : "The school was closed for a holiday on the selected date."}
        </div>
        <button
          style={{
            background: '#3b2f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => setShowDatePicker(true)}
        >
          Select Another Date
        </button>
      </div>
    );
  } else {
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          No data available
        </div>
        <div style={{ color: '#666', marginBottom: 32 }}>
          No attendance data is available for the selected date.
        </div>
        <button
          style={{
            background: '#3b2f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => setShowDatePicker(true)}
        >
          Select Another Date
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Keep your existing responsive styles */}
      <style>{`
        @media (max-width: 600px) {
          .rr-container { max-width: 100vw; padding: 0 0 40px 0; }
          .rr-header { padding: 18px 12px 22px 12px; }
          .rr-profile-img { width: 48px !important; height: 48px !important; }
          .rr-title { font-size: 16px !important; }
          .rr-badge { font-size: 13px !important; padding: 7px 12px !important; }
          .rr-date-nav { gap: 4px !important; }
          .rr-day-btn, .rr-day-btn-active { min-width: 40px !important; font-size: 13px !important; padding: 8px 4px !important; }
          .rr-report-card { margin: 0 8px !important; padding: 18px 8px !important; min-height: 240px !important; }
          .rr-report-title { font-size: 16px !important; margin-bottom: 22px !important; }
          .rr-time-label { font-size: 14px !important; }
          .rr-time-btn { font-size: 15px !important; padding: 12px 8px !important; }
        }
        @media (min-width: 601px) {
          .rr-container { max-width: 420px; margin: 0 auto; padding: 0 0 60px 0; }
          .rr-header { padding: 24px 20px 30px 20px; }
          .rr-profile-img { width: 60px !important; height: 60px !important; }
          .rr-title { font-size: 18px !important; }
          .rr-badge { font-size: 14px !important; padding: 8px 16px !important; }
          .rr-date-nav { gap: 8px !important; }
          .rr-day-btn, .rr-day-btn-active { min-width: 50px !important; font-size: 14px !important; padding: 12px 8px !important; }
          .rr-report-card { margin: 0 20px !important; padding: 30px 24px !important; min-height: 400px !important; }
          .rr-report-title { font-size: 18px !important; margin-bottom: 40px !important; }
          .rr-time-label { font-size: 16px !important; }
          .rr-time-btn { font-size: 16px !important; padding: 16px 24px !important; }
        }
      `}</style>

      <div className="rr-container">
        {/* Header */}
        <div className="rr-header" style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div
            style={{
              fontSize: '38px',
              color: '#666',
              cursor: 'pointer',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={handleBackClick}
            role="button"
            tabIndex={0}
            aria-label="Go back"
          >
            ‹
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div className="rr-profile-img" style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundImage: 'url("https://via.placeholder.com/60")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: 10,
            }} />
            <h1 className="rr-title" style={{
              fontWeight: 500,
              color: '#333',
              margin: 0,
              fontSize: 18
            }}>
              {selectedStudent ? `${selectedStudent.name}'s Report` : "Student Report"}
            </h1>
            {/* Add dropdown for multiple students */}
            {students.length > 1 && selectedStudent && (
              <div style={{ position: 'relative', marginTop: '8px' }}>
                <button
                  onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Switch Child ▼
                </button>
                {showStudentDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    minWidth: '200px'
                  }}>
                    {students.map((student) => (
                      <div
                        key={student.student_id}
                        onClick={() => handleStudentSelect(student)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          fontSize: '14px',
                          backgroundColor: student.student_id === selectedStudent.student_id ? '#f0f0f0' : '#fff'
                        }}
                        onMouseEnter={(e) => {
                          if (student.student_id !== selectedStudent.student_id) {
                            e.target.style.backgroundColor = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (student.student_id !== selectedStudent.student_id) {
                            e.target.style.backgroundColor = '#fff';
                          }
                        }}
                      >
                        {student.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rest of your existing UI - Date Badge, Date Navigation, Report Card */}
        {selectedStudent && (
          <>
            {/* Date Badge */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              margin: '20px 0'
            }}>
              <div
                className="rr-badge"
                style={{
                  backgroundColor: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#666',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
                onClick={() => setShowDatePicker(true)}
                role="button"
                tabIndex={0}
              >
                📅 {formatDateDDMMYYYY(selectedDate)}
              </div>
              {showDatePicker && (
                <div style={{
                  position: 'absolute',
                  top: 110,
                  zIndex: 100
                }}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    inline
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              )}
            </div>

            {/* Date Navigation */}
            <div className="rr-date-nav" style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '24px',
              gap: 8
            }}>
              {days.map((day, index) => (
                <div
                  key={index}
                  className={day.active ? "rr-day-btn-active" : "rr-day-btn"}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    backgroundColor: day.active ? '#000' : '#fff',
                    color: day.active ? '#fff' : '#333',
                    fontSize: '14px',
                    fontWeight: '500',
                    minWidth: '50px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.09)'
                  }}
                  onClick={() => handleDayClick(index)}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>{day.num}</span>
                  <span style={{
                    fontSize: '12px',
                    opacity: 0.8
                  }}>{day.day}</span>
                </div>
              ))}
            </div>

            {/* Report Card */}
            <div className="rr-report-card" style={{
              backgroundColor: '#e5e7eb',
              borderRadius: '20px',
              padding: '30px 24px',
              minHeight: '320px',
              position: 'relative'
            }}>
              {reportContent}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
