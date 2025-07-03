import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ChildProfile = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [profile, setProfile] = useState({
    profileImage: "",
    name: "",
    dob: "",
    bloodGroup: "",
    nickName: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Fetch all children for this parent
  useEffect(() => {
    const fetchStudents = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.phoneNumber) return;
      let phone = user.phoneNumber;
      if (phone.startsWith("+91")) phone = phone.slice(3);
      else if (phone.startsWith("+")) phone = phone.slice(1);

      try {
        const res = await fetch(`http://localhost:5000/get-students-by-contact/${phone}`);
        const data = await res.json();
        setStudents(data);
        // If only one child, auto-select
        if (data.length === 1) setSelectedStudentId(data[0].student_id);
      } catch (e) {}
    };
    fetchStudents();
  }, []);

  // Fetch child profile when selectedStudentId changes
  useEffect(() => {
    const fetchChild = async () => {
      if (!selectedStudentId) return;
      try {
        const res = await fetch(`http://localhost:5000/get-child-profile/${selectedStudentId}`);
        const data = await res.json();
        setProfile({
          profileImage: data.profileImage || "",
          name: data.name || "",
          dob: data.dob || "",
          bloodGroup: data.bloodGroup || "",
          nickName: data.nickName || "",
        });
      } catch (e) {}
    };
    fetchChild();
  }, [selectedStudentId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
 const handleSave = async () => {
  if (!selectedStudentId) return;
  try {
    await fetch(`http://localhost:5000/update-child-profile/${selectedStudentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setEditMode(false);
    // Optionally show a success message
  } catch (e) {
    alert("Failed to save changes!");
  }
};


  const displayDOB = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={styles.bg}>
      <style>{`
        .child-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 0 20px;
          background: #fff;
        }
        .edit-btn {
          background: linear-gradient(90deg, #a084e8 60%, #8d6be8 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 7px 22px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background .16s;
        }
        .edit-btn:active { background: #8661c1; }
        .child-img-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0;
          margin-bottom: 0;
        }
        .child-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          background: #e0e0e0;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          margin: 0 auto;
        }
        .child-title {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin-top: 10px;
          margin-bottom: 24px;
          letter-spacing: 0.2px;
        }
        .child-form-card {
          background: #fff;
          border-radius: 18px;
          padding: 28px 18px 24px 18px;
          margin: 0 14px 18px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .child-label {
          color: #888;
          font-size: 14px;
          margin-bottom: 6px;
          margin-top: 18px;
        }
        .child-input {
          width: 100%;
          padding: 13px 18px;
          border: 1.5px solid #e0e0e0;
          border-radius: 24px;
          font-size: 16px;
          color: #333;
          background: #fafafa;
          margin-bottom: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
          outline: none;
          transition: border 0.15s;
        }
        .child-input:focus {
          border: 1.5px solid #a084e8;
          background: #fff;
        }
        .child-input[readonly] {
          background: #f8f8f8;
          color: #888;
          border: 1.5px solid #f0f0f0;
        }
        .child-row {
          display: flex;
          gap: 16px;
        }
        .child-row > div {
          flex: 1;
        }
        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }
        @media (max-width: 600px) {
          .child-form-card { padding: 18px 6px 14px 6px; margin: 0 4px 18px 4px; }
          .child-header { padding: 18px 8px 0 8px; }
        }
      `}</style>

      {/* Header */}
      <div className="child-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={26} color="#666" />
        </button>
        <button className="edit-btn" onClick={editMode ? handleSave : handleEdit}>
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      {/* Child selector if multiple children */}
      {students.length > 1 && (
        <div style={{ margin: "20px 18px 0 18px" }}>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1.5px solid #ccc",
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
      )}

      {/* Profile Image */}
      <div className="child-img-wrap" style={{ marginTop: 8 }}>
        {profile.profileImage ? (
          <img src={profile.profileImage} alt="Child" className="child-img" />
        ) : (
          <div className="child-img" style={{
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
              <circle cx="12" cy="7" r="4"/>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            </svg>
          </div>
        )}
      </div>

      {/* Child Profile Title */}
      <div className="child-title">Child Profile</div>

      {/* Form Card */}
      <form className="child-form-card" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="child-label">Name</div>
        <input
          className="child-input"
          name="name"
          value={profile.name}
          onChange={handleChange}
          readOnly={!editMode}
        />

      <div>
  <div className="child-label">DOB</div>
  {editMode ? (
    <input
      className="child-input"
      type="date"
      name="dob"
      value={profile.dob}
      onChange={handleChange}
    />
  ) : (
    <input
      className="child-input"
      value={displayDOB(profile.dob)}
      readOnly
    />
  )}
</div>

<div style={{ marginTop: '20px' }}>
  <div className="child-label">Blood Group</div>
  {editMode ? (
    <input
      className="child-input"
      name="bloodGroup"
      value={profile.bloodGroup}
      onChange={handleChange}
    />
  ) : (
    <input
      className="child-input"
      value={profile.bloodGroup}
      readOnly
    />
  )}
</div>


        <div className="child-label">Any nick name or preferred name</div>
        <input
          className="child-input"
          name="nickName"
          value={profile.nickName}
          onChange={handleChange}
          readOnly={!editMode}
        />
      </form>

      {/* Bottom Navigation */}
      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
};

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#f5f5f5",
    fontFamily: "Inter, Arial, sans-serif",
    maxWidth: 420,
    margin: "0 auto",
    position: "relative"
  }
};

export default ChildProfile;
