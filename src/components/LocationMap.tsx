import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Navigation, Loader2 } from 'lucide-react';
import { Location, latLngToGrid, gridToLatLng, GRID_RESOLUTION, METERS_PER_DEGREE_LAT, METERS_PER_DEGREE_LNG } from '../utils/encoding';
import logger from '../utils/logger';

// Tamil Nadu bounds (defined locally to avoid import issues)
const TAMIL_NADU_BOUNDS = {
  minLat: 8.08,
  maxLat: 13.50,
  minLng: 76.00,
  maxLng: 80.50,
};

// Add keyframes for smooth animation
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject the keyframes into the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LocationMapProps {
  location: Location | null;
  encodedLocation: string | null;
  onMapClick?: (location: Location) => void;
  onLocationSelect?: (location: Location) => void; // Add callback for location selection
}

const LocationMap: React.FC<LocationMapProps> = ({ location, encodedLocation, onMapClick, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gridRef = useRef<L.LayerGroup | null>(null); // Changed to LayerGroup
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(8);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [mapView, setMapView] = useState<'street' | 'satellite' | 'hybrid'>('street');

  // Initialize map (only once)
  useEffect(() => {
    logger.log('🗺️ LocationMap: Initializing map...');
    
    if (!mapRef.current) return;

    // Check if container already has a Leaflet map
    if ((mapRef.current as any)._leaflet_id) {
      logger.log('Map container already has a Leaflet map, skipping initialization');
      return;
    }

    // Initialize map only if not already initialized
    if (!mapInstanceRef.current) {
      // Ensure the container is properly sized before initializing
      const container = mapRef.current;
      if (container.offsetHeight === 0) {
        container.style.height = '100%';
        container.style.minHeight = '400px';
      }

      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        if (!mapRef.current || mapInstanceRef.current) return; // Double check
        
        // Check again if container already has a map
        if ((mapRef.current as any)._leaflet_id) {
          logger.log('Map container already has a Leaflet map after delay, skipping initialization');
          return;
        }
        
        // Initialize map with location if available, otherwise default to Tamil Nadu center
        const initialView = location 
          ? [location.lat, location.lng] 
          : [10.7905, 78.7047];
        const initialZoom = location ? 18 : 8;
        
        mapInstanceRef.current = L.map(mapRef.current, {
          minZoom: 6,
          maxZoom: 22,
          zoomControl: false, // Disable default zoom controls
          attributionControl: false // Disable attribution control completely
        }).setView(initialView as [number, number], initialZoom);

        // Initialize with street view by default
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '', // Remove attribution to eliminate black bar
          maxZoom: 22 // Street view can go to 22
        }).addTo(mapInstanceRef.current);

        // Add zoom event listener
        mapInstanceRef.current.on('zoomend', () => {
          if (mapInstanceRef.current) {
            setCurrentZoom(mapInstanceRef.current.getZoom() || 8);
          }
        });

        // Add move event listener to update grid
        mapInstanceRef.current.on('moveend', () => {
          // Grid updates automatically when location changes
          // No need for complex refresh logic
        });

        // Add click event listener to the map
        mapInstanceRef.current.on('click', (e) => {
          const clickedLocation: Location = {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            floor: undefined
          };
          logger.log('🗺️ Map clicked at:', clickedLocation);
          if (onMapClick) {
            onMapClick(clickedLocation);
          }
        });

        // Force a resize to ensure proper rendering
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            
            // If location exists, center and show grid immediately after map is ready
            if (location) {
              logger.log('🗺️ Map initialized with location, centering now:', location);
              mapInstanceRef.current.setView([location.lat, location.lng], 18, {
                animate: true,
                duration: 0.5
              });
              
              // Add grid after map is centered
              setTimeout(() => {
                if (!mapInstanceRef.current || !location) return;
                
                if (showGrid && mapInstanceRef.current) {
                  // Clear existing grid
                  if (gridRef.current) {
                    mapInstanceRef.current.removeLayer(gridRef.current);
                  }
                  
                  // Create new grid layer group
                  gridRef.current = L.layerGroup();
                  
                  // Get the grid coordinates for this location
                  const gridCoords = latLngToGrid(location.lat, location.lng);
                  
                  // Calculate the actual grid cell bounds using our encoding system
                  const gridCellCenter = gridToLatLng(gridCoords.x, gridCoords.y);
                  const halfGridSizeLat = (GRID_RESOLUTION / 2) / METERS_PER_DEGREE_LAT;
                  const halfGridSizeLng = (GRID_RESOLUTION / 2) / METERS_PER_DEGREE_LNG;
                  
                  const selectedCellBounds: L.LatLngBoundsLiteral = [
                    [gridCellCenter.lat - halfGridSizeLat, gridCellCenter.lng - halfGridSizeLng] as L.LatLngTuple,
                    [gridCellCenter.lat + halfGridSizeLat, gridCellCenter.lng + halfGridSizeLng] as L.LatLngTuple
                  ];

                  // Create red highlight for selected grid cell
                  const selectedCellHighlight = L.rectangle(selectedCellBounds, {
                    color: '#ff0000',
                    weight: 3,
                    fillColor: '#ff0000',
                    fillOpacity: 0.3
                  });
                  
                  // Add to layer group and then add layer group to map
                  gridRef.current.addLayer(selectedCellHighlight);
                  gridRef.current.addTo(mapInstanceRef.current);
                }
              }, 300);
            }
          }
        }, 100);

        // Aggressive removal of attribution elements
        const removeAttribution = () => {
          const attributionElements = document.querySelectorAll('.leaflet-control-attribution, .leaflet-bottom, [class*="attribution"]');
          attributionElements.forEach(el => {
            el.remove();
          });
        };

        // Remove immediately and then periodically
        removeAttribution();
        setTimeout(removeAttribution, 100);
        setTimeout(removeAttribution, 500);
        setTimeout(removeAttribution, 1000);

        // Set up a mutation observer to catch any new attribution elements
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                const element = node as Element;
                if (element.classList && (
                  element.classList.contains('leaflet-control-attribution') ||
                  element.classList.contains('leaflet-bottom') ||
                  (typeof element.className === 'string' && element.className.includes('attribution'))
                )) {
                  element.remove();
                }
              }
            });
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }, 50);
    }
  }, []); // Only run once on mount - location is handled separately

  // Handle location changes (separate from map initialization)
  useEffect(() => {
    logger.log('🗺️ LocationMap: Location or encodedLocation changed:', { location, encodedLocation });
    
    // Function to handle location update
    const handleLocationUpdate = () => {
      if (!mapInstanceRef.current) return;
      
      if (!location) {
        // Clear grid if no location
        if (gridRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(gridRef.current);
          gridRef.current = null;
        }
        return;
      }

      // Clear existing markers and grid first
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (gridRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(gridRef.current);
        gridRef.current = null;
      }

      // Center map on location immediately
      logger.log('🗺️ LocationMap: Centering map on location:', location);
      mapInstanceRef.current.setView([location.lat, location.lng], 18, {
        animate: true,
        duration: 0.5
      });

      // Add grid highlight after a brief delay to ensure map is centered
      setTimeout(() => {
        if (!mapInstanceRef.current || !location) return;
        
        logger.log('🗺️ LocationMap: Adding location highlight for:', location);
        
        // Add red highlight for the selected grid cell
        if (showGrid && mapInstanceRef.current) {
          logger.log('🗺️ Creating new grid highlight for location:', location);
          
          // Create new grid layer group
          gridRef.current = L.layerGroup();
          
          // Get the grid coordinates for this location
          const gridCoords = latLngToGrid(location.lat, location.lng);
          
          // Calculate the actual grid cell bounds using our encoding system
          const gridCellCenter = gridToLatLng(gridCoords.x, gridCoords.y);
          const halfGridSizeLat = (GRID_RESOLUTION / 2) / METERS_PER_DEGREE_LAT;
          const halfGridSizeLng = (GRID_RESOLUTION / 2) / METERS_PER_DEGREE_LNG;
          
          const selectedCellBounds: L.LatLngBoundsLiteral = [
            [gridCellCenter.lat - halfGridSizeLat, gridCellCenter.lng - halfGridSizeLng] as L.LatLngTuple,
            [gridCellCenter.lat + halfGridSizeLat, gridCellCenter.lng + halfGridSizeLng] as L.LatLngTuple
          ];

          // Create red highlight for selected grid cell
          const selectedCellHighlight = L.rectangle(selectedCellBounds, {
            color: '#ff0000',
            weight: 3,
            fillColor: '#ff0000',
            fillOpacity: 0.3
          });
          
          // Add to layer group and then add layer group to map
          gridRef.current.addLayer(selectedCellHighlight);
          gridRef.current.addTo(mapInstanceRef.current);
        }

        // Force a resize to ensure proper rendering
        mapInstanceRef.current.invalidateSize();
      }, 300);
    };
    
    // Wait for map to be initialized - use a retry mechanism
    if (!mapInstanceRef.current) {
      logger.log('🗺️ LocationMap: Map not yet initialized, waiting...');
      
      // Retry after a short delay if map is still initializing
      const retryTimeout = setTimeout(() => {
        if (mapInstanceRef.current && location) {
          logger.log('🗺️ Map now ready, processing location');
          handleLocationUpdate();
        }
      }, 300);
      
      return () => clearTimeout(retryTimeout);
    }

    // Map is ready, handle location update
    handleLocationUpdate();
  }, [location, encodedLocation, showGrid]);

  // Separate cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 8;
      const maxZoom = mapView === 'street' ? 22 : 18; // Limit satellite/hybrid to 18
      if (currentZoom < maxZoom) {
        mapInstanceRef.current.zoomIn();
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      logger.log('Starting location request...');
      setIsLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          logger.log('Location obtained:', position);
          const { latitude, longitude, accuracy } = position.coords;
          
          if (mapInstanceRef.current) {
            // Center map on current location
            mapInstanceRef.current.setView([latitude, longitude], 18);
            
            // Clean up any existing grid highlights
            if (gridRef.current && mapInstanceRef.current) {
              mapInstanceRef.current.removeLayer(gridRef.current);
              gridRef.current = null;
            }
            
            // Add red highlight for current location grid cell
            const gridCoords = latLngToGrid(latitude, longitude);
            const gridCellCenter = gridToLatLng(gridCoords.x, gridCoords.y);
            const halfGridSizeLat = (GRID_RESOLUTION / 2) / METERS_PER_DEGREE_LAT;
            const halfGridSizeLng = (GRID_RESOLUTION / 2) / METERS_PER_DEGREE_LNG;
            
            const currentLocationBounds: L.LatLngBoundsLiteral = [
              [gridCellCenter.lat - halfGridSizeLat, gridCellCenter.lng - halfGridSizeLng] as L.LatLngTuple,
              [gridCellCenter.lat + halfGridSizeLat, gridCellCenter.lng + halfGridSizeLng] as L.LatLngTuple
            ];

            const currentLocationHighlight = L.rectangle(currentLocationBounds, {
              color: '#ff0000',
              weight: 3,
              fillColor: '#ff0000',
              fillOpacity: 0.3
            });
            
            // Create new grid layer group and add highlight
            gridRef.current = L.layerGroup();
            gridRef.current.addLayer(currentLocationHighlight);
            gridRef.current.addTo(mapInstanceRef.current);
            
            // Trigger location selection to show bottom-right popup
            if (onLocationSelect) {
              onLocationSelect({ lat: latitude, lng: longitude, floor: undefined });
            }
          }
          
          setIsLocationLoading(false);
          logger.log('Location loading completed');
        },
        (error) => {
          logger.error('Error getting current location:', error);
          alert('Unable to get your current location. Please check your browser permissions.');
          setIsLocationLoading(false);
          logger.log('Location loading failed');
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: true,
          maximumAge: 60000 // 1 minute cache
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSatelliteToggle = () => {
    if (!mapInstanceRef.current) return;
    
    // Remove current tile layers
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    if (labelLayerRef.current) {
      mapInstanceRef.current.removeLayer(labelLayerRef.current);
    }
    
    if (mapView === 'street') {
      // Switch to satellite view
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
      setMapView('satellite');
      updateMapMaxZoom('satellite');
    } else if (mapView === 'satellite') {
      // Switch to hybrid view (Satellite with street labels)
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
      
      // Add street labels layer on top
      labelLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
        opacity: 0.8
      }).addTo(mapInstanceRef.current);
      setMapView('hybrid');
      updateMapMaxZoom('hybrid');
    } else { // mapView === 'hybrid'
      // Switch back to street view
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 22
      }).addTo(mapInstanceRef.current);
      setMapView('street');
      updateMapMaxZoom('street');
    }
  };

  const updateMapMaxZoom = (viewMode: 'street' | 'satellite' | 'hybrid') => {
    if (mapInstanceRef.current) {
      const maxZoom = viewMode === 'street' ? 22 : 18;
      mapInstanceRef.current.setMaxZoom(maxZoom);
      
      // If current zoom is beyond the new max, zoom out to the max
      const currentZoom = mapInstanceRef.current.getZoom() || 8;
      if (currentZoom > maxZoom) {
        mapInstanceRef.current.setZoom(maxZoom);
      }
    }
  };

  return (
    <div className="location-map">
      <div ref={mapRef} className="map-container" />
      
      {/* Enhanced zoom level display with controls */}
      <div className="zoom-level-display">
        {/* Satellite/Street View Toggle */}
        <div className="satellite-toggle">
          <button 
            className={`satellite-button ${mapView === 'street' ? 'active' : ''}`}
            onClick={() => {
              if (mapView !== 'street') {
                if (tileLayerRef.current) mapInstanceRef.current?.removeLayer(tileLayerRef.current);
                if (labelLayerRef.current) mapInstanceRef.current?.removeLayer(labelLayerRef.current);
                tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '',
                  maxZoom: 22
                }).addTo(mapInstanceRef.current!);
                setMapView('street');
                updateMapMaxZoom('street');
              }
            }}
            title="Switch to Street View"
          >
            🗺️ Street
          </button>
          <button 
            className={`satellite-button ${mapView === 'satellite' ? 'active' : ''}`}
            onClick={() => {
              if (mapView !== 'satellite') {
                if (tileLayerRef.current) mapInstanceRef.current?.removeLayer(tileLayerRef.current);
                if (labelLayerRef.current) mapInstanceRef.current?.removeLayer(labelLayerRef.current);
                tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                  attribution: '',
                  maxZoom: 18
                }).addTo(mapInstanceRef.current!);
                setMapView('satellite');
                updateMapMaxZoom('satellite');
              }
            }}
            title="Switch to Satellite View"
          >
            🛰️ Satellite
          </button>
          <button 
            className={`satellite-button ${mapView === 'hybrid' ? 'active' : ''}`}
            onClick={() => {
              if (mapView !== 'hybrid') {
                if (tileLayerRef.current) mapInstanceRef.current?.removeLayer(tileLayerRef.current);
                if (labelLayerRef.current) mapInstanceRef.current?.removeLayer(labelLayerRef.current);
                tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                  attribution: '',
                  maxZoom: 18 // Hybrid view limited to 18
                }).addTo(mapInstanceRef.current!);
                // Use a better approach for hybrid labels - CartoDB Positron labels
                labelLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                  attribution: '',
                  maxZoom: 18,
                  opacity: 0.8
                }).addTo(mapInstanceRef.current!);
                setMapView('hybrid');
                updateMapMaxZoom('hybrid');
              }
            }}
            title="Switch to Hybrid View (Satellite with Street Labels)"
          >
            🌐 Hybrid
          </button>
        </div>
        
        <div className="zoom-controls">
          <button 
            className="zoom-button" 
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <Plus size={16} />
          </button>
          <span className="zoom-text">Zoom: {currentZoom} / {mapView === 'street' ? '22' : '18'}</span>
          <button 
            className="zoom-button" 
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>
          <button 
            className={`zoom-button location-button ${isLocationLoading ? 'loading' : ''}`}
            onClick={handleCurrentLocation}
            disabled={isLocationLoading}
            title="Go to Current Location"
          >
            {isLocationLoading ? (
              <Loader2 
                size={16} 
                className="spinning" 
                style={{
                  animation: 'spin 1s linear infinite',
                  transformOrigin: 'center',
                  display: 'inline-block'
                }}
              />
            ) : (
              <Navigation size={16} />
            )}
          </button>
        </div>
      </div>
      
      {location && (
        <div className="map-controls">
          <button 
            className={`grid-toggle ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle 3x3 meter grid overlay. Best visible at zoom level 18+"
          >
            {showGrid ? '🔲' : '⬜'} 3×3m Grid {!showGrid && '(Off)'}
          </button>
          <div className="zoom-info" title="Use mouse wheel or +/- buttons to zoom. Maximum zoom level is 22 for detailed view.">
            {showGrid && currentZoom < 18 && (
              <div className="zoom-hint">Grid best at zoom 18+</div>
            )}
            {!showGrid && (
              <div className="zoom-hint disabled">Grid disabled</div>
            )}
          </div>
        </div>
      )}
      
      {!location && (
        <div className="map-placeholder">
          <div className="placeholder-content">
            <h3>📍 Select a Location</h3>
            <p>Search for a location above to see it on the map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap; 