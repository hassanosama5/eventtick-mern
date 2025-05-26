import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Toast from "../Toast";
import "./AuthForms.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { login, validateMFA, mfaRequired, mfaEmail, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (mfaRequired) {
      setShowMfaInput(true);
      setToast({
        message: "Please enter your MFA code",
        type: "info"
      });
    }
  }, [mfaRequired]);

  const handleLoginError = (err) => {
    console.error("Login error:", err);
    const errorMessage = err.response?.data?.message || 
                        (err.message === "Network Error" ? 
                          "Unable to connect to server. Please check if the server is running." :
                          "Login failed. Please check your credentials.");
    setToast({
      message: errorMessage,
      type: "error"
    });
    setIsLoading(false);
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await validateMFA(mfaEmail || email, mfaToken.trim());
      setToast({ message: "Login successful! Welcome back.", type: "success" });
    } catch (err) {
      handleLoginError(err);
      setMfaToken("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email.trim(), password.trim());
      if (!mfaRequired) {
        setToast({ message: "Login successful! Welcome back.", type: "success" });
      }
    } catch (err) {
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {!showMfaInput ? (
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
      ) : (
        <form onSubmit={handleMfaSubmit} className="auth-form">
          <div className="mfa-notice">
            <p>Your account requires multi-factor authentication.</p>
            <p>Please enter the 6-digit code from your authenticator app.</p>
          </div>
          <div className="form-group">
            <label htmlFor="mfaToken">MFA Code</label>
            <input
              type="text"
              id="mfaToken"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              required
              placeholder="123456"
              pattern="\d{6}"
              maxLength="6"
              inputMode="numeric"
            />
          </div>
          <div className="mfa-actions">
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMfaInput(false);
                setMfaToken("");
              }}
              className="text-button"
            >
              Back to login
            </button>
          </div>
          <div className="mfa-recovery">
            <Link to="/recover-account" className="text-button">
              Lost your device? Use recovery code
            </Link>
          </div>
        </form>
      )}

      {!showMfaInput && (
        <div className="auth-links">
          <Link to="/forgot-password" className="text-button">
            Forgot Password?
          </Link>
          <div>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      )}
    </div>
  );
}
