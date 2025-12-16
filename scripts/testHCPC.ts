/**
 * HCPC Verification Test Script
 * 
 * Tests HCPC verification with real test data:
 * - Occupational Therapist: OT61642, OT74314
 * - Dietitian: DT035366, DT034289
 * 
 * Note: Profession is REQUIRED for HCPC verification
 */

import { hcpcScraper } from '../src/lib/hcpcScraper';

interface TestCase {
  name: string;
  registrationNumber: string;
  profession: string;
  expectedSuccess: boolean;
  expectedVerified?: boolean;
  description?: string;
}

const testCases: TestCase[] = [
  // Valid Occupational Therapist tests
  {
    name: 'Occupational Therapist - OT61642',
    registrationNumber: 'OT61642',
    profession: 'Occupational therapist',
    expectedSuccess: true,
    expectedVerified: true,
    description: 'Should find Lindsey Matthew, Registered, Location: Upton, Period: 01/11/2025 to 31/10/2027',
  },
  {
    name: 'Occupational Therapist - OT74314',
    registrationNumber: 'OT74314',
    profession: 'Occupational therapist',
    expectedSuccess: true,
    expectedVerified: true,
  },
  // Valid Dietitian tests
  {
    name: 'Dietitian - DT035366',
    registrationNumber: 'DT035366',
    profession: 'Dietitian',
    expectedSuccess: true,
    expectedVerified: true,
  },
  {
    name: 'Dietitian - DT034289',
    registrationNumber: 'DT034289',
    profession: 'Dietitian',
    expectedSuccess: true,
    expectedVerified: true,
  },
  // Test with different profession name variations
  {
    name: 'Occupational Therapist - OT61642 (lowercase profession)',
    registrationNumber: 'OT61642',
    profession: 'occupational therapist',
    expectedSuccess: true,
    expectedVerified: true,
    description: 'Should handle lowercase profession name',
  },
  {
    name: 'Dietitian - DT035366 (alternative spelling)',
    registrationNumber: 'DT035366',
    profession: 'dietitian',
    expectedSuccess: true,
    expectedVerified: true,
    description: 'Should handle alternative profession spelling',
  },
  // Invalid test cases
  {
    name: 'Invalid registration number',
    registrationNumber: 'INVALID123',
    profession: 'Occupational therapist',
    expectedSuccess: false,
    expectedVerified: false,
    description: 'Should return not_found for invalid registration',
  },
  {
    name: 'Valid registration but wrong profession',
    registrationNumber: 'OT61642',
    profession: 'Dietitian',
    expectedSuccess: false,
    expectedVerified: false,
    description: 'Should fail when profession does not match registration',
  },
];

// Test case for missing profession (should fail validation)
const testMissingProfession = async () => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log('[VALIDATION TEST] Testing missing profession requirement');
  console.log('  Registration Number: OT61642');
  console.log('  Profession: (missing)');
  console.log('  Expected: success=false, error message about missing profession');

  try {
    // @ts-ignore - Intentionally passing undefined to test validation
    const result = await hcpcScraper({
      registrationNumber: 'OT61642',
      profession: undefined as any,
    });

    if (!result.success && result.status === 'error' && result.message.includes('required')) {
      console.log('  ✅ PASS - Correctly rejected missing profession');
      console.log(`  Message: ${result.message}`);
      return true;
    } else {
      console.log('  ❌ FAIL - Should have rejected missing profession');
      console.log(`  Actual result: success=${result.success}, status=${result.status}`);
      return false;
    }
  } catch (error) {
    console.log('  ✅ PASS - Correctly threw error for missing profession');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return true;
  }
};

function logTest(
  testName: string,
  expected: { success: boolean; verified?: boolean },
  actual: { success: boolean; verified?: boolean },
  message?: string,
  error?: string,
  details?: any
) {
  const passed = 
    expected.success === actual.success &&
    (expected.verified === undefined || expected.verified === actual.verified);
  
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status} - ${testName}`);
  console.log(`  Expected: success=${expected.success}, verified=${expected.verified ?? 'N/A'}`);
  console.log(`  Actual:   success=${actual.success}, verified=${actual.verified ?? 'N/A'}`);
  console.log(`  Status:   ${actual.status ?? 'N/A'}`);
  console.log(`  Result:   ${actual.result ?? 'N/A'}`);
  if (message) {
    console.log(`  Message:  ${message}`);
  }
  if (error) {
    console.log(`  Error:    ${error}`);
  }
  if (details) {
    console.log(`  Details:`);
    if (details.fullName) {
      console.log(`    Name: ${details.fullName}`);
    }
    if (details.registrationNumber) {
      console.log(`    Registration Number: ${details.registrationNumber}`);
    }
    if (details.location) {
      console.log(`    Location: ${details.location}`);
    }
    if (details.registrationStatus) {
      console.log(`    Status: ${details.registrationStatus}`);
    }
    if (details.period) {
      console.log(`    Period: ${details.period}`);
    }
    if (details.profession) {
      console.log(`    Profession: ${details.profession}`);
    }
  }
}

async function testHCPC() {
  console.log('\n' + '='.repeat(80));
  console.log('HCPC REGISTER VERIFICATION TESTS');
  console.log('='.repeat(80));
  console.log(`Test Cases: ${testCases.length}`);
  console.log(`Note: Profession is REQUIRED for HCPC verification\n`);

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`[${i + 1}/${testCases.length}] Testing: ${testCase.name}`);
      console.log(`  Registration Number: ${testCase.registrationNumber}`);
      console.log(`  Profession: ${testCase.profession}`);
      if (testCase.description) {
        console.log(`  Description: ${testCase.description}`);
      }
      console.log(`  Expected: success=${testCase.expectedSuccess}, verified=${testCase.expectedVerified ?? 'N/A'}`);

      const testStartTime = Date.now();
      const result = await hcpcScraper({
        registrationNumber: testCase.registrationNumber,
        profession: testCase.profession,
      });
      const testDuration = ((Date.now() - testStartTime) / 1000).toFixed(2);

      const expected = {
        success: testCase.expectedSuccess,
        verified: testCase.expectedVerified,
      };

      const actual = {
        success: result.success,
        verified: result.verified,
        status: result.status,
        result: result.result,
      };

      const testPassed = 
        expected.success === actual.success &&
        (expected.verified === undefined || expected.verified === actual.verified);

      logTest(
        testCase.name,
        expected,
        actual,
        result.message,
        result.status === 'error' ? result.message : undefined,
        result.details
      );

      console.log(`  Duration: ${testDuration}s`);

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }

      // Add delay between tests to avoid rate limiting
      if (i < testCases.length - 1) {
        console.log(`  Waiting 3 seconds before next test...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`\n❌ ERROR - ${testCase.name}`);
      console.error(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.stack) {
        console.error(`  Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
      failed++;
    }
  }

  // Test missing profession validation
  console.log(`\n${'='.repeat(80)}`);
  console.log('VALIDATION TESTS');
  console.log('='.repeat(80));
  const validationPassed = await testMissingProfession();
  if (!validationPassed) {
    failed++;
  } else {
    passed++;
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${testCases.length + 1} (${testCases.length} functional + 1 validation)`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (testCases.length + 1)) * 100).toFixed(1)}%`);
  console.log(`Total Duration: ${totalDuration}s`);
  console.log('='.repeat(80) + '\n');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testHCPC().catch(console.error);
