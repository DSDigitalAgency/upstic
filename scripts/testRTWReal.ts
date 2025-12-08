/**
 * Test Right to Work Verification with Real Share Code Data
 */

import { rtwScraper } from '../src/lib/rtwScraper';

async function testRealRTW() {
  console.log('Testing Right to Work Verification with Real Share Code Data\n');
  console.log('='.repeat(70));
  
  const testData = {
    shareCode: 'W5LLFY5DN',
    dateOfBirth: '1986-11-13', // Format: YYYY-MM-DD
  };

  console.log('\n📋 Test Data:');
  console.log(`  Share Code: ${testData.shareCode}`);
  console.log(`  Date of Birth: ${testData.dateOfBirth} (13/11/1986)`);
  console.log('\n' + '-'.repeat(70));
  console.log('Starting verification...\n');

  try {
    const startTime = Date.now();
    const result = await rtwScraper(testData);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✅ Verification Complete!\n');
    console.log('='.repeat(70));
    console.log('RESULTS');
    console.log('='.repeat(70));
    console.log(`\nSuccess: ${result.success}`);
    console.log(`Verified: ${result.verified}`);
    console.log(`Status: ${result.status}`);
    console.log(`Result: ${result.result}`);
    console.log(`\nMessage: ${result.message}`);
    
    if (result.details && Object.keys(result.details).length > 0) {
      console.log('\nDetails:');
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    console.log(`\nDuration: ${duration}s`);

    console.log('\n' + '-'.repeat(70));
    console.log('Full Response:');
    console.log('-'.repeat(70));
    const responseToShow = { ...result };
    // Remove screenshot from display if present (it's very long)
    if (responseToShow.screenshot) {
      responseToShow.screenshot = '[Base64 screenshot data - removed for display]';
    }
    console.log(JSON.stringify(responseToShow, null, 2));

    // Determine expected UI display
    console.log('\n' + '='.repeat(70));
    console.log('EXPECTED UI DISPLAY:');
    console.log('='.repeat(70));
    
    if (result.success && result.verified) {
      console.log('🟢 GREEN - "Verified ✓"');
      console.log('   The applicant has the right to work in the UK.');
    } else if (result.success && !result.verified) {
      console.log('🟡 AMBER - "Not Verified - Manual Review Required"');
      console.log('   The applicant does not have the right to work or verification needs review.');
    } else {
      console.log('🔴 RED - "Verification Failed"');
      console.log('   The share code was invalid, expired, or details do not match.');
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

testRealRTW().catch(console.error);

