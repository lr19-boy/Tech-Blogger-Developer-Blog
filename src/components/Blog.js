import React, { useState } from 'react';
import './Blog.css';

const initialPosts = [
  {
    id: 1,
    author: {
      name: "Rolando",
      avatar: require("../lazarus.jpg"),
    },
    date: "May 28",
    title: "AI-Powered Development: The Future of Coding",
    tags: ["#ai", "#programming", "#future"],
    summary: "Discover how AI is revolutionizing software development with code completion, bug detection, and automated testing. Learn about the latest AI tools and how they're changing the way we write code.",
    reactions: 45,
    comments: 12,
    readTime: "5 min read",
    cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    commentsList: [
      {
        author: "Riya",
        avatar: "https://randomuser.me/api/portraits/women/42.jpg",
        text: "AI has definitely made my coding faster!",
        date: "May 28"
      },
      {
        author: "Tom",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
        text: "Great insights on the future of development.",
        date: "May 28"
      }
    ]
  },
  {
    id: 2,
    author: {
      name: "Lina",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    date: "May 28",
    title: "Mastering TypeScript: Advanced Types and Design Patterns",
    tags: ["#typescript", "#javascript", "#programming"],
    summary: "Deep dive into TypeScript's advanced features. Learn about utility types, decorators, and how to implement common design patterns in TypeScript for better code organization.",
    reactions: 38,
    comments: 15,
    readTime: "7 min read",
    cover: "https://images.unsplash.com/photo-1619410283995-43d9134e7656",
    commentsList: [
      {
        author: "Alex",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        text: "This helped me understand TypeScript better!",
        date: "May 28"
      },
      {
        author: "Sarah",
        avatar: "https://randomuser.me/api/portraits/women/46.jpg",
        text: "Love the design patterns section.",
        date: "May 28"
      }
    ]
  },
  {
    id: 3,
    author: {
      name: "Kishore",
      avatar: require("../kishore.jpg"),
    },
    date: "May 25",
    title: "Understanding React Server Components",
    tags: ["#react", "#webdev", "#frontend"],
    summary: "A deep dive into React Server Components and how they change the way we build apps.",
    reactions: 18,
    comments: 5,
    readTime: "4 min read",
    cover: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    commentsList: [
      {
        author: "Alex",
        avatar: "https://randomuser.me/api/portraits/men/54.jpg",
        text: "Nice overview!",
        date: "May 25"
      },
      {
        author: "Sara",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg",
        text: "Looking forward to more.",
        date: "May 25"
      }
    ]
  },
  {
    id: 4,
    author: {
      name: "Lingesh",
      avatar: require("../lingesh.jpg"),
    },
    date: "May 24",
    title: "The Evolution of CSS: From Cascading Styles to CSS Grid",
    tags: ["#css", "#webdev", "#design"],
    summary: "Explore the evolution of CSS and how it has transformed web design. Learn about the latest features like CSS Grid and Flexbox, and how to use them effectively.",
    reactions: 27,
    comments: 10,
    readTime: "6 min read",
    cover: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    commentsList: [
      {
        author: "Mike",
        avatar: "https://randomuser.me/api/portraits/men/48.jpg",
        text: "CSS Grid has changed the way I build layouts.",
        date: "May 24"
      },
      {
        author: "Emma",
        avatar: "https://randomuser.me/api/portraits/women/49.jpg",
        text: "Great insights on CSS evolution.",
        date: "May 24"
      }
    ]
  },
  {
    id: 5,
    author: {
      name: "Anu",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    date: "May 23",
    title: "Getting Started with Docker: A Beginner's Guide",
    tags: ["#docker", "#devops", "#containers"],
    summary: "Learn the basics of Docker and containerization. This guide covers Docker installation, basic commands, and how to create your first container.",
    reactions: 33,
    comments: 8,
    readTime: "5 min read",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    commentsList: [
      {
        author: "Sam",
        avatar: "https://randomuser.me/api/portraits/men/53.jpg",
        text: "Docker has simplified my development workflow.",
        date: "May 23"
      },
      {
        author: "Samantha",
        avatar: "https://randomuser.me/api/portraits/women/52.jpg",
        text: "Clear and concise guide, thanks!",
        date: "May 23"
      }
    ]
  },
  {
    id: 6,
    author: {
      name: "Jeeva",
      avatar: require("../jeeva.jpg"),
    },
    date: "May 25",
    title: "Web Performance Optimization Techniques for 2025",
    tags: ["#performance", "#webdev", "#optimization"],
    summary: "Learn the latest techniques for optimizing web applications. From code splitting to lazy loading, discover how to make your web apps blazing fast in 2025.",
    reactions: 56,
    comments: 18,
    readTime: "6 min read",
    cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    commentsList: [
      {
        author: "Mike",
        avatar: "https://randomuser.me/api/portraits/men/48.jpg",
        text: "These tips improved my site's performance significantly!",
        date: "May 25"
      },
      {
        author: "Lisa",
        avatar: "https://randomuser.me/api/portraits/women/49.jpg",
        text: "Great article on modern optimization techniques.",
        date: "May 25"
      }
    ]
  },
  {
    id: 7,
    author: {
      name: "Lalitha",
      avatar: require("../lalitha.jpg"),
    },
    date: "May 24",
    title: "Machine Learning for Web Developers",
    tags: ["#ml", "#webdev", "#tutorial"],
    summary: "A beginner-friendly guide to implementing machine learning in web applications. Learn how to use TensorFlow.js and integrate ML models in your web projects.",
    reactions: 42,
    comments: 14,
    readTime: "8 min read",
    cover: "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    commentsList: [
      {
        author: "David",
        avatar: "https://randomuser.me/api/portraits/men/51.jpg",
        text: "Great introduction to ML for web devs!",
        date: "May 24"
      },
      {
        author: "Emma",
        avatar: "https://randomuser.me/api/portraits/women/52.jpg",
        text: "Can't wait to try these techniques.",
        date: "May 24"
      }
    ]
  },
  {
    id: 8,
    author: {
      name: "Raj",
      avatar: "https://randomuser.me/api/portraits/men/53.jpg",
    },
    date: "May 24",
    title: "Building Accessible Web Applications",
    tags: ["#accessibility", "#webdev", "#a11y"],
    summary: "Learn how to make your web applications accessible to everyone. Best practices, ARIA attributes, and testing tools for better web accessibility.",
    reactions: 35,
    comments: 9,
    readTime: "4 min read",
    cover: "https://images.unsplash.com/photo-1584433305355-9cb73387fc61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    commentsList: [
      {
        author: "Chris",
        avatar: "https://randomuser.me/api/portraits/men/54.jpg",
        text: "Accessibility is so important, thanks for sharing!",
        date: "May 24"
      },
      {
        author: "Anna",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg",
        text: "Great tips for making web apps more inclusive.",
        date: "May 24"
      }
    ]
  }
];

function Blog() {
  const [posts, setPosts] = useState(initialPosts);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [activeComments, setActiveComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [imgError, setImgError] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    const tagArr = tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    const newPost = {
      id: Date.now(),
      author: {
        name: "Guest",
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
  const handleReaction = (id) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === id
          ? { ...post, reactions: post.reactions + 1 }
          : post
      )
    );
  };

  // Handle open/close comments popup
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
            <img src={post.author.avatar} alt={post.author.name} className="author-avatar" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%' }} />
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

export { initialPosts };
export default Blog;
