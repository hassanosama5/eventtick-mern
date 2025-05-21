import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TokenSetter.css';

const TokenSetter = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);

    const handleSetTestToken = () => {
        try {
            // Create test user data
            const testUser = {
                _id: '682bcbd395ac11f949e0ba12', // This is the test user ID
                name: 'Test Organizer',
                email: 'test@example.com',
                role: 'organizer'
            };

            // Create a test token (this is just for testing, not a real JWT)
            const testToken = 'test-token-123';

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(testUser));
            localStorage.setItem('token', testToken);

            // Update auth context
            login(testToken, testUser);

            // Navigate to events list
            navigate('/');
        } catch (err) {
            setError('Failed to set test token: ' + err.message);
        }
    };

    return (
        <div className="token-setter-container">
            <h2>Set Test Token</h2>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <button 
                onClick={handleSetTestToken}
                className="set-token-btn"
            >
                Set Test Token
            </button>
        </div>
    );
};

export default TokenSetter; 