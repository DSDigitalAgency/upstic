/**
 * NMC (Nursing and Midwifery Council) Register Scraper
 * 
 * Performs automated verification against the official NMC register
 * at https://www.nmc.org.uk/registration/check-the-register/
 */

import { chromium, Browser } from 'playwright';

export interface NMCVerificationRequest {
  registrationNumber: string;
}

export interface NMCVerificationResult {
  success: boolean;
  verified: boolean;
  registrationNumber: string;
  status: 'verified' | 'not_found' | 'invalid' | 'error';
  result: 'active' | 'inactive' | 'suspended' | 'struck_off' | 'not_found' | 'error';
  message: string;
  
  // Registration details (when verified)
  details?: {
    fullName?: string;
    registrationType?: string;
    registrationStatus?: string;
    expiryDate?: string;
    qualifications?: string[];
  };
  
  verificationDate: string;
}

const NMC_REGISTER_URL = 'https://www.nmc.org.uk/registration/check-the-register/';

export async function nmcScraper(request: NMCVerificationRequest): Promise<NMCVerificationResult> {
  const { registrationNumber } = request;
  
  let browser: Browser | null = null;
  
  try {
    console.log('[NMC Scraper] Starting browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Navigate to NMC register check page
    console.log('[NMC Scraper] Navigating to NMC register...');
    await page.goto(NMC_REGISTER_URL, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('[NMC Scraper] Current URL:', page.url());
    
    // Handle cookie consent if present
    try {
      await page.waitForTimeout(2000); // Wait for page to load
      
      // Try to find and click cookie consent
      const cookieConsentSelectors = [
        'button:has-text("Accept")',
        'button:has-text("Accept all")',
        'button:has-text("I agree")',
        'button:has-text("Accept cookies")',
        'button[id*="accept"]',
        'button[class*="accept"]',
        '[id*="cookie"] button',
        '[class*="cookie"] button',
      ];
      
      for (const selector of cookieConsentSelectors) {
        try {
          const cookieButton = await page.$(selector);
          if (cookieButton && await cookieButton.isVisible()) {
            console.log('[NMC Scraper] Found cookie consent button, clicking...');
            await cookieButton.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    } catch (e) {
      console.log('[NMC Scraper] No cookie consent found or already accepted');
    }
    
    // Wait for the search form to appear
    console.log('[NMC Scraper] Waiting for search form...');
    await page.waitForTimeout(3000);
    
    // Get all input fields to see what's available
    const allInputs = await page.$$('input');
    console.log(`[NMC Scraper] Found ${allInputs.length} input fields on page`);
    
    // Try to find the search input by checking all inputs
    let searchInput = null;
    let foundSelector = '';
    
    for (const input of allInputs) {
      const inputType = await input.getAttribute('type');
      const inputName = await input.getAttribute('name');
      const inputId = await input.getAttribute('id');
      const inputPlaceholder = await input.getAttribute('placeholder') || '';
      const inputClass = await input.getAttribute('class') || '';
      
      // Check if this looks like a registration/PIN search input
      if (
        (inputType === 'text' || !inputType) &&
        (
          inputName?.toLowerCase().includes('pin') ||
          inputName?.toLowerCase().includes('registration') ||
          inputId?.toLowerCase().includes('pin') ||
          inputId?.toLowerCase().includes('registration') ||
          inputId?.toLowerCase().includes('search') ||
          inputPlaceholder.toLowerCase().includes('pin') ||
          inputPlaceholder.toLowerCase().includes('registration') ||
          inputClass.toLowerCase().includes('search')
        )
      ) {
        searchInput = input;
        foundSelector = `input[name="${inputName}"][id="${inputId}"]`;
        console.log(`[NMC Scraper] Found search input: ${foundSelector}`);
        break;
      }
    }
    
    // If not found, try common selectors
    if (!searchInput) {
      const searchSelectors = [
        'input[name="pin"]',
        'input[name="registrationNumber"]',
        'input[name="registration"]',
        'input[type="text"]',
        '#search-input',
        '.search-input',
        'input[placeholder*="registration"]',
        'input[placeholder*="PIN"]',
        'input[id*="search"]',
        'input[id*="pin"]',
      ];
      
      for (const selector of searchSelectors) {
        try {
          searchInput = await page.$(selector);
          if (searchInput) {
            console.log(`[NMC Scraper] Found search input with selector: ${selector}`);
            foundSelector = selector;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    }
    
    if (!searchInput) {
      console.log('[NMC Scraper] Search input not found, checking page content...');
      const pageContent = await page.textContent('body') || '';
      const pageHTML = await page.content();
      
      // Log some HTML to help debug
      console.log('[NMC Scraper] Page HTML preview:', pageHTML.substring(0, 1000));
      console.log('[NMC Scraper] Page content preview:', pageContent.substring(0, 500));
      
      // Take screenshot for debugging
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        verified: false,
        registrationNumber,
        status: 'error',
        result: 'error',
        message: 'Could not locate the NMC register search form. The website structure may have changed. Please check the NMC website manually.',
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Enter registration number
    console.log('[NMC Scraper] Entering registration number:', registrationNumber);
    await searchInput.fill(registrationNumber);
    await page.waitForTimeout(500);
    
    // Find and click search button
    const searchButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Search")',
      'button:has-text("Check")',
      '.search-button',
      '#search-button',
      'button.search',
    ];
    
    let searchButton = null;
    for (const selector of searchButtonSelectors) {
      try {
        searchButton = await page.$(selector);
        if (searchButton) {
          console.log(`[NMC Scraper] Found search button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!searchButton) {
      // Try pressing Enter on the input
      console.log('[NMC Scraper] Search button not found, trying Enter key...');
      await searchInput.press('Enter');
    } else {
      await searchButton.click();
    }
    
    // Wait for results page
    console.log('[NMC Scraper] Waiting for results...');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const resultsUrl = page.url();
    console.log('[NMC Scraper] Results URL:', resultsUrl);
    
    // Get page content
    const pageContent = await page.textContent('body') || '';
    const lowerContent = pageContent.toLowerCase();
    
    console.log('[NMC Scraper] Page content length:', pageContent.length);
    console.log('[NMC Scraper] Content preview:', pageContent.substring(0, 500));
    
    // Check for "not found" or "no results" messages
    const notFound = 
      lowerContent.includes('no results') ||
      lowerContent.includes('not found') ||
      lowerContent.includes('no matching') ||
      lowerContent.includes('could not find') ||
      lowerContent.includes('no registrations found') ||
      (lowerContent.includes('error') && lowerContent.includes('registration'));
    
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
    
    // Check for error messages
    const hasError = 
      lowerContent.includes('invalid') ||
      lowerContent.includes('error occurred') ||
      (lowerContent.includes('please') && lowerContent.includes('try again'));
    
    if (hasError && !lowerContent.includes('registration')) {
      return {
        success: false,
        verified: false,
        registrationNumber,
        status: 'error',
        result: 'error',
        message: 'An error occurred while checking the register. Please try again later.',
        verificationDate: new Date().toISOString(),
      };
    }
    
    // Try to extract registration details
    let details: NMCVerificationResult['details'] = {};
    
    // Look for name
    const nameMatch = pageContent.match(/(?:Name|Registered as)[:\s]+([^\n\r<]+)/i);
    if (nameMatch) {
      details.fullName = nameMatch[1].trim();
    }
    
    // Look for registration status
    const statusMatch = pageContent.match(/(?:Status|Registration status)[:\s]+([^\n\r<]+)/i);
    if (statusMatch) {
      details.registrationStatus = statusMatch[1].trim();
    }
    
    // Look for registration type
    const typeMatch = pageContent.match(/(?:Type|Registration type)[:\s]+([^\n\r<]+)/i);
    if (typeMatch) {
      details.registrationType = typeMatch[1].trim();
    }
    
    // Check for active/current registration indicators
    const isActive = 
      lowerContent.includes('active') ||
      lowerContent.includes('current') ||
      lowerContent.includes('registered') ||
      (lowerContent.includes('status') && !lowerContent.includes('inactive') && !lowerContent.includes('suspended'));
    
    // Check for suspended/struck off
    const isSuspended = lowerContent.includes('suspended');
    const isStruckOff = lowerContent.includes('struck off') || lowerContent.includes('struck-off');
    const isInactive = lowerContent.includes('inactive') || lowerContent.includes('lapsed');
    
    let result: NMCVerificationResult['result'] = 'active';
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
    console.error('[NMC Scraper] Error:', error);
    
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

