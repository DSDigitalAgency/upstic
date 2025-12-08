/**
 * Right to Work (RTW) Share Code Scraper
 * 
 * Performs automated verification against the official UK Right to Work service
 * at https://right-to-work.service.gov.uk/rtw-view
 * 
 * The share code verification is a 2-step process:
 * 1. Enter the 9-character share code
 * 2. Enter the applicant's date of birth (day, month, year)
 * 
 * Returns verification status, work entitlements, and a screenshot as proof.
 */

import { chromium, Browser, Page } from 'playwright';

export interface RTWVerificationRequest {
  shareCode: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
}

export interface RTWVerificationResult {
  success: boolean;
  verified: boolean;
  shareCode: string;
  dateOfBirth: string;
  status: 'verified' | 'not_found' | 'invalid_code' | 'invalid_dob' | 'expired' | 'error';
  result: 'has_right_to_work' | 'no_right_to_work' | 'check_required' | 'invalid_details' | 'error';
  message: string;
  
  // Right to work details (when verified)
  details?: {
    fullName?: string;
    nationality?: string;
    documentType?: string;
    workStatus?: string;
    restrictions?: string;
    validUntil?: string;
    immigrationStatus?: string;
  };
  
  verificationDate: string;
  screenshot?: string; // Base64 encoded screenshot
}

export async function rtwScraper(request: RTWVerificationRequest): Promise<RTWVerificationResult> {
  const { shareCode, dateOfBirth } = request;
  
  // Parse date of birth
  const dobParts = dateOfBirth.split('-');
  if (dobParts.length !== 3) {
    return {
      success: false,
      verified: false,
      shareCode,
      dateOfBirth,
      status: 'error',
      result: 'invalid_details',
      message: 'Invalid date of birth format. Expected YYYY-MM-DD.',
      verificationDate: new Date().toISOString(),
    };
  }
  
  const [year, month, day] = dobParts;
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    console.log('[RTW Scraper] Starting browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    
    page = await context.newPage();
    
    // Navigate to the RTW service
    console.log('[RTW Scraper] Navigating to RTW service...');
    await page.goto('https://right-to-work.service.gov.uk/rtw-view', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('[RTW Scraper] Initial page URL:', page.url());
    
    // The page may redirect through authentication - wait for it to settle
    // Check if we're on an authentication page and wait for redirect back
    let currentUrl = page.url();
    if (currentUrl.includes('user-auth.apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk')) {
      console.log('[RTW Scraper] Detected authentication redirect, waiting for redirect back...');
      // Wait for redirect back to RTW service (or for share code form to appear)
      try {
        await page.waitForFunction(
          (url) => !url.includes('user-auth.apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk') || 
                   document.querySelector('#shareCode') !== null,
          currentUrl,
          { timeout: 10000 }
        );
        await page.waitForTimeout(2000);
        currentUrl = page.url();
        console.log('[RTW Scraper] After redirect, URL:', currentUrl);
      } catch (e) {
        console.log('[RTW Scraper] Still on auth page or timeout waiting for redirect');
      }
    }
    
    // Wait for the share code input to appear (it may be on the current page or after redirect)
    console.log('[RTW Scraper] Waiting for share code input...');
    await page.waitForSelector('#shareCode', { timeout: 30000 });
    console.log('[RTW Scraper] Share code input found');
    
    // Step 1: Enter share code
    console.log('[RTW Scraper] Entering share code:', shareCode);
    await page.fill('#shareCode', shareCode);
    
    // Take a screenshot before submitting
    await page.waitForTimeout(500);
    
    // Submit the form
    console.log('[RTW Scraper] Submitting share code form...');
    
    // Wait for navigation after clicking submit
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"], input[type="submit"]'),
    ]);
    
    await page.waitForTimeout(2000);
    
    console.log('[RTW Scraper] After share code submit, URL:', page.url());
    
    // Check for error messages on share code page
    const shareCodeError = await page.$('.govuk-error-message, .govuk-error-summary, [class*="error"]');
    if (shareCodeError) {
      const errorText = await shareCodeError.textContent();
      console.log('[RTW Scraper] Share code error:', errorText);
      
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'invalid_code',
        result: 'invalid_details',
        message: errorText?.trim() || 'Invalid share code. The share code may be incorrect, expired, or not found. Please verify and try again.',
        verificationDate: new Date().toISOString(),
        screenshot: screenshotBuffer.toString('base64'),
      };
    }
    
    // Step 2: Enter date of birth
    // Wait for DOB fields to appear (they may be on a different page after redirect)
    console.log('[RTW Scraper] Waiting for DOB form...');
    let dobDayInput, dobMonthInput, dobYearInput;
    
    try {
      // Wait for DOB fields with a longer timeout to handle redirects
      await page.waitForSelector('#dob-day, input[name="dob-day"]', { timeout: 15000 });
      dobDayInput = await page.$('#dob-day, input[name="dob-day"]');
      dobMonthInput = await page.$('#dob-month, input[name="dob-month"]');
      dobYearInput = await page.$('#dob-year, input[name="dob-year"]');
    } catch (e) {
      console.log('[RTW Scraper] DOB fields not found, checking if we\'re on result page...');
    }
    
    if (dobDayInput && dobMonthInput && dobYearInput) {
      console.log('[RTW Scraper] Filling date of birth...');
      await dobDayInput.fill(day);
      await dobMonthInput.fill(month);
      await dobYearInput.fill(year);
      
      // Submit the DOB form and wait for navigation
      console.log('[RTW Scraper] Submitting DOB form...');
      const beforeSubmitUrl = page.url();
      
      try {
        await Promise.race([
          page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
          page.waitForURL('**/rtw-view/**', { timeout: 30000 }),
          page.waitForURL('**/right-to-work.service.gov.uk/**', { timeout: 30000 }),
        ]);
      } catch (e) {
        console.log('[RTW Scraper] Navigation timeout, checking current state...');
      }
      
      await page.waitForTimeout(3000); // Give extra time for redirects
      
      const afterSubmitUrl = page.url();
      console.log('[RTW Scraper] After DOB submit, URL:', afterSubmitUrl);
      
      // Check if we've navigated away from auth page
      if (afterSubmitUrl.includes('right-to-work.service.gov.uk') && 
          !afterSubmitUrl.includes('user-auth')) {
        console.log('[RTW Scraper] Successfully navigated to RTW service page');
      }
    } else {
      console.log('[RTW Scraper] DOB fields not found - may already be on result page');
    }
    
    // Wait a bit more to ensure page is fully loaded
    await page.waitForTimeout(2000);
    
    // Check for error messages first (before checking auth page)
    const pageContent = await page.textContent('body') || '';
    const lowerContent = pageContent.toLowerCase();
    
    // Check for DOB error messages
    const dobError = await page.$('.govuk-error-message, .govuk-error-summary, [class*="error"]');
    if (dobError) {
      const errorText = await dobError.textContent();
      console.log('[RTW Scraper] DOB error found:', errorText);
      
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'invalid_dob',
        result: 'invalid_details',
        message: errorText?.trim() || 'Date of birth does not match the share code. Please verify the date of birth is correct.',
        verificationDate: new Date().toISOString(),
        screenshot: screenshotBuffer.toString('base64'),
      };
    }
    
    // Check for share code error messages in page content
    if (lowerContent.includes('share code') && 
        (lowerContent.includes('invalid') || lowerContent.includes('incorrect') || 
         lowerContent.includes('not found') || lowerContent.includes('expired'))) {
      console.log('[RTW Scraper] Share code error detected in page content');
      
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'invalid_code',
        result: 'invalid_details',
        message: 'The share code is invalid, expired, or not found. Please verify the share code and date of birth are correct.',
        verificationDate: new Date().toISOString(),
        screenshot: screenshotBuffer.toString('base64'),
      };
    }
    
    // Analyze the result page
    console.log('[RTW Scraper] Analyzing result page...');
    const resultUrl = page.url();
    console.log('[RTW Scraper] Current URL:', resultUrl);
    
    // Check if we're stuck on an authentication page
    const isAuthPage = resultUrl.includes('user-auth.apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk') ||
                       resultUrl.includes('login-actions/authenticate');
    
    if (isAuthPage) {
      console.log('[RTW Scraper] Still on authentication page - checking for error messages...');
      
      // Wait a bit more and check page content for errors
      await page.waitForTimeout(2000);
      const authPageContent = await page.textContent('body') || '';
      const authLowerContent = authPageContent.toLowerCase();
      
      // Check for specific error messages
      let errorMessage = 'Verification failed. The share code may be invalid, expired, or incorrect. Please verify the share code and date of birth are correct.';
      
      if (authLowerContent.includes('share code') || authLowerContent.includes('invalid') || 
          authLowerContent.includes('incorrect') || authLowerContent.includes('not found')) {
        // Try to extract the actual error message
        const errorElement = await page.$('.error, .alert, [class*="error"], [class*="alert"], .govuk-error-message, .govuk-error-summary');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          if (errorText && errorText.trim().length > 0) {
            errorMessage = errorText.trim();
          }
        }
      }
      
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshot = screenshotBuffer.toString('base64');
      
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'error',
        result: 'invalid_details',
        message: errorMessage,
        verificationDate: new Date().toISOString(),
        screenshot,
      };
    }
    
    // Wait a bit more to ensure page is fully loaded
    await page.waitForTimeout(2000);
    
    // Get page content (reuse if already retrieved, otherwise get fresh)
    const finalPageContent = await page.textContent('body') || '';
    const pageHTML = await page.content();
    
    // Take final screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshot = screenshotBuffer.toString('base64');
    
    console.log('[RTW Scraper] Page content length:', finalPageContent?.length || 0);
    
    // Try to extract details from the result page
    let details: RTWVerificationResult['details'] = {};
    
    // Look for common patterns in the result page
    const mainContent = await page.$('#main-content, .govuk-main-wrapper, main');
    if (mainContent) {
      const content = await mainContent.textContent() || '';
      
      // Try to extract name
      const nameMatch = content.match(/Name[:\s]+([^\n]+)/i);
      if (nameMatch) details.fullName = nameMatch[1].trim();
      
      // Try to extract nationality
      const nationalityMatch = content.match(/Nationality[:\s]+([^\n]+)/i);
      if (nationalityMatch) details.nationality = nationalityMatch[1].trim();
      
      // Try to extract work status
      const workStatusMatch = content.match(/(?:Work|Employment)\s*status[:\s]+([^\n]+)/i);
      if (workStatusMatch) details.workStatus = workStatusMatch[1].trim();
      
      // Try to extract restrictions
      const restrictionsMatch = content.match(/Restrictions?[:\s]+([^\n]+)/i);
      if (restrictionsMatch) details.restrictions = restrictionsMatch[1].trim();
      
      // Try to extract valid until date
      const validUntilMatch = content.match(/(?:Valid|Expires?)\s*(?:until|by)?[:\s]+([^\n]+)/i);
      if (validUntilMatch) details.validUntil = validUntilMatch[1].trim();
      
      // Try to extract immigration status
      const immigrationMatch = content.match(/Immigration\s*status[:\s]+([^\n]+)/i);
      if (immigrationMatch) details.immigrationStatus = immigrationMatch[1].trim();
      
      // Try to extract document type
      const docTypeMatch = content.match(/Document\s*type[:\s]+([^\n]+)/i);
      if (docTypeMatch) details.documentType = docTypeMatch[1].trim();
    }
    
    // Determine verification status based on page content
    const finalLowerContent = finalPageContent?.toLowerCase() || '';
    const lowerHTML = pageHTML?.toLowerCase() || '';
    
    console.log('[RTW Scraper] Checking page content for status indicators...');
    
    // Check for success indicators - be more specific to avoid false positives
    const hasRightToWork = 
      (finalLowerContent.includes('has the right to work') || finalLowerContent.includes('right to work in the uk')) &&
      !finalLowerContent.includes('does not have') &&
      !finalLowerContent.includes('no right') &&
      !finalLowerContent.includes('cannot work') &&
      (finalLowerContent.includes('name') || finalLowerContent.includes('nationality') || finalLowerContent.includes('immigration status'));
    
    // Check for failure indicators
    const noRightToWork = 
      finalLowerContent.includes('no right to work') ||
      finalLowerContent.includes('does not have the right') ||
      finalLowerContent.includes('cannot work') ||
      finalLowerContent.includes('not permitted to work') ||
      finalLowerContent.includes('work is not permitted');
    
    // Check for not found/invalid indicators
    const notFound = 
      finalLowerContent.includes('not found') ||
      finalLowerContent.includes('no record') ||
      finalLowerContent.includes('cannot find') ||
      finalLowerContent.includes('details do not match') ||
      finalLowerContent.includes('invalid share code') ||
      finalLowerContent.includes('share code is not valid') ||
      finalLowerContent.includes('check your details') ||
      finalLowerContent.includes('try again') ||
      (finalLowerContent.includes('error') && (finalLowerContent.includes('share code') || finalLowerContent.includes('date of birth')));
    
    // Check for expired indicators
    const expired = 
      finalLowerContent.includes('expired') ||
      finalLowerContent.includes('no longer valid') ||
      finalLowerContent.includes('has expired');
    
    console.log('[RTW Scraper] Status checks:', {
      hasRightToWork,
      noRightToWork,
      notFound,
      expired
    });
    
    if (hasRightToWork && !noRightToWork && !notFound) {
      return {
        success: true,
        verified: true,
        shareCode,
        dateOfBirth,
        status: 'verified',
        result: 'has_right_to_work',
        message: 'The applicant has the right to work in the UK.',
        details: Object.keys(details).length > 0 ? details : undefined,
        verificationDate: new Date().toISOString(),
        screenshot,
      };
    } else if (noRightToWork) {
      return {
        success: true,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'verified',
        result: 'no_right_to_work',
        message: 'The applicant does not have the right to work in the UK.',
        details: Object.keys(details).length > 0 ? details : undefined,
        verificationDate: new Date().toISOString(),
        screenshot,
      };
    } else if (expired) {
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'expired',
        result: 'check_required',
        message: 'The share code has expired. Please request a new share code from the applicant.',
        verificationDate: new Date().toISOString(),
        screenshot,
      };
    } else if (notFound) {
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'not_found',
        result: 'invalid_details',
        message: 'No matching record found. Please verify the share code and date of birth are correct.',
        verificationDate: new Date().toISOString(),
        screenshot,
      };
    }
    
    // If we can't determine the status, this is a failure
    return {
      success: false,
      verified: false,
      shareCode,
      dateOfBirth,
      status: 'error',
      result: 'error',
      message: 'Verification failed. Unable to determine the right to work status. Please verify the share code and date of birth are correct.',
      details: Object.keys(details).length > 0 ? details : undefined,
      verificationDate: new Date().toISOString(),
      screenshot,
    };
    
  } catch (error) {
    console.error('[RTW Scraper] Error:', error);
    
    // Try to capture error screenshot
    let screenshot: string | undefined;
    if (page) {
      try {
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        screenshot = screenshotBuffer.toString('base64');
      } catch (e) {
        console.error('[RTW Scraper] Failed to capture error screenshot:', e);
      }
    }
    
    return {
      success: false,
      verified: false,
      shareCode,
      dateOfBirth,
      status: 'error',
      result: 'error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred during verification.',
      verificationDate: new Date().toISOString(),
      screenshot,
    };
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

