import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout, deleteMyAccount, dispatch } = useAuth(); // get dispatch here
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
    try {
      const response = await axios.put(
        "http://localhost:5000/api/v1/users/profile",
        {
          name: formData.name,
          email: formData.email,
        },
        { withCredentials: true }
      );

      alert("Profile updated successfully!");

      // Dispatch updated user data to update global context state
      dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });

      // Update local form data (optional, usually synced automatically from context)
      setFormData((prev) => ({
        ...prev,
        name: response.data.data.name,
        email: response.data.data.email,
      }));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        Please log in to view your profile
      </div>
    );
  }

  const firstInitial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="avatar">{firstInitial}</div>
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
        <button className="btn delete-btn" onClick={deleteMyAccount}>
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
