import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserDropdown.css';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        try {
          const response = await fetch('http://localhost:5000/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: storedUsername })
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUsername(userData.username);
            setIsAuthenticated(true);
            setUserRole(userData.is_user ? 'user' : 'admin');
          } else {
            localStorage.removeItem('username');
            setIsAuthenticated(false);
            setUserRole(null);
            setUsername('');
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          setIsAuthenticated(false);
          setUserRole(null);
          setUsername('');
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUsername('');
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername('');
    setIsOpen(false);
    window.location.href = '/logout';
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Check if user is trying to access the wrong dashboard
    const targetRole = userRole === 'admin' ? 'admin' : 'user';
    const currentPath = window.location.pathname;
    
    if ((targetRole === 'admin' && currentPath === '/user') || 
        (targetRole === 'user' && currentPath === '/admin')) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        navigate(targetRole === 'admin' ? '/admin' : '/user');
      }, 3000);
    } else {
      navigate(targetRole === 'admin' ? '/admin' : '/user');
    }
  };

  if (!isAuthenticated) {
    return (
      <Link to="/auth" className="primary-button1">
        Get Started
      </Link>
    );
  }

  return (
    <>
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
          zIndex: 1000,
          maxWidth: '400px',
          textAlign: 'center',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>⚠️ Access Denied</h3>
          <p style={{ margin: '0 0 15px 0', opacity: 0.9 }}>
            {userRole === 'admin' 
              ? 'You are logged in as an Admin. This page is for Users only.'
              : 'You are logged in as a User. This page is for Admins only.'
            }
          </p>
          <p style={{ margin: 0, fontSize: '0.9em', opacity: 0.8 }}>
            Redirecting to your dashboard in 3 seconds...
          </p>
          <button
            onClick={() => {
              setShowAlert(false);
              navigate(userRole === 'admin' ? '/admin' : '/user');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Go Now
          </button>
        </div>
      )}
      
      <div className="user-dropdown" ref={dropdownRef}>
        <button className="user-dropdown-toggle" onClick={toggleDropdown}>
          <div className="user-avatar">
            <img 
              src="https://randomuser.me/api/portraits/men/26.jpg" 
              alt="User Avatar" 
              className="avatar-img"
            />
          </div>
          <span className="username">{username}</span>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <span className="welcome-text">Welcome, {username}!</span>
              <span className="role-badge">{userRole === 'admin' ? 'Admin' : 'User'}</span>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item"
              onClick={handleDashboardClick}
            >
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                <polyline points="3,7 12,13 21,7"></polyline>
              </svg>
              Dashboard
            </button>
            
            <Link 
              to="/blog" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Blog
            </Link>
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDropdown; 