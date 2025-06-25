import React from 'react';
import '../App.css';
import './Services.css';

import PropTypes from 'prop-types';

function ServiceCard({ icon, title, description }) {
  return (
    <div className="service-card">
      <h3>{icon} {title}</h3>
      <p>{description}</p>
    </div>
  );
}

ServiceCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

function WhyChooseUs() {
  return (
    <div className="why-choose">
      <h3>Why Choose Us?</h3>
      <ul>
        <li>✔️ Experienced professionals passionate about technology</li>
        <li>✔️ Focus on quality, clarity, and real-world value</li>
        <li>✔️ Fast response and personalized solutions</li>
        <li>✔️ Community-driven and always learning</li>
      </ul>
    </div>
  );
}

function PricingCard({ plan, price, features, onPrimary, onSecondary, isPopular, popularText, refProp }) {
  return (
    <div className={`pricing-card${isPopular ? ' popular' : ''}`} ref={refProp}>
      {isPopular && <div className="popular-badge">{popularText}</div>}
      <h3>{plan}</h3>
      <div className="price">{price}</div>
      <ul className="features-list">
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      {onPrimary && <button className="cta-button cta-primary" onClick={onPrimary.action}>{onPrimary.label}</button>}
      <br />
      {onSecondary && <button className="cta-button cta-secondary" onClick={onSecondary.action}>{onSecondary.label}</button>}
    </div>
  );
}

PricingCard.propTypes = {
  plan: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  price: PropTypes.node.isRequired,
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
  onPrimary: PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
  }),
  onSecondary: PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
  }),
  isPopular: PropTypes.bool,
  popularText: PropTypes.string,
  refProp: PropTypes.oneOfType([
    PropTypes.func, 
    PropTypes.shape({ current: PropTypes.any })
  ])
};

function TechStack() {
  const techs = [
    { icon: '🌐', name: 'HTML' },
    { icon: '🎨', name: 'CSS' },
    { icon: '📜', name: 'JavaScript' },
    { icon: '⚛️', name: 'React.js' }
  ];
  return (
    <div className="tech-stack">
      <h2>Technologies We Use</h2>
      <p>Modern tools and frameworks for modern solutions</p>
      <div className="tech-grid">
        {techs.map((t) => (
          <div className="tech-item" key={t.name}>
            <div className="tech-icon">{t.icon}</div>
            <span>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareTable({ highlightCol }) {
  const rows = [
    {
      feature: 'Access to public blog posts',
      values: ['✔️', '✔️', '✔️', '✔️']
    },
    {
      feature: 'Community forum access',
      values: ['✔️', '✔️', '✔️', '✔️']
    },
    {
      feature: 'Email newsletter',
      values: ['✔️', '✔️', '✔️', '✔️']
    },
    {
      feature: 'Blog posts per month',
      values: ['—', '50', '200+', 'Unlimited']
    },
    {
      feature: 'Web development consultation',
      values: ['—', 'Basic', 'Advanced', 'Full-scale']
    },
    {
      feature: 'Support',
      values: ['Email', 'Email', 'Priority', 'Dedicated 24/7']
    },
    {
      feature: '1-on-1 consultation calls',
      values: ['—', '—', '✔️', '✔️']
    },
    {
      feature: 'Custom project planning',
      values: ['—', '—', '✔️', '✔️']
    },
    {
      feature: 'Custom solutions',
      values: ['—', '—', '—', '✔️']
    },
    {
      feature: 'Priority features',
      values: ['—', '—', '—', '✔️']
    }
  ];
  const plans = ['basic', 'starter', 'professional', 'enterprise'];
  return (
    <div
      className={
        'compare-features-content' +
        (highlightCol ? ' ' + highlightCol + '-border' : '')
      }
      style={{
        marginTop: '32px',
        marginBottom: '32px',
        transition: 'border 0.3s, border-radius 0.3s, box-shadow 0.3s'
      }}>
      <h2>Compare Plan Features</h2>
      <table className="features-table" style={{
        width: '100%',
        borderCollapse: 'collapse',
        margin: '0 auto',
        background: 'rgba(72, 61, 139, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
      }}>
        <thead>
          <tr style={{ background: 'var(--accent-primary)', color: '#fff' }}>
            <th style={{ padding: '12px' }}>Features</th>
            <th style={{ padding: '12px' }}>Basic</th>
            <th style={{ padding: '12px' }}>Starter</th>
            <th style={{ padding: '12px' }}>Professional</th>
            <th style={{ padding: '12px' }}>Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <td style={{ padding: '10px' }}>{row.feature}</td>
              {row.values.map((val, j) => (
                <td
                  key={`${row.feature}-${plans[j]}`}
                  style={{ textAlign: 'center' }}
                  className={highlightCol === plans[j] ? `highlight-${plans[j]}` : ''}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

CompareTable.propTypes = {
  highlightCol: PropTypes.string
};

function CTASection({ onClick }) {
  return (
    <div className="cta-section">
      <h2>Ready to Get Started?</h2>
      <p>Join our community of developers and start building amazing things today.</p>
      <div className="cta-buttons">
        <button
          className="cta-button cta-primary"
          onClick={onClick}
        >
          Start Free Trial
        </button>
      </div>
    </div>
  );
}

CTASection.propTypes = {
  onClick: PropTypes.func.isRequired
};

function Services() {
  const compareRef = React.useRef(null);
  const starterRef = React.useRef(null);
  const pricingRef = React.useRef(null);
  const [highlightCol, setHighlightCol] = React.useState('');

  const auth = () => {
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth';
    }
  };

  const handleCompareClick = (plan) => {
    if (compareRef.current) {
      compareRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightCol(plan);
    }
  };

  const handleStartTrialClick = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (starterRef.current) {
      starterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightCol('starter');
    }
  };

  const serviceCards = [
    {
      icon: '🌐',
      title: 'Web Development & Design',
      description: 'Modern, responsive websites and web apps tailored to your needs using the latest technologies.'
    },
    {
      icon: '✍️',
      title: 'Technical Blog Writing',
      description: 'In-depth articles, tutorials, and guides to help the tech community learn and grow.'
    },
    {
      icon: '📚',
      title: 'Programming Tutorials',
      description: 'Step-by-step tutorials and code walkthroughs for all levels, from beginner to advanced.'
    },
    {
      icon: '💡',
      title: 'Project Consultation',
      description: 'Expert advice and guidance for your software projects, from planning to deployment.'
    },
    {
      icon: '🤝',
      title: 'Community Support',
      description: 'Active support forums, Q&A, and mentorship to help you solve problems and connect with peers.'
    }
  ];

  const pricingCards = [
    {
      plan: 'Basic',
      price: 'Free',
      features: [
        'Access to public blog posts',
        'Community forum access',
        'Email newsletter',
        'Access to analytics'
      ],
      onPrimary: { label: 'Sign Up', action: auth },
      onSecondary: { label: 'Compare Features', action: () => handleCompareClick('basic') },
      isPopular: false,
      refProp: null
    },
    {
      plan: 'Starter',
      price: <>₹499<span>/month</span></>,
      features: [
        'Basic web development consultation',
        '50+ blog posts per month',
        'Community forum access',
        'Email support',
        'Access to analytics'
      ],
      onPrimary: null,
      onSecondary: { label: 'Compare Features', action: () => handleCompareClick('starter') },
      isPopular: false,
      refProp: starterRef
    },
    {
      plan: 'Professional',
      price: <>₹999<span>/month</span></>,
      features: [
        'Advanced web development',
        '200+ blog posts per month',
        'Priority community support',
        '1-on-1 consultation calls',
        'Custom project planning',
        'Access to analytics'
      ],
      onPrimary: null,
      onSecondary: { label: 'Compare Features', action: () => handleCompareClick('professional') },
      isPopular: true,
      popularText: 'Most Popular',
      refProp: null
    },
    {
      plan: 'Enterprise',
      price: <>₹1,999<span>/month</span></>,
      features: [
        'Full-scale web development',
        'Unlimited blog posts',
        'Dedicated support team',
        'Custom solutions',
        'Priority features',
        '24/7 priority support',
        'Access to analytics'
      ],
      onPrimary: null,
      onSecondary: { label: 'Compare Features', action: () => handleCompareClick('enterprise') },
      isPopular: false,
      refProp: null
    }
  ];

  return (
    <div className="services-container">
      <h2>Our Services</h2>
      <p>
        Empowering developers and businesses with high-quality tech solutions, content, and support.
      </p>

      <div className="services-list">
        {serviceCards.map((card) => (
          <ServiceCard key={card.title} {...card} />
        ))}
      </div>

      <WhyChooseUs />

      <div className="pricing-section" ref={pricingRef}>
        <h2>Pricing Plans</h2>
        <p>Choose the perfect plan for your needs</p>
        <div className="pricing-plans">
          {pricingCards.map((card) => (
            <PricingCard key={card.plan} {...card} />
          ))}
        </div>
      </div>

      <div ref={compareRef}>
        <CompareTable highlightCol={highlightCol} />
      </div>

      <TechStack />

      <CTASection onClick={handleStartTrialClick} />
    </div>
  );
}

export default Services;
