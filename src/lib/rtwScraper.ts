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
    
    console.log('[RTW Scraper] Page URL:', page.url());
    
    // Wait for the share code input to appear
    await page.waitForSelector('#shareCode', { timeout: 30000 });
    
    // Step 1: Enter share code
    console.log('[RTW Scraper] Entering share code:', shareCode);
    await page.fill('#shareCode', shareCode);
    
    // Take a screenshot before submitting
    await page.waitForTimeout(500);
    
    // Submit the form
    console.log('[RTW Scraper] Submitting share code form...');
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
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
        message: errorText?.trim() || 'Invalid share code. Please check and try again.',
        verificationDate: new Date().toISOString(),
        screenshot: screenshotBuffer.toString('base64'),
      };
    }
    
    // Step 2: Enter date of birth
    // Check if DOB fields are present
    const dobDayInput = await page.$('#dob-day');
    const dobMonthInput = await page.$('#dob-month');
    const dobYearInput = await page.$('#dob-year');
    
    if (dobDayInput && dobMonthInput && dobYearInput) {
      console.log('[RTW Scraper] Filling date of birth...');
      await dobDayInput.fill(day);
      await dobMonthInput.fill(month);
      await dobYearInput.fill(year);
      
      // Submit the DOB form
      console.log('[RTW Scraper] Submitting DOB form...');
      await page.click('button[type="submit"], input[type="submit"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('[RTW Scraper] After DOB submit, URL:', page.url());
    }
    
    // Check for DOB error messages
    const dobError = await page.$('.govuk-error-message, .govuk-error-summary');
    if (dobError) {
      const errorText = await dobError.textContent();
      console.log('[RTW Scraper] DOB error:', errorText);
      
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        verified: false,
        shareCode,
        dateOfBirth,
        status: 'invalid_dob',
        result: 'invalid_details',
        message: errorText?.trim() || 'Date of birth does not match records.',
        verificationDate: new Date().toISOString(),
        screenshot: screenshotBuffer.toString('base64'),
      };
    }
    
    // Analyze the result page
    const pageContent = await page.textContent('body');
    console.log('[RTW Scraper] Analyzing result page...');
    
    // Take final screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshot = screenshotBuffer.toString('base64');
    
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
    const lowerContent = pageContent?.toLowerCase() || '';
    
    // Check for success indicators
    const hasRightToWork = 
      lowerContent.includes('has the right to work') ||
      lowerContent.includes('right to work in the uk') ||
      lowerContent.includes('can work in the uk') ||
      lowerContent.includes('employment status') ||
      lowerContent.includes('immigration status') ||
      (lowerContent.includes('name') && lowerContent.includes('nationality'));
    
    // Check for failure indicators
    const noRightToWork = 
      lowerContent.includes('no right to work') ||
      lowerContent.includes('does not have the right') ||
      lowerContent.includes('cannot work') ||
      lowerContent.includes('not permitted to work');
    
    // Check for not found indicators
    const notFound = 
      lowerContent.includes('not found') ||
      lowerContent.includes('no record') ||
      lowerContent.includes('cannot find') ||
      lowerContent.includes('details do not match') ||
      lowerContent.includes('invalid');
    
    // Check for expired indicators
    const expired = 
      lowerContent.includes('expired') ||
      lowerContent.includes('no longer valid');
    
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
        verified: true,
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
    
    // If we can't determine the status, return what we have with the screenshot
    return {
      success: true,
      verified: false,
      shareCode,
      dateOfBirth,
      status: 'verified',
      result: 'check_required',
      message: 'Verification completed. Please review the screenshot to confirm the applicant\'s right to work status.',
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

