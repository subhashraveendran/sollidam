import React from 'react';
import { Location } from '../utils/encoding';
import LocationMap from '../components/LocationMap';

interface HomePageProps {
  selectedLocation: Location | null;
  encodedLocation: string | null;
  onMapClick?: (location: Location) => void;
  onLocationSelect?: (location: Location) => void;
}

const HomePage: React.FC<HomePageProps> = ({ selectedLocation, encodedLocation, onMapClick, onLocationSelect }) => {
  return (
    <div className="home-page">
      <LocationMap 
        location={selectedLocation} 
        encodedLocation={encodedLocation}
        onMapClick={onMapClick}
        onLocationSelect={onLocationSelect}
      />
    </div>
  );
};

export default HomePage; 