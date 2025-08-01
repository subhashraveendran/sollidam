# Sollidam Algorithm Stress Tests

This folder contains comprehensive stress tests for the Sollidam location encoding algorithm.

## Test Files

### 1. `testAlgorithm.ts` - Full Algorithm Tests
A comprehensive TypeScript test suite that tests the actual algorithm functions including:
- **Basic Round Trip Tests**: Encode → Decode → Verify accuracy
- **Boundary Cases**: Tamil Nadu corner points and center
- **Out of Bounds**: Locations outside Tamil Nadu
- **Floor/Altitude Support**: Z-axis calculations
- **Word List Validation**: 3000 words integration
- **Grid Coordinate Conversion**: lat/lng ↔ grid coordinates
- **URL Generation**: Share link creation and parsing
- **Stress Operations**: 50+ rapid encode/decode operations
- **Invalid Inputs**: Error handling for bad data
- **Performance Tests**: 1000+ operations timing

### 2. `runTests.js` - Structure Validation Tests
A Node.js test runner that validates the project structure without requiring the full React environment:
- **Word List Validation**: Checks 3000 words integration
- **File Structure**: Verifies all required files exist
- **Tamil Nadu Bounds**: Geographic boundary validation
- **Grid Resolution**: 3-meter grid configuration
- **Service Functions**: Core algorithm functions
- **React Components**: UI component structure
- **Package Configuration**: Dependencies and scripts
- **TypeScript Config**: Compiler settings
- **Public Files**: Static assets
- **Words.txt Integration**: Source file validation

## Running the Tests

### Option 1: Structure Tests (Recommended)
```bash
npm run test-structure
```
This runs the Node.js tests that validate the project structure and file integrity.

### Option 2: Full Algorithm Tests
```bash
npm run stress-test
```
This runs the comprehensive TypeScript tests that exercise the actual algorithm functions.

## Test Categories

### 🔍 **Validation Tests**
- Word list size and uniqueness
- File existence and content
- Geographic bounds accuracy
- Grid resolution configuration

### 🧪 **Algorithm Tests**
- Encoding/decoding round trips
- Accuracy within 3 meters
- Boundary condition handling
- Error case management

### ⚡ **Performance Tests**
- 50+ rapid operations
- 1000+ performance benchmarks
- Memory usage patterns
- Response time validation

### 🛡️ **Edge Cases**
- Invalid coordinates (NaN, Infinity)
- Out-of-bounds locations
- Malformed word combinations
- Empty or null inputs

### 🌐 **Integration Tests**
- URL generation and parsing
- Share link functionality
- Floor/altitude calculations
- Word list integration

## Expected Results

### ✅ **Pass Criteria**
- **Structure Tests**: 100% pass rate
- **Algorithm Tests**: ≥95% success rate
- **Performance**: <1ms average per operation
- **Accuracy**: ≤3 meters precision

### 📊 **Test Coverage**
- **10 Test Categories** with 50+ individual tests
- **File System**: All required files and structure
- **Algorithm Logic**: Core encoding/decoding functions
- **Edge Cases**: Error handling and boundary conditions
- **Performance**: Speed and efficiency validation

## Test Output

The tests provide detailed output including:
- ✅/❌ Pass/Fail status for each test
- Detailed error messages for failures
- Performance metrics and timing data
- Sample data and validation results
- Comprehensive final report

## Example Output

```
🚀 Starting Sollidam Algorithm Stress Test
============================================================

🧪 Test 1: Word List Validation
✅ PASS: Word List Size
✅ PASS: Word List - No Duplicates

🧪 Test 2: Encoding Algorithm Files
✅ PASS: File Exists - encoding.ts
✅ PASS: File Content - encoding.ts

📊 STRESS TEST REPORT
============================================================
Total Tests: 45
Passed: 45
Failed: 0
Success Rate: 100.0%

🎉 ALL TESTS PASSED! The Sollidam algorithm is working correctly.
```

## Troubleshooting

### Common Issues

1. **Missing Files**: Run `npm run update-words` to regenerate word list
2. **TypeScript Errors**: Check `tsconfig.json` configuration
3. **Dependency Issues**: Run `npm install --legacy-peer-deps`
4. **Performance Failures**: Check system resources and Node.js version

### Debug Mode

For detailed debugging, the tests include:
- Detailed error messages
- Sample data output
- Performance timing breakdown
- File content validation

## Next Steps

After running the stress tests:

1. **If All Tests Pass**: Your algorithm is ready for production use
2. **If Some Tests Fail**: Check the error messages and fix the issues
3. **Manual Testing**: Test the web application at `http://localhost:3000`
4. **Real-world Testing**: Try encoding/decoding actual Tamil Nadu locations

## Contributing

To add new tests:
1. Add test functions to the appropriate test file
2. Follow the existing naming conventions
3. Include proper error handling
4. Add descriptive test names and error messages
5. Update this README with new test categories 