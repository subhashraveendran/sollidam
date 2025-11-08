import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-content">
            <div className="logo-text">
              <h1>Sollidam - Tamil Nadu</h1>
              <span className="logo-subtitle">சொல்லிடம் - The world will know where you are!</span>
            </div>
          </div>
        </Link>
        
        <nav className="nav">
          <Link 
            to="/api" 
            className={`nav-link ${location.pathname === '/api' ? 'active' : ''}`}
          >
            API
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 
