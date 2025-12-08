/**
 * HCPC (Health and Care Professions Council) Register Scraper
 * 
 * Performs automated verification against the official HCPC register
 * at https://www.hcpc-uk.org/check-the-register/
 */

import { chromium, Browser } from 'playwright';

export interface HCPCVerificationRequest {
  registrationNumber: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export interface HCPCVerificationResult {
  success: boolean;
  verified: boolean;
  registrationNumber: string;
  status: 'verified' | 'not_found' | 'invalid' | 'error';
  result: 'active' | 'inactive' | 'suspended' | 'struck_off' | 'not_found' | 'error';
  message: string;
  
  details?: {
    fullName?: string;
    profession?: string;
    registrationStatus?: string;
    expiryDate?: string;
  };
  
  verificationDate: string;
}

const HCPC_REGISTER_URL = 'https://www.hcpc-uk.org/check-the-register/';

export async function hcpcScraper(request: HCPCVerificationRequest): Promise<HCPCVerificationResult> {
  const { registrationNumber } = request;
  
  let browser: Browser | null = null;
  
  try {
    console.log('[HCPC Scraper] Starting browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Navigate to HCPC register check page
    console.log('[HCPC Scraper] Navigating to HCPC register...');
    await page.goto(HCPC_REGISTER_URL, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('[HCPC Scraper] Current URL:', page.url());
    
    // Handle cookie consent if present
    try {
      await page.waitForTimeout(2000);
      
      const cookieConsentSelectors = [
        'button:has-text("Accept")',
        'button:has-text("Accept all")',
        'button:has-text("I agree")',
        'button[id*="accept"]',
        'button[class*="accept"]',
        '[id*="cookie"] button',
        '[class*="cookie"] button',
      ];
      
      for (const selector of cookieConsentSelectors) {
        try {
          const cookieButton = await page.$(selector);
          if (cookieButton && await cookieButton.isVisible()) {
            console.log('[HCPC Scraper] Found cookie consent button, clicking...');
            await cookieButton.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    } catch (e) {
      console.log('[HCPC Scraper] No cookie consent found or already accepted');
    }
    
    // Wait for search form
    console.log('[HCPC Scraper] Waiting for search form...');
    await page.waitForTimeout(3000);
    
    // Find search input
    const allInputs = await page.$$('input');
    console.log(`[HCPC Scraper] Found ${allInputs.length} input fields on page`);
    
    let searchInput = null;
    let foundSelector = '';
    
    for (const input of allInputs) {
      const inputType = await input.getAttribute('type');
      const inputName = await input.getAttribute('name');
      const inputId = await input.getAttribute('id');
      const inputPlaceholder = await input.getAttribute('placeholder') || '';
      const inputClass = await input.getAttribute('class') || '';
      
      // Skip site search inputs - look for registration-specific inputs
      const isSiteSearch = inputId?.toLowerCase().includes('site-search') || 
                          inputName?.toLowerCase() === 'query' ||
                          inputClass?.toLowerCase().includes('site-search');
      
      if (
        (inputType === 'text' || !inputType) &&
        !isSiteSearch &&
        (
          inputName?.toLowerCase().includes('registration') ||
          inputName?.toLowerCase().includes('number') ||
          inputName?.toLowerCase().includes('pin') ||
          inputId?.toLowerCase().includes('registration') ||
          inputId?.toLowerCase().includes('reg-number') ||
          inputPlaceholder.toLowerCase().includes('registration') ||
          inputPlaceholder.toLowerCase().includes('pin') ||
          (inputClass.toLowerCase().includes('search') && !inputClass.toLowerCase().includes('site'))
        )
      ) {
        searchInput = input;
        foundSelector = `input[name="${inputName}"][id="${inputId}"]`;
        console.log(`[HCPC Scraper] Found search input: ${foundSelector}`);
        break;
      }
    }
    
    // Try common selectors if not found
    if (!searchInput) {
      const searchSelectors = [
        'input[name="registrationNumber"]',
        'input[name="registration"]',
        'input[type="text"]',
        '#search-input',
        '.search-input',
        'input[placeholder*="registration"]',
      ];
      
      for (const selector of searchSelectors) {
        try {
          searchInput = await page.$(selector);
          if (searchInput) {
            console.log(`[HCPC Scraper] Found search input with selector: ${selector}`);
            foundSelector = selector;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    }
    
    if (!searchInput) {
      console.log('[HCPC Scraper] Search input not found');
      return {
        success: false,
        verified: false,
        registrationNumber,
        status: 'error',
        result: 'error',
        message: 'Could not locate the HCPC register search form. The website structure may have changed.',
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Enter registration number
    console.log('[HCPC Scraper] Entering registration number:', registrationNumber);
    
    try {
      // Try direct fill first
      await searchInput.fill(registrationNumber);
    } catch (e) {
      // If that fails, try using evaluate to set value
      try {
        await page.evaluate(({ input, value }) => {
          const el = input as HTMLInputElement;
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, { input: searchInput, value: registrationNumber });
        await page.waitForTimeout(500);
      } catch (e2) {
        console.log('[HCPC Scraper] Could not fill input:', e2);
        return {
          success: false,
          verified: false,
          registrationNumber,
          status: 'error',
          result: 'error',
          message: 'Could not interact with the search input. The website structure may have changed.',
          verificationDate: new Date().toISOString(),
        };
      }
    }
    await page.waitForTimeout(500);
    
    // Find and click search button
    const searchButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Search")',
      'button:has-text("Check")',
      '.search-button',
      '#search-button',
    ];
    
    let searchButton = null;
    for (const selector of searchButtonSelectors) {
      try {
        searchButton = await page.$(selector);
        if (searchButton) {
          console.log(`[HCPC Scraper] Found search button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!searchButton) {
      await searchInput.press('Enter');
    } else {
      await searchButton.click();
    }
    
    // Wait for results
    console.log('[HCPC Scraper] Waiting for results...');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const resultsUrl = page.url();
    console.log('[HCPC Scraper] Results URL:', resultsUrl);
    
    // Get page content
    const pageContent = await page.textContent('body') || '';
    const lowerContent = pageContent.toLowerCase();
    
    console.log('[HCPC Scraper] Page content length:', pageContent.length);
    
    // Check for not found
    const notFound = 
      lowerContent.includes('no results') ||
      lowerContent.includes('not found') ||
      lowerContent.includes('no matching') ||
      lowerContent.includes('could not find') ||
      lowerContent.includes('no registrations found');
    
    if (notFound) {
      return {
        success: false,
        verified: false,
        registrationNumber,
        status: 'not_found',
        result: 'not_found',
        message: 'No registration found with this registration number. Please verify the registration number is correct.',
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Extract details
    let details: HCPCVerificationResult['details'] = {};
    
    const nameMatch = pageContent.match(/(?:Name|Registered as)[:\s]+([^\n\r<]+)/i);
    if (nameMatch) details.fullName = nameMatch[1].trim();
    
    const professionMatch = pageContent.match(/(?:Profession|Title)[:\s]+([^\n\r<]+)/i);
    if (professionMatch) details.profession = professionMatch[1].trim();
    
    const statusMatch = pageContent.match(/(?:Status|Registration status)[:\s]+([^\n\r<]+)/i);
    if (statusMatch) details.registrationStatus = statusMatch[1].trim();
    
    // Check status
    const isActive = 
      lowerContent.includes('active') ||
      lowerContent.includes('current') ||
      lowerContent.includes('registered') ||
      (lowerContent.includes('status') && !lowerContent.includes('inactive') && !lowerContent.includes('suspended'));
    
    const isSuspended = lowerContent.includes('suspended');
    const isStruckOff = lowerContent.includes('struck off') || lowerContent.includes('struck-off');
    const isInactive = lowerContent.includes('inactive') || lowerContent.includes('lapsed');
    
    let result: HCPCVerificationResult['result'] = 'active';
    let verified = true;
    
    if (isStruckOff) {
      result = 'struck_off';
      verified = false;
    } else if (isSuspended) {
      result = 'suspended';
      verified = false;
    } else if (isInactive) {
      result = 'inactive';
      verified = false;
    } else if (isActive) {
      result = 'active';
      verified = true;
    }
    
    // If we found registration details, it's a successful verification
    if (details.fullName || details.registrationStatus || isActive || !notFound) {
      return {
        success: true,
        verified,
        registrationNumber,
        status: verified ? 'verified' : 'verified',
        result,
        message: verified 
          ? 'Registration found and is active.'
          : `Registration found but status is: ${result}`,
        details: Object.keys(details).length > 0 ? details : undefined,
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Default: couldn't determine result
    return {
      success: false,
      verified: false,
      registrationNumber,
      status: 'error',
      result: 'error',
      message: 'Could not determine registration status. Please verify the registration number and try again.',
      verificationDate: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('[HCPC Scraper] Error:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    
    return {
      success: false,
      verified: false,
      registrationNumber,
      status: 'error',
      result: 'error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred during verification.',
      verificationDate: new Date().toISOString(),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

