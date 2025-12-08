/**
 * GMC (General Medical Council) Register Scraper
 * 
 * Performs automated verification against the official GMC register
 * at https://www.gmc-uk.org/registration-and-licensing/the-medical-register
 */

import { chromium, Browser } from 'playwright';

export interface GMCVerificationRequest {
  registrationNumber: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export interface GMCVerificationResult {
  success: boolean;
  verified: boolean;
  registrationNumber: string;
  status: 'verified' | 'not_found' | 'invalid' | 'error';
  result: 'active' | 'inactive' | 'suspended' | 'struck_off' | 'not_found' | 'error';
  message: string;
  
  details?: {
    fullName?: string;
    registrationStatus?: string;
    expiryDate?: string;
    qualifications?: string[];
  };
  
  verificationDate: string;
}

const GMC_REGISTER_URL = 'https://www.gmc-uk.org/registration-and-licensing/the-medical-register';

export async function gmcScraper(request: GMCVerificationRequest): Promise<GMCVerificationResult> {
  const { registrationNumber } = request;
  
  let browser: Browser | null = null;
  
  try {
    console.log('[GMC Scraper] Starting browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Navigate to GMC register check page
    console.log('[GMC Scraper] Navigating to GMC register...');
    await page.goto(GMC_REGISTER_URL, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('[GMC Scraper] Current URL:', page.url());
    
    // Handle cookie consent if present
    try {
      await page.waitForTimeout(2000);
      
      const cookieConsentSelectors = [
        'button:has-text("Accept")',
        'button:has-text("Accept all")',
        'button[id*="accept"]',
        'button[class*="accept"]',
        '[id*="cookie"] button',
      ];
      
      for (const selector of cookieConsentSelectors) {
        try {
          const cookieButton = await page.$(selector);
          if (cookieButton && await cookieButton.isVisible()) {
            console.log('[GMC Scraper] Found cookie consent button, clicking...');
            await cookieButton.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    } catch (e) {
      console.log('[GMC Scraper] No cookie consent found or already accepted');
    }
    
    // Wait for search form
    console.log('[GMC Scraper] Waiting for search form...');
    await page.waitForTimeout(3000);
    
    // Find search input - GMC typically has a registration number search
    const allInputs = await page.$$('input');
    console.log(`[GMC Scraper] Found ${allInputs.length} input fields on page`);
    
    let searchInput = null;
    let foundSelector = '';
    
    for (const input of allInputs) {
      const inputType = await input.getAttribute('type');
      const inputName = await input.getAttribute('name');
      const inputId = await input.getAttribute('id');
      const inputPlaceholder = await input.getAttribute('placeholder') || '';
      const inputClass = await input.getAttribute('class') || '';
      
      // Skip hidden inputs and site search
      const isSiteSearch = inputId?.toLowerCase().includes('site-search') || 
                          inputName?.toLowerCase() === 'query';
      
      if (
        (inputType === 'text' || !inputType) &&
        !isSiteSearch &&
        (
          inputName?.toLowerCase().includes('registration') ||
          inputName?.toLowerCase().includes('gmc') ||
          inputName?.toLowerCase().includes('number') ||
          inputId?.toLowerCase().includes('registration') ||
          inputId?.toLowerCase().includes('gmc') ||
          inputPlaceholder.toLowerCase().includes('registration') ||
          inputPlaceholder.toLowerCase().includes('gmc') ||
          (inputClass.toLowerCase().includes('search') && !inputClass.toLowerCase().includes('site'))
        )
      ) {
        searchInput = input;
        foundSelector = `input[name="${inputName}"][id="${inputId}"]`;
        console.log(`[GMC Scraper] Found search input: ${foundSelector}`);
        break;
      }
    }
    
    // Try common selectors if not found
    if (!searchInput) {
      const searchSelectors = [
        'input[name="registrationNumber"]',
        'input[name="gmcNumber"]',
        'input[name="registration"]',
        'input[type="text"]',
        '#search-input',
        '.search-input',
        'input[placeholder*="registration"]',
        'input[placeholder*="GMC"]',
      ];
      
      for (const selector of searchSelectors) {
        try {
          searchInput = await page.$(selector);
          if (searchInput) {
            console.log(`[GMC Scraper] Found search input with selector: ${selector}`);
            foundSelector = selector;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    }
    
    if (!searchInput) {
      console.log('[GMC Scraper] Search input not found');
      return {
        success: false,
        verified: false,
        registrationNumber,
        status: 'error',
        result: 'error',
        message: 'Could not locate the GMC register search form. The website structure may have changed.',
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Enter registration number
    console.log('[GMC Scraper] Entering registration number:', registrationNumber);
    
    try {
      await searchInput.fill(registrationNumber);
    } catch (e) {
      try {
        await page.evaluate(({ input, value }) => {
          const el = input as HTMLInputElement;
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, { input: searchInput, value: registrationNumber });
        await page.waitForTimeout(500);
      } catch (e2) {
        console.log('[GMC Scraper] Could not fill input:', e2);
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
          console.log(`[GMC Scraper] Found search button with selector: ${selector}`);
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
    console.log('[GMC Scraper] Waiting for results...');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const resultsUrl = page.url();
    console.log('[GMC Scraper] Results URL:', resultsUrl);
    
    // Get page content
    const pageContent = await page.textContent('body') || '';
    const lowerContent = pageContent.toLowerCase();
    
    console.log('[GMC Scraper] Page content length:', pageContent.length);
    
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
    let details: GMCVerificationResult['details'] = {};
    
    const nameMatch = pageContent.match(/(?:Name|Registered as|Doctor)[:\s]+([^\n\r<]+)/i);
    if (nameMatch) details.fullName = nameMatch[1].trim();
    
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
    
    let result: GMCVerificationResult['result'] = 'active';
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
    console.error('[GMC Scraper] Error:', error);
    
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

