import { checkDBSCertificate } from '../src/lib/dbsScraper';

async function testDBS() {
  console.log('Testing DBS Update Service Verification\n');
  console.log('='.repeat(60));

  // Test 1: Invalid certificate number (random data like "abcd")
  console.log('\n📋 Test 1: Invalid certificate number (random data)');
  console.log('-'.repeat(60));
  try {
    const result1 = await checkDBSCertificate({
      certificateNumber: 'abcd12345678',
      firstName: 'Test',
      lastName: 'User',
      dob: { day: '01', month: '01', year: '1990' },
    });
    console.log('Result:', {
      success: result1.success,
      verified: result1.verified,
      status: result1.data.status,
      result: result1.data.result,
      message: result1.data.message,
    });
    console.log('Expected: success=false, verified=false (should show RED - Verification Failed)');
    console.log('Actual:', result1.success === false && result1.verified === false ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Invalid format (too short)
  console.log('\n📋 Test 2: Invalid certificate number format (too short)');
  console.log('-'.repeat(60));
  try {
    const result2 = await checkDBSCertificate({
      certificateNumber: '123456',
      firstName: 'Test',
      lastName: 'User',
      dob: { day: '01', month: '01', year: '1990' },
    });
    console.log('Result:', {
      success: result2.success,
      verified: result2.verified,
      status: result2.data.status,
      result: result2.data.result,
      message: result2.data.message,
    });
    console.log('Expected: success=false, verified=false (should show RED - Verification Failed)');
    console.log('Actual:', result2.success === false && result2.verified === false ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Valid format but likely not found
  console.log('\n📋 Test 3: Valid format but certificate not found');
  console.log('-'.repeat(60));
  try {
    const result3 = await checkDBSCertificate({
      certificateNumber: '001234567890',
      firstName: 'Invalid',
      lastName: 'Name',
      dob: { day: '01', month: '01', year: '1990' },
    });
    console.log('Result:', {
      success: result3.success,
      verified: result3.verified,
      status: result3.data.status,
      result: result3.data.result,
      message: result3.data.message,
    });
    console.log('Expected: success=false, verified=false (should show RED - Verification Failed)');
    console.log('Actual:', result3.success === false && result3.verified === false ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 4: Note about testing with real certificate
  console.log('\n📋 Test 4: Testing with real certificate');
  console.log('-'.repeat(60));
  console.log('To test with a real certificate, use the admin verification page at:');
  console.log('http://localhost:3000/admin/verifications');
  console.log('\nEnter a valid certificate number, first name, last name, and DOB.');
  console.log('If the certificate is valid and current, you should see:');
  console.log('  - success=true, verified=true (GREEN - Verified ✓)');
  console.log('If the certificate exists but is not current, you should see:');
  console.log('  - success=true, verified=false (AMBER - Not Verified - Manual Review Required)');
  console.log('If the certificate is not found, you should see:');
  console.log('  - success=false, verified=false (RED - Verification Failed)');

  console.log('\n' + '='.repeat(60));
  console.log('Testing complete!');
}

testDBS().catch(console.error);

