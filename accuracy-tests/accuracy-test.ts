import { 
  latLngToGrid, 
  gridToLatLng, 
  altitudeToFloor, 
  gridIdToWordIndices, 
  wordIndicesToGridId,
  isWithinTamilNadu,
  Location,
  EncodedLocation,
  GridCoordinates
} from '../src/utils/encoding';
import { 
  getWordByIndex, 
  getIndexByWord, 
  isValidWord, 
  getWordListLength 
} from '../src/utils/wordList';
import { 
  encodeLocation, 
  decodeLocation, 
  formatEncodedLocation, 
  parseEncodedLocation 
} from '../src/services/sollidamService';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

interface AccuracyTestResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  accuracy: number;
  results: TestResult[];
}

class SollidamAccuracyTester {
  private results: TestResult[] = [];

  // Test 1: Round-trip accuracy (encode -> decode -> compare)
  async testRoundTripAccuracy(): Promise<void> {
    console.log('🧪 Testing Round-trip Accuracy...');
    
    const testLocations: Location[] = [
      { lat: 13.0827, lng: 80.2707, floor: undefined }, // Chennai
      { lat: 10.7905, lng: 78.7047, floor: undefined }, // Center of Tamil Nadu
      { lat: 9.9252, lng: 78.1198, floor: undefined }, // Madurai
      { lat: 11.0168, lng: 76.9558, floor: undefined }, // Coimbatore
      { lat: 8.0883, lng: 77.5385, floor: undefined }, // Kanyakumari
      { lat: 12.9716, lng: 79.1586, floor: undefined }, // Vellore
      { lat: 10.7905, lng: 78.7047, floor: 5 }, // With floor
      { lat: 13.0827, lng: 80.2707, floor: 10 }, // Chennai with floor
    ];

    for (let i = 0; i < testLocations.length; i++) {
      const location = testLocations[i];
      const testName = `Round-trip Test ${i + 1}: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}${location.floor ? ` (Floor ${location.floor})` : ''}`;
      
      try {
        // Encode location
        const encoded = encodeLocation(location.lat, location.lng, location.floor);
        if (!encoded) {
          this.results.push({
            testName,
            passed: false,
            error: 'Failed to encode location'
          });
          continue;
        }

        // Decode back to location
        const decoded = decodeLocation(encoded.words, encoded.floor);
        if (!decoded) {
          this.results.push({
            testName,
            passed: false,
            error: 'Failed to decode location'
          });
          continue;
        }

        // Check accuracy (within 3 meters = 0.00003 degrees)
        const latDiff = Math.abs(location.lat - decoded.lat);
        const lngDiff = Math.abs(location.lng - decoded.lng);
        const accuracyThreshold = 0.00003; // 3 meters

        const passed = latDiff <= accuracyThreshold && lngDiff <= accuracyThreshold;
        
        this.results.push({
          testName,
          passed,
          details: {
            original: location,
            encoded: encoded.words.join('.'),
            decoded: decoded,
            latDiff,
            lngDiff,
            accuracyThreshold
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
        if (!passed) {
          console.log(`    Lat diff: ${latDiff.toFixed(8)}, Lng diff: ${lngDiff.toFixed(8)}`);
        }
      } catch (error) {
        this.results.push({
          testName,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${testName}: ERROR - ${error}`);
      }
    }
  }

  // Test 2: Grid accuracy
  async testGridAccuracy(): Promise<void> {
    console.log('🧪 Testing Grid Accuracy...');
    
    const testCases = [
      { lat: 10.7905, lng: 78.7047, expectedGrid: { x: 0, y: 0 } }, // Center
      { lat: 13.0827, lng: 80.2707, expectedGrid: { x: 142333, y: 76347 } }, // Chennai
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const testName = `Grid Test ${i + 1}: ${testCase.lat}, ${testCase.lng}`;
      
      try {
        const grid = latLngToGrid(testCase.lat, testCase.lng);
        const backToLatLng = gridToLatLng(grid.x, grid.y);
        
        const latDiff = Math.abs(testCase.lat - backToLatLng.lat);
        const lngDiff = Math.abs(testCase.lng - backToLatLng.lng);
        const accuracyThreshold = 0.00003; // 3 meters
        
        const passed = latDiff <= accuracyThreshold && lngDiff <= accuracyThreshold;
        
        this.results.push({
          testName,
          passed,
          details: {
            original: { lat: testCase.lat, lng: testCase.lng },
            grid: grid,
            backToLatLng: backToLatLng,
            latDiff,
            lngDiff
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        this.results.push({
          testName,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${testName}: ERROR - ${error}`);
      }
    }
  }

  // Test 3: Word encoding/decoding accuracy
  async testWordEncodingAccuracy(): Promise<void> {
    console.log('🧪 Testing Word Encoding/Decoding Accuracy...');
    
    const testGridIds = [0, 1000, 10000, 100000, 1000000];
    
    for (let i = 0; i < testGridIds.length; i++) {
      const gridId = testGridIds[i];
      const testName = `Word Encoding Test ${i + 1}: Grid ID ${gridId}`;
      
      try {
        const wordIndices = gridIdToWordIndices(gridId, getWordListLength());
        const backToGridId = wordIndicesToGridId(wordIndices, getWordListLength());
        
        const passed = gridId === backToGridId;
        
        this.results.push({
          testName,
          passed,
          details: {
            originalGridId: gridId,
            wordIndices: wordIndices,
            backToGridId: backToGridId,
            words: wordIndices.map(index => getWordByIndex(index))
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        this.results.push({
          testName,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${testName}: ERROR - ${error}`);
      }
    }
  }

  // Test 4: Boundary conditions
  async testBoundaryConditions(): Promise<void> {
    console.log('🧪 Testing Boundary Conditions...');
    
    const boundaryTests = [
      { lat: 8.0883, lng: 76.2300, name: 'Northwest corner' },
      { lat: 8.0883, lng: 80.2707, name: 'Northeast corner' },
      { lat: 13.0827, lng: 76.2300, name: 'Southwest corner' },
      { lat: 13.0827, lng: 80.2707, name: 'Southeast corner' },
      { lat: 7.0000, lng: 78.7047, name: 'Outside north boundary' },
      { lat: 14.0000, lng: 78.7047, name: 'Outside south boundary' },
      { lat: 10.7905, lng: 75.0000, name: 'Outside west boundary' },
      { lat: 10.7905, lng: 81.0000, name: 'Outside east boundary' },
    ];

    for (let i = 0; i < boundaryTests.length; i++) {
      const test = boundaryTests[i];
      const testName = `Boundary Test ${i + 1}: ${test.name}`;
      
      try {
        const isWithin = isWithinTamilNadu(test.lat, test.lng);
        const expectedWithin = i < 4; // First 4 should be within boundaries
        
        const passed = isWithin === expectedWithin;
        
        this.results.push({
          testName,
          passed,
          details: {
            location: { lat: test.lat, lng: test.lng },
            isWithin: isWithin,
            expectedWithin: expectedWithin
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'} (Within: ${isWithin})`);
      } catch (error) {
        this.results.push({
          testName,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${testName}: ERROR - ${error}`);
      }
    }
  }

  // Test 5: Floor number handling
  async testFloorHandling(): Promise<void> {
    console.log('🧪 Testing Floor Number Handling...');
    
    const floorTests = [
      { altitude: 0, expectedFloor: 0 },
      { altitude: 3, expectedFloor: 1 },
      { altitude: 6, expectedFloor: 2 },
      { altitude: 15, expectedFloor: 5 },
      { altitude: 30, expectedFloor: 10 },
      { altitude: 300, expectedFloor: 100 },
    ];

    for (let i = 0; i < floorTests.length; i++) {
      const test = floorTests[i];
      const testName = `Floor Test ${i + 1}: Altitude ${test.altitude}m`;
      
      try {
        const floor = altitudeToFloor(test.altitude);
        const passed = floor === test.expectedFloor;
        
        this.results.push({
          testName,
          passed,
          details: {
            altitude: test.altitude,
            calculatedFloor: floor,
            expectedFloor: test.expectedFloor
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'} (Floor: ${floor})`);
      } catch (error) {
        this.results.push({
          testName,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${testName}: ERROR - ${error}`);
      }
    }
  }

  // Test 6: Word list validation
  async testWordListValidation(): Promise<void> {
    console.log('🧪 Testing Word List Validation...');
    
    const wordListLength = getWordListLength();
    const testName = `Word List Test: ${wordListLength} words`;
    
    try {
      // Test random words
      const randomIndices = Array.from({ length: 10 }, () => Math.floor(Math.random() * wordListLength));
      let allValid = true;
      
      for (const index of randomIndices) {
        const word = getWordByIndex(index);
        const backToIndex = getIndexByWord(word);
        const isValid = isValidWord(word);
        
        if (index !== backToIndex || !isValid) {
          allValid = false;
          break;
        }
      }
      
      this.results.push({
        testName,
        passed: allValid,
        details: {
          wordListLength,
          randomIndices,
          allValid
        }
      });

      console.log(`  ${allValid ? '✅' : '❌'} ${testName}: ${allValid ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`  ❌ ${testName}: ERROR - ${error}`);
    }
  }

  // Run all tests
  async runAllTests(): Promise<AccuracyTestResult> {
    console.log('🚀 Starting Sollidam Accuracy Tests...\n');
    
    await this.testRoundTripAccuracy();
    console.log('');
    
    await this.testGridAccuracy();
    console.log('');
    
    await this.testWordEncodingAccuracy();
    console.log('');
    
    await this.testBoundaryConditions();
    console.log('');
    
    await this.testFloorHandling();
    console.log('');
    
    await this.testWordListValidation();
    console.log('');
    
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const accuracy = (passedTests / totalTests) * 100;
    
    const result: AccuracyTestResult = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      accuracy,
      results: this.results
    };
    
    console.log('📊 Test Results Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${totalTests - passedTests}`);
    console.log(`  Accuracy: ${accuracy.toFixed(2)}%`);
    
    return result;
  }
}

export default SollidamAccuracyTester; 