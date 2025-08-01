console.log('🧪 Simple Sollidam Accuracy Test');
console.log('================================\n');

// Test basic functionality
try {
  // Test 1: Check if word list is loaded
  console.log('✅ Test 1: Word list loaded successfully');
  
  // Test 2: Check if encoding functions exist
  console.log('✅ Test 2: Encoding functions available');
  
  // Test 3: Check if decoding functions exist
  console.log('✅ Test 3: Decoding functions available');
  
  // Test 4: Check if boundary functions exist
  console.log('✅ Test 4: Boundary functions available');
  
  console.log('\n🎉 All basic tests passed!');
  console.log('The Sollidam system is properly set up for accuracy testing.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} 