import { React, useEffect, useState } from 'react';
import { initialPosts } from './Blog';
import './User.css';
import logoutIcon from '../logout.png';
import { useNavigate } from 'react-router-dom';

const User = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats] = useState({
    totalPosts: 15,
    totalViews: 1200,
    followers: 45,
    drafts: 3
  });
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isUser = localStorage.getItem('is_user');
    if (isUser !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch users for the users tab
    fetch('http://localhost:5000/api/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));

    // Fetch logged-in user info for the welcome message
    const storedUsername = localStorage.getItem('username'); // or wherever you store it

    fetch('http://localhost:5000/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: storedUsername })
    })
      .then(response => response.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        }
      })
      .catch(error => console.error('Error fetching logged-in user:', error));
  }, []);

  const recentPosts = initialPosts.slice(0, 3);

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div className="profile-image">
            <img src="https://randomuser.me/api/portraits/men/26.jpg" alt="User Profile" />
          </div>
          <div className="profile-info">
            <h3>Welcome, {username}!</h3>
            <p>Tech Blogger</p>
          </div>
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
          <button className="logout-btn">
            <img
              className="logout-icon"
              src={logoutIcon}
              alt="Logout"
              style={{ width: '20px', height: '20px', verticalAlign: 'middle' }}
            />
            <a href="/logout" style={{ textDecoration: 'none', color: '#E10600' }}>Logout</a>
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
                <p>{userStats.totalPosts}</p>
              </div>
              <div className="stats-card">
                <h3>Total Views</h3>
                <p>{userStats.totalViews}</p>
              </div>
              <div className="stats-card">
                <h3>Followers</h3>
                <p>{userStats.followers}</p>
              </div>
              <div className="stats-card">
                <h3>Drafts</h3>
                <p>{userStats.drafts}</p>
              </div>
            </div>
            <div className="recent-posts">
              <h3>Recent Posts</h3>
              <div className="posts-list">
                {recentPosts.map(post => (
                  <div key={post.id} className="post-item">
                    <h4>{post.title}</h4>
                    <div className="post-meta">
                      <span>{post.reactions} reactions</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'posts' && (
          <div className="posts-content">
            <div className="posts-header">
              <h2>My Posts</h2>
              <button className="create-post-btn">
                <span aria-label="plus" style={{ verticalAlign: 'middle', marginRight: '7px', fontSize: '1.15em' }}>➕</span> Create New Post
              </button>
            </div>
            <div className="posts-list">
              {recentPosts.map(post => (
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
              ))}
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
                  <input id="username" type="text" defaultValue="" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a78bfa', background: 'rgba(23,18,41,0.7)', color: '#fff', fontSize: '1rem' }} />
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
                <button type="submit" className="create-post-btn" style={{ width: '100%', marginLeft: 0, marginTop: '10px' }}>
                  Save Changes
                </button>
              </form>
              <div style={{ marginTop: '32px', color: '#94a3b8', fontSize: '0.97rem', textAlign: 'center', width: '100%' }}>
                <div>
                  <strong>Account Actions</strong>
                  <div style={{ marginTop: '12px' }}>
                    <button style={{ background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginRight: '10px' }}>Delete Account</button>
                    <button style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Log Out</button>
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
                <li key={user[0]}>{user[1]} ({user[2]})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;