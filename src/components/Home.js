import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
     const [email, setEmail] = useState('');
     const [subscribed, setSubscribed] = useState(false); 
     const features = [
          {
               icon: "💡",
               title: "Latest Tech Insights",
               description: "Stay updated with cutting-edge technology trends and innovations"
          },
          {
               icon: "📚",
               title: "In-depth Tutorials",
               description: "Learn from comprehensive guides and practical examples"
          },
          {
               icon: "🤝",
               title: "Community Support",
               description: "Connect with fellow developers and tech enthusiasts"
          },
          {
               icon: "🚀",
               title: "Career Growth",
               description: "Advance your tech career with expert advice and resources"
          },
          {
               icon: "🎯",
               title: "Hands-on Projects",
               description: "Build real-world applications with guided project tutorials and code reviews"
          },
          {
               icon: "🌐",
               title: "Global Network",
               description: "Connect with developers worldwide and participate in collaborative learning"
          }
     ];

     const stats = [
          { 
            icon: "🌐",
            number: "10K+", 
            label: "Active Readers" 
          },
          { 
            icon: "📝",
            number: "500+", 
            label: "Articles" 
          },
          { 
            icon: "👨‍💻",
            number: "50+", 
            label: "Expert Authors" 
          },
          { 
            icon: "👥",
            number: "100K+", 
            label: "Monthly Views" 
          }
     ];

     const featuredArticles = [
          {
               title: "Getting Started with Web Development in 2025",
               excerpt: "Explore the essential tools, languages, and frameworks that define modern web development.",
               author: "Lazarus",
               readTime: "5 min read",
               image: require("../lazarus.jpg"),
               category: "Web Development"
          }, {
               title: "Building Data-Driven Web Apps with Python",
               excerpt: "Master Flask for web development and Pandas for data analysis in this comprehensive guide.",
               author: "Lingesh",
               readTime: "12 min read",
               image: require("../lingesh.jpg"),
               category: "Python"
          },
          {
               title: "Building Responsive Web Apps with React",
               excerpt: "A comprehensive guide to creating mobile-first, responsive applications using React.",
               author: "Guest",
               readTime: "10 min read",
               image: require("../techblogger.png"),
               category: "React"
          }
     ];

     const handleSubscribe = (e) => {
          e.preventDefault();
          if (email) {
               setSubscribed(true);
               setEmail('');
               setTimeout(() => setSubscribed(false), 3000);
          }
     };

     return (
          <div className="home-container">
               {/* Hero Section */}
               <section className="hero-section">
                    <h1>Discover the Future of Tech</h1>
                    <p className="hero-text">
                         Join our community of innovators, developers, and tech enthusiasts.
                         Get access to cutting-edge insights, tutorials, and expert knowledge.
                    </p>
                    <div className="cta-buttons">
                         <Link to="/auth" className="primary-button1">Get Started</Link>
                         <Link to="/blog" className="secondary-button">Explore Articles</Link>
                    </div>
               </section>

               {/* Features Section */}
               <section className="features-section">
                    <h2>Why Choose Tech Blogger?</h2>
                    <div className="features-grid">
                         {features.map((feature) => (
                              <div key={feature.title} className="feature-card">
                                   <div className="feature-icon">{feature.icon}</div>
                                   <h3>{feature.title}</h3>
                                   <p>{feature.description}</p>
                              </div>
                         ))}
                    </div>
               </section>

               {/* Stats Section */}
               <section className="stats-section">
                    <div className="stats-grid">
                         {stats.map((stat) => (
                              <div key={stat.label} className="stat-card">
                                   <div className="stat-icon">{stat.icon}</div>
                                   <div className="stat-number">{stat.number}</div>
                                   <div className="stat-label">{stat.label}</div>
                              </div>
                         ))}
                    </div>
               </section>

               {/* Featured Articles Section */}
               <section className="featured-articles-section">
                    <h2>Featured Articles</h2>
                    <p className="section-subtitle">Latest insights from our tech experts</p>
                    <div className="articles-grid">
                         {featuredArticles.map((article) => (
                              <Link to="/blog" key={article.title} className="article-card">
                                   <div className="article-image" style={{ backgroundImage: `url(${article.image})` }}></div>
                                   <div className="article-content">
                                        <span className="article-category">{article.category}</span>
                                        <h3>{article.title}</h3>
                                        <p className="article-excerpt">{article.excerpt}</p>
                                        <div className="article-meta">
                                             <span className="article-author">{article.author}</span>
                                             <span className="article-separator"> • </span>
                                             <span className="article-time">{article.readTime}</span>
                                        </div>
                                   </div>
                              </Link>
                         ))}
                    </div>
               </section>

               {/* Latest Topics Section */}
               <section className="topics-section">
                    <h2>Trending Topics</h2>
                    <p className="section-subtitle">Explore our most popular technology categories</p>
                    <div className="topics-grid">
                         <Link to="/blog" className="topic-card">
                              <span className="topic-icon">🎨</span>
                              <h4>HTML & CSS</h4>
                              <p>Web design fundamentals</p>
                         </Link>
                         <Link to="/blog" className="topic-card">
                              <span className="topic-icon">📜</span>
                              <h4>JavaScript</h4>
                              <p>Dynamic web programming</p>
                         </Link>
                         <Link to="/blog" className="topic-card">
                              <span className="topic-icon">⚛️</span>
                              <h4>React.js</h4>
                              <p>Modern UI development</p>
                         </Link>
                         <Link to="/blog" className="topic-card">
                              <span className="topic-icon">🐍</span>
                              <h4>Python</h4>
                              <p>Backend & automation</p>
                         </Link>
                    </div>
               </section>

               {/* Newsletter Section */}
               <section className="newsletter-section">
                    <h2>Stay Ahead in Tech</h2>
                    <p>Get weekly curated articles, tutorials, and tech news in your inbox</p>
                    <form className="newsletter-form" onSubmit={handleSubscribe}>
                         <input
                              type="email"
                              placeholder="Enter your email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                         />
                         <button style={{ background: 'linear-gradient(135deg, #7B00FF 0%, #1565c0 100%)', color: 'white' }} type="submit">Subscribe Now</button>
                    </form>
                    {subscribed && (
                         <div className="success-message">
                              Thanks for subscribing! Welcome to our tech community 🎉
                         </div>
                    )}
               </section>
          </div>
     );
}

export default Home;
