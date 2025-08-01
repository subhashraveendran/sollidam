const { execSync } = require('child_process');
const path = require('path');

console.log('🎯 Running Sollidam Accuracy Tests...\n');

try {
  // Run the JavaScript test directly
  const testPath = path.join(__dirname, 'accuracy-test.js');
  execSync(`node "${testPath}"`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    shell: true
  });
  
  console.log('\n✅ Accuracy tests completed successfully!');
} catch (error) {
  console.error('\n❌ Accuracy tests failed:', error.message);
  process.exit(1);
} 