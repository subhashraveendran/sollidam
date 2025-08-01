import SollidamAccuracyTester from './accuracy-test';

async function runAccuracyTests() {
  try {
    console.log('🎯 Sollidam Accuracy Test Suite');
    console.log('================================\n');
    
    const tester = new SollidamAccuracyTester();
    const results = await tester.runAllTests();
    
    console.log('\n📋 Detailed Results:');
    console.log('===================');
    
    results.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${status} - ${result.testName}`);
      
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });
    
    console.log('\n🎉 Test Suite Completed!');
    console.log(`Overall Accuracy: ${results.accuracy.toFixed(2)}%`);
    
    if (results.accuracy >= 95) {
      console.log('🌟 Excellent accuracy! The algorithm is working perfectly.');
    } else if (results.accuracy >= 90) {
      console.log('👍 Good accuracy! Minor issues detected.');
    } else if (results.accuracy >= 80) {
      console.log('⚠️  Moderate accuracy! Some issues need attention.');
    } else {
      console.log('🚨 Poor accuracy! Significant issues detected.');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    throw error;
  }
}

export default runAccuracyTests; 