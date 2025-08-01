import { 
  encodeLocation, 
  decodeLocation, 
  formatEncodedLocation, 
  parseEncodedLocation,
  generateShareUrl,
  parseShareUrl
} from '../src/services/sollidamService';
import { 
  latLngToGrid, 
  gridToLatLng, 
  altitudeToFloor, 
  isWithinTamilNadu,
  TAMIL_NADU_BOUNDS 
} from '../src/utils/encoding';
import { 
  getWordByIndex, 
  getIndexByWord, 
  isValidWord, 
  getWordListLength 
} from '../src/utils/wordList';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class SollidamStressTest {
  private results: TestResult[] = [];
  private testCount = 0;
  private passedCount = 0;

  private log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  private addResult(testName: string, passed: boolean, error?: string, details?: any) {
    this.testCount++;
    if (passed) this.passedCount++;
    
    const result: TestResult = {
      testName,
      passed,
      error,
      details
    };
    
    this.results.push(result);
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    this.log(`${status}: ${testName}`);
    if (error) this.log(`   Error: ${error}`);
    if (details) this.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }

  // Test 1: Basic Encoding/Decoding Round Trip
  testBasicRoundTrip() {
    this.log('\n🧪 Test 1: Basic Encoding/Decoding Round Trip');
    
    const testLocations = [
      { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
      { lat: 11.0168, lng: 76.9558, name: 'Coimbatore' },
      { lat: 9.9252, lng: 78.1198, name: 'Madurai' },
      { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli' },
      { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari' }
    ];

    testLocations.forEach(({ lat, lng, name }) => {
      try {
        // Encode
        const encoded = encodeLocation(lat, lng);
        if (!encoded) {
          this.addResult(`Round Trip - ${name}`, false, 'Encoding failed');
          return;
        }

        // Decode
        const decoded = decodeLocation(encoded.words);
        if (!decoded) {
          this.addResult(`Round Trip - ${name}`, false, 'Decoding failed');
          return;
        }

        // Check accuracy (within 3 meters)
        const latDiff = Math.abs(lat - decoded.lat);
        const lngDiff = Math.abs(lng - decoded.lng);
        const accuracy = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // Convert to meters

        const passed = accuracy <= 3;
        this.addResult(`Round Trip - ${name}`, passed, 
          passed ? undefined : `Accuracy: ${accuracy.toFixed(2)}m (expected ≤3m)`,
          { original: { lat, lng }, encoded: encoded.words, decoded, accuracy: accuracy.toFixed(2) + 'm' }
        );
      } catch (error) {
        this.addResult(`Round Trip - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 2: Edge Cases - Tamil Nadu Boundaries
  testBoundaryCases() {
    this.log('\n🧪 Test 2: Boundary Cases');
    
    const boundaryTests = [
      { lat: TAMIL_NADU_BOUNDS.minLat, lng: TAMIL_NADU_BOUNDS.minLng, name: 'Southwest Corner' },
      { lat: TAMIL_NADU_BOUNDS.maxLat, lng: TAMIL_NADU_BOUNDS.maxLng, name: 'Northeast Corner' },
      { lat: TAMIL_NADU_BOUNDS.minLat, lng: TAMIL_NADU_BOUNDS.maxLng, name: 'Southeast Corner' },
      { lat: TAMIL_NADU_BOUNDS.maxLat, lng: TAMIL_NADU_BOUNDS.minLng, name: 'Northwest Corner' },
      { lat: (TAMIL_NADU_BOUNDS.minLat + TAMIL_NADU_BOUNDS.maxLat) / 2, 
        lng: (TAMIL_NADU_BOUNDS.minLng + TAMIL_NADU_BOUNDS.maxLng) / 2, name: 'Center' }
    ];

    boundaryTests.forEach(({ lat, lng, name }) => {
      try {
        const encoded = encodeLocation(lat, lng);
        const passed = encoded !== null;
        this.addResult(`Boundary - ${name}`, passed, 
          passed ? undefined : 'Should be within Tamil Nadu bounds',
          { lat, lng, encoded: encoded?.words }
        );
      } catch (error) {
        this.addResult(`Boundary - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 3: Out of Bounds Locations
  testOutOfBounds() {
    this.log('\n🧪 Test 3: Out of Bounds Locations');
    
    const outOfBoundsTests = [
      { lat: 20.5937, lng: 78.9629, name: 'Delhi (North India)' },
      { lat: 12.9716, lng: 77.5946, name: 'Bangalore (Karnataka)' },
      { lat: 19.0760, lng: 72.8777, name: 'Mumbai (Maharashtra)' },
      { lat: 22.5726, lng: 88.3639, name: 'Kolkata (West Bengal)' },
      { lat: 0, lng: 0, name: 'Null Island' }
    ];

    outOfBoundsTests.forEach(({ lat, lng, name }) => {
      try {
        const encoded = encodeLocation(lat, lng);
        const passed = encoded === null;
        this.addResult(`Out of Bounds - ${name}`, passed, 
          passed ? undefined : 'Should return null for out of bounds locations',
          { lat, lng, encoded: encoded?.words }
        );
      } catch (error) {
        this.addResult(`Out of Bounds - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 4: Floor/Altitude Support
  testFloorSupport() {
    this.log('\n🧪 Test 4: Floor/Altitude Support');
    
    const floorTests = [
      { altitude: 0, expectedFloor: 0, name: 'Ground Floor' },
      { altitude: 3.2, expectedFloor: 1, name: '1st Floor' },
      { altitude: 6.4, expectedFloor: 2, name: '2nd Floor' },
      { altitude: 9.6, expectedFloor: 3, name: '3rd Floor' },
      { altitude: 12.8, expectedFloor: 4, name: '4th Floor' },
      { altitude: 15.9, expectedFloor: 4, name: '4th Floor (Edge)' },
      { altitude: 16.0, expectedFloor: 5, name: '5th Floor' }
    ];

    floorTests.forEach(({ altitude, expectedFloor, name }) => {
      try {
        const calculatedFloor = altitudeToFloor(altitude);
        const passed = calculatedFloor === expectedFloor;
        this.addResult(`Floor - ${name}`, passed, 
          passed ? undefined : `Expected ${expectedFloor}, got ${calculatedFloor}`,
          { altitude, expectedFloor, calculatedFloor }
        );
      } catch (error) {
        this.addResult(`Floor - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 5: Word List Validation
  testWordListValidation() {
    this.log('\n🧪 Test 5: Word List Validation');
    
    try {
      const wordCount = getWordListLength();
      const passed = wordCount >= 2500;
      this.addResult('Word List Size', passed, 
        passed ? undefined : `Need at least 2500 words, got ${wordCount}`,
        { wordCount }
      );
    } catch (error) {
      this.addResult('Word List Size', false, `Exception: ${error}`);
    }

    // Test word retrieval
    try {
      const testIndices = [0, 100, 1000, 2000, 2999];
      testIndices.forEach(index => {
        const word = getWordByIndex(index);
        const passed = word && word.length > 0;
        this.addResult(`Word Retrieval - Index ${index}`, passed, 
          passed ? undefined : 'Word should not be empty',
          { index, word }
        );
      });
    } catch (error) {
      this.addResult('Word Retrieval', false, `Exception: ${error}`);
    }

    // Test word validation
    try {
      const testWords = ['abcd', 'ability', 'able', 'invalidword', 'nonexistent'];
      testWords.forEach(word => {
        const isValid = isValidWord(word);
        const expectedValid = ['abcd', 'ability', 'able'].includes(word);
        const passed = isValid === expectedValid;
        this.addResult(`Word Validation - "${word}"`, passed, 
          passed ? undefined : `Expected ${expectedValid}, got ${isValid}`,
          { word, isValid, expectedValid }
        );
      });
    } catch (error) {
      this.addResult('Word Validation', false, `Exception: ${error}`);
    }
  }

  // Test 6: Grid Coordinate Conversion
  testGridConversion() {
    this.log('\n🧪 Test 6: Grid Coordinate Conversion');
    
    const testCoords = [
      { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
      { lat: 11.0168, lng: 76.9558, name: 'Coimbatore' },
      { lat: 9.9252, lng: 78.1198, name: 'Madurai' }
    ];

    testCoords.forEach(({ lat, lng, name }) => {
      try {
        // Convert to grid
        const grid = latLngToGrid(lat, lng);
        
        // Convert back to lat/lng
        const converted = gridToLatLng(grid.x, grid.y);
        
        // Check accuracy
        const latDiff = Math.abs(lat - converted.lat);
        const lngDiff = Math.abs(lng - converted.lng);
        const accuracy = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;
        
        const passed = accuracy <= 3;
        this.addResult(`Grid Conversion - ${name}`, passed, 
          passed ? undefined : `Accuracy: ${accuracy.toFixed(2)}m (expected ≤3m)`,
          { original: { lat, lng }, grid, converted, accuracy: accuracy.toFixed(2) + 'm' }
        );
      } catch (error) {
        this.addResult(`Grid Conversion - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 7: URL Generation and Parsing
  testUrlGeneration() {
    this.log('\n🧪 Test 7: URL Generation and Parsing');
    
    const testCases = [
      { words: ['tree', 'dream', 'code'], floor: undefined, name: 'Basic 3 Words' },
      { words: ['sky', 'leaf', 'moon'], floor: 3, name: 'With Floor' },
      { words: ['river', 'rock', 'bird'], floor: 0, name: 'Ground Floor' }
    ];

    testCases.forEach(({ words, floor, name }) => {
      try {
        // Create encoded location
        const encoded = { words, floor, gridId: 12345 };
        
        // Generate URL
        const url = generateShareUrl(encoded);
        
        // Parse URL
        const parsed = parseShareUrl(url);
        
        const passed = parsed && 
                      parsed.words.join('.') === words.join('.') && 
                      parsed.floor === floor;
        
        this.addResult(`URL Generation - ${name}`, passed, 
          passed ? undefined : 'URL generation/parsing failed',
          { original: { words, floor }, url, parsed }
        );
      } catch (error) {
        this.addResult(`URL Generation - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 8: Stress Test - Multiple Rapid Operations
  testStressOperations() {
    this.log('\n🧪 Test 8: Stress Test - Multiple Rapid Operations');
    
    const iterations = 50;
    let successCount = 0;
    
    for (let i = 0; i < iterations; i++) {
      try {
        // Generate random coordinates within Tamil Nadu
        const lat = TAMIL_NADU_BOUNDS.minLat + Math.random() * (TAMIL_NADU_BOUNDS.maxLat - TAMIL_NADU_BOUNDS.minLat);
        const lng = TAMIL_NADU_BOUNDS.minLng + Math.random() * (TAMIL_NADU_BOUNDS.maxLng - TAMIL_NADU_BOUNDS.minLng);
        
        // Encode
        const encoded = encodeLocation(lat, lng);
        if (!encoded) continue;
        
        // Decode
        const decoded = decodeLocation(encoded.words);
        if (!decoded) continue;
        
        // Check accuracy
        const latDiff = Math.abs(lat - decoded.lat);
        const lngDiff = Math.abs(lng - decoded.lng);
        const accuracy = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;
        
        if (accuracy <= 3) {
          successCount++;
        }
      } catch (error) {
        // Continue with next iteration
      }
    }
    
    const passed = successCount >= iterations * 0.95; // 95% success rate
    this.addResult(`Stress Test - ${iterations} iterations`, passed, 
      passed ? undefined : `Success rate: ${(successCount/iterations*100).toFixed(1)}% (expected ≥95%)`,
      { iterations, successCount, successRate: (successCount/iterations*100).toFixed(1) + '%' }
    );
  }

  // Test 9: Edge Cases - Invalid Inputs
  testInvalidInputs() {
    this.log('\n🧪 Test 9: Invalid Inputs');
    
    // Test invalid word combinations
    const invalidWords = [
      ['invalid', 'words', 'here'],
      ['tree', 'dream'], // Only 2 words
      ['tree', 'dream', 'code', 'extra'], // 4 words
      ['', '', ''], // Empty words
      ['tree', 'dream', 'invalidword'] // Invalid word
    ];

    invalidWords.forEach((words, index) => {
      try {
        const decoded = decodeLocation(words);
        const passed = decoded === null;
        this.addResult(`Invalid Words - Case ${index + 1}`, passed, 
          passed ? undefined : 'Should return null for invalid words',
          { words, decoded }
        );
      } catch (error) {
        this.addResult(`Invalid Words - Case ${index + 1}`, false, `Exception: ${error}`);
      }
    });

    // Test invalid coordinates
    const invalidCoords = [
      { lat: NaN, lng: 80.2707, name: 'NaN Latitude' },
      { lat: 13.0827, lng: NaN, name: 'NaN Longitude' },
      { lat: Infinity, lng: 80.2707, name: 'Infinity Latitude' },
      { lat: 13.0827, lng: -Infinity, name: 'Infinity Longitude' }
    ];

    invalidCoords.forEach(({ lat, lng, name }) => {
      try {
        const encoded = encodeLocation(lat, lng);
        const passed = encoded === null;
        this.addResult(`Invalid Coordinates - ${name}`, passed, 
          passed ? undefined : 'Should handle invalid coordinates gracefully',
          { lat, lng, encoded: encoded?.words }
        );
      } catch (error) {
        this.addResult(`Invalid Coordinates - ${name}`, false, `Exception: ${error}`);
      }
    });
  }

  // Test 10: Performance Test
  testPerformance() {
    this.log('\n🧪 Test 10: Performance Test');
    
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const lat = TAMIL_NADU_BOUNDS.minLat + Math.random() * (TAMIL_NADU_BOUNDS.maxLat - TAMIL_NADU_BOUNDS.minLat);
      const lng = TAMIL_NADU_BOUNDS.minLng + Math.random() * (TAMIL_NADU_BOUNDS.maxLng - TAMIL_NADU_BOUNDS.minLng);
      
      encodeLocation(lat, lng);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;
    
    const passed = avgTime < 1; // Less than 1ms per operation
    this.addResult(`Performance - ${iterations} operations`, passed, 
      passed ? undefined : `Average time: ${avgTime.toFixed(3)}ms (expected <1ms)`,
      { iterations, totalTime: duration.toFixed(2) + 'ms', avgTime: avgTime.toFixed(3) + 'ms' }
    );
  }

  // Run all tests
  runAllTests() {
    this.log('🚀 Starting Sollidam Algorithm Stress Test');
    this.log('=' .repeat(60));
    
    this.testBasicRoundTrip();
    this.testBoundaryCases();
    this.testOutOfBounds();
    this.testFloorSupport();
    this.testWordListValidation();
    this.testGridConversion();
    this.testUrlGeneration();
    this.testStressOperations();
    this.testInvalidInputs();
    this.testPerformance();
    
    this.generateReport();
  }

  // Generate final report
  generateReport() {
    this.log('\n' + '=' .repeat(60));
    this.log('📊 STRESS TEST REPORT');
    this.log('=' .repeat(60));
    
    this.log(`Total Tests: ${this.testCount}`);
    this.log(`Passed: ${this.passedCount}`);
    this.log(`Failed: ${this.testCount - this.passedCount}`);
    this.log(`Success Rate: ${(this.passedCount / this.testCount * 100).toFixed(1)}%`);
    
    if (this.passedCount === this.testCount) {
      this.log('\n🎉 ALL TESTS PASSED! The Sollidam algorithm is working correctly.');
    } else {
      this.log('\n❌ Some tests failed. Check the details above.');
      
      this.log('\nFailed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          this.log(`  - ${r.testName}: ${r.error}`);
        });
    }
    
    this.log('\n' + '=' .repeat(60));
  }
}

// Run the stress test
const stressTest = new SollidamStressTest();
stressTest.runAllTests(); 