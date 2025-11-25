// Test against local API endpoint (requires dev server running)
const LOCAL_API_URL = 'http://localhost:3000/api/dbs-verify';
// Or test directly against the external DBS service
const EXTERNAL_API_URL = 'https://perform-check.upstic.com/status/check?raw=1';

// Use local API by default, set to 'external' to test external service directly
const USE_EXTERNAL = process.env.TEST_EXTERNAL === 'true';
const API_URL = USE_EXTERNAL ? EXTERNAL_API_URL : LOCAL_API_URL;

// Test data provided by user
const testData = {
  certificateNumber: '001913551408',
  applicantSurname: 'KUJU',
  dob: {
    day: '27',
    month: '5',
    year: '1994'
  }
};

// Full payload for external API (includes organisation and requester details)
const externalTestData = {
  organisationName: 'New Gen',
  requesterForename: 'Kalis',
  requesterSurname: 'Reddy',
  certificateNumber: '001913551408',
  applicantSurname: 'KUJU',
  dob: {
    day: '27',
    month: '5',
    year: '1994'
  }
};

async function testDBSVerification() {
  console.log('\n🔍 Testing DBS Verification API');
  console.log('='.repeat(80));
  console.log('Test Data:');
  console.log('  Name: ADEROJU KUJU');
  console.log('  Date of Birth: 27/05/1994');
  console.log('  Certificate Number: 001913551408');
  console.log('='.repeat(80));
  
  const payload = USE_EXTERNAL ? externalTestData : testData;
  console.log('\nRequest Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\nMaking API call to:', API_URL);
  if (!USE_EXTERNAL) {
    console.log('(Make sure the dev server is running: npm run dev)');
  }
  console.log('');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('\nResponse Data:');
    console.log(JSON.stringify(result, null, 2));
    
    // Analyze the response
    console.log('\n' + '='.repeat(80));
    console.log('Analysis:');
    console.log('='.repeat(80));
    
    // Handle both response formats:
    // 1. Our wrapper API: { success: true, data: { ok: true, structured: {...} } }
    // 2. External API (raw format): { ok: true, personName: "...", ... }
    // 3. External API (full format): { ok: true, structured: {...} }
    
    let verificationData: any = null;
    let verificationOk = false;
    let errorMessage = '';
    
    if (result.success && result.data) {
      // Our wrapper API format
      verificationData = result.data.structured || result.data;
      verificationOk = result.data.ok === true;
      errorMessage = result.data.error || '';
      console.log('✅ API call successful (via wrapper)');
    } else if (result.ok !== undefined) {
      // Direct external API format
      verificationData = result.structured || result;
      verificationOk = result.ok === true;
      errorMessage = result.error || '';
      console.log('✅ API call successful (direct external API)');
    } else {
      // Error response
      verificationOk = false;
      errorMessage = result.error || 'Unknown error';
      console.log('❌ API call failed');
    }
    
    console.log('Verification Result:', verificationOk ? '✅ PASSED' : '❌ FAILED');
    
    if (verificationOk) {
      console.log('\n✅ DBS Verification PASSED!');
      if (verificationData) {
        console.log('\nCertificate Details:');
        console.log('  Person Name:', verificationData.personName || '(not provided)');
        console.log('  Date of Birth:', verificationData.dateOfBirth || '(not provided)');
        console.log('  Certificate Number:', verificationData.certificateNumber || '(not provided)');
        console.log('  Certificate Print Date:', verificationData.certificatePrintDate || '(not provided)');
        console.log('  Outcome:', verificationData.outcome || '(not provided)');
        if (verificationData.outcomeText) {
          const outcomeText = verificationData.outcomeText.length > 150 
            ? verificationData.outcomeText.substring(0, 150) + '...' 
            : verificationData.outcomeText;
          console.log('  Outcome Text:', outcomeText);
        }
        
        // Validation checks
        console.log('\nValidation Checks:');
        const hasPersonName = verificationData.personName && verificationData.personName.trim() !== '';
        const hasDateOfBirth = verificationData.dateOfBirth && verificationData.dateOfBirth.trim() !== '';
        const hasCertificateNumber = verificationData.certificateNumber && verificationData.certificateNumber.trim() !== '';
        const hasOutcome = verificationData.outcome && ['clear_and_current', 'current', 'not_current'].includes(verificationData.outcome);
        
        console.log('  ✓ Has Person Name:', hasPersonName ? '✅' : '❌');
        console.log('  ✓ Has Date of Birth:', hasDateOfBirth ? '✅' : '❌');
        console.log('  ✓ Has Certificate Number:', hasCertificateNumber ? '✅' : '❌');
        console.log('  ✓ Has Valid Outcome:', hasOutcome ? '✅' : '❌');
        
        // Check certificate number match
        if (hasCertificateNumber) {
          const returnedCert = verificationData.certificateNumber.trim().toUpperCase().replace(/[\s\-_]/g, '');
          const submittedCert = payload.certificateNumber.trim().toUpperCase().replace(/[\s\-_]/g, '');
          const certMatch = returnedCert === submittedCert;
          console.log('  ✓ Certificate Number Match:', certMatch ? '✅' : '❌', 
            `(submitted: ${payload.certificateNumber}, returned: ${verificationData.certificateNumber})`);
        }
        
        // Check surname match
        if (hasPersonName && payload.applicantSurname) {
          const personNameUpper = verificationData.personName.trim().toUpperCase();
          const surnameUpper = payload.applicantSurname.trim().toUpperCase();
          const surnameMatch = personNameUpper.includes(surnameUpper);
          console.log('  ✓ Surname in Person Name:', surnameMatch ? '✅' : '⚠️', 
            `(${payload.applicantSurname} in ${verificationData.personName})`);
        }
      }
    } else {
      console.log('\n❌ DBS Verification FAILED');
      console.log('Error:', errorMessage || 'Unknown error');
      if (verificationData) {
        console.log('\nReturned Data (for debugging):');
        console.log(JSON.stringify(verificationData, null, 2));
      }
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('Test completed!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. Make sure the dev server is running:');
      console.error('   npm run dev');
    }
    console.error('\n');
  }
}

// Run the test
testDBSVerification();

