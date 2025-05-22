import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your profile update API call here
    alert("Profile updated successfully!");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      // Add account deletion API call here
      logout();
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled
          >
            <option value="user">Event Attendee</option>
            <option value="organizer">Event Organizer</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn update-btn">
            Update Profile
          </button>
          <button type="button" className="btn logout-btn" onClick={logout}>
            Log Out
          </button>
        </div>
      </form>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <button className="btn delete-btn" onClick={handleDeleteAccount}>
          Delete Account
        </button>
        <p className="warning-text">
          Warning: This will permanently remove your account and all associated
          data.
        </p>
      </div>
    </div>
  );
}
