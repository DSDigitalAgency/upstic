/**
 * GMC Verification Test Script
 * 
 * Tests GMC verification with real test data:
 * - 7596231, 7488738, 6166983, A8142667
 * 
 * Note: Only registration number is required for GMC verification
 */

import { gmcScraper } from '../src/lib/gmcScraper';

interface TestCase {
  name: string;
  registrationNumber: string;
  expectedSuccess: boolean;
  expectedVerified?: boolean;
  description?: string;
}

const testCases: TestCase[] = [
  // Valid GMC registration tests
  {
    name: 'GMC Registration - 7596231',
    registrationNumber: '7596231',
    expectedSuccess: true,
    expectedVerified: true,
    description: 'Should find Andrew James STREET, Registered with a licence to practise',
  },
  {
    name: 'GMC Registration - 7488738',
    registrationNumber: '7488738',
    expectedSuccess: true,
    expectedVerified: true,
  },
  {
    name: 'GMC Registration - 6166983',
    registrationNumber: '6166983',
    expectedSuccess: true,
    expectedVerified: true,
  },
  {
    name: 'GMC Registration - A8142667',
    registrationNumber: 'A8142667',
    expectedSuccess: true,
    expectedVerified: true,
    description: 'PA (Physician Associate) registration',
  },
  // Invalid test cases
  {
    name: 'Invalid registration number',
    registrationNumber: 'INVALID123',
    expectedSuccess: false,
    expectedVerified: false,
    description: 'Should return not_found for invalid registration',
  },
];

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
    if (details.registrationStatus) {
      console.log(`    Registration Status: ${details.registrationStatus}`);
    }
    if (details.gpRegisterStatus) {
      console.log(`    GP Register: ${details.gpRegisterStatus}`);
    }
    if (details.specialistRegisterStatus) {
      console.log(`    Specialist Register: ${details.specialistRegisterStatus}`);
    }
    if (details.registeredQualification) {
      console.log(`    Qualification: ${details.registeredQualification}`);
    }
  }
  if (actual.screenshot) {
    console.log(`  Screenshot: ✅ Captured (${(actual.screenshot.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  Screenshot: ❌ Not captured`);
  }
  if (actual.pdf) {
    console.log(`  PDF: ✅ Generated (${(actual.pdf.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  PDF: ❌ Not generated`);
  }
}

async function testGMC() {
  console.log('\n' + '='.repeat(80));
  console.log('GMC REGISTER VERIFICATION TESTS');
  console.log('='.repeat(80));
  console.log(`Test Cases: ${testCases.length}`);
  console.log(`Note: Only registration number is required for GMC verification\n`);

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`[${i + 1}/${testCases.length}] Testing: ${testCase.name}`);
      console.log(`  Registration Number: ${testCase.registrationNumber}`);
      if (testCase.description) {
        console.log(`  Description: ${testCase.description}`);
      }
      console.log(`  Expected: success=${testCase.expectedSuccess}, verified=${testCase.expectedVerified ?? 'N/A'}`);

      const testStartTime = Date.now();
      const result = await gmcScraper({
        registrationNumber: testCase.registrationNumber,
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
        screenshot: result.screenshot,
        pdf: result.pdf,
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

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  console.log(`Total Duration: ${totalDuration}s`);
  console.log('='.repeat(80) + '\n');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testGMC().catch(console.error);
