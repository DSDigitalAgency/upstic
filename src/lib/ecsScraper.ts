/**
 * ECS (Employer Checking Service) Scraper
 * 
 * Performs automated verification against the official UK Employer Checking Service
 * Similar to RTW but for employers to check immigration status
 */

import { chromium, Browser, Page } from 'playwright';

export interface ECSVerificationRequest {
  shareCode: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
}

export interface ECSVerificationResult {
  success: boolean;
  verified: boolean;
  shareCode: string;
  dateOfBirth: string;
  status: 'verified' | 'not_found' | 'invalid_code' | 'invalid_dob' | 'expired' | 'error';
  result: 'work_allowed' | 'work_not_allowed' | 'check_required' | 'invalid_details' | 'error';
  message: string;
  
  // ECS details (when verified)
  details?: {
    fullName?: string;
    nationality?: string;
    workStatus?: string;
    restrictions?: string;
    validUntil?: string;
    immigrationStatus?: string;
  };
  
  verificationDate: string;
}

export async function ecsScraper(request: ECSVerificationRequest): Promise<ECSVerificationResult> {
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
    console.log('[ECS Scraper] Starting browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    
    page = await context.newPage();
    
    // Navigate to the ECS service
    // ECS uses the same service as RTW but for employer checking
    // The actual URL might be different - using RTW service URL as base
    console.log('[ECS Scraper] Navigating to ECS service...');
    // Try the RTW service URL first (ECS might use the same infrastructure)
    await page.goto('https://right-to-work.service.gov.uk/ecs-view', {
      waitUntil: 'networkidle',
      timeout: 60000,
    }).catch(async () => {
      // If that fails, try the main gov.uk page
      console.log('[ECS Scraper] First URL failed, trying alternative...');
      await page.goto('https://www.gov.uk/employer-checking-service', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
    });
    
    console.log('[ECS Scraper] Initial page URL:', page.url());
    
    // Handle authentication redirects similar to RTW
    let currentUrl = page.url();
    if (currentUrl.includes('user-auth.apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk')) {
      console.log('[ECS Scraper] Detected authentication redirect, waiting for redirect back...');
      try {
        await page.waitForFunction(
          (url) => !url.includes('user-auth.apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk') || 
                   document.querySelector('#shareCode, input[name="shareCode"]') !== null,
          currentUrl,
          { timeout: 10000 }
        );
        await page.waitForTimeout(2000);
        currentUrl = page.url();
        console.log('[ECS Scraper] After redirect, URL:', currentUrl);
      } catch (e) {
        console.log('[ECS Scraper] Still on auth page or timeout waiting for redirect');
      }
    }
    
    // Wait for the share code input to appear
    // ECS might use the same form structure as RTW or a different one
    console.log('[ECS Scraper] Waiting for share code input...');
    
    // Try multiple selectors - ECS might use different field names
    const shareCodeSelectors = [
      '#shareCode',
      'input[name="shareCode"]',
      'input[id*="share"]',
      'input[placeholder*="share"]',
      'input[placeholder*="code"]',
      'input[type="text"]', // Fallback
    ];
    
    let shareCodeInput = null;
    for (const selector of shareCodeSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        shareCodeInput = await page.$(selector);
        if (shareCodeInput) {
          console.log(`[ECS Scraper] Found share code input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!shareCodeInput) {
      console.log('[ECS Scraper] Share code input not found, checking page content...');
      const pageContent = await page.textContent('body') || '';
      console.log('[ECS Scraper] Page content preview:', pageContent.substring(0, 500));
      
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'error',
        result: 'error',
        message: 'Could not locate the ECS share code input form. The website structure may have changed or ECS may use a different verification method.',
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Step 1: Enter share code
    console.log('[ECS Scraper] Entering share code:', shareCode);
    await shareCodeInput.fill(shareCode);
    await page.waitForTimeout(500);
    
    // Submit the form
    console.log('[ECS Scraper] Submitting share code form...');
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"], input[type="submit"]'),
    ]);
    
    await page.waitForTimeout(2000);
    
    console.log('[ECS Scraper] After share code submit, URL:', page.url());
    
    // Check for error messages on share code page
    const shareCodeError = await page.$('.govuk-error-message, .govuk-error-summary, [class*="error"]');
    if (shareCodeError) {
      const errorText = await shareCodeError.textContent();
      console.log('[ECS Scraper] Share code error:', errorText);
      
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
    console.log('[ECS Scraper] Waiting for DOB form...');
    let dobDayInput, dobMonthInput, dobYearInput;
    
    try {
      await page.waitForSelector('#dob-day, input[name="dob-day"], input[id*="dob"]', { timeout: 15000 });
      dobDayInput = await page.$('#dob-day, input[name="dob-day"]');
      dobMonthInput = await page.$('#dob-month, input[name="dob-month"]');
      dobYearInput = await page.$('#dob-year, input[name="dob-year"]');
    } catch (e) {
      console.log('[ECS Scraper] DOB fields not found, checking if we\'re on result page...');
    }
    
    if (dobDayInput && dobMonthInput && dobYearInput) {
      console.log('[ECS Scraper] Filling date of birth...');
      await dobDayInput.fill(day);
      await dobMonthInput.fill(month);
      await dobYearInput.fill(year);
      
      // Submit the DOB form
      console.log('[ECS Scraper] Submitting DOB form...');
      const [dobResponse] = await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"], input[type="submit"], button.govuk-button'),
      ]);
      
      await page.waitForTimeout(2000);
      
      console.log('[ECS Scraper] After DOB submit, URL:', page.url());
    } else {
      console.log('[ECS Scraper] DOB fields not found - may already be on result page');
    }
    
    // Check for DOB error messages
    const dobError = await page.$('.govuk-error-message, .govuk-error-summary');
    if (dobError) {
      const errorText = await dobError.textContent();
      console.log('[ECS Scraper] DOB error:', errorText);
      
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
    
    // Analyze the result page
    console.log('[ECS Scraper] Analyzing result page...');
    const resultUrl = page.url();
    console.log('[ECS Scraper] Current URL:', resultUrl);
    
    // Check if we're stuck on an authentication page
    const isAuthPage = resultUrl.includes('user-auth.apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk') ||
                       resultUrl.includes('login-actions/authenticate');
    
    if (isAuthPage) {
      console.log('[ECS Scraper] Still on authentication page - checking for error messages...');
      
      await page.waitForTimeout(2000);
      const authPageContent = await page.textContent('body') || '';
      const authLowerContent = authPageContent.toLowerCase();
      
      let errorMessage = 'Verification failed. The share code may be invalid, expired, or incorrect. Please verify the share code and date of birth are correct.';
      
      if (authLowerContent.includes('share code') || authLowerContent.includes('invalid') || 
          authLowerContent.includes('incorrect') || authLowerContent.includes('not found')) {
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
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body') || '';
    const lowerContent = pageContent.toLowerCase();
    
    // Extract details
    let details: ECSVerificationResult['details'] = {};
    
    const mainContent = await page.$('#main-content, .govuk-main-wrapper, main');
    if (mainContent) {
      const content = await mainContent.textContent() || '';
      
      const nameMatch = content.match(/Name[:\s]+([^\n]+)/i);
      if (nameMatch) details.fullName = nameMatch[1].trim();
      
      const nationalityMatch = content.match(/Nationality[:\s]+([^\n]+)/i);
      if (nationalityMatch) details.nationality = nationalityMatch[1].trim();
      
      const workStatusMatch = content.match(/(?:Work|Employment)\s*status[:\s]+([^\n]+)/i);
      if (workStatusMatch) details.workStatus = workStatusMatch[1].trim();
      
      const restrictionsMatch = content.match(/Restrictions?[:\s]+([^\n]+)/i);
      if (restrictionsMatch) details.restrictions = restrictionsMatch[1].trim();
      
      const validUntilMatch = content.match(/(?:Valid|Expires?)\s*(?:until|by)?[:\s]+([^\n]+)/i);
      if (validUntilMatch) details.validUntil = validUntilMatch[1].trim();
      
      const immigrationMatch = content.match(/Immigration\s*status[:\s]+([^\n]+)/i);
      if (immigrationMatch) details.immigrationStatus = immigrationMatch[1].trim();
    }
    
    // Determine verification status
    console.log('[ECS Scraper] Checking page content for status indicators...');
    
    const workAllowed = 
      (lowerContent.includes('allowed to work') || lowerContent.includes('can work') || 
       lowerContent.includes('work is allowed') || lowerContent.includes('permitted to work')) &&
      !lowerContent.includes('not allowed') &&
      !lowerContent.includes('cannot work');
    
    const workNotAllowed = 
      lowerContent.includes('not allowed to work') ||
      lowerContent.includes('cannot work') ||
      lowerContent.includes('work is not permitted') ||
      lowerContent.includes('not permitted to work');
    
    const notFound = 
      lowerContent.includes('not found') ||
      lowerContent.includes('no record') ||
      lowerContent.includes('cannot find') ||
      lowerContent.includes('details do not match') ||
      lowerContent.includes('invalid share code') ||
      lowerContent.includes('share code is not valid') ||
      lowerContent.includes('check your details') ||
      lowerContent.includes('try again') ||
      (lowerContent.includes('error') && (lowerContent.includes('share code') || lowerContent.includes('date of birth')));
    
    const expired = 
      lowerContent.includes('expired') ||
      lowerContent.includes('no longer valid') ||
      lowerContent.includes('has expired');
    
    console.log('[ECS Scraper] Status checks:', {
      workAllowed,
      workNotAllowed,
      notFound,
      expired
    });
    
    if (workAllowed && !workNotAllowed && !notFound) {
      return {
        success: true,
        verified: true,
        shareCode,
        dateOfBirth,
        status: 'verified',
        result: 'work_allowed',
        message: 'The employee is allowed to work in the UK.',
        details: Object.keys(details).length > 0 ? details : undefined,
        verificationDate: new Date().toISOString(),
      };
    } else if (workNotAllowed) {
      return {
        success: true,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'verified',
        result: 'work_not_allowed',
        message: 'The employee is not allowed to work in the UK.',
        details: Object.keys(details).length > 0 ? details : undefined,
        verificationDate: new Date().toISOString(),
      };
    } else if (expired) {
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'expired',
        result: 'check_required',
        message: 'The share code has expired. Please request a new share code from the employee.',
        verificationDate: new Date().toISOString(),
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
      message: 'Verification failed. Unable to determine the work status. Please verify the share code and date of birth are correct.',
      details: Object.keys(details).length > 0 ? details : undefined,
      verificationDate: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('[ECS Scraper] Error:', error);
    
    let screenshot: string | undefined;
    if (page) {
      try {
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        screenshot = screenshotBuffer.toString('base64');
      } catch (e) {
        console.error('[ECS Scraper] Failed to capture error screenshot:', e);
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

