// Tamil Nadu geographic bounds
export const TAMIL_NADU_BOUNDS = {
  minLat: 8.08,
  maxLat: 13.50,
  minLng: 76.00,
  maxLng: 80.50,
};

// Grid resolution in meters
export const GRID_RESOLUTION = 3;

// More accurate meters per degree for Tamil Nadu (average latitude ~10.5°N)
export const METERS_PER_DEGREE_LAT = 110574; // More precise value for ~10.5°N
export const METERS_PER_DEGREE_LNG = 109639; // More precise value for ~10.5°N (cos(10.5°) * 111320)

export interface Location {
  lat: number;
  lng: number;
  floor?: number;
}

export interface EncodedLocation {
  words: string[];
  floor?: number;
  gridId: number;
}

export interface GridCoordinates {
  x: number;
  y: number;
  gridId: number;
}

/**
 * Convert lat/lng to grid coordinates
 */
export function latLngToGrid(lat: number, lng: number): GridCoordinates {
  // Use Math.floor to get the grid cell that contains this point
  // This ensures consistency: latLngToGrid -> gridToLatLng returns the center of the original cell
  const x = Math.floor((lng - TAMIL_NADU_BOUNDS.minLng) * METERS_PER_DEGREE_LNG / GRID_RESOLUTION);
  const y = Math.floor((lat - TAMIL_NADU_BOUNDS.minLat) * METERS_PER_DEGREE_LAT / GRID_RESOLUTION);
  
  const totalColumns = Math.floor((TAMIL_NADU_BOUNDS.maxLng - TAMIL_NADU_BOUNDS.minLng) * METERS_PER_DEGREE_LNG / GRID_RESOLUTION);
  const gridId = y * totalColumns + x;
  
  return { x, y, gridId };
}

/**
 * Convert grid coordinates back to lat/lng
 */
export function gridToLatLng(x: number, y: number): Location {
  // Calculate the center of the grid cell by adding half a grid resolution
  const lng = TAMIL_NADU_BOUNDS.minLng + (x * GRID_RESOLUTION / METERS_PER_DEGREE_LNG) + (GRID_RESOLUTION / 2 / METERS_PER_DEGREE_LNG);
  const lat = TAMIL_NADU_BOUNDS.minLat + (y * GRID_RESOLUTION / METERS_PER_DEGREE_LAT) + (GRID_RESOLUTION / 2 / METERS_PER_DEGREE_LAT);
  
  return { lat, lng };
}

/**
 * Convert altitude to floor number
 */
export function altitudeToFloor(altitude: number): number {
  return Math.floor(altitude / 3.2);
}

/**
 * Convert floor number to altitude range
 */
export function floorToAltitudeRange(floor: number): { min: number; max: number } {
  return {
    min: floor * 3.2,
    max: (floor + 1) * 3.2 - 0.1
  };
}

/**
 * Encode grid ID to word indices
 */
export function gridIdToWordIndices(gridId: number, wordListLength: number): number[] {
  const word1 = gridId % wordListLength;
  const word2 = Math.floor(gridId / wordListLength) % wordListLength;
  const word3 = Math.floor(gridId / (wordListLength * wordListLength)) % wordListLength;
  
  return [word1, word2, word3];
}

/**
 * Decode word indices back to grid ID
 */
export function wordIndicesToGridId(indices: number[], wordListLength: number): number {
  return indices[0] + indices[1] * wordListLength + indices[2] * wordListLength * wordListLength;
}

/**
 * Check if coordinates are within Tamil Nadu bounds
 */
export function isWithinTamilNadu(lat: number, lng: number): boolean {
  return lat >= TAMIL_NADU_BOUNDS.minLat && 
         lat <= TAMIL_NADU_BOUNDS.maxLat && 
         lng >= TAMIL_NADU_BOUNDS.minLng && 
         lng <= TAMIL_NADU_BOUNDS.maxLng;
} 