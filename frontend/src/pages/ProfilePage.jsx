import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MFASetup from "../components/auth/MFASetup";
import Toast from "../components/Toast";
import axios from "axios";
import "./ProfilePage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfilePage() {
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    mfaEnabled: false,
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        mfaEnabled: user.mfaEnabled || false,
      });
    }
  }, [user]);

  // Refresh profile immediately on mount and periodically to keep MFA status up to date
  useEffect(() => {
    // Immediate refresh when component mounts
    refreshProfile();

    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(() => {
      refreshProfile();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/users/profile`,
        {
          name: formData.name,
          email: formData.email,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        await refreshProfile();
        setToast({
          message: "Profile updated successfully!",
          type: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/users/me`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        setToast({
          message: "Your account has been deleted successfully.",
          type: "success",
        });

        // Wait a bit for the toast to be visible before logging out
        setTimeout(() => {
          logout();
          navigate("/");
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      setToast({
        message: error.response?.data?.message || "Failed to delete account",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASetupComplete = async () => {
    setShowMFASetup(false);
    await refreshProfile(); // Refresh immediately after MFA setup
    setToast({
      message: "MFA setup completed successfully!",
      type: "success",
    });
  };

  const handleDisableMFA = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disable two-factor authentication? This will make your account less secure."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/mfa/disable`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        await refreshProfile();
        setToast({
          message: "Two-factor authentication has been disabled",
          type: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to disable 2FA");
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Failed to disable 2FA",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        Please log in to view your profile
      </div>
    );
  }

  if (showMFASetup) {
    return <MFASetup onComplete={handleMFASetupComplete} />;
  }

  // Always use user.mfaEnabled instead of formData.mfaEnabled for the current status
  const mfaEnabled = user.mfaEnabled || false;

  return (
    <div className="profile-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="avatar">
          {formData.name ? formData.name.charAt(0).toUpperCase() : ""}
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
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            disabled
          />
        </div>

        <div className="security-section">
          <h2>Security Settings</h2>
          <div className="mfa-status">
            <p>
              Two-Factor Authentication: {mfaEnabled ? "Enabled" : "Disabled"}
            </p>
            {mfaEnabled ? (
              <button
                type="button"
                onClick={handleDisableMFA}
                className="danger-btn"
                disabled={isLoading}
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowMFASetup(true)}
                className="secondary-btn"
                disabled={isLoading}
              >
                Set up 2FA
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="delete-btn"
            disabled={isLoading}
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
}
