# Sollidam Accuracy Tests

This folder contains comprehensive accuracy tests for the Sollidam location encoding system.

## 🎯 Purpose

The accuracy tests verify that the Sollidam algorithm correctly:
- Encodes coordinates to 3-word codes
- Decodes 3-word codes back to coordinates
- Maintains accuracy within 3 meters
- Handles boundary conditions
- Processes floor numbers correctly
- Validates the word list

## 📁 Files

- `accuracy-test.ts` - Main test suite with all test cases
- `run-tests.ts` - Test runner function
- `test-runner.js` - Node.js script to execute tests
- `README.md` - This documentation

## 🧪 Test Categories

### 1. Round-trip Accuracy Tests
Tests the complete encode → decode cycle for various locations in Tamil Nadu:
- Chennai, Madurai, Coimbatore, Kanyakumari, Vellore
- Locations with and without floor numbers
- Accuracy threshold: 3 meters (0.00003 degrees)

### 2. Grid Accuracy Tests
Verifies the grid coordinate system:
- Latitude/longitude to grid conversion
- Grid to latitude/longitude conversion
- Ensures no data loss in conversions

### 3. Word Encoding/Decoding Tests
Tests the word-based encoding system:
- Grid ID to word indices conversion
- Word indices back to grid ID
- Verifies word list integrity

### 4. Boundary Condition Tests
Validates Tamil Nadu boundary detection:
- Corner points of Tamil Nadu
- Points outside the boundary
- Ensures proper boundary validation

### 5. Floor Number Tests
Tests altitude to floor number conversion:
- Ground level (0m) → Floor 0
- 3m altitude → Floor 1
- Various altitude levels

### 6. Word List Validation
Verifies the 3000-word list:
- Random word retrieval
- Word index consistency
- Word validation

## 🚀 Running Tests

### Method 1: Using npm script (Recommended)
```bash
npm run accuracy-test
```

### Method 2: Direct execution
```bash
node accuracy-tests/accuracy-test.js
```

### Method 3: Using test runner
```bash
node accuracy-tests/test-runner.js
```

## 📊 Expected Results

### Excellent Accuracy (95%+)
- All core functions working perfectly
- No significant issues detected

### Good Accuracy (90-94%)
- Minor issues that don't affect core functionality
- May need small adjustments

### Moderate Accuracy (80-89%)
- Some issues need attention
- Core functionality may be affected

### Poor Accuracy (<80%)
- Significant issues detected
- Algorithm needs major fixes

## 🔍 Understanding Test Results

Each test provides:
- **Test Name**: Description of what's being tested
- **Status**: ✅ PASS or ❌ FAIL
- **Details**: Technical information about the test
- **Error**: Specific error message if test failed

## 🎯 Accuracy Standards

- **Coordinate Accuracy**: Within 3 meters (0.00003 degrees)
- **Grid Conversion**: 100% accuracy (no data loss)
- **Word Encoding**: 100% accuracy (perfect round-trip)
- **Boundary Detection**: 100% accuracy
- **Floor Conversion**: Exact altitude to floor mapping

## 🛠️ Troubleshooting

### Common Issues:
1. **Import Errors**: Ensure all source files are accessible
2. **Word List Issues**: Check if words.txt is properly loaded
3. **Boundary Errors**: Verify Tamil Nadu coordinates are correct
4. **Grid Calculation Errors**: Check mathematical precision

### Debug Mode:
Add console.log statements in the test files to debug specific issues.

## 📈 Performance Notes

- Tests run in parallel where possible
- Total execution time: ~2-5 seconds
- Memory usage: Minimal
- Network: No external dependencies

## 🔄 Continuous Integration

These tests can be integrated into CI/CD pipelines:
- Run on every commit
- Generate reports
- Fail builds on poor accuracy
- Track accuracy trends over time 