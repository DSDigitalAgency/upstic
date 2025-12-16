/**
 * GMC (General Medical Council) Register Scraper
 * 
 * Performs automated verification against the official GMC register
 * at https://www.gmc-uk.org/registration-and-licensing/our-registers
 */

import { chromium, Browser } from 'playwright';

export interface GMCVerificationRequest {
  registrationNumber: string;
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
    gpRegisterStatus?: string;
    specialistRegisterStatus?: string;
    registeredQualification?: string;
    provisionalRegistrationDate?: string;
    fullRegistrationDate?: string;
    gender?: string;
    revalidationInfo?: string;
    designatedBody?: string;
    responsibleOfficer?: string;
  };
  
  verificationDate: string;
  screenshot?: string; // Base64 encoded screenshot of the results page
  pdf?: string; // Base64 encoded PDF of the results page
}

const GMC_REGISTER_URL = 'https://www.gmc-uk.org/registration-and-licensing/our-registers';

export async function gmcScraper(request: GMCVerificationRequest): Promise<GMCVerificationResult> {
  const { registrationNumber } = request;
  
  let browser: Browser | null = null;
  
  try {
    console.log('[GMC Scraper] Starting browser...');
    // Allow non-headless mode via environment variable for Cloudflare challenges
    const headless = process.env.GMC_HEADLESS !== 'false';
    
    browser = await chromium.launch({
      headless: headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
    
    if (!headless) {
      console.log('[GMC Scraper] Running in non-headless mode - Cloudflare challenges can be completed manually');
    }
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-GB',
      timezoneId: 'Europe/London',
      // Add extra headers to look more like a real browser
      extraHTTPHeaders: {
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
    });
    
    const page = await context.newPage();
    
    // Remove webdriver property to avoid detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Override plugins to look more realistic
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-GB', 'en'],
      });
    });
    
    // Navigate to GMC register check page
    console.log('[GMC Scraper] Navigating to GMC register...');
    await page.goto(GMC_REGISTER_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    
    console.log('[GMC Scraper] Current URL:', page.url());
    
    // Check for Cloudflare challenge and wait for it to complete
    console.log('[GMC Scraper] Checking for Cloudflare challenge...');
    const hasCloudflareChallenge = await page.evaluate(() => {
      return document.body.textContent?.includes('One more step') ||
             document.body.textContent?.includes('Just a moment') ||
             document.body.textContent?.includes('Checking your browser') ||
             document.body.textContent?.includes('Please complete the security check') ||
             document.querySelector('[data-ray]') !== null ||
             document.querySelector('#challenge-form') !== null ||
             window.location.href.includes('challenge');
    });
    
    if (hasCloudflareChallenge) {
      console.log('[GMC Scraper] Cloudflare challenge detected, waiting for it to complete...');
      
      if (!headless) {
        console.log('[GMC Scraper] Non-headless mode: Please complete the Cloudflare challenge manually in the browser window');
        console.log('[GMC Scraper] Waiting up to 60 seconds for manual completion...');
      }
      
      // Wait for the challenge to complete (up to 60 seconds in non-headless, 30 in headless)
      const challengeTimeout = headless ? 30000 : 60000;
      try {
        await page.waitForFunction(
          () => {
            const bodyText = document.body.textContent || '';
            return !bodyText.includes('One more step') &&
                   !bodyText.includes('Just a moment') &&
                   !bodyText.includes('Checking your browser') &&
                   !bodyText.includes('Please complete the security check') &&
                   !document.querySelector('[data-ray]') &&
                   !document.querySelector('#challenge-form') &&
                   !document.querySelector('iframe[src*="challenges.cloudflare"]');
          },
          { timeout: challengeTimeout }
        );
        console.log('[GMC Scraper] Cloudflare challenge completed');
        await page.waitForTimeout(2000);
      } catch (e) {
        if (!headless) {
          console.log('[GMC Scraper] Cloudflare challenge timeout - if challenge was completed, continuing...');
        } else {
          console.log('[GMC Scraper] Cloudflare challenge timeout - page may still be loading');
        }
        // Continue anyway - sometimes the challenge passes but the wait times out
        await page.waitForTimeout(3000);
      }
    }
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      console.log('[GMC Scraper] Network idle timeout, continuing...');
    });
    
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
    
    // Try to wait for the search input to be visible
    try {
      await page.waitForSelector('input[placeholder*="GMC"], input[placeholder*="name or GMC"], input[type="text"]', {
        timeout: 10000,
        state: 'visible'
      });
    } catch (e) {
      console.log('[GMC Scraper] Could not wait for input selector, continuing...');
    }
    
    // Find search input - look for "Enter name or GMC reference number" placeholder
    let searchInput = null;
    let foundSelector = '';
    
    const searchInputSelectors = [
      'input[placeholder*="Enter name or GMC reference number"]',
      'input[placeholder*="GMC reference number"]',
      'input[placeholder*="name or GMC"]',
      'input[type="text"]',
      '#search-input',
      '.search-input',
      'input[name*="search"]',
      'input[name*="gmc"]',
      'input[name*="reference"]',
    ];
    
    console.log('[GMC Scraper] Looking for search input...');
    for (const selector of searchInputSelectors) {
      try {
        const inputs = await page.$$(selector);
        console.log(`[GMC Scraper] Found ${inputs.length} inputs with selector: ${selector}`);
        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder') || '';
          const inputId = await input.getAttribute('id') || '';
          const inputName = await input.getAttribute('name') || '';
          const isVisible = await input.isVisible();
          
          console.log(`[GMC Scraper] Input - placeholder: "${placeholder}", id: "${inputId}", name: "${inputName}", visible: ${isVisible}`);
          
          // Skip site search inputs
          const isSiteSearch = inputId?.toLowerCase().includes('site-search') || 
                              inputName?.toLowerCase() === 'query' ||
                              placeholder.toLowerCase().includes('search this site');
          
          if (!isSiteSearch && isVisible) {
            searchInput = input;
            foundSelector = selector;
            console.log(`[GMC Scraper] Found search input with selector: ${selector}, placeholder: "${placeholder}"`);
            break;
          }
        }
        if (searchInput) break;
      } catch (e) {
        console.log(`[GMC Scraper] Error with selector ${selector}:`, e);
        // Try next selector
      }
    }
    
    if (!searchInput) {
      console.log('[GMC Scraper] Search input not found - listing all inputs on page');
      try {
        const allInputs = await page.$$('input');
        console.log(`[GMC Scraper] Total inputs found: ${allInputs.length}`);
        for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
          const input = allInputs[i];
          const placeholder = await input.getAttribute('placeholder') || '';
          const inputId = await input.getAttribute('id') || '';
          const inputName = await input.getAttribute('name') || '';
          const inputType = await input.getAttribute('type') || '';
          console.log(`[GMC Scraper] Input ${i}: type="${inputType}", placeholder="${placeholder}", id="${inputId}", name="${inputName}"`);
        }
      } catch (e) {
        console.log('[GMC Scraper] Could not list inputs:', e);
      }
      
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
      // Make sure input is visible and enabled
      await searchInput.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      
      // Clear any existing value first
      await searchInput.click();
      await page.waitForTimeout(300);
      await searchInput.fill('');
      await page.waitForTimeout(300);
      
      // Fill the input
      await searchInput.fill(registrationNumber);
      await page.waitForTimeout(500);
      
      // Verify the value was set
      const inputValue = await searchInput.inputValue();
      console.log(`[GMC Scraper] Input value after fill: "${inputValue}"`);
      
      if (inputValue !== registrationNumber) {
        console.log('[GMC Scraper] Input value mismatch, trying JavaScript method');
        throw new Error('Input value mismatch');
      }
    } catch (e) {
      console.log('[GMC Scraper] Fill method failed, trying JavaScript method:', e);
      try {
        await page.evaluate(({ selector, value }) => {
          const el = document.querySelector(selector) as HTMLInputElement;
          if (el) {
            el.focus();
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('keyup', { bubbles: true }));
          }
        }, { selector: foundSelector, value: registrationNumber });
        await page.waitForTimeout(500);
        
        // Verify again
        const inputValue = await searchInput.inputValue();
        console.log(`[GMC Scraper] Input value after JavaScript fill: "${inputValue}"`);
        
        if (inputValue !== registrationNumber) {
          throw new Error('JavaScript fill also failed');
        }
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
    
    // Find and click search button - look for "Search our registers" button or magnifying glass icon
    const searchButtonSelectors = [
      'button:has-text("Search our registers")',
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Search")',
      'button.search',
      '.search-button',
      '#search-button',
      '[aria-label*="Search"]',
      '[aria-label*="search"]',
      'button[class*="search"]',
      // Look for magnifying glass icon (SVG or icon button)
      'button:has(svg)',
      'button[class*="icon"]',
      'button[class*="magnify"]',
      // Form submit
      'form button[type="submit"]',
      'form input[type="submit"]',
    ];
    
    let searchButton = null;
    let foundButtonSelector = '';
    
    for (const selector of searchButtonSelectors) {
      try {
        const buttons = await page.$$(selector);
        for (const btn of buttons) {
          const isVisible = await btn.isVisible();
          const text = await btn.textContent() || '';
          const ariaLabel = await btn.getAttribute('aria-label') || '';
          const className = await btn.getAttribute('class') || '';
          
          // Look for the "Search our registers" button specifically, or any visible button near the search input
          if (isVisible && (
            text.toLowerCase().includes('search our registers') || 
            text.toLowerCase().includes('search') ||
            ariaLabel.toLowerCase().includes('search') ||
            className.toLowerCase().includes('search') ||
            className.toLowerCase().includes('submit')
          )) {
            // Make sure it's not the site-wide search
            if (!className.toLowerCase().includes('site-search') && 
                !text.toLowerCase().includes('search this site')) {
              searchButton = btn;
              foundButtonSelector = selector;
              console.log(`[GMC Scraper] Found search button with selector: ${selector}, text: "${text}", aria-label: "${ariaLabel}"`);
              break;
            }
          }
        }
        if (searchButton) break;
      } catch (e) {
        // Try next selector
      }
    }
    
    // If button found, try to click it with better error handling
    if (searchButton) {
      try {
        // Wait for button to be visible and enabled
        if (foundButtonSelector) {
          await page.waitForSelector(foundButtonSelector, { 
            state: 'visible',
            timeout: 5000 
          }).catch(() => {
            console.log('[GMC Scraper] Could not wait for button selector, continuing...');
          });
        }
        await page.waitForTimeout(500);
        
        // Try clicking via JavaScript if regular click fails
        try {
          await searchButton.click({ timeout: 5000 });
          console.log('[GMC Scraper] Clicked search button');
        } catch (clickError) {
          // Fallback: use JavaScript click
          console.log('[GMC Scraper] Regular click failed, trying JavaScript click');
          await page.evaluate((selector) => {
            const btn = document.querySelector(selector) as HTMLElement;
            if (btn) {
              btn.click();
            } else {
              // Try to find button by text
              const buttons = Array.from(document.querySelectorAll('button'));
              const searchBtn = buttons.find(b => 
                b.textContent?.toLowerCase().includes('search our registers') ||
                b.textContent?.toLowerCase().includes('search') ||
                b.getAttribute('aria-label')?.toLowerCase().includes('search')
              );
              if (searchBtn) {
                searchBtn.click();
              }
            }
          }, foundButtonSelector || searchButtonSelectors[0]);
          console.log('[GMC Scraper] Used JavaScript click');
        }
      } catch (e) {
        console.log('[GMC Scraper] Button click failed, trying Enter key');
        await searchInput.press('Enter');
      }
    } else {
      // No button found, use Enter key
      console.log('[GMC Scraper] Search button not found, using Enter key');
      await searchInput.press('Enter');
    }
    
    // Wait a bit for the form to process
    await page.waitForTimeout(1000);
    
    // Wait for results - wait for navigation or content change
    console.log('[GMC Scraper] Waiting for results...');
    
    // Wait for either navigation or content change
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null),
        page.waitForTimeout(5000),
      ]);
    } catch (e) {
      // Continue anyway
    }
    
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {
      console.log('[GMC Scraper] Network idle timeout, continuing...');
    });
    
    const resultsUrl = page.url();
    console.log('[GMC Scraper] Results URL:', resultsUrl);
    
    // Check if we're still on the search page - if so, try submitting again
    if (resultsUrl.includes('/our-registers') && !resultsUrl.includes('/doctors/') && !resultsUrl.includes('/pa/') && !resultsUrl.includes('/aa/')) {
      console.log('[GMC Scraper] Still on search page, trying to submit form again...');
      
      // Try submitting the form directly
      try {
        const form = await page.$('form');
        if (form) {
          await form.evaluate((form) => (form as HTMLFormElement).submit());
          await page.waitForTimeout(3000);
          await page.waitForLoadState('networkidle').catch(() => {});
        } else {
          // Try Enter key again
          await searchInput.press('Enter');
          await page.waitForTimeout(3000);
        }
      } catch (e) {
        console.log('[GMC Scraper] Form submit failed:', e);
      }
    }
    
    // Capture screenshot and PDF of the results page
    let screenshot: string | undefined;
    let pdf: string | undefined;
    
    try {
      console.log('[GMC Scraper] Capturing screenshot...');
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      screenshot = screenshotBuffer.toString('base64');
      console.log('[GMC Scraper] Screenshot captured');
      
      console.log('[GMC Scraper] Generating PDF...');
      const pdfBuffer = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      pdf = pdfBuffer.toString('base64');
      console.log('[GMC Scraper] PDF generated');
    } catch (e) {
      console.log('[GMC Scraper] Failed to capture screenshot/PDF:', e);
      // Continue without screenshot/PDF
    }
    
    // Try to find the main results content area
    let mainContentElement = null;
    const mainContentSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      '#main-content',
      'article',
      '.profile',
      '.doctor-profile',
    ];
    
    for (const selector of mainContentSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent() || '';
          // Check if this element contains registration-related content
          if (text.toLowerCase().includes('gmc reference') || text.toLowerCase().includes('registered with') || text.toLowerCase().includes('registration')) {
            mainContentElement = element;
            console.log(`[GMC Scraper] Found main content with selector: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Get page content - prefer main content area, fallback to body
    const pageContent = mainContentElement 
      ? (await mainContentElement.textContent() || '')
      : (await page.textContent('body') || '');
    const lowerContent = pageContent.toLowerCase();
    
    console.log('[GMC Scraper] Page content length:', pageContent.length);
    
    // Check for not found - look for specific error messages
    const notFound = 
      lowerContent.includes('no results') ||
      lowerContent.includes('not found') ||
      lowerContent.includes('no matching') ||
      lowerContent.includes('could not find') ||
      lowerContent.includes('no registrations found') ||
      (lowerContent.includes('error') && lowerContent.includes('registration'));
    
    // Also check if we're still on the search page
    const isStillOnSearchPage = resultsUrl.includes('/our-registers') && !resultsUrl.includes('/doctors/') && !resultsUrl.includes('/pa/') && !resultsUrl.includes('/aa/');
    
    if (notFound || isStillOnSearchPage) {
      return {
        success: false,
        verified: false,
        registrationNumber,
        status: 'not_found',
        result: 'not_found',
        message: 'No registration found with this registration number. Please verify the registration number is correct.',
        verificationDate: new Date().toISOString(),
        screenshot,
        pdf,
      };
    }
    
    // Extract details using HTML structure
    let details: GMCVerificationResult['details'] = {};
    let foundRegistrationNumber = '';
    
    try {
      // Extract name - usually in a large heading, look for the main heading that's not navigation
      const nameSelectors = [
        'h1:not([class*="site"]):not([class*="nav"]):not([class*="header"])',
        'h2:not([class*="site"]):not([class*="nav"]):not([class*="header"])',
        '.name',
        '.doctor-name',
        '[class*="name"]:not([class*="site"]):not([class*="nav"])',
        'main h1',
        'main h2',
        'article h1',
        'article h2',
      ];
      
      for (const selector of nameSelectors) {
        try {
          const nameElement = await page.$(selector);
          if (nameElement) {
            const nameText = await nameElement.textContent();
            if (nameText && nameText.trim().length > 0 && nameText.trim().length < 200) {
              // Filter out cookie policy text and navigation items
              if (!nameText.toLowerCase().includes('cookie') && 
                  !nameText.toLowerCase().includes('storage') &&
                  !nameText.toLowerCase().includes('our registers') &&
                  !nameText.toLowerCase().includes('general medical council') &&
                  !nameText.toLowerCase().includes('search') &&
                  nameText.trim().split(' ').length >= 2) { // Names usually have at least 2 words
                details.fullName = nameText.trim();
                console.log(`[GMC Scraper] Found name: ${details.fullName}`);
                break;
              }
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // Extract GMC reference number and verify it matches
      // Try multiple patterns to find the GMC reference number
      let gmcRefMatch = pageContent.match(/GMC reference number[:\s]+([A-Z]?\d+)/i);
      if (!gmcRefMatch) {
        // Try alternative patterns
        gmcRefMatch = pageContent.match(/GMC reference[:\s]+([A-Z]?\d+)/i);
      }
      if (!gmcRefMatch) {
        // Try without "number"
        gmcRefMatch = pageContent.match(/GMC[:\s]+([A-Z]?\d+)/i);
      }
      if (!gmcRefMatch) {
        // Try to find it in HTML structure
        const gmcRefElement = await page.$('dt:has-text("GMC reference"), label:has-text("GMC reference"), [class*="gmc-reference"], [class*="reference-number"]');
        if (gmcRefElement) {
          const gmcRefText = await gmcRefElement.textContent();
          if (gmcRefText) {
            const match = gmcRefText.match(/([A-Z]?\d+)/);
            if (match) {
              foundRegistrationNumber = match[1].trim();
            }
          }
        }
      } else {
        foundRegistrationNumber = gmcRefMatch[1].trim();
      }
      
      // Also try to find it near the name or in the page URL
      if (!foundRegistrationNumber) {
        // Check if registration number appears in the page content
        const regNumberPattern = new RegExp(`\\b${registrationNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regNumberPattern.test(pageContent)) {
          foundRegistrationNumber = registrationNumber;
          console.log(`[GMC Scraper] Found registration number in page content: ${registrationNumber}`);
        }
      }
      
      // Verify it matches what we searched for
      if (foundRegistrationNumber && foundRegistrationNumber !== registrationNumber) {
        console.log(`[GMC Scraper] Registration number mismatch: searched for ${registrationNumber}, found ${foundRegistrationNumber}`);
        return {
          success: false,
          verified: false,
          registrationNumber,
          status: 'not_found',
          result: 'not_found',
          message: `Registration number mismatch. Found ${foundRegistrationNumber} but searched for ${registrationNumber}.`,
          verificationDate: new Date().toISOString(),
          screenshot,
          pdf,
        };
      }
      
      // If we found a match or the number appears in content, consider it found
      if (foundRegistrationNumber === registrationNumber || (foundRegistrationNumber && foundRegistrationNumber === registrationNumber)) {
        console.log(`[GMC Scraper] Confirmed registration number match: ${registrationNumber}`);
      }
      
      // Extract registration status - look for "Registered with a licence to practise"
      const registeredStatusMatch = pageContent.match(/Registered with (?:a )?licence to practise/i);
      const registeredWithoutLicenceMatch = pageContent.match(/Registered (?:but )?without (?:a )?licence/i);
      
      if (registeredStatusMatch) {
        details.registrationStatus = 'Registered with a licence to practise';
        console.log(`[GMC Scraper] Found registration status: ${details.registrationStatus}`);
      } else if (registeredWithoutLicenceMatch) {
        details.registrationStatus = 'Registered without a licence';
        console.log(`[GMC Scraper] Found registration status: ${details.registrationStatus}`);
      } else {
        // Try to find status in structured format - look for the green box with checkmark
        const statusSelectors = [
          '[class*="status"]',
          '[class*="registration-status"]',
          '.status',
          '[class*="registered"]',
          '[class*="licence"]',
          'div:has-text("Registered")',
        ];
        
        for (const selector of statusSelectors) {
          try {
            const statusElements = await page.$$(selector);
            for (const statusElement of statusElements) {
              const statusText = await statusElement.textContent();
              if (statusText && statusText.trim().length < 200 && 
                  (statusText.toLowerCase().includes('registered') || statusText.toLowerCase().includes('licence'))) {
                details.registrationStatus = statusText.trim();
                console.log(`[GMC Scraper] Found registration status: ${details.registrationStatus}`);
                break;
              }
            }
            if (details.registrationStatus) break;
          } catch (e) {
            // Continue to next selector
          }
        }
      }
      
      // Extract GP Register status
      const gpRegisterMatch = pageContent.match(/GP Register[:\s]+(This doctor is (?:on|not on) the GP Register[^.]*)/i);
      if (gpRegisterMatch) {
        details.gpRegisterStatus = gpRegisterMatch[1].trim();
      }
      
      // Extract Specialist Register status
      const specialistRegisterMatch = pageContent.match(/Specialist Register[:\s]+(This doctor is (?:on|not on) the Specialist Register[^.]*)/i);
      if (specialistRegisterMatch) {
        details.specialistRegisterStatus = specialistRegisterMatch[1].trim();
      }
      
      // Extract registered qualification
      const qualificationMatch = pageContent.match(/Registered qualification[:\s]+([^\n\r<]+)/i);
      if (qualificationMatch) {
        details.registeredQualification = qualificationMatch[1].trim();
      }
      
      // Extract dates
      const provisionalDateMatch = pageContent.match(/Provisional registration date[:\s]+([^\n\r<]+)/i);
      if (provisionalDateMatch) {
        details.provisionalRegistrationDate = provisionalDateMatch[1].trim();
      }
      
      const fullDateMatch = pageContent.match(/Full registration date[:\s]+([^\n\r<]+)/i);
      if (fullDateMatch) {
        details.fullRegistrationDate = fullDateMatch[1].trim();
      }
      
      // Extract gender
      const genderMatch = pageContent.match(/Gender[:\s]+([^\n\r<]+)/i);
      if (genderMatch) {
        details.gender = genderMatch[1].trim();
      }
      
      // Extract revalidation info
      const revalidationMatch = pageContent.match(/This doctor is subject to revalidation[^.]*/i);
      if (revalidationMatch) {
        details.revalidationInfo = revalidationMatch[0].trim();
      }
      
      // Extract designated body
      const designatedBodyMatch = pageContent.match(/Designated body[:\s]+([^\n\r<]+)/i);
      if (designatedBodyMatch) {
        details.designatedBody = designatedBodyMatch[1].trim();
      }
      
      // Extract responsible officer
      const responsibleOfficerMatch = pageContent.match(/Responsible officer[:\s]+([^\n\r<]+)/i);
      if (responsibleOfficerMatch) {
        details.responsibleOfficer = responsibleOfficerMatch[1].trim();
      }
    } catch (e) {
      console.log('[GMC Scraper] Error extracting via HTML structure:', e);
    }
    
    // Validate that we found the correct registration number or at least found registration details
    // If we found name and registration status, but couldn't extract the number, check if the number appears in the page
    if (!foundRegistrationNumber || foundRegistrationNumber !== registrationNumber) {
      // Check if registration number appears anywhere in the page content
      const regNumberPattern = new RegExp(`\\b${registrationNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const numberInPage = regNumberPattern.test(pageContent);
      
      // If we have registration details (name or status) and the number appears in the page, consider it valid
      if ((details.fullName || details.registrationStatus) && numberInPage) {
        console.log(`[GMC Scraper] Registration number ${registrationNumber} found in page content, proceeding with verification`);
        foundRegistrationNumber = registrationNumber; // Set it for validation
      } else {
        console.log(`[GMC Scraper] Could not find matching registration number. Searched for: ${registrationNumber}`);
        console.log(`[GMC Scraper] Found name: ${details.fullName || 'No'}, Found status: ${details.registrationStatus || 'No'}, Number in page: ${numberInPage}`);
        return {
          success: false,
          verified: false,
          registrationNumber,
          status: 'not_found',
          result: 'not_found',
          message: 'Could not find a matching registration number on the results page. The registration may not exist or the page structure may have changed.',
          verificationDate: new Date().toISOString(),
          screenshot,
          pdf,
        };
      }
    }
    
    // Check status based on registration status
    const isActive = 
      lowerContent.includes('registered with a licence') ||
      lowerContent.includes('registered with licence') ||
      (details.registrationStatus && details.registrationStatus.toLowerCase().includes('licence to practise'));
    
    const isSuspended = lowerContent.includes('suspended');
    const isStruckOff = lowerContent.includes('struck off') || lowerContent.includes('struck-off') || lowerContent.includes('erased');
    const isInactive = lowerContent.includes('inactive') || lowerContent.includes('lapsed') || lowerContent.includes('without a licence');
    
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
    
    // If we found registration details with matching registration number, it's a successful verification
    if (foundRegistrationNumber === registrationNumber && (details.fullName || details.registrationStatus || isActive)) {
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
        screenshot,
        pdf,
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
      screenshot,
      pdf,
    };
    
  } catch (error) {
    console.error('[GMC Scraper] Error:', error);
    
    // Try to capture error screenshot
    let screenshot: string | undefined;
    let pdf: string | undefined;
    
    if (browser) {
      try {
        const pages = browser.pages();
        if (pages.length > 0) {
          const page = pages[0];
          try {
            const screenshotBuffer = await page.screenshot({ fullPage: true });
            screenshot = screenshotBuffer.toString('base64');
          } catch (e) {
            console.error('[GMC Scraper] Failed to capture error screenshot:', e);
          }
          
          try {
            const pdfBuffer = await page.pdf({ 
              format: 'A4',
              printBackground: true,
              margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });
            pdf = pdfBuffer.toString('base64');
          } catch (e) {
            console.error('[GMC Scraper] Failed to capture error PDF:', e);
          }
        }
      } catch (e) {
        // Ignore screenshot errors
      }
      
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
      screenshot,
      pdf,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

