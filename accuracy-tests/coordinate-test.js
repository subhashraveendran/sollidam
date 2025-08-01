console.log('🧪 Coordinate Accuracy Test');
console.log('============================\n');

// Test the specific coordinates mentioned by the user
const testLat = 10.945907;
const testLng = 77.713126;

console.log(`📍 Original coordinates: ${testLat}, ${testLng}`);

// Simulate the encoding/decoding process
const TAMIL_NADU_BOUNDS = {
  minLat: 8.08,
  maxLat: 13.50,
  minLng: 76.00,
  maxLng: 80.50,
};

const GRID_RESOLUTION = 3;
const METERS_PER_DEGREE_LAT = 110574;
const METERS_PER_DEGREE_LNG = 109639;

// Old method (using Math.floor)
function oldLatLngToGrid(lat, lng) {
  const x = Math.floor((lng - TAMIL_NADU_BOUNDS.minLng) * METERS_PER_DEGREE_LNG / GRID_RESOLUTION);
  const y = Math.floor((lat - TAMIL_NADU_BOUNDS.minLat) * METERS_PER_DEGREE_LAT / GRID_RESOLUTION);
  return { x, y };
}

function oldGridToLatLng(x, y) {
  const lng = TAMIL_NADU_BOUNDS.minLng + (x * GRID_RESOLUTION / METERS_PER_DEGREE_LNG);
  const lat = TAMIL_NADU_BOUNDS.minLat + (y * GRID_RESOLUTION / METERS_PER_DEGREE_LAT);
  return { lat, lng };
}

// New method (using Math.round)
function newLatLngToGrid(lat, lng) {
  const x = Math.round((lng - TAMIL_NADU_BOUNDS.minLng) * METERS_PER_DEGREE_LNG / GRID_RESOLUTION);
  const y = Math.round((lat - TAMIL_NADU_BOUNDS.minLat) * METERS_PER_DEGREE_LAT / GRID_RESOLUTION);
  return { x, y };
}

function newGridToLatLng(x, y) {
  const lng = TAMIL_NADU_BOUNDS.minLng + (x * GRID_RESOLUTION / METERS_PER_DEGREE_LNG);
  const lat = TAMIL_NADU_BOUNDS.minLat + (y * GRID_RESOLUTION / METERS_PER_DEGREE_LAT);
  return { lat, lng };
}

// Test old method
console.log('\n🔍 Testing OLD method (Math.floor):');
const oldGrid = oldLatLngToGrid(testLat, testLng);
const oldDecoded = oldGridToLatLng(oldGrid.x, oldGrid.y);
console.log(`Grid coordinates: X=${oldGrid.x}, Y=${oldGrid.y}`);
console.log(`Decoded coordinates: ${oldDecoded.lat.toFixed(6)}, ${oldDecoded.lng.toFixed(6)}`);
console.log(`Latitude difference: ${Math.abs(testLat - oldDecoded.lat).toFixed(8)}`);
console.log(`Longitude difference: ${Math.abs(testLng - oldDecoded.lng).toFixed(8)}`);

// Test new method
console.log('\n🔍 Testing NEW method (Math.round):');
const newGrid = newLatLngToGrid(testLat, testLng);
const newDecoded = newGridToLatLng(newGrid.x, newGrid.y);
console.log(`Grid coordinates: X=${newGrid.x}, Y=${newGrid.y}`);
console.log(`Decoded coordinates: ${newDecoded.lat.toFixed(6)}, ${newDecoded.lng.toFixed(6)}`);
console.log(`Latitude difference: ${Math.abs(testLat - newDecoded.lat).toFixed(8)}`);
console.log(`Longitude difference: ${Math.abs(testLng - newDecoded.lng).toFixed(8)}`);

// Calculate improvement
const oldLatDiff = Math.abs(testLat - oldDecoded.lat);
const oldLngDiff = Math.abs(testLng - oldDecoded.lng);
const newLatDiff = Math.abs(testLat - newDecoded.lat);
const newLngDiff = Math.abs(testLng - newDecoded.lng);

console.log('\n📊 Accuracy Improvement:');
console.log(`Old method accuracy: Lat ±${(oldLatDiff * 111000).toFixed(2)}m, Lng ±${(oldLngDiff * 109639).toFixed(2)}m`);
console.log(`New method accuracy: Lat ±${(newLatDiff * 111000).toFixed(2)}m, Lng ±${(newLngDiff * 109639).toFixed(2)}m`);
console.log(`Improvement: ${((oldLatDiff - newLatDiff) / oldLatDiff * 100).toFixed(1)}% better`);

// Test with user's specific case
console.log('\n🎯 User\'s Specific Test Case:');
console.log(`Expected: 10.945892, 77.713120`);
console.log(`Actual (old): ${oldDecoded.lat.toFixed(6)}, ${oldDecoded.lng.toFixed(6)}`);
console.log(`Actual (new): ${newDecoded.lat.toFixed(6)}, ${newDecoded.lng.toFixed(6)}`);

const expectedLat = 10.945892;
const expectedLng = 77.713120;

const oldError = Math.sqrt(Math.pow(testLat - oldDecoded.lat, 2) + Math.pow(testLng - oldDecoded.lng, 2));
const newError = Math.sqrt(Math.pow(testLat - newDecoded.lat, 2) + Math.pow(testLng - newDecoded.lng, 2));

console.log(`\n📏 Distance from expected coordinates:`);
console.log(`Old method error: ${(oldError * 111000).toFixed(2)}m`);
console.log(`New method error: ${(newError * 111000).toFixed(2)}m`);
console.log(`Error reduction: ${((oldError - newError) / oldError * 100).toFixed(1)}%`);

console.log('\n✅ Coordinate accuracy test completed!'); 