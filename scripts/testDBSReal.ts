/**
 * Test DBS Verification with Real Certificate Data
 */

import { checkDBSCertificate } from '../src/lib/dbsScraper';

async function testRealDBS() {
  console.log('Testing DBS Update Service with Real Certificate Data\n');
  console.log('='.repeat(70));
  
  const testData = {
    certificateNumber: '001913551408',
    firstName: 'ADEROJU',
    lastName: 'KUJU',
    dob: {
      day: '27',
      month: '05',
      year: '1994',
    },
  };

  console.log('\n📋 Test Data:');
  console.log(`  Certificate Number: ${testData.certificateNumber}`);
  console.log(`  First Name: ${testData.firstName}`);
  console.log(`  Last Name: ${testData.lastName}`);
  console.log(`  Date of Birth: ${testData.dob.day}/${testData.dob.month}/${testData.dob.year}`);
  console.log('\n' + '-'.repeat(70));
  console.log('Starting verification...\n');

  try {
    const startTime = Date.now();
    const result = await checkDBSCertificate(testData);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✅ Verification Complete!\n');
    console.log('='.repeat(70));
    console.log('RESULTS');
    console.log('='.repeat(70));
    console.log(`\nSuccess: ${result.success}`);
    console.log(`Verified: ${result.verified}`);
    console.log(`Status: ${result.data.status}`);
    console.log(`Result: ${result.data.result}`);
    console.log(`\nMessage: ${result.data.message}`);
    console.log(`\nDuration: ${duration}s`);

    console.log('\n' + '-'.repeat(70));
    console.log('Full Response:');
    console.log('-'.repeat(70));
    console.log(JSON.stringify(result, null, 2));

    // Determine expected UI display
    console.log('\n' + '='.repeat(70));
    console.log('EXPECTED UI DISPLAY:');
    console.log('='.repeat(70));
    
    if (result.success && result.verified) {
      console.log('🟢 GREEN - "Verified ✓"');
      console.log('   The certificate is valid and current.');
    } else if (result.success && !result.verified) {
      console.log('🟡 AMBER - "Not Verified - Manual Review Required"');
      console.log('   The certificate exists but may not be current or has issues.');
    } else {
      console.log('🔴 RED - "Verification Failed"');
      console.log('   The certificate was not found or details do not match.');
    }

    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Error during verification:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testRealDBS().catch(console.error);

