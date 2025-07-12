import { React, useEffect, useState } from 'react';
import './User.css';
import { Helmet } from 'react-helmet';
import Notifications from './Notifications';
const User = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', summary: '', tags: [], cover: '' });

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const storedUsername = localStorage.getItem('username');
      if (!storedUsername) {
        setAuthError('No authentication data found. Please log in.');
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
    };

    checkUserAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const username = localStorage.getItem('username');
      if (!username) return;

      // Robust fetch with retry for posts
      const fetchPosts = (retry = false) => {
        fetch(`http://localhost:5000/api/posts/user/${username}`)
          .then(response => response.json())
          .then(data => {
            if (Array.isArray(data)) {
              setPosts(data);
            } else {
              if (!retry) {
                // Retry once if not an array
                fetchPosts(true);
              } else {
                setPosts([]);
              }
            }
          })
          .catch(error => {
            if (!retry) {
              // Retry once on error
              fetchPosts(true);
            } else {
              console.error('Error fetching posts:', error);
              setPosts([]);
            }
          });
      };
      fetchPosts();

      // Fetch unread notifications count
      fetch(`http://localhost:5000/api/notifications/${username}/unread-count`)
        .then(response => response.json())
        .then(data => setUnreadNotificationsCount(data.unread_count || 0))
        .catch(error => {
          console.error('Error fetching unread notifications count:', error);
          setUnreadNotificationsCount(0);
        });
    }
  }, [isAuthenticated]);

  const userPosts = posts;
  const totalPosts = userPosts.length;
  const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
  const drafts = userPosts.filter(post => post.status === 'draft' || post.draft === true).length;

  const recentPosts = userPosts.slice(0, 3);

  // Filter out current user and already followed users from discovery


  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('cover', file);
    const res = await fetch('http://localhost:5000/api/upload/cover', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setEditForm({ ...editForm, cover: data.url });
    }
  };

  const handleEditSubmit = async () => {
    await fetch(`http://localhost:5000/api/posts/${editingPost.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editForm,
        tags: editForm.tags.split(',').map(t => t.trim()),
        cover: editForm.cover,
      }),
    });
    setEditingPost(null);
    // Optionally refresh posts here
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    let username = document.getElementById('username').value;
    if (!username) {
      username = localStorage.getItem('username');
    }
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const bio = document.getElementById('bio').value;

    // Add debug log
    console.log({ username, email, password, bio });

    // Require at least one field to update
    if (!email && !password && !bio) {
      alert('Please change at least one field before saving.');
      return;
    }

    const res = await fetch('http://localhost:5000/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, bio }),
    });
    if (res.ok) {
      alert('Settings updated! You will receive a notification.');
      setShowNotifications(true); // This will open the notifications modal
    } else {
      alert('Failed to update settings.');
    }
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.18)',
            borderRadius: '18px',
            padding: '40px 32px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            animation: 'fadeInBox 0.5s',
          }}>
            <h2 style={{ marginBottom: '18px', color: '#ff5f6d', fontWeight: 800, letterSpacing: '0.5px' }}>⚠️ Access Denied</h2>
            <p style={{ marginBottom: '22px', fontSize: '1.13em', color: '#333', fontWeight: 500 }}>{authError}</p>
            <button
              onClick={() => window.location.href = '/auth'}
              style={{
                background: 'linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                cursor: 'pointer',
                fontSize: '1.08rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.10)',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
              onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #ffc371 0%, #ff5f6d 100%)'}
              onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%)'}
            >
              Go to Login
            </button>
          </div>
        </div>
        <style>{`
          @keyframes fadeInBox {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Tech Blogger | User</title>
        <meta name="description" content="Manage your account, posts, and settings in the user dashboard." />
      </Helmet>
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <h3 style={{ fontSize: '1.3rem', color: '#a78bfa', marginBottom: '18px', fontWeight: '700' }}>User Profile</h3>
          <div
            style={{
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <span
              style={{
                fontSize: '25px',
                fontWeight: 500,
                color: '#a78bfa',
                lineHeight: 1,
                alignItems: 'center'
              }}
            >
              Welcome, {localStorage.getItem('username')}!
            </span>
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
                      {post.cover && (
                          <div className="cover-container">
                            <img
                              src={post.cover.startsWith('http') ? post.cover : `http://localhost:5000${post.cover}`}
                              alt="Cover"
                              className="post-cover"
                              style={{
                                width: '75%',
                                maxHeight: '75%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                background: 'transparent'
                              }}
                            />
                          </div>
                        )}
                      <h4 style={{textAlign: 'center'}}>{post.title}</h4>
                      <div className="post-content" style={{textAlign: 'center'}}>{post.summary}</div>
                      <div className="post-tags" style={{textAlign: 'center'}}>
                        {post.tags && post.tags.length > 0 && post.tags.map((tag, idx) => (
                          <span key={idx} className="post-tag">{tag}</span>
                        ))}
                      </div>
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
                    {editingPost && editingPost.id === post.id ? (
                      <div className="post-edit-form">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          className="edit-title-input"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={editForm.tags}
                          onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                          className="edit-tags-input"
                          placeholder="#tags, #comma, #separated"
                        />
                        <label className="cover-label">Cover Image</label>
                        {editForm.cover && (
                          <img
                            src={editForm.cover.startsWith('http') ? editForm.cover : `http://localhost:5000${editForm.cover}`}
                            alt="Cover Preview"
                            className="edit-cover-preview"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="edit-cover-input"
                        />
                        <textarea
                          value={editForm.summary}
                          onChange={e => setEditForm({ ...editForm, summary: e.target.value })}
                          className="edit-summary-input"
                          placeholder="Summary"
                          rows={5}
                        />
                        <div className="edit-actions">
                          <button className="save-btn" onClick={handleEditSubmit}>Save</button>
                          <button className="cancel-btn" onClick={() => setEditingPost(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {post.cover && (
                          <div className="cover-container">
                            <img
                              src={post.cover.startsWith('http') ? post.cover : `http://localhost:5000${post.cover}`}
                              alt="Cover"
                              className="post-cover"
                              style={{
                                width: '75%',
                                maxHeight: '75%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                background: 'transparent'
                              }}
                            />
                          </div>
                        )}
                        <h4 style={{textAlign: "center"}}>{post.title}</h4>
                        <div className="post-content" style={{textAlign: "center"}}>{post.summary}</div>
                        <div className="post-tags" style={{textAlign: "center"}}>
                          {post.tags && post.tags.length > 0 && post.tags.map((tag, idx) => (
                            <span key={idx} className="post-tag">{tag}</span>
                          ))}
                        </div>
                        <div className="post-meta">
                          <span>{post.reactions} reactions</span>
                          <span>{post.date}</span>
                        </div>
                      </>
                    )}
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
              <form onSubmit={handleSettingsSubmit} style={{ width: '100%', maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
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

        {activeTab === 'notification' && (
          <div className="notification-content">
            <h2>Notifications</h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#a78bfa', margin: 0 }}>Recent Notifications</h3>
                <button
                  onClick={() => setShowNotifications(true)}
                  style={{
                    background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
                    color: 'black',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={e => e.target.style.opacity = '0.8'}
                  onMouseOut={e => e.target.style.opacity = '1'}
                >
                  View All
                </button>
              </div>
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔔</div>
                <p>Click "View All" to see your notifications</p>
                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                  {unreadNotificationsCount > 0
                    ? `You have ${unreadNotificationsCount} unread notification${unreadNotificationsCount > 1 ? 's' : ''}`
                    : 'No unread notifications'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <Notifications
          username={localStorage.getItem('username')}
          onClose={() => {
            setShowNotifications(false);
            // Refresh unread count when modal is closed
            const username = localStorage.getItem('username');
            if (username) {
              fetch(`http://localhost:5000/api/notifications/${username}/unread-count`)
                .then(response => response.json())
                .then(data => setUnreadNotificationsCount(data.unread_count || 0))
                .catch(error => console.error('Error refreshing unread count:', error));
            }
          }}
        />
      )}
    </div >
  );
};

export default User;
