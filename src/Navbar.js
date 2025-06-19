import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import './Navbar.css';

function Navbar({ isLoggedIn, username, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleDashboard = () => {
    setDropdownOpen(false);
    const isUser = localStorage.getItem('is_user');
    if (isUser === 'true') {
      navigate('/user');
    } else {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout && onLogout();
  };


  return (
    <nav className="navbar">
      {/* Left: Navigation Links */}
      <ul className="nav-menu">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/blog">Blog</Link></li>
      </ul>
      {/* Right: Auth/User Button */}
      <div className="relative ml-auto">
        {!isLoggedIn ? (
          <Link
            to="/auth"
            className="primary-button1"
          >
            Get Started
          </Link>
        ) : (
          <>
            <button
              ref={buttonRef}
              onClick={() => setDropdownOpen((open) => !open)}
              className="primary-button1 border-none"
            >
              <span className="nav-btn-text">{username}</span>              
            </button>
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="dropdown-menu"
              >
                <button
                  onClick={handleDashboard}
                  className="w-full text-left px-4 py-2"
                >
                  My Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 logout"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 