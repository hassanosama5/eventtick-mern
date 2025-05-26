import React, { useState } from 'react';
import axios from 'axios';
import MFASetup from './MFASetup';
import './MFASettings.css';

const MFASettings = ({ user, onUpdate }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDisableMFA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/mfa/disable');
      
      if (response.data.success) {
        onUpdate({ ...user, mfaEnabled: false });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    onUpdate({ ...user, mfaEnabled: true });
  };

  if (showSetup) {
    return <MFASetup onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="mfa-settings">
      <h2>Two-Factor Authentication</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="mfa-status">
        <div className="status-indicator">
          <span className={`status-dot ${user.mfaEnabled ? 'enabled' : 'disabled'}`} />
          <span className="status-text">
            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {user.mfaEnabled ? (
          <button 
            onClick={handleDisableMFA}
            disabled={isLoading}
            className="disable-btn"
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        ) : (
          <button 
            onClick={() => setShowSetup(true)}
            className="enable-btn"
          >
            Enable 2FA
          </button>
        )}
      </div>

      <div className="mfa-info">
        <h3>About Two-Factor Authentication</h3>
        <p>
          Two-factor authentication adds an extra layer of security to your account by requiring both your password and a verification code from your mobile device.
        </p>
        {!user.mfaEnabled && (
          <div className="security-recommendation">
            <strong>Security Recommendation:</strong>
            <p>
              We strongly recommend enabling two-factor authentication to better protect your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MFASettings; 