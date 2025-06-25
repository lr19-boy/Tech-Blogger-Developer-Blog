import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Blog from './components/Blog';
import Auth from './components/Auth';
import User from './components/User';
import Admin from './components/Admin';
import UserDropdown from './components/UserDropdown';
import techbloggerLogo from '../src/techblogger.png';

// Logout component
function Logout() {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Clear authentication data
    localStorage.removeItem('username');
    
    // Redirect to home page
    navigate('/', { replace: true });
  }, [navigate]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Logging out...</h2>
        <p>You have been successfully logged out.</p>
      </div>
    </div>
  );
}

function AnimatedMain() {
  const location = useLocation();
  const [animate, setAnimate] = useState(true);

  React.useEffect(() => {
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
        <nav className="navbar">
          <ul className="nav-menu">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
          <UserDropdown />
        </nav>
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
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </main>
  );
}

function ScrollToTop() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return null;
}
function App() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [scrollBtnVisible, setScrollBtnVisible] = useState(false);
  const fadeDuration = 400; // ms, must match CSS

  React.useEffect(() => {
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

  return (
    <Router>
      <AnimatedMain />
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
