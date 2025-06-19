import React from 'react';
import '../App.css';
import './About.css';
import lazarus from '../lazarus.jpg';

function About() {
  const teamMembers = [
    {
      name: "Lazarus Rolando",
      role: "Founder & Lead Developer",
      avatar: lazarus,
      bio: "Becoming a Full Stack Developer with a focus on web technologies and community building.",
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Innovation",
      description: "Staying at the forefront of technology trends and best practices"
    },
    {
      icon: "🤝",
      title: "Community",
      description: "Building a supportive and inclusive tech community"
    },
    {
      icon: "📚",
      title: "Education",
      description: "Making quality tech education accessible to everyone"
    },
    {
      icon: "💫",
      title: "Excellence",
      description: "Delivering high-quality content and technical solutions"
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>About Tech Blogger</h1>
        <p className="about-tagline">
          Empowering developers and tech enthusiasts with knowledge and community since 2025
        </p>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            At Tech Blogger, we're passionate about making technology accessible and 
            understandable to everyone. Our platform serves as a bridge between complex 
            technical concepts and practical, real-world applications.
          </p>
          <p>
            We believe in the power of community-driven learning and the importance of 
            staying current with rapidly evolving technology trends. Through our articles, 
            tutorials, and resources, we aim to empower developers at all stages of their journey.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          {values.map((value) => (
            <div key={value} className="value-card">
              <span className="value-icon">{value.icon}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member} className="team-card">
              <img src={member.avatar} alt={member.name} className="team-avatar" />
              <h3>{member.name}</h3>
              <span className="team-role">{member.role}</span>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Section */}
      <section>
        <h2>Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-date">2025</div>
            <div className="timeline-content">
              <h3>The Beginning</h3>
              <p>Started as a small tech blog with a vision to simplify complex technical concepts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
