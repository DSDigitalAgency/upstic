// Test script for DBS verification API
// Tests both correct and incorrect certificate details

const API_URL = 'https://perform-check.upstic.com/status/check';

// Test case 1: Correct details (should pass)
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

// Test case 2: Incorrect certificate number (should fail)
const incorrectCertificateNumber = {
  organisationName: "New Gen",
  requesterForename: "Kalis",
  requesterSurname: "Reddy",
  certificateNumber: "00191355140899", // Wrong certificate number
  applicantSurname: "KUJU",
  dob: {
    day: "27",
    month: "5",
    year: "1994"
  }
};

// Test case 3: Incorrect surname (should fail)
const incorrectSurname = {
  organisationName: "New Gen",
  requesterForename: "Kalis",
  requesterSurname: "Reddy",
  certificateNumber: "001913551408",
  applicantSurname: "SMITH", // Wrong surname
  dob: {
    day: "27",
    month: "5",
    year: "1994"
  }
};

// Test case 4: Incorrect date of birth (should fail)
const incorrectDOB = {
  organisationName: "New Gen",
  requesterForename: "Kalis",
  requesterSurname: "Reddy",
  certificateNumber: "001913551408",
  applicantSurname: "KUJU",
  dob: {
    day: "1",
    month: "1",
    year: "2000" // Wrong date of birth
  }
};

async function testDBSVerification(testName, payload) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${testName}`);
  console.log(`${'='.repeat(80)}`);
  console.log('Request Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\nMaking API call...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Analyze the response
    console.log('\n--- Analysis ---');
    console.log('ok:', data.ok);
    console.log('has structured:', !!data.structured);
    
    if (data.structured) {
      console.log('personName:', data.structured.personName || '(empty)');
      console.log('dateOfBirth:', data.structured.dateOfBirth || '(empty)');
      console.log('certificateNumber:', data.structured.certificateNumber || '(empty)');
      console.log('certificatePrintDate:', data.structured.certificatePrintDate || '(empty)');
      console.log('outcome:', data.structured.outcome || '(empty)');
      console.log('outcomeText:', data.structured.outcomeText ? data.structured.outcomeText.substring(0, 100) + '...' : '(empty)');
      
      // Check validation criteria
      const hasPersonName = data.structured.personName && data.structured.personName.trim() !== '';
      const hasDateOfBirth = data.structured.dateOfBirth && data.structured.dateOfBirth.trim() !== '';
      const hasCertificateNumber = data.structured.certificateNumber && data.structured.certificateNumber.trim() !== '';
      const hasOutcome = data.structured.outcome && ['clear_and_current', 'current', 'not_current'].includes(data.structured.outcome);
      
      console.log('\nValidation Checks:');
      console.log('  - hasPersonName:', hasPersonName);
      console.log('  - hasDateOfBirth:', hasDateOfBirth);
      console.log('  - hasCertificateNumber:', hasCertificateNumber);
      console.log('  - hasOutcome:', hasOutcome);
      
      const shouldPass = hasPersonName && hasDateOfBirth && hasCertificateNumber && hasOutcome && data.ok === true;
      console.log('\nShould Pass Verification:', shouldPass);
      
      // Check surname match
      if (hasPersonName) {
        const personNameUpper = data.structured.personName.trim().toUpperCase();
        const surnameUpper = payload.applicantSurname.trim().toUpperCase();
        const surnameMatch = personNameUpper.includes(surnameUpper);
        console.log('  - surname in personName:', surnameMatch, `(${payload.applicantSurname} in ${data.structured.personName})`);
        if (!surnameMatch) {
          console.log('  ⚠️  Surname mismatch - verification should FAIL');
        }
      }
      
      // Check certificate number match
      if (hasCertificateNumber) {
        const returnedCert = data.structured.certificateNumber.trim().toUpperCase();
        const submittedCert = payload.certificateNumber.trim().toUpperCase();
        const certMatch = returnedCert === submittedCert;
        console.log('  - certificate number match:', certMatch, `(submitted: ${submittedCert}, returned: ${returnedCert})`);
        if (!certMatch) {
          console.log('  ⚠️  Certificate number mismatch - verification should FAIL');
        }
      }
    }
    
    console.log('\nExpected Result:', testName.includes('Correct') ? 'PASS' : 'FAIL');
    console.log('Actual Result:', data.ok === true && data.structured?.personName && data.structured?.dateOfBirth ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runAllTests() {
  console.log('\n🔍 DBS Verification API Test Suite');
  console.log('Testing against:', API_URL);
  
  await testDBSVerification('Correct Details', correctDetails);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  
  await testDBSVerification('Incorrect Certificate Number', incorrectCertificateNumber);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testDBSVerification('Incorrect Surname', incorrectSurname);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testDBSVerification('Incorrect Date of Birth', incorrectDOB);
  
  console.log('\n' + '='.repeat(80));
  console.log('All tests completed!');
  console.log('='.repeat(80) + '\n');
}

// Run the tests
runAllTests().catch(console.error);

