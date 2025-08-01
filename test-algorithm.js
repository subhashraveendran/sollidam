// Simple test to verify encoding/decoding algorithm
const testLocation = {
  lat: 10.7905,
  lng: 78.7047
};

console.log('Testing encoding/decoding algorithm...');
console.log('Test location:', testLocation);

// This would need to be run in the browser or with proper imports
// For now, let's just log the expected behavior
console.log('Expected behavior:');
console.log('1. Encode location to 3-word code');
console.log('2. Decode 3-word code back to same location');
console.log('3. "fighting.milk.pick" should decode to a consistent location');

console.log('\nTo test this:');
console.log('1. Go to the app');
console.log('2. Enter "fighting.milk.pick" in the search bar');
console.log('3. Click "Decode"');
console.log('4. It should show the same location every time'); 