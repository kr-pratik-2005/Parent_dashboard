import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ParentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fatherName: "",
    fatherContact: "",
    motherName: "",
    motherContact: "",
    address: "",
    profileImage: "",
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchParent = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.phoneNumber) return;
      let phone = user.phoneNumber;
      if (phone.startsWith("+91")) phone = phone.slice(3);
      else if (phone.startsWith("+")) phone = phone.slice(1);

      try {
        const res = await fetch(`http://localhost:5000/get-parent-profile/${phone}`);
        const data = await res.json();
        setProfile({
          fatherName: data.fatherName || "",
          fatherContact: data.fatherContact || "",
          motherName: data.motherName || "",
          motherContact: data.motherContact || "",
          address: data.address || "",
          profileImage: data.profileImage || "",
        });
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchParent();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleSave = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user || !user.phoneNumber) return;
  let phone = user.phoneNumber;
  if (phone.startsWith("+91")) phone = phone.slice(3);
  else if (phone.startsWith("+")) phone = phone.slice(1);

  try {
    await fetch(`http://localhost:5000/update-parent-profile/${phone}`, {
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
  return (
    <div style={styles.bg}>
      <style>{`
        .profile-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 18px 18px 0 18px;
          background: #fff;
        }
        .edit-btn {
          background: linear-gradient(90deg, #a084e8 60%, #8d6be8 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 18px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background .16s;
        }
        .edit-btn:active { background: #8661c1; }
        .profile-img-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0;
          margin-bottom: 0;
        }
        .profile-img {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          object-fit: cover;
          background: #e0e0e0;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          margin: 0 auto;
        }
        .profile-title {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin-top: 10px;
          margin-bottom: 24px;
          letter-spacing: 0.2px;
        }
        .profile-form {
          background: #fff;
          border-radius: 18px;
          padding: 28px 18px 18px 18px;
          margin: 0 14px 18px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .profile-label {
          color: #888;
          font-size: 14px;
          margin-bottom: 4px;
          margin-top: 16px;
        }
        .profile-input {
          width: 100%;
          padding: 12px 18px;
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          font-size: 16px;
          color: #333;
          background: #fafafa;
          margin-bottom: 2px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
          outline: none;
          transition: border 0.15s;
        }
        .profile-input:focus {
          border: 1.5px solid #a084e8;
          background: #fff;
        }
        .profile-input[readonly] {
          background: #f8f8f8;
          color: #888;
          border: 1.5px solid #f0f0f0;
        }
        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          position: absolute;
          left: 10px;
          top: 18px;
        }
        @media (max-width: 600px) {
          .profile-form { padding: 18px 6px 14px 6px; margin: 0 4px 18px 4px; }
          .profile-header { padding: 18px 8px 0 8px; }
        }
      `}</style>

      {/* Back button */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        aria-label="Back"
      >
        <ChevronLeft size={26} color="#666" />
      </button>

      {/* Edit button in header */}
      <div className="profile-header">
        <button className="edit-btn" onClick={editMode ? handleSave : handleEdit}>
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      {/* Profile Image */}
      <div className="profile-img-wrap" style={{ marginTop: 8 }}>
        {profile.profileImage ? (
          <img src={profile.profileImage} alt="Parent" className="profile-img" />
        ) : (
          <div className="profile-img" style={{
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
      </div>

      {/* Parent Profile Title */}
      <div className="profile-title">Parent Profile</div>

      {/* Form */}
      <form className="profile-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="profile-label">Father's Name</div>
        <input
          className="profile-input"
          name="fatherName"
          value={profile.fatherName}
          onChange={handleChange}
          readOnly={!editMode}
        />
        
        
        <div className="profile-label">Mother's Name</div>
        <input
          className="profile-input"
          name="motherName"
          value={profile.motherName}
          onChange={handleChange}
          readOnly={!editMode}
        />
        <div className="profile-label">Contact Details</div>
        <input
          className="profile-input"
          name="motherContact"
          value={profile.motherContact}
          onChange={handleChange}
          readOnly={!editMode}
        />
        <div className="profile-label">Address</div>
        <input
          className="profile-input"
          name="address"
          value={profile.address}
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

export default ParentProfile;
