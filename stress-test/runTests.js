const fs = require('fs');
const path = require('path');

// Mock the browser environment for Node.js
global.window = {
  location: {
    origin: 'http://localhost:3000',
    pathname: '/'
  }
};

// Simple test runner
class SimpleTestRunner {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passedCount = 0;
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  addResult(testName, passed, error, details) {
    this.testCount++;
    if (passed) this.passedCount++;
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    this.log(`${status}: ${testName}`);
    if (error) this.log(`   Error: ${error}`);
    if (details) this.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    
    this.results.push({ testName, passed, error, details });
  }

  // Test 1: Check if word list exists and has enough words
  testWordList() {
    this.log('\n🧪 Test 1: Word List Validation');
    
    try {
      const wordListPath = path.join(__dirname, '..', 'src', 'utils', 'wordList.ts');
      const wordListContent = fs.readFileSync(wordListPath, 'utf8');
      
      // Count words in the array
      const wordArrayMatch = wordListContent.match(/export const WORD_LIST: string\[\] = \[([\s\S]*?)\];/);
      if (!wordArrayMatch) {
        this.addResult('Word List Structure', false, 'Could not find WORD_LIST array');
        return;
      }
      
      const wordArrayContent = wordArrayMatch[1];
      const words = wordArrayContent.split(',').map(word => word.trim().replace(/'/g, '')).filter(word => word.length > 0);
      
      const passed = words.length >= 2500;
      this.addResult('Word List Size', passed, 
        passed ? undefined : `Need at least 2500 words, got ${words.length}`,
        { wordCount: words.length, sampleWords: words.slice(0, 10) }
      );
      
      // Check for duplicates
      const uniqueWords = [...new Set(words)];
      const duplicateCount = words.length - uniqueWords.length;
      const noDuplicates = duplicateCount === 0;
      this.addResult('Word List - No Duplicates', noDuplicates,
        noDuplicates ? undefined : `Found ${duplicateCount} duplicate words`,
        { totalWords: words.length, uniqueWords: uniqueWords.length, duplicates: duplicateCount }
      );
      
    } catch (error) {
      this.addResult('Word List File', false, `Exception: ${error.message}`);
    }
  }

  // Test 2: Check encoding algorithm files
  testEncodingFiles() {
    this.log('\n🧪 Test 2: Encoding Algorithm Files');
    
    const requiredFiles = [
      '../src/utils/encoding.ts',
      '../src/services/sollidamService.ts'
    ];
    
    requiredFiles.forEach(filePath => {
      try {
        const fullPath = path.join(__dirname, filePath);
        const exists = fs.existsSync(fullPath);
        this.addResult(`File Exists - ${path.basename(filePath)}`, exists,
          exists ? undefined : `File not found: ${filePath}`,
          { path: fullPath }
        );
        
        if (exists) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasContent = content.length > 100; // Basic check for meaningful content
          this.addResult(`File Content - ${path.basename(filePath)}`, hasContent,
            hasContent ? undefined : 'File appears to be empty or too small',
            { fileSize: content.length }
          );
        }
      } catch (error) {
        this.addResult(`File Check - ${path.basename(filePath)}`, false, `Exception: ${error.message}`);
      }
    });
  }

  // Test 3: Check Tamil Nadu bounds
  testTamilNaduBounds() {
    this.log('\n🧪 Test 3: Tamil Nadu Geographic Bounds');
    
    try {
      const encodingPath = path.join(__dirname, '..', 'src', 'utils', 'encoding.ts');
      const content = fs.readFileSync(encodingPath, 'utf8');
      
      // Check if bounds are defined
      const boundsMatch = content.match(/TAMIL_NADU_BOUNDS\s*=\s*\{[\s\S]*?minLat:\s*([\d.]+)[\s\S]*?maxLat:\s*([\d.]+)[\s\S]*?minLng:\s*([\d.]+)[\s\S]*?maxLng:\s*([\d.]+)/);
      
      if (boundsMatch) {
        const [, minLat, maxLat, minLng, maxLng] = boundsMatch.map(Number);
        
        // Validate bounds
        const validBounds = minLat < maxLat && minLng < maxLng && 
                           minLat >= 8 && maxLat <= 14 && 
                           minLng >= 76 && maxLng <= 81;
        
        this.addResult('Tamil Nadu Bounds - Valid Range', validBounds,
          validBounds ? undefined : 'Bounds appear to be outside expected Tamil Nadu range',
          { minLat, maxLat, minLng, maxLng }
        );
        
        // Check area calculation
        const latRange = maxLat - minLat;
        const lngRange = maxLng - minLng;
        const approximateArea = latRange * lngRange * 111 * 100; // Rough km² calculation
        
        const reasonableArea = approximateArea > 100000 && approximateArea < 200000;
        this.addResult('Tamil Nadu Bounds - Reasonable Area', reasonableArea,
          reasonableArea ? undefined : `Calculated area: ${approximateArea.toFixed(0)} km² (expected ~130,000 km²)`,
          { approximateArea: approximateArea.toFixed(0) + ' km²' }
        );
        
      } else {
        this.addResult('Tamil Nadu Bounds - Structure', false, 'Could not find TAMIL_NADU_BOUNDS definition');
      }
      
    } catch (error) {
      this.addResult('Tamil Nadu Bounds Check', false, `Exception: ${error.message}`);
    }
  }

  // Test 4: Check grid resolution
  testGridResolution() {
    this.log('\n🧪 Test 4: Grid Resolution');
    
    try {
      const encodingPath = path.join(__dirname, '..', 'src', 'utils', 'encoding.ts');
      const content = fs.readFileSync(encodingPath, 'utf8');
      
      const gridResMatch = content.match(/GRID_RESOLUTION\s*=\s*(\d+)/);
      if (gridResMatch) {
        const gridResolution = parseInt(gridResMatch[1]);
        const correctResolution = gridResolution === 3;
        
        this.addResult('Grid Resolution - 3 Meters', correctResolution,
          correctResolution ? undefined : `Grid resolution is ${gridResolution}m (expected 3m)`,
          { gridResolution: gridResolution + 'm' }
        );
        
        // Check if grid calculation functions exist
        const hasLatLngToGrid = content.includes('latLngToGrid');
        const hasGridToLatLng = content.includes('gridToLatLng');
        
        this.addResult('Grid Functions - latLngToGrid', hasLatLngToGrid,
          hasLatLngToGrid ? undefined : 'latLngToGrid function not found',
          { found: hasLatLngToGrid }
        );
        
        this.addResult('Grid Functions - gridToLatLng', hasGridToLatLng,
          hasGridToLatLng ? undefined : 'gridToLatLng function not found',
          { found: hasGridToLatLng }
        );
        
      } else {
        this.addResult('Grid Resolution - Definition', false, 'Could not find GRID_RESOLUTION definition');
      }
      
    } catch (error) {
      this.addResult('Grid Resolution Check', false, `Exception: ${error.message}`);
    }
  }

  // Test 5: Check service functions
  testServiceFunctions() {
    this.log('\n🧪 Test 5: Service Functions');
    
    try {
      const servicePath = path.join(__dirname, '..', 'src', 'services', 'sollidamService.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredFunctions = [
        'encodeLocation',
        'decodeLocation',
        'formatEncodedLocation',
        'parseEncodedLocation',
        'generateShareUrl',
        'parseShareUrl'
      ];
      
      requiredFunctions.forEach(funcName => {
        const hasFunction = content.includes(`function ${funcName}`) || content.includes(`export function ${funcName}`);
        this.addResult(`Service Function - ${funcName}`, hasFunction,
          hasFunction ? undefined : `Function ${funcName} not found`,
          { found: hasFunction }
        );
      });
      
    } catch (error) {
      this.addResult('Service Functions Check', false, `Exception: ${error.message}`);
    }
  }

  // Test 6: Check React components
  testReactComponents() {
    this.log('\n🧪 Test 6: React Components');
    
    const requiredComponents = [
      '../src/components/Header.tsx',
      '../src/components/LocationMap.tsx',
      '../src/components/LocationSearch.tsx',
      '../src/pages/HomePage.tsx',
      '../src/pages/LookupPage.tsx',
      '../src/pages/AboutPage.tsx'
    ];
    
    requiredComponents.forEach(componentPath => {
      try {
        const fullPath = path.join(__dirname, componentPath);
        const exists = fs.existsSync(fullPath);
        const componentName = path.basename(componentPath, '.tsx');
        
        this.addResult(`React Component - ${componentName}`, exists,
          exists ? undefined : `Component file not found: ${componentPath}`,
          { path: fullPath }
        );
        
        if (exists) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasExport = content.includes('export default');
          this.addResult(`Component Export - ${componentName}`, hasExport,
            hasExport ? undefined : 'Component does not have default export',
            { hasExport }
          );
        }
        
      } catch (error) {
        this.addResult(`Component Check - ${path.basename(componentPath)}`, false, `Exception: ${error.message}`);
      }
    });
  }

  // Test 7: Check package.json scripts
  testPackageScripts() {
    this.log('\n🧪 Test 7: Package.json Scripts');
    
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredScripts = ['start', 'build', 'test', 'update-words'];
      
      requiredScripts.forEach(scriptName => {
        const hasScript = packageContent.scripts && packageContent.scripts[scriptName];
        this.addResult(`Package Script - ${scriptName}`, hasScript,
          hasScript ? undefined : `Script ${scriptName} not found in package.json`,
          { found: hasScript }
        );
      });
      
      // Check dependencies
      const requiredDeps = ['react', 'react-dom', 'leaflet', 'react-leaflet', 'react-router-dom'];
      
      requiredDeps.forEach(depName => {
        const hasDep = packageContent.dependencies && packageContent.dependencies[depName];
        this.addResult(`Package Dependency - ${depName}`, hasDep,
          hasDep ? undefined : `Dependency ${depName} not found in package.json`,
          { found: hasDep }
        );
      });
      
    } catch (error) {
      this.addResult('Package.json Check', false, `Exception: ${error.message}`);
    }
  }

  // Test 8: Check TypeScript configuration
  testTypeScriptConfig() {
    this.log('\n🧪 Test 8: TypeScript Configuration');
    
    try {
      const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
      const exists = fs.existsSync(tsConfigPath);
      
      this.addResult('TypeScript Config - Exists', exists,
        exists ? undefined : 'tsconfig.json not found',
        { path: tsConfigPath }
      );
      
      if (exists) {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
        
        const hasJsx = tsConfig.compilerOptions && tsConfig.compilerOptions.jsx;
        this.addResult('TypeScript Config - JSX Support', hasJsx,
          hasJsx ? undefined : 'JSX configuration not found',
          { jsx: hasJsx }
        );
        
        const hasStrict = tsConfig.compilerOptions && tsConfig.compilerOptions.strict;
        this.addResult('TypeScript Config - Strict Mode', hasStrict,
          hasStrict ? undefined : 'Strict mode not enabled',
          { strict: hasStrict }
        );
      }
      
    } catch (error) {
      this.addResult('TypeScript Config Check', false, `Exception: ${error.message}`);
    }
  }

  // Test 9: Check public files
  testPublicFiles() {
    this.log('\n🧪 Test 9: Public Files');
    
    const requiredPublicFiles = [
      '../public/index.html',
      '../public/manifest.json',
      '../public/robots.txt'
    ];
    
    requiredPublicFiles.forEach(filePath => {
      try {
        const fullPath = path.join(__dirname, filePath);
        const exists = fs.existsSync(fullPath);
        const fileName = path.basename(filePath);
        
        this.addResult(`Public File - ${fileName}`, exists,
          exists ? undefined : `Public file not found: ${filePath}`,
          { path: fullPath }
        );
        
      } catch (error) {
        this.addResult(`Public File Check - ${path.basename(filePath)}`, false, `Exception: ${error.message}`);
      }
    });
  }

  // Test 10: Check words.txt integration
  testWordsIntegration() {
    this.log('\n🧪 Test 10: Words.txt Integration');
    
    try {
      const wordsPath = path.join(__dirname, '..', 'words.txt');
      const exists = fs.existsSync(wordsPath);
      
      this.addResult('Words.txt - Exists', exists,
        exists ? undefined : 'words.txt file not found',
        { path: wordsPath }
      );
      
      if (exists) {
        const content = fs.readFileSync(wordsPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        
        const hasEnoughWords = lines.length >= 2500;
        this.addResult('Words.txt - Sufficient Words', hasEnoughWords,
          hasEnoughWords ? undefined : `Only ${lines.length} words found (need at least 2500)`,
          { wordCount: lines.length }
        );
        
        // Check for empty lines
        const emptyLines = content.split('\n').filter(line => line.trim().length === 0).length;
        const noEmptyLines = emptyLines === 0;
        this.addResult('Words.txt - No Empty Lines', noEmptyLines,
          noEmptyLines ? undefined : `Found ${emptyLines} empty lines`,
          { emptyLines }
        );
      }
      
    } catch (error) {
      this.addResult('Words.txt Check', false, `Exception: ${error.message}`);
    }
  }

  // Run all tests
  runAllTests() {
    this.log('🚀 Starting Sollidam Algorithm Stress Test (File System Check)');
    this.log('=' .repeat(70));
    
    this.testWordList();
    this.testEncodingFiles();
    this.testTamilNaduBounds();
    this.testGridResolution();
    this.testServiceFunctions();
    this.testReactComponents();
    this.testPackageScripts();
    this.testTypeScriptConfig();
    this.testPublicFiles();
    this.testWordsIntegration();
    
    this.generateReport();
  }

  // Generate final report
  generateReport() {
    this.log('\n' + '=' .repeat(70));
    this.log('📊 STRESS TEST REPORT (File System & Structure Check)');
    this.log('=' .repeat(70));
    
    this.log(`Total Tests: ${this.testCount}`);
    this.log(`Passed: ${this.passedCount}`);
    this.log(`Failed: ${this.testCount - this.passedCount}`);
    this.log(`Success Rate: ${(this.passedCount / this.testCount * 100).toFixed(1)}%`);
    
    if (this.passedCount === this.testCount) {
      this.log('\n🎉 ALL TESTS PASSED! The Sollidam project structure is correct.');
      this.log('✅ The algorithm files are properly structured and ready for testing.');
    } else {
      this.log('\n❌ Some tests failed. Check the details above.');
      
      this.log('\nFailed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          this.log(`  - ${r.testName}: ${r.error}`);
        });
    }
    
    this.log('\n' + '=' .repeat(70));
    this.log('💡 Next Steps:');
    this.log('   1. Run the application: npm start');
    this.log('   2. Test encoding/decoding manually in the browser');
    this.log('   3. Verify the 3-word combinations work correctly');
    this.log('   4. Check map integration and location sharing');
    this.log('=' .repeat(70));
  }
}

// Run the stress test
const testRunner = new SimpleTestRunner();
testRunner.runAllTests(); 