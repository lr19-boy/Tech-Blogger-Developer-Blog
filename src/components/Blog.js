import React, { useState, useEffect } from 'react';
import './Blog.css';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [activeComments, setActiveComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [imgError, setImgError] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch posts from MySQL database  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/posts');
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData.reverse());
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Check authentication status on component mount
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
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else {
            // Clear invalid stored data
            localStorage.removeItem('username');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to refresh authentication status
  const refreshAuthStatus = async () => {
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
          setCurrentUser(userData);
          setIsAuthenticated(true);
          return true;
        } else {
          localStorage.removeItem('username');
          setIsAuthenticated(false);
          setCurrentUser(null);
          return false;
        }
      } catch (error) {
        console.error('Error refreshing auth status:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        return false;
      }
    }
    return false;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        setCoverPreview(URL.createObjectURL(file));
        e.preventDefault();
        break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    
    // Refresh authentication status before submission
    const isStillAuthenticated = await refreshAuthStatus();
    if (!isStillAuthenticated) {
      alert('Your session has expired. Please log in again to create a post.');
      return;
    }
    
    const tagArr = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    const newPost = {
      id: Date.now(),
      author: {
        name: currentUser?.username || "Guest",
        avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      title,
      tags: tagArr,
      summary,
      reactions: 0,
      comments: 0,
      readTime: "1 min read",
      cover: coverPreview,
      commentsList: [],
    };
    setPosts([newPost, ...posts]);
    setTitle('');
    setTags('');
    setSummary('');
    setCoverPreview(null);
  };

  // Handle reaction click
  const handleReaction = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/posts/${id}/react`, { method: 'POST' });
      fetchPosts(); // Refresh posts from backend
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Handle open/close comments popup
  const handleComments = async (id) => {
    setActiveComments(id);
    setNewComment('');
    await fetchPosts(); // Refresh all posts, including comments
  };

  // Handle add new comment
  const handleAddComment = async (id) => {
    if (!newComment.trim()) return;
    const commentObj = {
      author: "Guest",
      avatar: "https://randomuser.me/api/portraits/lego/2.jpg",
      text: newComment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    try {
      await fetch(`http://localhost:5000/api/posts/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentObj)
      });
      fetchPosts(); // Refresh posts from backend
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle close popup
  const handleCloseComments = () => setActiveComments(null);

  const handleImageError = (postId) => {
    setImgError(prev => ({
      ...prev,
      [postId]: true
    }));
  };

  return (
    <div className="blog-feed">
      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          fontSize: '1.2em',
          color: '#666'
        }}>
          Loading blog posts...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg,rgb(255, 51, 51) 0%,rgb(255, 0, 0) 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2em' }}>⚠️ Error Loading Posts</h3>
          <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>{error}</p>
          <button 
            onClick={fetchPosts}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Post creation form - only show if authenticated */}
      {isAuthenticated && (
        <form className="blog-post-form" onSubmit={handleSubmit}>
          
          <label className="cover-label">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverChange}
            />
            <span className="cover-btn">{coverPreview ? "Change cover image" : "Add a cover image"}</span>
          </label>
          {coverPreview && (
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img src={coverPreview} alt="Cover Preview" className="cover-preview" />
              <button
                type="button"
                className="remove-cover-btn"
                onClick={() => setCoverPreview(null)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#d00',
                }}
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}
          <input
            className="blog-title-input"
            type="text"
            placeholder="New post title here..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            className="blog-tags-input"
            type="text"
            placeholder="Add up to 4 tags, separated by commas (e.g. javascript,react,webdev)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            maxLength={50}
          />
          <textarea
            className="blog-summary-input"
            placeholder="Write your post content here..."
            value={summary}
            onChange={e => setSummary(e.target.value)}
            onPaste={handlePaste}
            rows={4}
            required
          />
          <button className="blog-publish-btn" type="submit">Publish</button>
        </form>
      )}

      {/* Show login prompt if not authenticated */}
      {!isAuthenticated && (
        <div style={{
          background: 'linear-gradient(135deg,rgb(255, 51, 51) 0%,rgb(255, 0, 0) 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2em' }}>🔒 Authentication Required</h3>
          <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
            You need to be logged in to create blog posts. Please log in to access the post creation form.
          </p>
          <a 
            href="/auth" 
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login Now
          </a>
        </div>
      )}

      {/* Blog posts feed */}
      {!loading && !error && posts.map(post => (
        <div className="blog-card" key={post.id}>
          {post.cover && !imgError[post.id] && (
            <img
              src={post.cover}
              alt={post.title}
              className="blog-cover-img"
              onError={() => handleImageError(post.id)}
            />
          )}
          <div className="blog-card-header">
            <img src={post.author.avatar} alt={post.author.name} className="author-avatar" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%' }} />
            <div>
              <div className="author-name">{post.author.name}</div>
              <div className="post-date">{post.date}</div>
            </div>
          </div>
          <div className="blog-card-body">
            <h2 className="blog-title">{post.title}</h2>
            <div className="blog-tags">
              {post.tags && post.tags.map(tag => (
                <span className="blog-tag" key={tag}>{tag}</span>
              ))}
            </div>
            <p className="blog-summary">{post.summary}</p>
          </div>
          <div className="blog-card-footer">
            <button
              type="button"
              className="reaction-btn"
              style={{ cursor: isAuthenticated ? 'pointer' : 'not-allowed', color: '#e25555', fontWeight: 'bold', background: 'none', border: 'none', padding: 0, opacity: isAuthenticated ? 1 : 0.5 }}
              onClick={isAuthenticated ? () => handleReaction(post.id) : undefined}
              title={isAuthenticated ? "Like" : "Login to react"}
              tabIndex={isAuthenticated ? 0 : -1}
              aria-label={`Like post titled ${post.title}`}
              disabled={!isAuthenticated}
              onKeyDown={e => {
                if (isAuthenticated && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleReaction(post.id);
                }
              }}
            >
              ❤️ {post.reactions} reactions
            </button>
            <button
              type="button"
              className="comment-btn"
              style={{ cursor: isAuthenticated ? 'pointer' : 'not-allowed', color: '#198fcf', fontWeight: 'bold', background: 'none', border: 'none', padding: 0, opacity: isAuthenticated ? 1 : 0.5 }}
              onClick={isAuthenticated ? () => handleComments(post.id) : undefined}
              title={isAuthenticated ? "View/Add Comments" : "Login to comment"}
              tabIndex={isAuthenticated ? 0 : -1}
              aria-label={`View or add comments to post titled ${post.title}`}
              disabled={!isAuthenticated}
              onKeyDown={e => {
                if (isAuthenticated && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleComments(post.id);
                }
              }}
            >
              💬 {post.comments} comments
            </button>
            <span>{post.readTime}</span>
          </div>

          {/* Comments Popup */}
          {activeComments === post.id && (
            <div className="comments-popup">
              <div className="comments-popup-content" style={{ position: 'relative', paddingTop: '48px' }}>
                <button
                  className="close-comments-btn"
                  onClick={handleCloseComments}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 18,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#d00',
                    fontSize: '1.5em',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    zIndex: 10
                  }}
                  title="Close"
                >×</button>
                <h3 style={{ textAlign: 'center', margin: '18px 0 16px 0', fontSize: '1.5em', fontWeight: 'bold' }}>Comments</h3>
                <div className="comments-list">
                  {(!post.commentsList || post.commentsList.length === 0) && <div>No comments yet.</div>}
                  {post.commentsList && post.commentsList.map((c, index) => (
                    <div
                      key={`${c.author}-${c.date}-${index}`}
                      className="comment-item"
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
                    >
                      <img src={c.avatar} alt={c.author} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                      <div>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{c.author}</span>
                          <span style={{ color: '#888', marginLeft: 8, fontSize: '0.98em' }}>{c.date}</span>
                        </div>
                        <div style={{ fontSize: '1.08em', marginTop: 2 }}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="add-comment-section" style={{ display: 'flex', gap: '8px', marginTop: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder={isAuthenticated ? "Add a comment..." : "Login to add a comment"}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => {
                      if (isAuthenticated && e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1.5px solid #198fcf',
                      fontSize: '1em',
                      minWidth: '180px',
                      maxWidth: '320px',
                      boxShadow: '0 1px 4px rgba(25,143,207,0.10)',
                      outline: 'none',
                      color: '#222',
                      background: '#f8fbff',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      opacity: isAuthenticated ? 1 : 0.5
                    }}
                    onFocus={e => isAuthenticated && (e.target.style.border = '1.5px solid #1565c0')}
                    onBlur={e => isAuthenticated && (e.target.style.border = '1.5px solid #198fcf')}
                    disabled={!isAuthenticated}
                  />
                  <button
                    onClick={isAuthenticated ? () => handleAddComment(post.id) : undefined}
                    style={{
                      background: 'linear-gradient(135deg, #198fcf 0%, #6c5ce7 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 18px',
                      fontSize: '1em',
                      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                      boxShadow: '0 1px 4px rgba(25,143,207,0.13)',
                      transition: 'background 0.2s, box-shadow 0.2s',
                      opacity: isAuthenticated ? 1 : 0.5
                    }}
                    onMouseOver={e => isAuthenticated && (e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #6c5ce7 100%)')}
                    onFocus={e => isAuthenticated && (e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #6c5ce7 100%)')}
                    onMouseOut={e => isAuthenticated && (e.target.style.background = 'linear-gradient(135deg, #198fcf 0%, #6c5ce7 100%)')}
                    onBlur={e => isAuthenticated && (e.target.style.background = 'linear-gradient(135deg, #198fcf 0%, #6c5ce7 100%)')}
                    disabled={!isAuthenticated}
                  >Post</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Blog;
