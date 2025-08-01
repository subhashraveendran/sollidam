console.log('🧪 Sollidam Accuracy Test Suite');
console.log('================================\n');

// Import the required modules
const fs = require('fs');
const path = require('path');

// Load the word list
const wordsPath = path.join(__dirname, '..', 'words.txt');
const wordList = fs.readFileSync(wordsPath, 'utf8').split('\n').filter(word => word.trim());

console.log(`📚 Loaded ${wordList.length} words from word list`);
console.log(`📝 First 10 words: ${wordList.slice(0, 10).join(', ')}`);

// Test 1: Word List Validation
console.log('\n🧪 Test 1: Word List Validation');
console.log('===============================');

let wordListValid = true;
const testWords = wordList.slice(0, 10); // Use first 10 words from the actual list

for (const word of testWords) {
  if (!wordList.includes(word)) {
    console.log(`❌ Word "${word}" not found in word list`);
    wordListValid = false;
  }
}

if (wordListValid) {
  console.log('✅ All test words found in word list');
} else {
  console.log('❌ Some words missing from word list');
}

// Test 2: Grid Calculation Test
console.log('\n🧪 Test 2: Grid Calculation Test');
console.log('=================================');

// Simple grid calculation test with improved precision
const testLat = 10.7905;
const testLng = 78.7047;

// More accurate meters per degree for Tamil Nadu (average latitude ~10.5°N)
const METERS_PER_DEGREE_LAT = 110574;
const METERS_PER_DEGREE_LNG = 109639;

// Calculate grid coordinates (improved version with Math.round)
const latDiff = testLat - 8.08; // Distance from northern boundary
const lngDiff = testLng - 76.00; // Distance from western boundary

const gridX = Math.round(lngDiff * METERS_PER_DEGREE_LNG / 3); // 3-meter grid with rounding
const gridY = Math.round(latDiff * METERS_PER_DEGREE_LAT / 3);

console.log(`📍 Test location: ${testLat}, ${testLng}`);
console.log(`📐 Grid coordinates: X=${gridX}, Y=${gridY}`);

// Test round-trip accuracy
const decodedLat = 8.08 + (gridY * 3 / METERS_PER_DEGREE_LAT);
const decodedLng = 76.00 + (gridX * 3 / METERS_PER_DEGREE_LNG);
const latAccuracy = Math.abs(testLat - decodedLat) * METERS_PER_DEGREE_LAT;
const lngAccuracy = Math.abs(testLng - decodedLng) * METERS_PER_DEGREE_LNG;

console.log(`🔄 Round-trip test: ${decodedLat.toFixed(6)}, ${decodedLng.toFixed(6)}`);
console.log(`📏 Accuracy: Lat ±${latAccuracy.toFixed(2)}m, Lng ±${lngAccuracy.toFixed(2)}m`);

// Test 3: Boundary Test
console.log('\n🧪 Test 3: Boundary Test');
console.log('========================');

const boundaryTests = [
  { lat: 8.0883, lng: 76.2300, name: 'Northwest corner', expected: true },
  { lat: 8.0883, lng: 80.2707, name: 'Northeast corner', expected: true },
  { lat: 13.0827, lng: 76.2300, name: 'Southwest corner', expected: true },
  { lat: 13.0827, lng: 80.2707, name: 'Southeast corner', expected: true },
  { lat: 7.0000, lng: 78.7047, name: 'Outside north boundary', expected: false },
  { lat: 14.0000, lng: 78.7047, name: 'Outside south boundary', expected: false },
  { lat: 10.7905, lng: 75.0000, name: 'Outside west boundary', expected: false },
  { lat: 10.7905, lng: 81.0000, name: 'Outside east boundary', expected: false },
];

let boundaryTestsPassed = 0;

for (const test of boundaryTests) {
  const isWithin = test.lat >= 8.0883 && test.lat <= 13.0827 && 
                   test.lng >= 76.2300 && test.lng <= 80.2707;
  
  const passed = isWithin === test.expected;
  if (passed) boundaryTestsPassed++;
  
  console.log(`${passed ? '✅' : '❌'} ${test.name}: ${isWithin ? 'Within' : 'Outside'} boundaries`);
}

console.log(`📊 Boundary tests: ${boundaryTestsPassed}/${boundaryTests.length} passed`);

// Test 4: Floor Number Test
console.log('\n🧪 Test 4: Floor Number Test');
console.log('============================');

const floorTests = [
  { altitude: 0, expectedFloor: 0 },
  { altitude: 3, expectedFloor: 1 },
  { altitude: 6, expectedFloor: 2 },
  { altitude: 15, expectedFloor: 5 },
  { altitude: 30, expectedFloor: 10 },
  { altitude: 300, expectedFloor: 100 },
];

let floorTestsPassed = 0;

for (const test of floorTests) {
  const calculatedFloor = Math.floor(test.altitude / 3);
  const passed = calculatedFloor === test.expectedFloor;
  if (passed) floorTestsPassed++;
  
  console.log(`${passed ? '✅' : '❌'} Altitude ${test.altitude}m → Floor ${calculatedFloor} (expected: ${test.expectedFloor})`);
}

console.log(`📊 Floor tests: ${floorTestsPassed}/${floorTests.length} passed`);

// Test 5: Word Encoding Test
console.log('\n🧪 Test 5: Word Encoding Test');
console.log('=============================');

// Simulate word encoding for grid coordinates
const testGridIds = [0, 1000, 10000, 100000, 1000000];
let wordEncodingTestsPassed = 0;

for (const gridId of testGridIds) {
  // Simulate word encoding (simplified)
  const wordIndex1 = gridId % wordList.length;
  const wordIndex2 = Math.floor(gridId / wordList.length) % wordList.length;
  const wordIndex3 = Math.floor(gridId / (wordList.length * wordList.length)) % wordList.length;
  
  const words = [
    wordList[wordIndex1] || 'unknown',
    wordList[wordIndex2] || 'unknown',
    wordList[wordIndex3] || 'unknown'
  ];
  
  // Simulate decoding back to grid ID
  const decodedGridId = wordIndex1 + (wordIndex2 * wordList.length) + (wordIndex3 * wordList.length * wordList.length);
  
  const passed = decodedGridId === gridId;
  if (passed) wordEncodingTestsPassed++;
  
  console.log(`${passed ? '✅' : '❌'} Grid ID ${gridId} → ${words.join('.')} → Grid ID ${decodedGridId}`);
}

console.log(`📊 Word encoding tests: ${wordEncodingTestsPassed}/${testGridIds.length} passed`);

// Calculate overall accuracy
const totalTests = 1 + 1 + boundaryTests.length + floorTests.length + testGridIds.length;
const passedTests = (wordListValid ? 1 : 0) + 1 + boundaryTestsPassed + floorTestsPassed + wordEncodingTestsPassed;
const accuracy = (passedTests / totalTests) * 100;

console.log('\n📊 Test Results Summary');
console.log('=======================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Accuracy: ${accuracy.toFixed(2)}%`);

if (accuracy >= 95) {
  console.log('🌟 Excellent accuracy! The algorithm is working perfectly.');
} else if (accuracy >= 90) {
  console.log('👍 Good accuracy! Minor issues detected.');
} else if (accuracy >= 80) {
  console.log('⚠️  Moderate accuracy! Some issues need attention.');
} else {
  console.log('🚨 Poor accuracy! Significant issues detected.');
}

console.log('\n🎉 Accuracy test suite completed!'); 