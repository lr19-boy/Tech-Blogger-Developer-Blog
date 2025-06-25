import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Auth.css';
import Forgotpass from './Forgotpass';

function TabButtons({ isUser, setIsUser, setShowForgot, setIsLogin }) {
  return (
    <div
      className="auth-tabs"
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
        backgroundColor: 'transparent',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '4px',
        borderRadius: '25px',
        width: '320px',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderColor: 'rgb(255, 255, 255)',
        borderWidth: '1px',
        borderStyle: 'solid',
        animation: 'fadeIn 0.5s ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* Slider indicator */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: isUser ? '4px' : 'calc(50% + 4px)',
          width: 'calc(50% - 8px)',
          height: 'calc(100% - 8px)',
          background: isUser
            ? 'linear-gradient(135deg, rgb(138, 43, 226) 0%, rgb(41, 101, 255) 100%)'
            : 'linear-gradient(135deg, rgb(41, 101, 255) 0%, rgb(138, 43, 226) 100%)',
          borderRadius: '20px',
          transition: 'left 0.3s ease-in-out',
          zIndex: 0,
        }}
      />
      <button
        type="button"
        className={`tab-btn${isUser ? ' active' : ''}`}
        onClick={() => {
          setIsUser(true);
          setShowForgot(false);
          setIsLogin(true);
        }}
        style={{
          background: 'transparent',
          color: isUser ? 'black' : 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 0',
          flex: 1,
          fontWeight: 600,
          fontSize: '16px',
          transition: 'color 0.2s',
          outline: 'none',
          cursor: isUser ? 'default' : 'pointer',
          zIndex: 1,
        }}
        disabled={isUser}
      >
        User
      </button>
      <button
        type="button"
        className={`tab-btn${!isUser ? ' active' : ''}`}
        onClick={() => {
          setIsUser(false);
          setShowForgot(false);
          setIsLogin(true);
        }}
        style={{
          background: 'transparent',
          color: !isUser ? 'black' : 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 0',
          flex: 1,
          fontWeight: 600,
          fontSize: '16px',
          transition: 'color 0.2s',
          outline: 'none',
          cursor: !isUser ? 'default' : 'pointer',
          zIndex: 1,
        }}
        disabled={!isUser}
      >
        Admin
      </button>
    </div>
  );
}

TabButtons.propTypes = {
  isUser: PropTypes.bool.isRequired,
  setIsUser: PropTypes.func.isRequired,
  setShowForgot: PropTypes.func.isRequired,
  setIsLogin: PropTypes.func.isRequired,
};

function AuthForm({
  isUser,
  isLogin,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  handleAuth,
  setShowForgot,
  setIsLogin
}) {
  let headingText = '';
  if (isUser) {
    headingText = isLogin ? 'User Login' : 'User Sign Up';
  } else {
    headingText = isLogin ? 'Admin Login' : 'Admin Sign Up';
  }

  return (
    <form className="auth-form" onSubmit={handleAuth} autoComplete='on'>
      <h2>{headingText}</h2>
      {!isLogin && (
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="submit-btn">
        {isLogin ? 'Login' : 'Sign Up'}
      </button>
      {isLogin && (
        <button
          type="button"
          className="forgot-btn"
          onClick={() => setShowForgot(true)}
        >
          Forgot password?
        </button>
      )}
      <div className="auth-switch">
        <p>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="switch-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </form>
  );
}

AuthForm.propTypes = {
  isUser: PropTypes.bool.isRequired,
  isLogin: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  handleAuth: PropTypes.func.isRequired,
  setShowForgot: PropTypes.func.isRequired,
  setIsLogin: PropTypes.func.isRequired,
};

function BackButton({ setShowForgot }) {
  return (
    <button
      className="back-btn"
      style={{
        marginTop: '18px',
        padding: '12px 32px',
        borderRadius: '24px',
        border: 'none',
        background: 'linear-gradient(135deg, var(--accent-primary, #1976d2) 0%, var(--accent-secondary, #42a5f5) 100%)',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(25,118,210,0.10)',
        transition: 'background 0.2s'
      }}
      onClick={() => setShowForgot(false)}
      tabIndex={0}
    >
      &#8592; Back to Login
    </button>
  );
}

BackButton.propTypes = {
  setShowForgot: PropTypes.func.isRequired,
};

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isUser, setIsUser] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLogin, username, email, password, isUser }),
      });

      const data = await response.json();
      if (isLogin && isUser && data.is_user === false) {
        alert("You cannot log in as admin from the User tab.");
        return;
      }
      if (isLogin && !isUser && data.is_user === true) {
        alert("You cannot log in as user from the Admin tab.");
        return;
      }
      if (data.redirect) {
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        window.location.href = data.redirect;
      } else if (data.error) {
        setAuthError(data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('An error occurred during authentication. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <TabButtons
        isUser={isUser}
        setIsUser={setIsUser}
        setShowForgot={setShowForgot}
        setIsLogin={setIsLogin}
      />
      {showForgot ? (
        <>
          <Forgotpass />
          <BackButton setShowForgot={setShowForgot} />
        </>
      ) : (
        <>
          <AuthForm
            isUser={isUser}
            isLogin={isLogin}
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleAuth={handleAuth}
            setShowForgot={setShowForgot}
            setIsLogin={setIsLogin}
          />
          {authError && (
            <div className="auth-message" style={{ color: 'red', marginTop: '12px', textAlign: 'center' }}>{authError}</div>
          )}
        </>
      )}
    </div>
  );
}

// Add keyframes for fadeIn animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Auth;

