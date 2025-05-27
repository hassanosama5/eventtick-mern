import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Toast';

const TestMFA = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [toast, setToast] = useState(null);
  const { login, validateMFA, mfaRequired, mfaEmail } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login...');
      await login(email, password);
      console.log('Login response received');
      setToast({
        message: mfaRequired ? 'MFA Required' : 'Login Successful',
        type: mfaRequired ? 'info' : 'success'
      });
    } catch (error) {
      console.error('Login error:', error);
      setToast({
        message: error.message || 'Login failed',
        type: 'error'
      });
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Validating MFA...');
      await validateMFA(mfaEmail || email, mfaToken);
      console.log('MFA validation successful');
      setToast({
        message: 'MFA Validation Successful',
        type: 'success'
      });
    } catch (error) {
      console.error('MFA validation error:', error);
      setToast({
        message: error.message || 'MFA validation failed',
        type: 'error'
      });
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

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Environment Info:</h3>
        <pre>
          {JSON.stringify({
            API_URL: import.meta.env.VITE_API_BASE_URL,
            mfaRequired,
            mfaEmail
          }, null, 2)}
        </pre>
      </div>

      {!mfaRequired ? (
        <form onSubmit={handleLogin} className="auth-form">
          <h2>Test Login</h2>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Test Login</button>
        </form>
      ) : (
        <form onSubmit={handleMfaSubmit} className="auth-form">
          <h2>Test MFA Verification</h2>
          <div className="form-group">
            <label>MFA Token:</label>
            <input
              type="text"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <button type="submit" className="submit-btn">Verify MFA</button>
        </form>
      )}
    </div>
  );
};

export default TestMFA; 