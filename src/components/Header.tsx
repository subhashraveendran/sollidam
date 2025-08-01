import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const handleImageLoad = () => {
    // Logo loaded successfully
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Simply hide the image if it fails to load
    e.currentTarget.style.display = 'none';
  };

  // Simple logo path
  const logoPath = '/icons/logo1.png';
  
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-content">
            <img 
              src={logoPath}
              alt="Sollidam Logo" 
              className="logo-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="logo-text">
              <h1>Sollidam</h1>
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