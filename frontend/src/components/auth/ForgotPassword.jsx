import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { forgotPassword, verifyOTP, resetPassword, isLoading, error } =
    useAuth();

  // Step 1: Request OTP
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

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(email, otp);
      setStep(3);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email, newPassword);
      alert("Password reset successfully!");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleSendOTP}>
          <h3>Step 1: Enter Email</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP}>
          <h3>Step 2: Enter OTP</h3>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            Verify OTP
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <h3>Step 3: New Password</h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            Reset Password
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
