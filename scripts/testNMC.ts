/**
 * Test NMC (Nursing and Midwifery Council) Verification
 */

import { nmcScraper } from '../src/lib/nmcScraper';

async function testNMC() {
  console.log('Testing NMC Register Verification\n');
  console.log('='.repeat(70));

  // Test 1: Invalid registration number (random data)
  console.log('\n📋 Test 1: Invalid registration number (random data)');
  console.log('-'.repeat(70));
  try {
    const result1 = await nmcScraper({
      registrationNumber: 'INVALID123',
    });
    console.log('Result:', {
      success: result1.success,
      verified: result1.verified,
      status: result1.status,
      result: result1.result,
      message: result1.message,
    });
    console.log('Expected: success=false, verified=false (should show RED - Verification Failed)');
    console.log('Actual:', result1.success === false && result1.verified === false ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Empty registration number
  console.log('\n📋 Test 2: Empty registration number');
  console.log('-'.repeat(70));
  try {
    const result2 = await nmcScraper({
      registrationNumber: '',
    });
    console.log('Result:', {
      success: result2.success,
      verified: result2.verified,
      status: result2.status,
      result: result2.result,
      message: result2.message,
    });
    console.log('Expected: success=false, verified=false (should show RED - Verification Failed)');
    console.log('Actual:', result2.success === false && result2.verified === false ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Note about testing with real registration
  console.log('\n📋 Test 3: Testing with real registration number');
  console.log('-'.repeat(70));
  console.log('To test with a real NMC registration number, use the admin verification page at:');
  console.log('http://localhost:3000/admin/verifications');
  console.log('\nSelect "Professional Registers" and choose "NMC - Nursing and Midwifery Council"');
  console.log('Enter a valid NMC registration number (PIN).');
  console.log('\nIf the registration is valid and active, you should see:');
  console.log('  - success=true, verified=true (GREEN - Verified ✓)');
  console.log('If the registration is found but inactive/suspended, you should see:');
  console.log('  - success=true, verified=false (AMBER - Not Verified - Manual Review Required)');
  console.log('If the registration is not found, you should see:');
  console.log('  - success=false, verified=false (RED - Verification Failed)');

  console.log('\n' + '='.repeat(70));
  console.log('Testing complete!');
}

testNMC().catch(console.error);

