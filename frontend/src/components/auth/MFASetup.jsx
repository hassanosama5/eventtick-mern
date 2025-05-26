import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Toast';
import './AuthForms.css';

const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL;

export default function MFASetup({ onComplete }) {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState('initial'); // initial, qr, verify
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleGenerateQR = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/mfa/setup`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.data.qrCodeUrl);
        setSecret(data.data.secret);
        setStep('qr');
      } else {
        throw new Error(data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      setToast({
        message: error.message || 'Failed to set up MFA',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: verificationCode }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecoveryCodes(data.data.recoveryCodes);
        setStep('recovery');
        setToast({
          message: 'MFA enabled successfully!',
          type: 'success'
        });
        // Refresh the user profile to update MFA status
        await refreshProfile();
      } else {
        throw new Error(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setToast({
        message: error.message || 'Verification failed',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    // Ensure profile is refreshed before completing
    await refreshProfile();
    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  return (
    <div className="auth-form-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {step === 'initial' && (
        <div className="mfa-setup">
          <h2>Set Up Two-Factor Authentication</h2>
          <p>
            Two-factor authentication adds an extra layer of security to your account.
            When enabled, you'll need to enter a code from your authenticator app
            in addition to your password when logging in.
          </p>
          <button
            onClick={handleGenerateQR}
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Setting up...' : 'Set up MFA'}
          </button>
        </div>
      )}

      {step === 'qr' && (
        <div className="mfa-setup">
          <h2>Scan QR Code</h2>
          <p>
            1. Install an authenticator app like Google Authenticator or Authy
            if you haven't already.
          </p>
          <p>
            2. Scan this QR code with your authenticator app:
          </p>
          <div className="qr-container">
            <img src={qrCode} alt="QR Code" />
          </div>
          <p>
            3. If you can't scan the QR code, enter this code manually:
            <br />
            <code className="secret-code">{secret}</code>
          </p>
          <form onSubmit={handleVerify} className="auth-form">
            <div className="form-group">
              <label htmlFor="verificationCode">
                Enter the 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      )}

      {step === 'recovery' && (
        <div className="mfa-setup">
          <h2>Save Your Recovery Codes</h2>
          <p>
            Keep these recovery codes in a safe place. If you lose access to your
            authenticator app, you can use one of these codes to log in.
            Each code can only be used once.
          </p>
          <div className="recovery-codes">
            {recoveryCodes.map((code, index) => (
              <div key={index} className="recovery-code">
                {code}
              </div>
            ))}
          </div>
          <p className="warning">
            Warning: These codes won't be shown again. Make sure to save them now!
          </p>
          <button
            onClick={handleComplete}
            className="submit-btn"
          >
            I've saved my recovery codes
          </button>
        </div>
      )}
    </div>
  );
}
