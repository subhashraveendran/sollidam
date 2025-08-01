import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Copy, X, Share2 } from 'lucide-react';
import { Location } from '../utils/encoding';
import { decodeLocation, encodeLocation, formatEncodedLocation } from '../services/sollidamService';
import { 
  getWordByIndex, 
  getIndexByWord, 
  isValidWord, 
  getWordListLength 
} from '../utils/wordList';

interface SearchBarProps {
  onLocationSelect?: (location: Location) => void;
  initialLocation?: Location | null;
  initialEncodedLocation?: string | null;
  selectedLocation?: Location | null; // Add this prop to receive current selected location
  encodedLocation?: string | null; // Add this prop to receive current encoded location
}

const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect, initialLocation, initialEncodedLocation, selectedLocation, encodedLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'google' | 'nominatim' | 'coordinates'>('google');
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<'google' | 'nominatim' | 'fallback'>('google');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchCache = useRef<Map<string, any[]>>(new Map()); // Simple cache for search results

  // Handle initial location from URL
  useEffect(() => {
    if (initialLocation && initialEncodedLocation) {
      console.log('📍 Loading initial location from URL:', initialLocation);
      
      // Get address from coordinates
      const getAddressFromCoordinates = async () => {
        try {
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${initialLocation.lat}&lon=${initialLocation.lng}&format=json&addressdetails=1`
          );
          const nominatimData = await nominatimResponse.json();
          const address = nominatimData.display_name || `${initialEncodedLocation} (Decoded)`;
          
          setShowResults(true);
          setSelectedResult({
            threeWordCode: initialEncodedLocation,
            address: address,
            coordinates: `${initialLocation.lat.toFixed(6)}, ${initialLocation.lng.toFixed(6)}`,
            floor: initialLocation.floor
          });
        } catch (error) {
          console.error('Error getting address:', error);
          setShowResults(true);
          setSelectedResult({
            threeWordCode: initialEncodedLocation,
            address: `${initialEncodedLocation} (Decoded)`,
            coordinates: `${initialLocation.lat.toFixed(6)}, ${initialLocation.lng.toFixed(6)}`,
            floor: initialLocation.floor
          });
        }
      };
      
      getAddressFromCoordinates();
    }
  }, [initialLocation, initialEncodedLocation]);

  // Handle location selection from map click
  useEffect(() => {
    console.log('📍 SearchBar: Location props changed:', { selectedLocation, encodedLocation });
    
    if (selectedLocation) {
      console.log('📍 Location selected from map:', selectedLocation);
      
      // Get address from coordinates
      const getAddressFromCoordinates = async () => {
        try {
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${selectedLocation.lat}&lon=${selectedLocation.lng}&format=json&addressdetails=1`
          );
          const nominatimData = await nominatimResponse.json();
          const address = nominatimData.display_name || `${encodedLocation || 'Selected Location'}`;
          
          console.log('📍 Setting search results for map click');
          setShowResults(true);
          setSelectedResult({
            threeWordCode: encodedLocation || 'N/A',
            address: address,
            coordinates: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
            floor: selectedLocation.floor
          });
        } catch (error) {
          console.error('Error getting address:', error);
          setShowResults(true);
          setSelectedResult({
            threeWordCode: encodedLocation || 'N/A',
            address: `${encodedLocation || 'Selected Location'}`,
            coordinates: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
            floor: selectedLocation.floor
          });
        }
      };
      
      getAddressFromCoordinates();
    }
  }, [selectedLocation, encodedLocation]);

  // Auto-detect if input is a 3-word code
  const isThreeWordCode = (query: string): boolean => {
    // Must have dots to be a 3-word code
    if (!query.includes('.')) return false;
    
    const words = query.trim().split(/[.\s]+/).filter(word => word.length > 0);
    return words.length === 3 && words.every(word => /^[a-zA-Z]+$/.test(word));
  };

  // Extract floor number from query (e.g., "tree.dream.code.3" -> floor 3)
  const extractFloorNumber = (query: string): { words: string[], floor?: number } => {
    const parts = query.trim().split(/[.\s]+/).filter(word => word.length > 0);
    if (parts.length === 4 && isThreeWordCode(parts.slice(0, 3).join('.'))) {
      const floor = parseInt(parts[3]);
      if (!isNaN(floor) && floor >= 0 && floor <= 999) {
        return { words: parts.slice(0, 3), floor };
      }
    }
    return { words: parts };
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowResults(false);
    setSelectedResult(null);
    
    // Check if input is a 3-word code (regardless of mode)
    if (isThreeWordCode(searchQuery)) {
      console.log('🔍 Decoding 3-word code:', searchQuery);
      
      // Extract words and floor
      const { words, floor } = extractFloorNumber(searchQuery);
      console.log('📝 Extracted words:', words);
      console.log('🏢 Floor:', floor);
      
      // Get word indices for debugging
      const wordIndices = words.map(word => {
        const index = getIndexByWord(word);
        console.log(`🔤 Word "${word}" -> Index ${index}`);
        return index;
      });
      console.log('📊 Word indices:', wordIndices);
      
      // Decode the location
      const decodedLocation = decodeLocation(words, floor);
      console.log('📍 Decoded location:', decodedLocation);
      
      if (decodedLocation && onLocationSelect) {
        onLocationSelect(decodedLocation);
        
        // Get address from coordinates
        try {
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${decodedLocation.lat}&lon=${decodedLocation.lng}&format=json&addressdetails=1`
          );
          const nominatimData = await nominatimResponse.json();
          const address = nominatimData.display_name || `${searchQuery} (Decoded)`;
          
          setShowResults(true);
          setSelectedResult({
            threeWordCode: searchQuery,
            address: address,
            coordinates: `${decodedLocation.lat.toFixed(6)}, ${decodedLocation.lng.toFixed(6)}`,
            floor: decodedLocation.floor
          });
        } catch (error) {
          console.error('Error getting address:', error);
          setShowResults(true);
          setSelectedResult({
            threeWordCode: searchQuery,
            address: `${searchQuery} (Decoded)`,
            coordinates: `${decodedLocation.lat.toFixed(6)}, ${decodedLocation.lng.toFixed(6)}`,
            floor: decodedLocation.floor
          });
        }
      } else {
        console.error('❌ Failed to decode 3-word code');
        alert('Invalid 3-word code. Please check the format.');
      }
      
      setIsLoading(false);
      return;
    }
    
    // Handle coordinates mode
    if (searchMode === 'coordinates') {
      // Direct coordinates input
      const coords = searchQuery.split(',').map(s => s.trim());
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log('📍 Processing coordinates:', lat, lng);
          const location = { lat, lng, floor: undefined };
          onLocationSelect?.(location);
          
          const encoded = encodeLocation(lat, lng);
          if (encoded) {
            setShowResults(true);
            setSelectedResult({
              threeWordCode: formatEncodedLocation(encoded),
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              floor: undefined
            });
          }
        } else {
          alert('Invalid coordinates format. Please use: latitude, longitude (e.g., 10.7905, 78.7047)');
        }
      } else {
        alert('Invalid coordinates format. Please use: latitude, longitude (e.g., 10.7905, 78.7047)');
      }
      
      setIsLoading(false);
      return;
    }
    
    // Handle address search (Google Maps or Nominatim)
    try {
      console.log('🔍 Starting address search for:', searchQuery);
      console.log('🔧 Using API:', searchMode);
      
      let results = [];

      if (searchMode === 'google') {
        const googleApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        console.log('🔑 Google API Key available:', !!googleApiKey);
        
        if (googleApiKey && googleApiKey !== 'YOUR_API_KEY_HERE' && googleApiKey.trim() !== '') {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${googleApiKey}&region=in`;
          console.log('🌐 Google Maps URL:', url);
          
          const response = await fetch(url);
          const data = await response.json();
          console.log('📡 Google Maps response:', data);
          
          if (data.status === 'REQUEST_DENIED') {
            console.error('❌ Google Maps API key is invalid or has restrictions');
            alert('Google Maps API key is invalid or has restrictions. Please check your configuration.');
            setIsLoading(false);
            return;
          }
          
          if (data.results && data.results.length > 0) {
            results = data.results.slice(0, 5).map((result: any) => ({
              display_name: result.formatted_address,
              lat: result.geometry.location.lat,
              lon: result.geometry.location.lng,
              type: 'google',
              name: result.name || result.formatted_address
            }));
          }
        } else {
          console.log('⚠️ No valid Google API key, falling back to Nominatim');
          // Fallback to Nominatim
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in&addressdetails=1&dedupe=1&polygon=0&extratags=0&namedetails=0`
          );
          const nominatimData = await nominatimResponse.json();
          console.log('📡 Nominatim fallback response:', nominatimData);
          
          results = nominatimData.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: 'nominatim',
            name: item.name || item.display_name.split(',')[0] || item.display_name
          }));
        }
      } else if (searchMode === 'nominatim') {
        // Use Nominatim
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in&addressdetails=1&dedupe=1&polygon=0&extratags=0&namedetails=0`;
        console.log('🌐 Nominatim URL:', url);
        
        const nominatimResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sollidam/1.0'
          }
        });
        const nominatimData = await nominatimResponse.json();
        console.log('📡 Nominatim response:', nominatimData);
        
        results = nominatimData.map((item: any) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: 'nominatim',
          name: item.name || item.display_name.split(',')[0] || item.display_name
        }));
      }

      console.log('✅ Search results:', results);
      
      if (results.length > 0) {
        // Automatically select the first result
        const firstResult = results[0];
        console.log('📍 Auto-selecting first result:', firstResult);
        
        // Generate the actual 3-word code from coordinates
        const encodedLocation = encodeLocation(firstResult.lat, firstResult.lon);
        console.log('🔐 Encoded location:', encodedLocation);
        
        const threeWordCode = encodedLocation ? formatEncodedLocation(encodedLocation) : 'invalid.coordinates.code';
        console.log('📝 Generated 3-word code:', threeWordCode);
        
        if (onLocationSelect) {
          const locationToSelect = {
            lat: firstResult.lat,
            lng: firstResult.lon,
            floor: undefined
          };
          console.log('🗺️ Calling onLocationSelect with:', locationToSelect);
          onLocationSelect(locationToSelect);
        }
        
        // Use the better name for display
        const displayName = firstResult.name || firstResult.display_name;
        setSearchQuery(displayName);
        setShowResults(true);
        setSelectedResult({
          threeWordCode: threeWordCode,
          address: displayName,
          coordinates: `${firstResult.lat.toFixed(6)}, ${firstResult.lon.toFixed(6)}`,
          floor: undefined
        });
      } else {
        alert('No locations found. Please try a different search term.');
      }
    } catch (error) {
      console.error('❌ Error searching location:', error);
      alert('Error searching for location. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Function for autocomplete suggestions (separate from handleSearch)
  const searchLocation = async (query: string) => {
    try {
      console.log('🔍 Starting autocomplete search for:', query);
      console.log('🔧 Using API:', searchMode);
      
      // Check cache first
      const cacheKey = `${searchMode}_${query.toLowerCase()}`;
      const cachedResults = searchCache.current.get(cacheKey);
      
      if (cachedResults) {
        console.log('💾 Using cached results for:', query);
        setSuggestions(cachedResults);
        setShowSuggestions(true);
        return;
      }
      
      let results = [];

      if (searchMode === 'google') {
        const googleApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        console.log('🔑 Google API Key available:', !!googleApiKey);
        
        if (googleApiKey && googleApiKey !== 'YOUR_API_KEY_HERE' && googleApiKey.trim() !== '') {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}&region=in`;
          console.log('🌐 Google Maps URL:', url);
          
          const response = await fetch(url);
          const data = await response.json();
          console.log('📡 Google Maps response:', data);
          
          if (data.status === 'REQUEST_DENIED') {
            console.error('❌ Google Maps API key is invalid or has restrictions');
            return;
          }
          
          if (data.results) {
            results = data.results.slice(0, 5).map((result: any) => ({
              display_name: result.formatted_address,
              lat: result.geometry.location.lat,
              lon: result.geometry.location.lng,
              type: 'google',
              name: result.name || result.formatted_address
            }));
          }
        } else {
          console.log('⚠️ No valid Google API key, falling back to Nominatim');
          // Fallback to Nominatim
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&addressdetails=1&dedupe=1&polygon=0&extratags=0&namedetails=0`
          );
          const nominatimData = await nominatimResponse.json();
          console.log('📡 Nominatim fallback response:', nominatimData);
          
          results = nominatimData.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: 'nominatim',
            name: item.name || item.display_name.split(',')[0] || item.display_name
          }));
        }
      } else if (searchMode === 'nominatim') {
        // Use Nominatim
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&addressdetails=1&dedupe=1&polygon=0&extratags=0&namedetails=0`;
        console.log('🌐 Nominatim URL:', url);
        
        const nominatimResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sollidam/1.0'
          }
        });
        const nominatimData = await nominatimResponse.json();
        console.log('📡 Nominatim response:', nominatimData);
        
        results = nominatimData.map((item: any) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: 'nominatim',
          name: item.name || item.display_name.split(',')[0] || item.display_name
        }));
      }

      console.log('✅ Autocomplete results:', results);
      
      // Cache the results
      searchCache.current.set(cacheKey, results);
      
      // Limit cache size to prevent memory issues
      if (searchCache.current.size > 50) {
        const firstKey = searchCache.current.keys().next().value;
        if (firstKey) {
          searchCache.current.delete(firstKey);
        }
      }
      
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('❌ Error in autocomplete search:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📝 Input changed:', value);
    console.log('🔍 Is 3-word code:', isThreeWordCode(value));
    console.log('📏 Value length:', value.length);
    
    setSearchQuery(value);
    setShowSuggestions(false);
    setShowResults(false);
    setSelectedResult(null);
    
    // Clear loading state if input is empty
    if (!value.trim()) {
      setIsLoading(false);
    }
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      console.log('⏰ Cleared existing timeout');
    }
    
    // Auto-search for addresses (not 3-word codes) after 150ms delay (reduced for real-time feel)
    if (value.length > 2 && !isThreeWordCode(value) && searchMode !== 'coordinates') {
      console.log('🚀 Setting up auto-search timeout for:', value);
      searchTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-search timeout triggered for:', value);
        searchLocation(value);
      }, 150); // Reduced delay for better real-time feel
    } else {
      console.log('⏸️ Skipping auto-search (3-word code, coordinates mode, or too short)');
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    console.log('📍 Suggestion clicked:', suggestion);
    
    // Generate the actual 3-word code from coordinates
    const encodedLocation = encodeLocation(suggestion.lat, suggestion.lon);
    console.log('🔐 Encoded location:', encodedLocation);
    
    const threeWordCode = encodedLocation ? formatEncodedLocation(encodedLocation) : 'invalid.coordinates.code';
    console.log('📝 Generated 3-word code:', threeWordCode);
    
    if (onLocationSelect) {
      const locationToSelect = {
        lat: suggestion.lat,
        lng: suggestion.lon,
        floor: undefined
      };
      console.log('🗺️ Calling onLocationSelect with:', locationToSelect);
      onLocationSelect(locationToSelect);
    } else {
      console.warn('⚠️ onLocationSelect is not provided');
    }
    
    // Use the better name for display
    const displayName = suggestion.name || suggestion.display_name;
    setSearchQuery(displayName);
    setShowSuggestions(false);
    setShowResults(true);
    setSelectedResult({
      threeWordCode: threeWordCode,
      address: displayName,
      coordinates: `${suggestion.lat.toFixed(6)}, ${suggestion.lon.toFixed(6)}`,
      floor: undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // If there are suggestions, select the first one
      if (showSuggestions && suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else {
        // Otherwise, perform normal search
        handleSearch();
      }
    }
  };

  const getSearchPlaceholder = () => {
    if (searchMode === 'coordinates') {
      return 'e.g., 10.7905, 78.7047';
    }
    return 'Search for a location in Tamil Nadu';
  };

  const getSearchButtonText = () => {
    // Check if input is a 3-word code (regardless of mode)
    if (isThreeWordCode(searchQuery)) {
      return 'Decode';
    }
    if (searchMode === 'coordinates') {
      return 'Convert to 3-Word Code';
    }
    return 'Search';
  };

  const getSearchIcon = () => {
    // Check if input is a 3-word code (regardless of mode)
    if (isThreeWordCode(searchQuery)) {
      return <Search size={16} />; // Magnifying glass for decode
    }
    if (searchMode === 'coordinates') {
      return <MapPin size={16} />;
    }
    return <Search size={16} />;
  };

  const handleShare = () => {
    if (selectedResult) {
      navigator.clipboard.writeText(selectedResult.threeWordCode);
    }
  };

  const closeResults = () => {
    setShowResults(false);
    setSelectedResult(null);
  };

  return (
    <>
      {/* Search Bar - Always visible */}
      <div className="search-container">
        <div className="api-toggle">
          <div className="toggle-switch three-way">
            <input
              type="radio"
              name="searchMode"
              id="google-mode"
              value="google"
              checked={searchMode === 'google'}
              onChange={(e) => setSearchMode(e.target.value as 'google' | 'nominatim' | 'coordinates')}
              className="toggle-input"
            />
            <input
              type="radio"
              name="searchMode"
              id="nominatim-mode"
              value="nominatim"
              checked={searchMode === 'nominatim'}
              onChange={(e) => setSearchMode(e.target.value as 'google' | 'nominatim' | 'coordinates')}
              className="toggle-input"
            />
            <input
              type="radio"
              name="searchMode"
              id="coordinates-mode"
              value="coordinates"
              checked={searchMode === 'coordinates'}
              onChange={(e) => setSearchMode(e.target.value as 'google' | 'nominatim' | 'coordinates')}
              className="toggle-input"
            />
            <div className="toggle-labels">
              <label htmlFor="google-mode" className={`toggle-option ${searchMode === 'google' ? 'active' : ''}`}>
                Google Maps
              </label>
              <label htmlFor="nominatim-mode" className={`toggle-option ${searchMode === 'nominatim' ? 'active' : ''}`}>
                Nominatim
              </label>
              <label htmlFor="coordinates-mode" className={`toggle-option ${searchMode === 'coordinates' ? 'active' : ''}`}>
                Coordinates
              </label>
            </div>
            <div className="toggle-slider"></div>
          </div>
        </div>
        
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <span className="search-icon">{getSearchIcon()}</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={getSearchPlaceholder()}
              className="search-input"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="search-button"
          >
            {isLoading ? '...' : getSearchButtonText()}
          </button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-text">{suggestion.name || suggestion.display_name}</div>
                <div className="suggestion-source">{suggestion.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Display - Right Bottom Corner */}
      {showResults && selectedResult && (
        <div className="results-display">
          <div className="results-content">
            <div className="results-header">
              <h3>Location Found</h3>
              <button className="close-button" onClick={closeResults}>
                <X size={16} />
              </button>
            </div>
            <div className="results-info">
              <div className="result-item">
                <span className="result-label">3-Word Code:</span>
                <span className="result-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedResult.threeWordCode}
                  <button 
                    className="clipboard-btn" 
                    title="Copy 3-word code" 
                    onClick={(event) => {
                      navigator.clipboard.writeText(selectedResult.threeWordCode).then(() => {
                        const button = event?.target as HTMLElement;
                        if (button) {
                          const originalHTML = button.innerHTML;
                          button.innerHTML = '✅';
                          button.style.background = '#4CAF50';
                          button.style.color = 'white';
                          setTimeout(() => {
                            button.innerHTML = originalHTML;
                            button.style.background = '';
                            button.style.color = '';
                          }, 1500);
                        }
                      });
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Address:</span>
                <span className="result-value">{selectedResult.address}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Coordinates:</span>
                <span className="result-value">{selectedResult.coordinates}</span>
              </div>
              {selectedResult.floor !== undefined && (
                <div className="result-item">
                  <span className="result-label">Floor:</span>
                  <span className="result-value">{selectedResult.floor}</span>
                </div>
              )}
            </div>
            <div className="button-group">
              <button className="copy-location-btn" onClick={(event) => {
                // Copy only the 3-word code
                navigator.clipboard.writeText(selectedResult.threeWordCode).then(() => {
                  const button = event?.target as HTMLElement;
                  if (button) {
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<Copy size={16} /> Copied!';
                    button.style.background = '#4CAF50';
                    button.style.color = 'white';
                    setTimeout(() => {
                      button.innerHTML = originalHTML;
                      button.style.background = '';
                      button.style.color = '';
                    }, 2000);
                  }
                });
              }}>
                <Copy size={16} />
                Copy Location
              </button>
              <button className="share-location-btn" onClick={(event) => {
                const shareData = {
                  title: 'Location Shared via Sollidam',
                  text: `Location: ${selectedResult.threeWordCode}\nAddress: ${selectedResult.address}\nCoordinates: ${selectedResult.coordinates}`,
                  url: window.location.origin + window.location.pathname + '?place=' + encodeURIComponent(selectedResult.threeWordCode)
                };
                
                if (navigator.share) {
                  // Use native sharing if available (shows app picker)
                  navigator.share(shareData).then(() => {
                    // Success - user shared via an app
                    const button = event?.target as HTMLElement;
                    if (button) {
                      const originalHTML = button.innerHTML;
                      button.innerHTML = '<Share2 size={16} /> Shared!';
                      button.style.background = '#4CAF50';
                      button.style.color = 'white';
                      setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.style.background = '';
                        button.style.color = '';
                      }, 2000);
                    }
                  }).catch((error) => {
                    console.log('Share cancelled or failed:', error);
                    // Fallback to clipboard if sharing fails
                    navigator.clipboard.writeText(shareData.url).then(() => {
                      const button = event?.target as HTMLElement;
                      if (button) {
                        const originalHTML = button.innerHTML;
                        button.innerHTML = '<Share2 size={16} /> Copied!';
                        button.style.background = '#4CAF50';
                        button.style.color = 'white';
                        setTimeout(() => {
                          button.innerHTML = originalHTML;
                          button.style.background = '';
                          button.style.color = '';
                        }, 2000);
                      }
                    });
                  });
                } else {
                  // Fallback to clipboard for browsers that don't support Web Share API
                  const url = window.location.origin + window.location.pathname + '?place=' + encodeURIComponent(selectedResult.threeWordCode);
                  navigator.clipboard.writeText(url).then(() => {
                    const button = event?.target as HTMLElement;
                    if (button) {
                      const originalHTML = button.innerHTML;
                      button.innerHTML = '<Share2 size={16} /> Copied!';
                      button.style.background = '#4CAF50';
                      button.style.color = 'white';
                      setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.style.background = '';
                        button.style.color = '';
                      }, 2000);
                    }
                  });
                }
              }}>
                <Share2 size={16} />
                Share Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar; 