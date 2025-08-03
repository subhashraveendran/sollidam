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
          <h1>Sollidam API</h1>
        </header>

        <div className="content-section">
          <div className="about-card">
            <h3>Get Started</h3>
            <p>
              Click the button below to view detailed API documentation with examples, 
              endpoint specifications, and usage guidelines.
            </p>
            <div className="contact-info" style={{ textAlign: 'center' }}>
              <a 
                href="https://api-sollidam.vercel.app" 
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
                View API Documentation
              </a>
            </div>
          </div>

          <div className="about-card">
            <h3>Two Simple Endpoints</h3>
            <ul>
              <li><strong>Words → Coordinates:</strong> Convert 3-word addresses to precise GPS coordinates</li>
              <li><strong>Coordinates → Words:</strong> Convert GPS coordinates to easy-to-remember 3-word codes</li>
            </ul>
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
              <em>3-meter resolution grid • Tamil Nadu coverage • No database required</em>
            </p>
          </div>

          <div className="about-card">
            <h3>Contact & Support</h3>
            <div className="contact-info">
              <p><strong>GitHub:</strong> <a href="https://github.com/subhashraveendran/sollidam" target="_blank" rel="noopener noreferrer">github.com/subhashraveendran/sollidam</a></p>
              <p><strong>Email:</strong> <a href="mailto:mailtosubhashr@gmail.com">mailtosubhashr@gmail.com</a></p>
              <p><em>Have questions or need help integrating? We're here to help!</em></p>
            </div>
          </div>
        </div>

        <footer className="api-footer">
          <div className="footer-content">
            <p><strong>API Base URL:</strong> <a href="https://api-sollidam.vercel.app" target="_blank" rel="noopener noreferrer">https://api-sollidam.vercel.app</a></p>
            <p className="footer-heart">Built with 💖 for Heros on Wheels</p>
            <p><strong>Github:</strong> <a href="https://github.com/subhashraveendran/sollidam" target="_blank" rel="noopener noreferrer">github.com/subhashraveendran/sollidam</a></p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ApiPage; 