// Test script for DBS verification API with raw format
const API_URL = 'https://perform-check.upstic.com/status/check?raw=1';

// Correct details
const correctDetails = {
  organisationName: "New Gen",
  requesterForename: "Kalis",
  requesterSurname: "Reddy",
  certificateNumber: "001913551408",
  applicantSurname: "KUJU",
  dob: {
    day: "27",
    month: "5",
    year: "1994"
  }
};

// Incorrect certificate number
const incorrectCertificateNumber = {
  organisationName: "New Gen",
  requesterForename: "Kalis",
  requesterSurname: "Reddy",
  certificateNumber: "00191355140899", // Wrong
  applicantSurname: "KUJU",
  dob: {
    day: "27",
    month: "5",
    year: "1994"
  }
};

async function testRawFormat(testName, payload) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${testName} (RAW FORMAT)`);
  console.log(`${'='.repeat(80)}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check what our validation would see
    console.log('\n--- Validation Analysis ---');
    console.log('ok:', data.ok);
    
    // In raw format, fields are at top level
    const personName = data.personName || '';
    const dateOfBirth = data.dateOfBirth || '';
    const certificateNumber = data.certificateNumber || '';
    const certificatePrintDate = data.certificatePrintDate || '';
    const outcome = data.outcome || '';
    
    console.log('personName:', personName || '(EMPTY)');
    console.log('dateOfBirth:', dateOfBirth || '(EMPTY)');
    console.log('certificateNumber:', certificateNumber || '(EMPTY)');
    console.log('certificatePrintDate:', certificatePrintDate || '(EMPTY)');
    console.log('outcome:', outcome || '(EMPTY)');
    
    const hasPersonName = personName && personName.trim() !== '';
    const hasDateOfBirth = dateOfBirth && dateOfBirth.trim() !== '';
    const hasCertificateNumber = certificateNumber && certificateNumber.trim() !== '';
    const hasOutcome = outcome && ['clear_and_current', 'current', 'not_current'].includes(outcome);
    
    console.log('\nValidation Checks:');
    console.log('  hasPersonName:', hasPersonName);
    console.log('  hasDateOfBirth:', hasDateOfBirth);
    console.log('  hasCertificateNumber:', hasCertificateNumber);
    console.log('  hasOutcome:', hasOutcome);
    console.log('  data.ok === true:', data.ok === true);
    
    // Our validation logic
    const shouldPass = data.ok === true && hasPersonName && hasDateOfBirth && hasCertificateNumber && hasOutcome;
    
    console.log('\n✅ Should Pass Verification:', shouldPass);
    console.log('❌ Should Fail Verification:', !shouldPass);
    
    if (hasPersonName && payload.applicantSurname) {
      const surnameMatch = personName.toUpperCase().includes(payload.applicantSurname.toUpperCase());
      console.log('\nSurname Check:');
      console.log('  Submitted surname:', payload.applicantSurname);
      console.log('  Person name:', personName);
      console.log('  Surname matches:', surnameMatch);
    }
    
    if (hasCertificateNumber) {
      const certMatch = certificateNumber.trim().toUpperCase() === payload.certificateNumber.trim().toUpperCase();
      console.log('\nCertificate Number Check:');
      console.log('  Submitted:', payload.certificateNumber);
      console.log('  Returned:', certificateNumber);
      console.log('  Cert numbers match:', certMatch);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('\n🔍 DBS Verification API Test (RAW FORMAT)');
  console.log('Testing against:', API_URL);
  
  await testRawFormat('Correct Details', correctDetails);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testRawFormat('Incorrect Certificate Number', incorrectCertificateNumber);
  
  console.log('\n' + '='.repeat(80) + '\n');
}

runTests().catch(console.error);

