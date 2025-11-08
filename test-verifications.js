#!/usr/bin/env node

/**
 * Test script for verification services
 * Tests all verification endpoints: Ofqual, DBS Update Service, Professional Registers, RTW, ECS
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logTest(message) {
  log(`\n▶ ${message}`, 'cyan');
}

async function testEndpoint(name, method, url, body = null, expectedStatus = 200) {
  try {
    logTest(`Testing ${name}...`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(url, options);
    } catch (fetchError) {
      if (fetchError.message.includes('fetch failed') || fetchError.message.includes('ECONNREFUSED')) {
        logError(`${name}: Cannot connect to server. Is it running?`);
        logError(`Try: npm run dev`);
        return { success: false, error: 'Server not available' };
      }
      throw fetchError;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      logError(`${name}: Invalid JSON response`);
      logError(`Status: ${response.status}`);
      const text = await response.text();
      logError(`Response: ${text.substring(0, 200)}`);
      return { success: false, error: 'Invalid JSON response' };
    }

    if (response.status === expectedStatus) {
      logSuccess(`${name}: Status ${response.status} (Expected: ${expectedStatus})`);
      
      if (data.success !== undefined) {
        if (data.success) {
          logSuccess(`${name}: Success flag is true`);
        } else {
          logError(`${name}: Success flag is false`);
        }
      }

      if (data.data) {
        if (data.data.ok !== undefined) {
          if (data.data.ok) {
            logSuccess(`${name}: Verification result is OK`);
          } else {
            logInfo(`${name}: Verification result is NOT OK (this may be expected for test data)`);
          }
        }
      }

      return { success: true, data };
    } else {
      logError(`${name}: Status ${response.status} (Expected: ${expectedStatus})`);
      logError(`Response: ${JSON.stringify(data, null, 2)}`);
      return { success: false, data, error: `Unexpected status: ${response.status}` };
    }
  } catch (error) {
    logError(`${name}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkServerConnection() {
  try {
    logInfo('Checking server connection...');
    const response = await fetch(`${BASE_URL}/api/verify/ofqual/qualification?qualificationNumber=test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    // If we get any response (even 400), the server is running
    logSuccess(`Server is running at ${BASE_URL}`);
    return true;
  } catch (error) {
    logError(`Cannot connect to server at ${BASE_URL}`);
    logError('Please make sure your Next.js development server is running:');
    log('  npm run dev', 'yellow');
    log('\nOr if using a different port:', 'yellow');
    log('  BASE_URL=http://localhost:3001 node test-verifications.js', 'yellow');
    return false;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('Verification Services Test Suite', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  // Check if server is running first
  const serverAvailable = await checkServerConnection();
  if (!serverAvailable) {
    logError('\nServer connection check failed. Aborting tests.');
    process.exit(1);
  }

  log(''); // Empty line after server check

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: Ofqual Qualification Verification - CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 1: Ofqual Qualification Verification', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const ofqualResultCorrect = await testEndpoint(
    'Ofqual Qualification (POST) - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/ofqual/qualification`,
    {
      qualificationNumber: '601/8830/6',
      qualificationTitle: 'Level 3 Diploma in Health and Social Care',
      awardingOrganisation: 'Pearson'
    }
  );
  
  if (ofqualResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2: Ofqual Qualification Verification - WRONG
  results.total++;
  const ofqualResultWrong = await testEndpoint(
    'Ofqual Qualification (POST) - WRONG',
    'POST',
    `${BASE_URL}/api/verify/ofqual/qualification`,
    {
      qualificationNumber: 'INVALID123456',
      qualificationTitle: 'Non-existent Qualification',
      awardingOrganisation: 'Fake Organisation'
    }
  );
  
  if (ofqualResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3: Ofqual Qualification Verification (GET) - CORRECT
  results.total++;
  const ofqualGetResultCorrect = await testEndpoint(
    'Ofqual Qualification (GET) - CORRECT',
    'GET',
    `${BASE_URL}/api/verify/ofqual/qualification?qualificationNumber=601/8830/6&qualificationTitle=Level%203%20Diploma%20in%20Health%20and%20Social%20Care`
  );
  
  if (ofqualGetResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4: Ofqual Qualification Verification (GET) - WRONG
  results.total++;
  const ofqualGetResultWrong = await testEndpoint(
    'Ofqual Qualification (GET) - WRONG',
    'GET',
    `${BASE_URL}/api/verify/ofqual/qualification?qualificationNumber=INVALID999&qualificationTitle=NonExistent`
  );
  
  if (ofqualGetResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 5: DBS Update Service Verification - CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 2: DBS Update Service Verification', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const dbsUpdateResultCorrect = await testEndpoint(
    'DBS Update Service - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/dbs/update-service`,
    {
      certificateNumber: '001913551408',
      surname: 'KUJU',
      dob: {
        day: '27',
        month: '5',
        year: '1994'
      },
      format: 'html'
    }
  );
  
  if (dbsUpdateResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 6: DBS Update Service Verification - WRONG
  results.total++;
  const dbsUpdateResultWrong = await testEndpoint(
    'DBS Update Service - WRONG',
    'POST',
    `${BASE_URL}/api/verify/dbs/update-service`,
    {
      certificateNumber: 'INVALID999999',
      surname: 'WRONG',
      dob: {
        day: '01',
        month: '01',
        year: '2000'
      },
      format: 'html'
    }
  );
  
  if (dbsUpdateResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 7: Professional Register Verification - NMC CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 3: Professional Register Verification (NMC)', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const nmcResultCorrect = await testEndpoint(
    'NMC Professional Register - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/nmc`,
    {
      registrationNumber: '12A3456',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1990-01-15'
    }
  );
  
  if (nmcResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 8: Professional Register Verification - NMC WRONG
  results.total++;
  const nmcResultWrong = await testEndpoint(
    'NMC Professional Register - WRONG',
    'POST',
    `${BASE_URL}/api/verify/nmc`,
    {
      registrationNumber: 'INVALID999',
      firstName: 'Wrong',
      lastName: 'Name',
      dateOfBirth: '2000-01-01'
    }
  );
  
  if (nmcResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 9: Professional Register Verification - GMC CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 4: Professional Register Verification (GMC)', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const gmcResultCorrect = await testEndpoint(
    'GMC Professional Register - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/gmc`,
    {
      registrationNumber: '12345678',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1985-06-20'
    }
  );
  
  if (gmcResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 10: Professional Register Verification - GMC WRONG
  results.total++;
  const gmcResultWrong = await testEndpoint(
    'GMC Professional Register - WRONG',
    'POST',
    `${BASE_URL}/api/verify/gmc`,
    {
      registrationNumber: 'INVALID888',
      firstName: 'Fake',
      lastName: 'Doctor',
      dateOfBirth: '1995-12-31'
    }
  );
  
  if (gmcResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 11: Professional Register Verification - HCPC CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 5: Professional Register Verification (HCPC)', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const hcpcResultCorrect = await testEndpoint(
    'HCPC Professional Register - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/hcpc`,
    {
      registrationNumber: 'SW12345',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1992-03-10'
    }
  );
  
  if (hcpcResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 12: Professional Register Verification - HCPC WRONG
  results.total++;
  const hcpcResultWrong = await testEndpoint(
    'HCPC Professional Register - WRONG',
    'POST',
    `${BASE_URL}/api/verify/hcpc`,
    {
      registrationNumber: 'INVALID777',
      firstName: 'Invalid',
      lastName: 'User',
      dateOfBirth: '1980-06-15'
    }
  );
  
  if (hcpcResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 13: Right to Work Verification - CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 6: Right to Work Verification', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const rtwResultCorrect = await testEndpoint(
    'Right to Work (Share Code) - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/rtw/share-code`,
    {
      shareCode: 'ABC123DEF456',
      dateOfBirth: '1990-05-15'
    }
  );
  
  if (rtwResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 14: Right to Work Verification - WRONG
  results.total++;
  const rtwResultWrong = await testEndpoint(
    'Right to Work (Share Code) - WRONG',
    'POST',
    `${BASE_URL}/api/verify/rtw/share-code`,
    {
      shareCode: 'INVALID999',
      dateOfBirth: '2000-01-01'
    }
  );
  
  if (rtwResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 15: ECS Verification - CORRECT
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 7: ECS (Employer Checking Service) Verification', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const ecsResultCorrect = await testEndpoint(
    'ECS (Employer Checking Service) - CORRECT',
    'POST',
    `${BASE_URL}/api/verify/ecs`,
    {
      shareCode: 'XYZ789GHI012',
      dateOfBirth: '1988-11-25'
    }
  );
  
  if (ecsResultCorrect.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 16: ECS Verification - WRONG
  results.total++;
  const ecsResultWrong = await testEndpoint(
    'ECS (Employer Checking Service) - WRONG',
    'POST',
    `${BASE_URL}/api/verify/ecs`,
    {
      shareCode: 'INVALID888',
      dateOfBirth: '1995-12-31'
    }
  );
  
  if (ecsResultWrong.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 17: Invalid Professional Register
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 8: Invalid Professional Register (Error Handling)', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const invalidRegisterResult = await testEndpoint(
    'Invalid Professional Register',
    'POST',
    `${BASE_URL}/api/verify/invalid-register`,
    {
      registrationNumber: '12345',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    },
    400 // Expected 400 for invalid register
  );
  
  if (invalidRegisterResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 18: Missing Required Fields
  log('\n' + '-'.repeat(60), 'yellow');
  log('TEST 9: Missing Required Fields (Error Handling)', 'yellow');
  log('-'.repeat(60), 'yellow');
  
  results.total++;
  const missingFieldsResult = await testEndpoint(
    'Missing Required Fields',
    'POST',
    `${BASE_URL}/api/verify/rtw/share-code`,
    {
      // Missing shareCode and dateOfBirth
    },
    400 // Expected 400 for missing fields
  );
  
  if (missingFieldsResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests: ${results.total}`, 'reset');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('='.repeat(60) + '\n', 'cyan');

  if (results.failed === 0) {
    logSuccess('All tests passed!');
    process.exit(0);
  } else {
    logError(`Some tests failed. Please review the output above.`);
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch.');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

