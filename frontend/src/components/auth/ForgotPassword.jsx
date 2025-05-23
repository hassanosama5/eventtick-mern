/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./AuthForms.css"; // Add this import

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { forgotPassword, verifyOTP, resetPassword, isLoading, error } =
    useAuth();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setStep(2);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(email, otp);
      setStep(3);
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email, newPassword);
      alert("Password reset successfully!");
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Password Recovery</h2>
      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleSendOTP} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
}
