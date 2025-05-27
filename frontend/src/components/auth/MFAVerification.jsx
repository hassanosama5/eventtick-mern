import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Toast';
import './MFAVerification.css';

const MFAVerification = () => {
  const [token, setToken] = useState('');
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { validateMFA, mfaEmail } = useAuth();

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await validateMFA(mfaEmail, token);
      setToast({
        message: 'Authentication successful',
        type: 'success'
      });
      navigate('/dashboard');
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Verification failed',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mfaEmail) {
    navigate('/login');
    return null;
  }

  return (
    <div className="mfa-verification-container">
      <div className="mfa-verification-box">
        <h2>{showRecoveryInput ? 'Enter Recovery Code' : 'Two-Factor Authentication'}</h2>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        
        <form onSubmit={handleVerification}>
          {!showRecoveryInput ? (
            <>
              <p>Enter the 6-digit code from your authenticator app</p>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                pattern="\d{6}"
                required
              />
            </>
          ) : (
            <>
              <p>Enter one of your recovery codes</p>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="Enter recovery code"
                required
              />
            </>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            type="button"
            className="switch-method-btn"
            onClick={() => setShowRecoveryInput(!showRecoveryInput)}
          >
            {showRecoveryInput 
              ? 'Use authenticator app instead' 
              : 'Use recovery code instead'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MFAVerification;
