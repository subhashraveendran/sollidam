import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ApiPage: React.FC = () => {
  useEffect(() => {
    // Add class to body to enable scrolling
    document.body.classList.add('content-page-active');
    document.getElementById('root')?.classList.add('content-page-active');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('content-page-active');
      document.getElementById('root')?.classList.remove('content-page-active');
    };
  }, []);

  return (
    <div className="api-page">
      <div className="page-container">
        <header className="page-header">
          <Link to="/" className="back-link">← Back to Map</Link>
          <h1>API Documentation</h1>
        </header>

        <div className="content-section">
          <h2>Request API Access</h2>
          <p>
            Want to integrate Sollidam into your application, chatbot, or mapping tool?
          </p>
          <p>
            Our API is lightweight, fast, and designed to work even in low-resource setups. Perfect for developers, researchers, and innovators.
          </p>

          <div className="about-card">
            <h3>Features of the Sollidam API</h3>
            <ul>
              <li><strong>Encode GPS coordinates</strong> into easy-to-remember 3-word codes</li>
              <li><strong>Decode word codes</strong> back into precise latitude & longitude</li>
              <li><strong>Supports floor-level (Z-axis)</strong> for multi-storey buildings</li>
              <li><strong>Tamil Nadu-only optimized grid</strong> for ultra-fast and offline-friendly use</li>
              <li><strong>No database required</strong> – deterministic and stateless</li>
              <li><strong>Zero cost</strong> for approved developers during beta</li>
              <li><strong>Simple, fast, and safe</strong> to use via REST-style endpoints</li>
              <li><strong>Perfect for bots, Telegram apps, delivery tools, or civic projects</strong></li>
            </ul>
          </div>

          <div className="about-card">
            <h3>How to Get Started</h3>
            <p>
              To use the API, submit a quick request using the link below.
              We'll review and respond via email with your API key.
            </p>
            <div className="contact-info" style={{ textAlign: 'center' }}>
              <a 
                href="https://forms.gle/KMfRhu4Eiq1Rc15x9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="api-request-button"
                style={{ 
                  color: '#000000', 
                  textDecoration: 'none',
                  WebkitTextFillColor: '#000000',
                  WebkitTextStroke: '0px'
                }}
              >
                Request API Access
              </a>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#888888' }}>
                <em>(Takes less than 2 minutes)</em>
              </p>
            </div>
          </div>

          <div className="about-card">
            <h3>Why Is It Free?</h3>
            <ul>
              <li>We're in beta (developer preview mode)</li>
              <li>This helps us test real-world use cases and improve reliability</li>
              <li>You help us by providing feedback — and enjoy free access!</li>
              <li>Once production-ready, pricing tiers may apply based on usage.</li>
            </ul>
          </div>

          <div className="about-card">
            <h3>Contact & Code</h3>
            <div className="contact-info">
              <p><strong>GitHub:</strong> <a href="https://github.com/subhashraveendran" target="_blank" rel="noopener noreferrer">github.com/subhashraveendran</a></p>
              <p><strong>Email:</strong> <a href="mailto:mailtosubhashr@gmail.com">mailtosubhashr@gmail.com</a></p>
              <p><em>Have an idea or use case? Reach out — we'd love to feature your project!</em></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPage; 