import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Location } from './utils/encoding';
import { encodeLocation, decodeLocation, parseEncodedLocation } from './services/sollidamService';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ApiPage from './pages/ApiPage';
import logger from './utils/logger';
import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [encodedLocation, setEncodedLocation] = useState<string | null>(null);
  const [initialLocationFromUrl, setInitialLocationFromUrl] = useState<Location | null>(null);
  const [initialEncodedFromUrl, setInitialEncodedFromUrl] = useState<string | null>(null);
  const urlProcessedRef = useRef<string | null>(null); // Track processed URL parameters

  const handleLocationSelect = useCallback((location: Location) => {
    logger.log('🗺️ App: handleLocationSelect called with:', location);
    setSelectedLocation(location);
    
    // Encode the location
    const encoded = encodeLocation(location.lat, location.lng, location.floor);
    if (encoded) {
      const encodedString = encoded.words.join('.') + (encoded.floor ? `.${encoded.floor}` : '');
      logger.log('🔐 App: Encoded location string:', encodedString);
      setEncodedLocation(encodedString);
    } else {
      logger.warn('⚠️ App: Failed to encode location');
      setEncodedLocation(null);
    }
  }, []);

  const handleMapClick = (location: Location) => {
    logger.log('🗺️ App: Map clicked at:', location);
    handleLocationSelect(location);
  };

  return (
    <Router>
      <div className="app">
        <Header />
        <AppContent 
          selectedLocation={selectedLocation}
          encodedLocation={encodedLocation}
          onLocationSelect={handleLocationSelect}
          initialLocationFromUrl={initialLocationFromUrl}
          initialEncodedFromUrl={initialEncodedFromUrl}
          setInitialLocationFromUrl={setInitialLocationFromUrl}
          setInitialEncodedFromUrl={setInitialEncodedFromUrl}
          onMapClick={handleMapClick}
          urlProcessedRef={urlProcessedRef}
        />
      </div>
    </Router>
  );
}

// Separate component to access useLocation hook
function AppContent({ 
  selectedLocation, 
  encodedLocation, 
  onLocationSelect,
  initialLocationFromUrl,
  initialEncodedFromUrl,
  setInitialLocationFromUrl,
  setInitialEncodedFromUrl,
  onMapClick,
  urlProcessedRef
}: {
  selectedLocation: Location | null;
  encodedLocation: string | null;
  onLocationSelect: (location: Location) => void;
  initialLocationFromUrl: Location | null;
  initialEncodedFromUrl: string | null;
  setInitialLocationFromUrl: (location: Location | null) => void;
  setInitialEncodedFromUrl: (encoded: string | null) => void;
  onMapClick: (location: Location) => void;
  urlProcessedRef: React.MutableRefObject<string | null>;
}) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Handle URL parameters for automatic decoding
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const placeParam = urlParams.get('place');
    
    // Prevent infinite loop: only process if URL parameter changed and hasn't been processed
    if (placeParam && isHomePage && placeParam !== urlProcessedRef.current) {
      logger.log('🔍 Found place parameter in URL:', placeParam);
      
      // Mark this URL parameter as processed
      urlProcessedRef.current = placeParam;
      
      // Parse the encoded location from URL
      const parsed = parseEncodedLocation(placeParam);
      if (parsed) {
        logger.log('📝 Parsed encoded location:', parsed);
        
        // Decode the location
        const decodedLocation = decodeLocation(parsed.words, parsed.floor);
        if (decodedLocation) {
          logger.log('📍 Decoded location from URL:', decodedLocation);
          
          // Set the location and encoded string
          onLocationSelect(decodedLocation);
          setInitialLocationFromUrl(decodedLocation);
          setInitialEncodedFromUrl(placeParam);
          
          // Update the encoded location string
          const encoded = encodeLocation(decodedLocation.lat, decodedLocation.lng, decodedLocation.floor);
          if (encoded) {
            const encodedString = encoded.words.join('.') + (encoded.floor ? `.${encoded.floor}` : '');
            // Note: We can't directly set encodedLocation here, but it will be set by onLocationSelect
          }
        } else {
          logger.error('❌ Failed to decode location from URL');
        }
      } else {
        logger.error('❌ Failed to parse encoded location from URL');
      }
    } else if (!placeParam) {
      // Reset processed ref when place parameter is removed
      urlProcessedRef.current = null;
    }
  }, [location.search, isHomePage, onLocationSelect]);

  return (
    <>
      {isHomePage && (
        <SearchBar 
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocationFromUrl}
          initialEncodedLocation={initialEncodedFromUrl}
          selectedLocation={selectedLocation}
          encodedLocation={encodedLocation}
        />
      )}
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <HomePage 
              selectedLocation={selectedLocation}
              encodedLocation={encodedLocation}
              onMapClick={onMapClick}
              onLocationSelect={onLocationSelect}
            />
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/api" element={<ApiPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App; 