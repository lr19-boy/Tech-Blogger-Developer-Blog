import React, { useState, useEffect } from 'react';
import './Blog.css';
import lazarusImg from '../lazarus.jpg';
import kishoreImg from '../kishore.jpg';
import lingeshImg from '../lingesh.jpg';
import jeevaImg from '../jeeva.jpg';
import lalithaImg from '../lalitha.jpg';
import { floor } from 'mathjs';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [activeComments, setActiveComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/api/blogposts')
      .then(res => res.json())
      .then(data => setPosts(data.reverse()))
      .catch(err => console.error('Failed to fetch blog posts:', err));
  }, []);

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
    const tagArr = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    const newPost = {
      author: {
        name: "Guest",
        avatar: `https://randomuser.me/api/portraits/lego/${floor(floor.random() * 20)}.jpg`,
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title,
      tags: tagArr,
      summary,
      reactions: 0,
      comments: 0,
      readTime: "1 min read",
      cover: coverPreview,
      commentsList: [],
    };
    try {
      const res = await fetch('http://localhost:5000/api/blogposts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        const postsRes = await fetch('http://localhost:5000/api/blogposts');
        const postsData = await postsRes.json();
        setPosts(postsData.reverse());
        setTitle('');
        setTags('');
        setSummary('');
        setCoverPreview(null);
      } else {
        alert('Failed to add post');
      }
    } catch (err) {
      alert('Error adding post');
      console.error(err);
    }
  };

  const handleReaction = (id) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === id
          ? { ...post, reactions: post.reactions + 1 }
          : post
      )
    );
  };


  const handleComments = (id) => {
    setActiveComments(id);
    setNewComment('');
  };

  // Handle add new comment
  const handleAddComment = (id) => {
    if (!newComment.trim()) return;
    const commentObj = {
      author: "Guest",
      avatar: "https://randomuser.me/api/portraits/lego/2.jpg",
      text: newComment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    setPosts(posts =>
      posts.map(post =>
        post.id === id
          ? {
            ...post,
            comments: post.comments + 1,
            commentsList: [...post.commentsList, commentObj]
          }
          : post
      )
    );
    setNewComment('');
  };

  // Handle close popup
  const handleCloseComments = () => setActiveComments(null);

  const handleImageError = (postId) => {
    setImgError(prev => ({
      ...prev,
      [postId]: true
    }));
  };

  // Helper to resolve avatar
  const resolveAvatar = (avatar) => {
    switch (avatar) {
      case './lazarus.jpg': return lazarusImg;
      case './kishore.jpg': return kishoreImg;
      case './lingesh.jpg': return lingeshImg;
      case './jeeva.jpg': return jeevaImg;
      case './lalitha.jpg': return lalithaImg;
      default: return avatar;
    }
  };

  return (
    <div className="blog-feed">
      {/* Post creation form */}
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

      {/* Blog posts feed */}
      {posts.map(post => (
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
            <img src={resolveAvatar(post.author.avatar)} alt={post.author.name} className="author-avatar" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%' }} />
            <div>
              <div className="author-name">{post.author.name}</div>
              <div className="post-date">{post.date}</div>
            </div>
          </div>
          <div className="blog-card-body">
            <h2 className="blog-title">{post.title}</h2>
            <div className="blog-tags">
              {post.tags.map(tag => (
                <span className="blog-tag" key={tag}>{tag}</span>
              ))}
            </div>
            <p className="blog-summary">{post.summary}</p>
          </div>
          <div className="blog-card-footer">
            <button
              type="button"
              className="reaction-btn"
              style={{ cursor: 'pointer', color: '#e25555', fontWeight: 'bold', background: 'none', border: 'none', padding: 0 }}
              onClick={() => handleReaction(post.id)}
              title="Like"
              tabIndex={0}
              aria-label={`Like post titled ${post.title}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
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
              style={{ cursor: 'pointer', color: '#198fcf', fontWeight: 'bold', background: 'none', border: 'none', padding: 0 }}
              onClick={() => handleComments(post.id)}
              title="View/Add Comments"
              tabIndex={0}
              aria-label={`View or add comments to post titled ${post.title}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
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
                  {post.commentsList.length === 0 && <div>No comments yet.</div>}
                  {post.commentsList.map((c) => (
                    <div
                      key={`${c.author}-${c.date}-${c.text.slice(0, 20)}`}
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
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
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
                      transition: 'border 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => e.target.style.border = '1.5px solid #1565c0'}
                    onBlur={e => e.target.style.border = '1.5px solid #198fcf'}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    style={{
                      background: 'linear-gradient(135deg, #198fcf 0%, #6c5ce7 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 18px',
                      fontSize: '1em',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 1px 4px rgba(25,143,207,0.13)',
                      transition: 'background 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={e => e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #6c5ce7 100%)'}
                    onFocus={e => e.target.style.background = 'linear-gradient(135deg, #1565c0 0%, #6c5ce7 100%)'}
                    onMouseOut={e => e.target.style.background = 'linear-gradient(135deg, #198fcf 0%, #6c5ce7 100%)'}
                    onBlur={e => e.target.style.background = 'linear-gradient(135deg, #198fcf 0%, #6c5ce7 100%)'}
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
