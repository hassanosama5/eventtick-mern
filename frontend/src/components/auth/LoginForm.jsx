import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email.trim(), password.trim()); // Added trim() to remove whitespace
      navigate("/"); // Explicit navigation after successful login
    } catch (err) {
      console.error("Login error:", err);
      // Error is already handled in AuthContext
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        autoComplete="username" // Helps password managers
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        autoComplete="current-password" // Helps password managers
      />
      <button type="submit" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      {error && <p className="error">{error}</p>}
      <button
        type="button"
        onClick={() => navigate("/forgot-password")}
        className="secondary-btn"
      >
        Forgot Password?
      </button>
    </form>
  );
}
