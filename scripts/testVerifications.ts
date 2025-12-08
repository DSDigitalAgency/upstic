/**
 * Automated Test Suite for Verification Services
 * Tests DBS Update Service and Right to Work verification
 */

import { checkDBSCertificate } from '../src/lib/dbsScraper';
import { rtwScraper } from '../src/lib/rtwScraper';

interface TestResult {
  name: string;
  passed: boolean;
  expected: { success: boolean; verified: boolean };
  actual: { success: boolean; verified: boolean };
  message?: string;
  error?: string;
}

const testResults: TestResult[] = [];

function logTest(name: string, expected: { success: boolean; verified: boolean }, actual: { success: boolean; verified: boolean }, message?: string, error?: string) {
  const passed = expected.success === actual.success && expected.verified === actual.verified;
  testResults.push({ name, passed, expected, actual, message, error });
  
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status} - ${name}`);
  console.log(`  Expected: success=${expected.success}, verified=${expected.verified}`);
  console.log(`  Actual:   success=${actual.success}, verified=${actual.verified}`);
  if (message) console.log(`  Message: ${message}`);
  if (error) console.error(`  Error: ${error}`);
}

async function testDBS() {
  console.log('\n' + '='.repeat(70));
  console.log('DBS UPDATE SERVICE VERIFICATION TESTS');
  console.log('='.repeat(70));

  // Test 1: Invalid certificate number (random data)
  try {
    const result = await checkDBSCertificate({
      certificateNumber: 'abcd12345678',
      firstName: 'Test',
      lastName: 'User',
      dob: { day: '01', month: '01', year: '1990' },
    });
    logTest(
      'DBS Test 1: Invalid certificate number (random data)',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.data.message
    );
  } catch (error) {
    logTest(
      'DBS Test 1: Invalid certificate number (random data)',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 2: Invalid format (too short)
  try {
    const result = await checkDBSCertificate({
      certificateNumber: '123456',
      firstName: 'Test',
      lastName: 'User',
      dob: { day: '01', month: '01', year: '1990' },
    });
    logTest(
      'DBS Test 2: Invalid certificate number format (too short)',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.data.message
    );
  } catch (error) {
    logTest(
      'DBS Test 2: Invalid certificate number format (too short)',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 3: Valid format but certificate not found
  try {
    const result = await checkDBSCertificate({
      certificateNumber: '001234567890',
      firstName: 'Invalid',
      lastName: 'Name',
      dob: { day: '01', month: '01', year: '1990' },
    });
    logTest(
      'DBS Test 3: Valid format but certificate not found',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.data.message
    );
  } catch (error) {
    logTest(
      'DBS Test 3: Valid format but certificate not found',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 4: Invalid DOB format
  try {
    const result = await checkDBSCertificate({
      certificateNumber: '001234567890',
      firstName: 'Test',
      lastName: 'User',
      dob: { day: '99', month: '99', year: '1990' },
    });
    logTest(
      'DBS Test 4: Invalid date of birth',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.data.message
    );
  } catch (error) {
    logTest(
      'DBS Test 4: Invalid date of birth',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

async function testRTW() {
  console.log('\n' + '='.repeat(70));
  console.log('RIGHT TO WORK VERIFICATION TESTS');
  console.log('='.repeat(70));

  // Test 1: Invalid share code format
  try {
    const result = await rtwScraper({
      shareCode: 'INVALID',
      dateOfBirth: '1990-01-01',
    });
    logTest(
      'RTW Test 1: Invalid share code format',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.message
    );
  } catch (error) {
    logTest(
      'RTW Test 1: Invalid share code format',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 2: Invalid share code (random data)
  try {
    const result = await rtwScraper({
      shareCode: 'ABCD12345',
      dateOfBirth: '1990-01-01',
    });
    logTest(
      'RTW Test 2: Invalid share code (random data)',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.message
    );
  } catch (error) {
    logTest(
      'RTW Test 2: Invalid share code (random data)',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 3: Invalid date of birth format
  try {
    const result = await rtwScraper({
      shareCode: 'W5LLFY5DN',
      dateOfBirth: 'invalid-date',
    });
    logTest(
      'RTW Test 3: Invalid date of birth format',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.message
    );
  } catch (error) {
    logTest(
      'RTW Test 3: Invalid date of birth format',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 4: Valid format but share code not found
  try {
    const result = await rtwScraper({
      shareCode: 'ABCDEFGHI',
      dateOfBirth: '1990-01-01',
    });
    logTest(
      'RTW Test 4: Valid format but share code not found',
      { success: false, verified: false },
      { success: result.success, verified: result.verified },
      result.message
    );
  } catch (error) {
    logTest(
      'RTW Test 4: Valid format but share code not found',
      { success: false, verified: false },
      { success: false, verified: false },
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Automated Verification Tests...\n');
  const startTime = Date.now();

  try {
    await testDBS();
    await testRTW();
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(t => !t.passed).forEach(test => {
      console.log(`  - ${test.name}`);
      console.log(`    Expected: success=${test.expected.success}, verified=${test.expected.verified}`);
      console.log(`    Actual:   success=${test.actual.success}, verified=${test.actual.verified}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

