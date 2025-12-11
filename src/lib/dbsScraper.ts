import { chromium, Browser } from 'playwright';

export interface DBSCheckRequest {
  certificateNumber: string;
  firstName: string;
  lastName: string;
  dob: {
    day: string;
    month: string;
    year: string;
  };
  // Organization details for the check
  organisationName?: string;
  checkerFirstName?: string;
  checkerLastName?: string;
}

export interface DBSCheckResult {
  success: boolean;
  verified: boolean;
  data: {
    certificateNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string;
    status: 'current' | 'current_with_info' | 'not_current' | 'not_registered' | 'not_found' | 'error';
    result: string;
    message: string;
    verificationDate: string;
  };
  error?: string;
}

const DBS_CHECK_URL = 'https://secure.crbonline.gov.uk/crsc/check';

export async function checkDBSCertificate(request: DBSCheckRequest): Promise<DBSCheckResult> {
  let browser: Browser | null = null;
  
  const { 
    certificateNumber, 
    firstName, 
    lastName, 
    dob,
    organisationName = 'Upstic Healthcare',
    checkerFirstName = 'HR',
    checkerLastName = 'Department'
  } = request;
  
  const fullName = `${firstName.trim()} ${lastName.trim()}`.toUpperCase();
  const dateOfBirth = `${dob.day.padStart(2, '0')}/${dob.month.padStart(2, '0')}/${dob.year}`;

  try {
    console.log('Launching browser for DBS check...');
    
    // Launch browser in headless mode
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    // ========== STEP 1: Organization Details ==========
    console.log('Step 1: Navigating to DBS Update Service...');
    await page.goto(DBS_CHECK_URL, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    // Fill organization details (Step 1)
    console.log('Filling organization details...');
    await page.fill('input[name="organisationName"]', organisationName);
    await page.fill('input[name="forename"]', checkerFirstName);
    await page.fill('input[name="surname"]', checkerLastName);

    // Click Continue button
    console.log('Submitting Step 1...');
    await page.click('input[name="_eventId_submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // ========== STEP 2: Certificate Details ==========
    console.log('Step 2: Filling certificate details...');
    const step2Url = page.url();
    console.log('Current URL:', step2Url);

    // Fill certificate number
    await page.fill('input[name="certificateNumber"]', certificateNumber);
    
    // Fill applicant's surname (the person being checked)
    await page.fill('input[name="surname"]', lastName);
    
    // Fill date of birth
    await page.fill('input[name="dayOfBirth"]', dob.day.padStart(2, '0'));
    await page.fill('input[name="monthOfBirth"]', dob.month.padStart(2, '0'));
    await page.fill('input[name="yearOfBirth"]', dob.year);

    // The form uses JavaScript for submission. We need to:
    // 1. Set the hidden _eventId_submit field to 'submit'
    // 2. Submit the form
    console.log('Submitting certificate check...');
    
    // Method 1: Try clicking the JS button and wait for navigation
    const currentUrl = page.url();
    
    await page.evaluate(() => {
      // Set the hidden field
      const hiddenField = document.querySelector('input[name="_eventId_submit"]') as HTMLInputElement;
      if (hiddenField) {
        hiddenField.value = 'submit';
      }
      
      // Get the form and submit it directly
      const form = document.querySelector('form#subscriberDetailsForm') as HTMLFormElement;
      if (form) {
        form.submit();
      }
    });
    
    // Wait for page to change
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Check if URL changed (indicates form was submitted)
    const newUrl = page.url();
    console.log('After submit URL:', newUrl);
    
    // If URL didn't change, try clicking the button
    if (newUrl === currentUrl || newUrl.includes('e1s2')) {
      console.log('Form may not have submitted, trying button click...');
      
      // Try clicking the button with JavaScript
      await page.evaluate(() => {
        const btn = document.getElementById('jsSubmit') as HTMLInputElement;
        if (btn) {
          btn.click();
        }
      });
      
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
    }

    // ========== STEP 3: Results ==========
    console.log('Step 3: Getting results...');
    const resultsUrl = page.url();
    console.log('Results URL:', resultsUrl);

    // Get the result page content
    const resultContent = await page.textContent('body') || '';
    
    // Check if we're on a results page (s3) or still on form page (s2)
    const isResultPage = resultsUrl.includes('s3') || resultsUrl.includes('s4') || 
                         !resultsUrl.includes('s2') || 
                         resultContent.includes('Status check result');

    console.log('Is result page:', isResultPage);
    console.log('Result content preview:', resultContent.substring(0, 300));

    // Parse the result
    const result = parseDBSResult(resultContent, certificateNumber, firstName, lastName, dob, isResultPage);

    await browser.close();
    return result;

  } catch (error) {
    console.error('DBS scraping error:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }

    // Check for missing system dependencies error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = error instanceof Error ? error.toString() : String(error);
    
    let userMessage = `Failed to check DBS certificate: ${errorMessage}`;
    
    if (errorString.includes('libatk') || 
        errorString.includes('cannot open shared object file') ||
        errorString.includes('shared libraries') ||
        errorMessage.includes('Target page, context or browser has been closed') ||
        errorString.includes('error while loading shared libraries')) {
      userMessage = 'Browser failed to start due to missing system dependencies. Please install Playwright system dependencies by running: npx playwright install-deps chromium';
    }

    return {
      success: false,
      verified: false,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'error',
        result: 'scraping_failed',
        message: userMessage,
        verificationDate: new Date().toISOString(),
      },
      error: errorMessage
    };
  }
}

function parseDBSResult(
  content: string,
  certificateNumber: string,
  firstName: string,
  lastName: string,
  dob: { day: string; month: string; year: string },
  isResultPage: boolean
): DBSCheckResult {
  const fullName = `${firstName.trim()} ${lastName.trim()}`.toUpperCase();
  const dateOfBirth = `${dob.day.padStart(2, '0')}/${dob.month.padStart(2, '0')}/${dob.year}`;
  const contentLower = content.toLowerCase();

  // If we're still on the form page, the form didn't submit - this is a failure
  if (!isResultPage) {
    // Check for validation errors on the form
    if (contentLower.includes('error') || contentLower.includes('invalid') || contentLower.includes('please enter') ||
        contentLower.includes('does not match') || contentLower.includes('check your details')) {
      return {
        success: false,
        verified: false,
        data: {
          certificateNumber,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          dateOfBirth,
          status: 'error',
          result: 'validation_error',
          message: 'The details entered are invalid or do not match any certificate. Please check the certificate number, name, and date of birth are correct.',
          verificationDate: new Date().toISOString(),
        }
      };
    }

    return {
      success: false,
      verified: false,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'error',
        result: 'form_not_submitted',
        message: 'The form could not be submitted. This may be due to website changes or restrictions.',
        verificationDate: new Date().toISOString(),
      }
    };
  }

  // Look for specific result messages in the content div (not sidebar help text)
  // The actual result should be in a specific result container

  // Check for "Certificate did not reveal any information and remains current"
  // This needs to be in a result context, not just help text
  if ((contentLower.includes('status check result') || contentLower.includes('the certificate')) &&
      contentLower.includes('did not reveal any information') && 
      contentLower.includes('remains current')) {
    return {
      success: true,
      verified: true,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'current',
        result: 'valid_no_info',
        message: 'This Certificate did not reveal any information and remains current as no further information has been identified since its issue.',
        verificationDate: new Date().toISOString(),
      }
    };
  }

  // Check for "Certificate remains current" (with previous info)
  if ((contentLower.includes('status check result') || contentLower.includes('the certificate')) &&
      contentLower.includes('remains current') && 
      !contentLower.includes('did not reveal')) {
    return {
      success: true,
      verified: true,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'current_with_info',
        result: 'valid_with_info',
        message: 'This Certificate remains current as no further information has been identified since its issue.',
        verificationDate: new Date().toISOString(),
      }
    };
  }

  // Check for "no longer current" - new information available
  if (contentLower.includes('no longer current') || 
      (contentLower.includes('apply for a new') && contentLower.includes('dbs check'))) {
    return {
      success: true,
      verified: false,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'not_current',
        result: 'not_current',
        message: 'This Certificate is no longer current. Please apply for a new DBS check to get the most up to date information.',
        verificationDate: new Date().toISOString(),
      }
    };
  }

  // Check for "not registered" or "not subscribed" to update service
  if (contentLower.includes('not registered') || contentLower.includes('not subscribed') || 
      contentLower.includes('not a member') || contentLower.includes('not signed up') ||
      contentLower.includes('certificate holder has not')) {
    return {
      success: false,
      verified: false,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'not_registered',
        result: 'not_registered',
        message: 'This certificate is not registered with the DBS Update Service. The certificate holder may not have subscribed to the Update Service.',
        verificationDate: new Date().toISOString(),
      }
    };
  }

  // Check for "no match" or validation errors - details don't match
  if (contentLower.includes('no match') || contentLower.includes('not found') || 
      contentLower.includes('does not match') || contentLower.includes('unable to find') ||
      contentLower.includes('cannot find') || contentLower.includes('details do not match') ||
      contentLower.includes('check your details') || contentLower.includes('try again')) {
    return {
      success: false,
      verified: false,
      data: {
        certificateNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        dateOfBirth,
        status: 'not_found',
        result: 'no_match',
        message: 'The details entered do not match any DBS certificate on record. Please verify the certificate number, surname, and date of birth are correct.',
        verificationDate: new Date().toISOString(),
      }
    };
  }

  // Default: couldn't determine result - this is a failure
  return {
    success: false,
    verified: false,
    data: {
      certificateNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      dateOfBirth,
      status: 'error',
      result: 'unknown',
      message: 'Verification failed. The result could not be automatically determined. Please check the details and try again.',
      verificationDate: new Date().toISOString(),
    }
  };
}
