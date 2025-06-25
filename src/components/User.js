import { React, useEffect, useState } from 'react';
import './User.css';

const User = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userApiKey, setUserApiKey] = useState('sk-xxxx-xxxx-xxxx');
  const [copySuccess, setCopySuccess] = useState('');
  const [apiKeyMsg, setApiKeyMsg] = useState('');

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const storedUsername = localStorage.getItem('username');
      if (!storedUsername) {
        setAuthError('No authentication data found. Please log in.');
        setTimeout(() => {
          setIsLoading(false);
        }, 8000);
        return;
      }

      try {
        // Check if the user exists in the users table and is actually a user (is_user = true)
        const response = await fetch('http://localhost:5000/auth/user-only', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: storedUsername })
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          localStorage.setItem('username', userData.username);
          console.log('✅ User authenticated successfully:', userData.username);
        } else {
          // This is not a user or doesn't exist
          setAuthError('Access denied. This area is for regular users only. Admins should use the admin dashboard.');
          localStorage.removeItem('username');
          setIsAuthenticated(false);
          console.log('❌ Non-user tried to access user area:', storedUsername);
        }
      } catch (error) {
        console.error('Error checking user authentication:', error);
        setAuthError('Network error. Please try again.');
        setIsAuthenticated(false);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 800); // 800ms delay
    };

    checkUserAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch users for the users tab
      fetch('http://localhost:5000/api/users')
        .then(response => response.json())
        .then(data => setUsers(data))
        .catch(error => console.error('Error fetching users:', error));

      // Fetch only the first 4 posts for the current user
      const username = localStorage.getItem('username');
      fetch(`http://localhost:5000/api/posts/user/${username}?limit=4`)
        .then(response => response.json())
        .then(data => setPosts(data))
        .catch(error => console.error('Error fetching posts:', error));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'settings' && localStorage.getItem('username')) {
      fetch(`http://localhost:5000/api/users/${localStorage.getItem('username')}/apikey`)
        .then(res => res.json())
        .then(data => {
          if (data.api_key) setUserApiKey(data.api_key);
        });
    }
  }, [activeTab]);

  const username = localStorage.getItem('username');
  const userPosts = posts.filter(post => post.author && post.author.name === username);
  const totalPosts = userPosts.length;
  const totalViews = userPosts.reduce((sum, post) => sum + (post.views || post.reactions || 0), 0);
  const followers = 0;
  const drafts = 0;

  const recentPosts = posts.slice(0, 3);

  function handleCopyApiKey() {
    navigator.clipboard.writeText(userApiKey).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 1200);
    });
  }

  async function handleRegenerateApiKey() {
    setApiKeyMsg('');
    // Generate a new key (client-side for demo, should be server-side in production)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk-';
    for (let i = 0; i < 20; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserApiKey(key);
    // Save to backend
    await fetch(`http://localhost:5000/api/users/${username}/apikey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    setApiKeyMsg('API Key regenerated!');
    setTimeout(() => setApiKeyMsg(''), 1500);
  }

  // Show loading state while fetching username
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100vw',
          color: '#a78bfa',
          fontSize: '1.2em',
          textAlign: 'center'
        }}>
          Loading user data...
        </div>
      </div>
    );
  }

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg,rgb(255, 31, 31) 0%, rgb(255, 102, 102) 100%)',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>⚠️ Access Denied</h2>
            <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>{authError}</p>
            <button
              onClick={() => window.location.href = '/auth'}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div className="profile-image">
            <img src="https://randomuser.me/api/portraits/men/26.jpg" alt="User Profile" />
          </div>
          <h3>Welcome, {localStorage.getItem('username')}!</h3>
          <p>User</p>
        </div>
        <nav className="dashboard-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </div>
      <div className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Total Posts</h3>
                <p>{totalPosts}</p>
              </div>
              <div className="stats-card">
                <h3>Total Views</h3>
                <p>{totalViews}</p>
              </div>
              <div className="stats-card">
                <h3>Followers</h3>
                <p>{followers}</p>
              </div>
              <div className="stats-card">
                <h3>Drafts</h3>
                <p>{drafts}</p>
              </div>
            </div>
            <div className="recent-posts">
              <h3>Recent Posts</h3>
              <div className="posts-list">
                {recentPosts.length === 0 ? (
                  <div style={{ color: '#a78bfa', fontSize: '1.1em', textAlign: 'center', margin: '24px 0' }}>
                    You have not posted any content yet.
                  </div>
                ) : (
                  recentPosts.map(post => (
                    <div key={post.id} className="post-item">
                      <h4>{post.title}</h4>
                      <div className="post-meta">
                        <span>{post.reactions} reactions</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'posts' && (
          <div className="posts-content">
            <div className="posts-header">
              <h2>My Posts</h2>
            </div>
            <div className="posts-list">
              {userPosts.length === 0 ? (
                <div style={{ color: '#a78bfa', fontSize: '1.1em', textAlign: 'center', margin: '24px 0' }}>
                  You have not posted any content yet.
                </div>
              ) : (
                userPosts.map(post => (
                  <div key={post.id} className="post-item">
                    <h4>{post.title}</h4>
                    <div className="post-meta">
                      <span>{post.reactions} reactions</span>
                      <span>{post.date}</span>
                    </div>
                    <div className="post-actions">
                      <button className="edit-btn" title="Edit Post">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                          <path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-2.12.71.71-2.12 9.3-9.3z" fill="#7c3aed" />
                          <path d="M3 17h14v2H3v-2z" fill="#a78bfa" />
                        </svg>
                        Edit
                      </button>
                      <button className="delete-btn" title="Delete Post">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                          <rect x="5" y="7" width="10" height="9" rx="2" fill="#e11d48" />
                          <rect x="8" y="10" width="1.5" height="4" rx="0.75" fill="#fff" />
                          <rect x="10.5" y="10" width="1.5" height="4" rx="0.75" fill="#fff" />
                          <rect x="3" y="4" width="14" height="2" rx="1" fill="#e11d48" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <h2>Analytics</h2>
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Views This Month</h3>
                <p>1,200</p>
              </div>
              <div className="stats-card">
                <h3>Top Post</h3>
                <p style={{ fontSize: '1.01rem', color: '#a78bfa', marginBottom: '6px', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Getting Started with React
                </p>
                <div style={{ color: '#94a3b8', fontSize: '0.93rem' }}>320 views • 2025-06-08</div>
              </div>
              <div className="stats-card">
                <h3>Average Views/Post</h3>
                <p>250</p>
              </div>
              <div className="stats-card">
                <h3>Followers Growth</h3>
                <p>+10%</p>
              </div>
            </div>
            <div className="analytics-charts" style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#f8fafc', marginBottom: '16px' }}>Views Trend</h3>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '18px', padding: '24px', minHeight: '180px', color: '#a78bfa', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>📈 Detailed Analytics Available</span>
                <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '0.95rem' }}>
                  Users have full access to all analytics.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-content">
            <h2>Settings</h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '18px', padding: '32px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <form style={{ width: '100%', maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ marginBottom: '22px' }}>
                  <label htmlFor="username" style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>Username</label>
                  <input id="username" type="text" defaultValue={localStorage.getItem('username')} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a78bfa', background: 'rgba(23,18,41,0.7)', color: '#fff', fontSize: '1rem' }} />
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label htmlFor="email" style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>Email</label>
                  <input id="email" type="email" defaultValue="" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a78bfa', background: 'rgba(23,18,41,0.7)', color: '#fff', fontSize: '1rem' }} />
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label htmlFor="password" style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>Password</label>
                  <input id="password" type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a78bfa', background: 'rgba(23,18,41,0.7)', color: '#fff', fontSize: '1rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px' }}>
                  <input id="notifications" type="checkbox" style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: '#7c3aed' }} />
                  <label htmlFor="notifications" style={{ color: '#a78bfa', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', margin: 0 }}>
                    Enable notifications
                  </label>
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label htmlFor="bio" style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>Bio</label>
                  <textarea id="bio" rows="3" placeholder="Tell us about yourself..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a78bfa', background: 'rgba(23,18,41,0.7)', color: '#fff', fontSize: '1rem', resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '7px' }}>API Key</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={userApiKey}
                      readOnly
                      placeholder="sk-xxxx-xxxx-xxxx"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #a78bfa',
                        background: 'rgba(23,18,41,0.7)',
                        color: '#fff',
                        fontSize: '1rem',
                        flex: 1
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyApiKey}
                      style={{
                        background: '#a78bfa',
                        color: '#18122b',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minWidth: '60px'
                      }}
                    >
                      {copySuccess ? copySuccess : 'Copy'}
                    </button>
                  </div>
                  <button
                    type="button"
                    style={{
                      marginTop: '8px',
                      background: '#6c5ce7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={handleRegenerateApiKey}
                  >
                    Regenerate Key
                  </button>
                  {apiKeyMsg && <div style={{ color: 'green', marginTop: '8px' }}>{apiKeyMsg}</div>}
                  <div style={{ background: 'rgba(23,18,41,0.7)', color: '#bdb4e6', fontSize: '0.95em', marginTop: '14px', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {`// Node.js (axios)\nconst axios = require('axios');\naxios.get('http://localhost:5000/api/protected', {\n  headers: { 'x-api-key': '${userApiKey}' }\n})\n.then(res => console.log(res.data));`}
                  </div>
                  <div style={{ background: 'rgba(23,18,41,0.7)', color: '#bdb4e6', fontSize: '0.95em', marginTop: '10px', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {`# Python (requests)\nimport requests\nresponse = requests.get(\n    'http://localhost:5000/api/protected',\n    headers={'x-api-key': '${userApiKey}'}\n)\nprint(response.json())`}
                  </div>
                </div>
                <button type="submit" className="create-post-btn" style={{ width: '100%', marginLeft: 0, marginTop: '10px' }}>
                  Save Changes
                </button>
              </form>
              <div style={{ marginTop: '32px', color: '#94a3b8', fontSize: '0.97rem', textAlign: 'center', width: '100%' }}>
                <div>
                  <strong>Account Actions</strong>
                  <div style={{ marginTop: '12px' }}>
                    <button style={{ background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginRight: '10px' }}>Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="users-content">
            <h2>Users</h2>
            <ul>
              {users.map(user => (
                <li key={user.id}>{user.username} ({user.email})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
