import React, { useState } from 'react';
import '../App.css';
import './Forgotpass.css'
import './Auth.css'
import { Helmet } from 'react-helmet';
function Forgotpass() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgot = (e) => {
    e.preventDefault();
    // Placeholder for backend integration
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    // Simulate sending reset link
    setMessage('If this email is registered, a password reset link will be sent.');
  };

  return (
    <div className="auth-form forgotpass-form">
      <Helmet>
        <title>Tech Blogger | Forgot Password</title>
        <meta name="description" content="Reset your password if you've forgotten it." />
      </Helmet>
      <h2>Forgot Password</h2>
      <p className="auth-desc">
        Enter your email address below and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleForgot} autoComplete='on'>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input"
          />
        </div>
        <button type="submit" className="auth-btn">
          Send Reset Link
        </button>
      </form>
      {message && (
        <div className="auth-message">
          {message}
        </div>
      )}
    </div>
  );
}

export default Forgotpass;
