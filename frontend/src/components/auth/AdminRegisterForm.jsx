import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../Toast";
import "./AuthForms.css";

export default function AdminRegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "", // Special code field for admin registration
  });

  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  // This should match the code in your backend
  const ADMIN_REGISTRATION_CODE = "ADMIN2024";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate admin code
    if (formData.adminCode !== ADMIN_REGISTRATION_CODE) {
      setToast({ message: "Invalid admin registration code!", type: "error" });
      return;
    }

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setToast({ message: "Passwords don't match!", type: "error" });
      return;
    }

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        "admin" // Force role to be admin
      );
      setToast({ message: "Admin registration successful!", type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setToast({ message: error || "Registration failed. Please try again.", type: "error" });
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Admin Registration</h2>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={3}
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminCode">Admin Registration Code</label>
          <input
            type="password"
            id="adminCode"
            name="adminCode"
            value={formData.adminCode}
            onChange={handleChange}
            required
            placeholder="Enter admin registration code"
          />
        </div>
        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Creating Admin Account..." : "Register as Admin"}
        </button>
      </form>
      <div className="auth-links">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
} 