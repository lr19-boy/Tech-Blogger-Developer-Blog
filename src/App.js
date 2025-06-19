import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Blog from './components/Blog';
import Auth from './components/Auth';
import User from './components/User';
import Admin from './components/Admin';
import techbloggerLogo from '../src/techblogger.png';
import Navbar from './Navbar';

function AnimatedMain({ isLoggedIn, username, onLogout }) {
  const location = useLocation();
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(false);
    const timeout = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <main className={animate ? 'route-fade-in' : ''}>
      <header className="header-container">
        <div className="logo-container">
          <a href="/"><img src={techbloggerLogo} alt="Tech Blogger Logo" className="logo-img" /></a>
        </div>
        <Navbar isLoggedIn={isLoggedIn} username={username} onLogout={onLogout} />
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </main>
  );
}

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return null;
}

function App() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [scrollBtnVisible, setScrollBtnVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('username'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const fadeDuration = 400; // ms, must match CSS

  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowScrollBtn(true);
        setScrollBtnVisible(true);
        if (timeout) clearTimeout(timeout);
      } else {
        setShowScrollBtn(false);
        timeout = setTimeout(() => setScrollBtnVisible(false), fadeDuration);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check on mount in case already scrolled
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Listen for login/logout changes (e.g., from Auth.js)
  useEffect(() => {
    const syncAuth = () => {
      const storedUsername = localStorage.getItem('username');
      setIsLoggedIn(!!storedUsername);
      setUsername(storedUsername || '');
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    window.location.href = '/auth';
  };

  return (
    <Router>
      <AnimatedMain isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
      <ScrollToTop />
      {scrollBtnVisible && (
        <button
          className={`scroll-to-top-btn ${showScrollBtn ? 'fade-in' : 'fade-out'}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          &#8593;
        </button>
      )}
      <footer>
        <p>&copy; 2025 Tech Blogger</p>
      </footer>
    </Router>
  );
}

export default App;
