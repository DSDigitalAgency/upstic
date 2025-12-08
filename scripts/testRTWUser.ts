/**
 * Test script for Right to Work verification with user-provided test data
 */

import { rtwScraper } from '../src/lib/rtwScraper';

async function testRTW() {
  console.log('Testing Right to Work verification...\n');
  
  const shareCode = 'W5LLFY5DN';
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const dateOfBirth = '1986-11-13'; // 13/11/1986 -> 1986-11-13
  
  console.log('Test Details:');
  console.log('  Share Code:', shareCode);
  console.log('  Date of Birth:', dateOfBirth, '(original: 13/11/1986)');
  console.log('\nStarting verification...\n');
  
  try {
    const result = await rtwScraper({
      shareCode,
      dateOfBirth,
    });
    
    console.log('\n=== Verification Result ===');
    console.log('Success:', result.success);
    console.log('Verified:', result.verified);
    console.log('Status:', result.status);
    console.log('Result:', result.result);
    console.log('Message:', result.message);
    
    if (result.details && Object.keys(result.details).length > 0) {
      console.log('\nDetails:');
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });
    }
    
    console.log('\nVerification Date:', result.verificationDate);
    console.log('Screenshot captured:', result.screenshot ? 'Yes' : 'No');
    
    if (result.screenshot) {
      console.log('\nScreenshot length:', result.screenshot.length, 'characters (base64)');
    }
    
  } catch (error) {
    console.error('\nError during verification:');
    console.error(error);
    process.exit(1);
  }
}

testRTW();

