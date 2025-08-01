import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

const AboutPage: React.FC = () => {
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
    <div className="about-page">
      <div className="page-container">
        <header className="page-header">
          <Link to="/" className="back-link">← Back to Map</Link>
          <h1>About Sollidam (சொல்லிடம்)</h1>
        </header>

        <div className="content-section">
          <div className="about-card">
            <h2>About Sollidam</h2>
            <p>
              Sollidam (சொல்லிடம்) is a free, open-source location encoding system inspired by What3Words, designed specifically for Tamil Nadu. It transforms complex GPS coordinates into simple, memorable three-word addresses — with optional support for floor-level precision.
            </p>
            <p>
              This system enables anyone — from delivery agents and emergency teams to developers and everyday users — to accurately identify and share locations in Tamil Nadu using just three unique words.
            </p>
          </div>

          <div className="about-card">
            <h2>Why We Built This</h2>
            <p>
              Tamil Nadu, like many parts of India, faces major issues with unstructured or incomplete addresses:
            </p>
            <ul>
              <li>Descriptions like "2nd street near temple" are not machine-readable</li>
              <li>Many buildings lack house numbers or clear floor indicators</li>
              <li>Voice assistants struggle with local address formats</li>
              <li>Literacy and language barriers affect usability</li>
              <li>Existing systems like What3Words are closed-source, paid beyond a limit, and lack floor or offline support</li>
            </ul>
            <p>
              Sollidam addresses all of these problems.
            </p>
          </div>

          <div className="about-card">
            <h2>What Makes Sollidam Unique?</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Sollidam</th>
                  <th>What3Words</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Open-source</td>
                  <td>Yes</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Floor-level support</td>
                  <td>Yes</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Free to use</td>
                  <td>Yes</td>
                  <td>Limited Tier</td>
                </tr>
                <tr>
                  <td>Offline capability</td>
                  <td>Yes</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Transparent algorithm</td>
                  <td>Fully documented</td>
                  <td>Proprietary</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="about-card">
            <h2>How It Works</h2>
            <ul>
              <li>Tamil Nadu is divided into 3 × 3 meter grid squares</li>
              <li>Each square is mapped to a unique three-word code</li>
              <li>The code is bi-directional: you can convert from coordinates to words, and back</li>
              <li>Optional floor-level precision is supported (e.g., tree.sky.ocean.4)</li>
              <li>Everything runs 100% in-browser or via open APIs — no server required</li>
            </ul>
          </div>

          <div className="about-card">
            <h2>Use Cases</h2>
            <ul>
              <li>Logistics and delivery in rural or complex areas</li>
              <li>GPS-free location sharing via chat or voice</li>
              <li>Smart assistants and Telegram bots</li>
              <li>Emergency and rescue location precision</li>
              <li>Civic planning and academic research</li>
            </ul>
          </div>

          <div className="about-card">
            <h2>About the Creator</h2>
            <p>
              I am Subhash Raveendran, a final-year B.Tech Computer Science and Business Systems student at Sri Krishna College of Engineering and Technology (SKCET), Coimbatore.
            </p>
            <p>
              <em>"Code should make life easier — not more confusing. That's what I build for."</em>
            </p>
            <div className="contact-info">
              <p><strong>Portfolio:</strong> <a href="https://subhashr.dev" target="_blank" rel="noopener noreferrer">subhashr.dev</a></p>
              <p><strong>GitHub:</strong> <a href="https://github.com/subhashraveendran" target="_blank" rel="noopener noreferrer">github.com/subhashraveendran</a></p>
              <p><strong>Email:</strong> <a href="mailto:mailtosubhashr@gmail.com">mailtosubhashr@gmail.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 