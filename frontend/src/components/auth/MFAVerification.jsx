import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MFAVerification.css';

const MFAVerification = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const navigate = useNavigate();

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const email = localStorage.getItem('tempEmail'); // Get email from storage
      const response = await axios.post('/api/v1/mfa/validate', {
        email,
        token
      });

      if (response.data.success) {
        // Clear temporary email
        localStorage.removeItem('tempEmail');
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        if (response.data.data.usedRecoveryCode) {
          // Show warning about recovery code usage
          alert('Recovery code used. Please set up MFA again for security.');
        }
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mfa-verification-container">
      <div className="mfa-verification-box">
        <h2>{showRecoveryInput ? 'Enter Recovery Code' : 'Two-Factor Authentication'}</h2>
        
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

          {error && <div className="error-message">{error}</div>}

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
