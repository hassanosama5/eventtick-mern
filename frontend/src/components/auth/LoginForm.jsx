import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../Toast";
import "./AuthForms.css"; // Add this import

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login with:", { email, password });
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      await login(trimmedEmail, trimmedPassword);
      setToast({ message: "Login successful! Welcome back.", type: "success" });
      setShouldRedirect(true);
    } catch (err) {
      console.error("Login error in form:", err);
      setToast({ 
        message: err.response?.data?.message || "Login failed. Please check your credentials.", 
        type: "error" 
      });
      setShouldRedirect(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => {
            setToast(null);
            if (shouldRedirect) navigate("/");
          }} 
        />
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="auth-links">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-button"
        >
          Forgot Password?
        </button>
        <div>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
