import { 
  latLngToGrid, 
  gridToLatLng, 
  altitudeToFloor, 
  gridIdToWordIndices, 
  wordIndicesToGridId,
  isWithinTamilNadu,
  Location,
  EncodedLocation,
  GridCoordinates,
  TAMIL_NADU_BOUNDS,
  METERS_PER_DEGREE_LNG,
  GRID_RESOLUTION
} from '../utils/encoding';
import { 
  getWordByIndex, 
  getIndexByWord, 
  isValidWord, 
  getWordListLength 
} from '../utils/wordList';

/**
 * Encode a location to Sollidam words
 */
export function encodeLocation(lat: number, lng: number, altitude?: number): EncodedLocation | null {
  // Check if location is within Tamil Nadu
  if (!isWithinTamilNadu(lat, lng)) {
    return null;
  }

  // Convert to grid coordinates
  const grid = latLngToGrid(lat, lng);
  
  // Convert grid ID to word indices
  const wordIndices = gridIdToWordIndices(grid.gridId, getWordListLength());
  
  // Get words from indices
  const words = wordIndices.map(index => getWordByIndex(index));
  
  // Calculate floor from altitude if provided
  let floor: number | undefined;
  if (altitude !== undefined) {
    floor = altitudeToFloor(altitude);
  }
  
  return {
    words,
    floor,
    gridId: grid.gridId
  };
}

/**
 * Decode Sollidam words back to location
 */
export function decodeLocation(words: string[], floor?: number): Location | null {
  // Validate input
  if (words.length !== 3) {
    return null;
  }
  
  // Check if all words are valid
  for (const word of words) {
    if (!isValidWord(word)) {
      return null;
    }
  }
  
  // Convert words to indices
  const wordIndices = words.map(word => getIndexByWord(word));
  
  // Convert indices to grid ID
  const gridId = wordIndicesToGridId(wordIndices, getWordListLength());
  
  // Calculate grid coordinates using the same constants as encoding
  const totalColumns = Math.floor((TAMIL_NADU_BOUNDS.maxLng - TAMIL_NADU_BOUNDS.minLng) * METERS_PER_DEGREE_LNG / GRID_RESOLUTION);
  const y = Math.floor(gridId / totalColumns);
  const x = gridId % totalColumns;
  
  // Convert grid coordinates to lat/lng
  const location = gridToLatLng(x, y);
  
  // Add floor if provided
  if (floor !== undefined) {
    location.floor = floor;
  }
  
  return location;
}

/**
 * Format encoded location as string
 */
export function formatEncodedLocation(encoded: EncodedLocation): string {
  let result = encoded.words.join('.');
  if (encoded.floor !== undefined) {
    result += `.${encoded.floor}`;
  }
  return result;
}

/**
 * Parse encoded location string
 */
export function parseEncodedLocation(encodedString: string): { words: string[], floor?: number } | null {
  const parts = encodedString.split('.');
  
  if (parts.length < 3 || parts.length > 4) {
    return null;
  }
  
  const words = parts.slice(0, 3);
  const floor = parts.length === 4 ? parseInt(parts[3]) : undefined;
  
  // Validate words
  for (const word of words) {
    if (!isValidWord(word)) {
      return null;
    }
  }
  
  // Validate floor
  if (floor !== undefined && (isNaN(floor) || floor < 0)) {
    return null;
  }
  
  return { words, floor };
}

/**
 * Generate shareable URL
 */
export function generateShareUrl(encoded: EncodedLocation): string {
  const encodedString = formatEncodedLocation(encoded);
  return `${window.location.origin}${window.location.pathname}?place=${encodedString}`;
}

/**
 * Parse shareable URL
 */
export function parseShareUrl(url: string): { words: string[], floor?: number } | null {
  try {
    const urlObj = new URL(url);
    const place = urlObj.searchParams.get('place');
    if (!place) {
      return null;
    }
    return parseEncodedLocation(place);
  } catch {
    return null;
  }
} 