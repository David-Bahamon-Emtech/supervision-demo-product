import React, { useState } from 'react';
import EmtechLogo from '../Logo/EmtechLogo.jsx';
import './PasswordScreen.css';

const PasswordScreen = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === 'User' && password === 'Password') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid User ID or Password.');
    }
  };

  const logoUrl = '/assets/logos/EMTECH_logo.png';

  return (
    <div className="password-screen-container">
      <div className="password-screen-box">
        <div className="password-screen-logo">
          <EmtechLogo logoUrl={logoUrl} altText="EMTECH Logo" />
        </div>
        <h2 className="password-screen-title">Beyond Supervision Access</h2>
        <form onSubmit={handleLogin} className="password-screen-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordScreen;