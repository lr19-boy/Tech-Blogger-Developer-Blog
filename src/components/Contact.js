import React, { useState } from 'react';
import './Contact.css';
import { Helmet } from 'react-helmet';
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(false);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setError('Failed to send message. Please try again later.');
      }
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="contact-container">
      <Helmet>
        <title>Tech Blogger | Contact</title>
        <meta name="description" content="Contact Tech Blogger for any questions, suggestions, or collaborations." />
      </Helmet>
      <div className="contact-hero">
        <h1>Contact Tech Blogger</h1>
        <p>
          Have a question, suggestion, or want to collaborate? <br />
          We'd love to hear from you! Reach out using the form below or connect with us on social media.
        </p>
      </div>
      <div className="contact-content">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send us a message</h2>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
          />
          <button type="submit">Send Message</button>
          {submitted && <div className="contact-success">Thank you! We'll get back to you soon.</div>}
          {error && <div className="contact-error">{error}</div>}
        </form>
        <div className="contact-info">
          <h2>Our Info</h2>
          <p>
            <strong>Emails:</strong><br />
            lazarusrolando399@gmail.com<br />
            <strong>Owners:</strong><br />
            Lazarus Rolando<br /><br />
            <strong>Phone:</strong> +1 234 567 8901<br />
            <strong>Address:</strong> 123 Tech Street, Innovation City, 45678
          </p>
          <h3>Follow us</h3>
          <div className="contact-socials">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">📘 Facebook</a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">💻 GitHub</a>
          </div>
          <div className="contact-map">
            <iframe
              title="Tech Blogger Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9716%2C77.5946%2C12.9716&amp;layer=mapnik"
              style={{ border: 0, width: '100%', height: '180px', borderRadius: '8px', marginTop: '12px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
