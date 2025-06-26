import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-container">
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
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
          />
          <button type="submit">Send Message</button>
          {submitted && <div className="contact-success">Thank you! We'll get back to you soon.</div>}
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
