/**
 * HCPC (Health and Care Professions Council) Register Scraper
 * 
 * Performs automated verification against the official HCPC register
 * at https://www.hcpc-uk.org/check-the-register/
 */

import { chromium, Browser } from 'playwright';

export interface HCPCVerificationRequest {
  registrationNumber: string;
  profession: string; // Required profession for HCPC verification
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
    location?: string;
    period?: string;
    expiryDate?: string;
  };
  
  verificationDate: string;
  screenshot?: string; // Base64 encoded screenshot of the results page
  pdf?: string; // Base64 encoded PDF of the results page
}

const HCPC_REGISTER_URL = 'https://www.hcpc-uk.org/check-the-register/';

export async function hcpcScraper(request: HCPCVerificationRequest): Promise<HCPCVerificationResult> {
  const { registrationNumber, profession } = request;
  
  // Validate required fields
  if (!profession) {
    return {
      success: false,
      verified: false,
      registrationNumber,
      status: 'error',
      result: 'error',
      message: 'Profession is required for HCPC verification.',
      verificationDate: new Date().toISOString(),
    };
  }
  
  // Map profession names to dropdown values (normalized)
  const professionMap: Record<string, string> = {
    'arts therapist': 'Arts Therapist',
    'biomedical scientist': 'Biomedical scientist',
    'chiropodist': 'Chiropodist / podiatrist',
    'podiatrist': 'Chiropodist / podiatrist',
    'clinical scientist': 'Clinical scientist',
    'dietitian': 'Dietitian',
    'dietician': 'Dietitian',
    'hearing aid dispenser': 'Hearing aid dispenser',
    'occupational therapist': 'Occupational therapist',
    'operating department practitioner': 'Operating department practitioner',
    'orthoptist': 'Orthoptist',
    'paramedic': 'Paramedic',
    'physiotherapist': 'Physiotherapist',
    'practitioner psychologist': 'Practitioner psychologist',
    'psychologist': 'Practitioner psychologist',
    'prosthetist': 'Prosthetist / orthotist',
    'orthotist': 'Prosthetist / orthotist',
    'radiographer': 'Radiographer',
    'speech and language therapist': 'Speech and language therapist',
    'speech therapist': 'Speech and language therapist',
  };
  
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
    
    // Find and select profession dropdown if profession is provided
    if (profession) {
      const normalizedProfession = profession.toLowerCase().trim();
      const mappedProfession = professionMap[normalizedProfession] || profession;
      
      console.log('[HCPC Scraper] Selecting profession:', mappedProfession);
      
      try {
        // Find profession dropdown/select element
        const professionSelectors = [
          'select[name*="profession"]',
          'select[id*="profession"]',
          'select[class*="profession"]',
          'select',
          '[role="combobox"]',
        ];
        
        let professionSelect = null;
        for (const selector of professionSelectors) {
          try {
            const selects = await page.$$(selector);
            for (const select of selects) {
              const selectText = await select.textContent() || '';
              const selectLabel = await page.evaluate((el) => {
                const label = el.closest('label')?.textContent || '';
                const prevLabel = el.previousElementSibling?.textContent || '';
                return label || prevLabel;
              }, select);
              
              // Check if this is the profession dropdown (not site search)
              if (
                (selectText.toLowerCase().includes('profession') || 
                 selectLabel.toLowerCase().includes('profession') ||
                 selectText.toLowerCase().includes('occupational') ||
                 selectText.toLowerCase().includes('dietitian')) &&
                !selectText.toLowerCase().includes('site')
              ) {
                professionSelect = select;
                console.log(`[HCPC Scraper] Found profession dropdown with selector: ${selector}`);
                break;
              }
            }
            if (professionSelect) break;
          } catch (e) {
            // Try next selector
          }
        }
        
        if (professionSelect) {
          // Get all options first
          const options = await professionSelect.$$('option');
          let selected = false;
          
          // Try to find and select the profession
          for (let i = 0; i < options.length; i++) {
            const optionText = (await options[i].textContent())?.trim() || '';
            const optionValue = await options[i].getAttribute('value') || '';
            
            // Check for exact match or partial match
            const optionLower = optionText.toLowerCase();
            const professionLower = mappedProfession.toLowerCase();
            
            if (
              optionText === mappedProfession ||
              optionLower === professionLower ||
              optionLower.includes(normalizedProfession) ||
              normalizedProfession.includes(optionLower.split(' ')[0]) // Match first word
            ) {
              try {
                await professionSelect.selectOption({ index: i });
                console.log(`[HCPC Scraper] Selected profession: "${optionText}" (index: ${i})`);
                await page.waitForTimeout(1000);
                selected = true;
                break;
              } catch (e) {
                // Try by value if index fails
                if (optionValue) {
                  try {
                    await professionSelect.selectOption({ value: optionValue });
                    console.log(`[HCPC Scraper] Selected profession by value: "${optionValue}"`);
                    await page.waitForTimeout(1000);
                    selected = true;
                    break;
                  } catch (e2) {
                    // Continue to next option
                  }
                }
              }
            }
          }
          
          if (!selected) {
            console.log(`[HCPC Scraper] Could not find profession "${mappedProfession}" in dropdown`);
            return {
              success: false,
              verified: false,
              registrationNumber,
              status: 'error',
              result: 'error',
              message: `Could not find profession "${profession}" in the HCPC dropdown. Please verify the profession name is correct.`,
              verificationDate: new Date().toISOString(),
            };
          }
        } else {
          console.log('[HCPC Scraper] Profession dropdown not found');
          return {
            success: false,
            verified: false,
            registrationNumber,
            status: 'error',
            result: 'error',
            message: 'Could not locate the profession dropdown on the HCPC website. The website structure may have changed.',
            verificationDate: new Date().toISOString(),
          };
        }
      } catch (e) {
        console.log('[HCPC Scraper] Error selecting profession:', e);
        // Continue without profession selection
      }
    }
    
    // Find search input (the registration number field)
    const allInputs = await page.$$('input');
    
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
      
      // Look for the "Surname or registration number" input
      const isRegistrationInput = 
        inputPlaceholder.toLowerCase().includes('surname') ||
        inputPlaceholder.toLowerCase().includes('registration') ||
        inputPlaceholder.toLowerCase().includes('number') ||
        inputName?.toLowerCase().includes('registration') ||
        inputName?.toLowerCase().includes('surname') ||
        inputId?.toLowerCase().includes('registration') ||
        inputId?.toLowerCase().includes('surname');
      
      if (
        (inputType === 'text' || !inputType) &&
        !isSiteSearch &&
        isRegistrationInput
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
        'input[placeholder*="Surname or registration number"]',
        'input[placeholder*="surname"]',
        'input[placeholder*="registration"]',
        'input[name="registrationNumber"]',
        'input[name="registration"]',
        'input[type="text"]',
        '#search-input',
        '.search-input',
      ];
      
      for (const selector of searchSelectors) {
        try {
          const inputs = await page.$$(selector);
          for (const input of inputs) {
            const placeholder = await input.getAttribute('placeholder') || '';
            const inputId = await input.getAttribute('id') || '';
            // Skip site search
            if (!inputId.toLowerCase().includes('site-search') && 
                !placeholder.toLowerCase().includes('search the hcpc')) {
              searchInput = input;
              console.log(`[HCPC Scraper] Found search input with selector: ${selector}`);
              foundSelector = selector;
              break;
            }
          }
          if (searchInput) break;
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
      // Clear any existing value first
      await searchInput.click();
      await page.waitForTimeout(200);
      await searchInput.fill('');
      await page.waitForTimeout(200);
      // Try direct fill
      await searchInput.fill(registrationNumber);
      await page.waitForTimeout(500);
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
    
    // Find and click search button - try multiple approaches
    const searchButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Search")',
      'button:has-text("Check")',
      'button[class*="search"]',
      'button[class*="submit"]',
      '.search-button',
      '#search-button',
    ];
    
    let searchButton = null;
    let foundButtonSelector = '';
    
    // First, try to find the button and wait for it to be visible
    for (const selector of searchButtonSelectors) {
      try {
        const buttons = await page.$$(selector);
        for (const btn of buttons) {
          const isVisible = await btn.isVisible();
          const text = await btn.textContent() || '';
          // Look for the Search button specifically
          if (isVisible && (text.toLowerCase().includes('search') || selector.includes('submit'))) {
            searchButton = btn;
            foundButtonSelector = selector;
            console.log(`[HCPC Scraper] Found search button with selector: ${selector}`);
            break;
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
        await page.waitForSelector(foundButtonSelector || searchButtonSelectors[0], { 
          state: 'visible',
          timeout: 5000 
        });
        await page.waitForTimeout(500);
        
        // Try clicking via JavaScript if regular click fails
        try {
          await searchButton.click({ timeout: 5000 });
          console.log('[HCPC Scraper] Clicked search button');
        } catch (clickError) {
          // Fallback: use JavaScript click
          console.log('[HCPC Scraper] Regular click failed, trying JavaScript click');
          await page.evaluate((selector) => {
            const btn = document.querySelector(selector) as HTMLElement;
            if (btn) {
              btn.click();
            }
          }, foundButtonSelector || searchButtonSelectors[0]);
        }
      } catch (e) {
        console.log('[HCPC Scraper] Button click failed, trying Enter key');
        await searchInput.press('Enter');
      }
    } else {
      // No button found, use Enter key
      console.log('[HCPC Scraper] Search button not found, using Enter key');
      await searchInput.press('Enter');
    }
    
    // Wait for results
    console.log('[HCPC Scraper] Waiting for results...');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const resultsUrl = page.url();
    console.log('[HCPC Scraper] Results URL:', resultsUrl);
    
    // Try to find the main results content area first (avoid cookie policy text)
    let mainContentElement = null;
    const mainContentSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      '#main-content',
      '.registration-detail',
      '.professional-registration-detail',
      'article',
      '.results',
    ];
    
    for (const selector of mainContentSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent() || '';
          // Check if this element contains registration-related content
          if (text.toLowerCase().includes('registration') || text.toLowerCase().includes('name') || text.toLowerCase().includes('status')) {
            mainContentElement = element;
            console.log(`[HCPC Scraper] Found main content with selector: ${selector}`);
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
    
    console.log('[HCPC Scraper] Page content length:', pageContent.length);
    
    // Check for not found - look for specific error messages
    const notFound = 
      lowerContent.includes('no results') ||
      lowerContent.includes('not found') ||
      lowerContent.includes('no matching') ||
      lowerContent.includes('could not find') ||
      lowerContent.includes('no registrations found') ||
      lowerContent.includes('no registration found') ||
      (lowerContent.includes('error') && lowerContent.includes('registration'));
    
    // Also check if we're still on the search page (didn't navigate to results)
    const isStillOnSearchPage = resultsUrl.includes('/check-the-register/') && !resultsUrl.includes('professional-registration-detail');
    
    // Capture screenshot and PDF of the results page
    let screenshot: string | undefined;
    let pdf: string | undefined;
    
    try {
      console.log('[HCPC Scraper] Capturing screenshot...');
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      screenshot = screenshotBuffer.toString('base64');
      console.log('[HCPC Scraper] Screenshot captured');
      
      console.log('[HCPC Scraper] Generating PDF...');
      const pdfBuffer = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      pdf = pdfBuffer.toString('base64');
      console.log('[HCPC Scraper] PDF generated');
    } catch (e) {
      console.log('[HCPC Scraper] Failed to capture screenshot/PDF:', e);
      // Continue without screenshot/PDF
    }
    
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
    
    // Extract details using more specific patterns
    let details: HCPCVerificationResult['details'] = {};
    let foundRegistrationNumber = '';
    
    // Try to extract using HTML structure first (more reliable)
    try {
      // Look for specific data fields in the results page
      const nameElement = await page.$('dt:has-text("Name") + dd, label:has-text("Name") + *, [data-field="name"], .name, .full-name');
      if (nameElement) {
        const nameText = await nameElement.textContent();
        if (nameText && nameText.trim().length > 0 && nameText.trim().length < 100) {
          // Filter out cookie policy text - names shouldn't contain these keywords
          if (!nameText.toLowerCase().includes('cookie') && 
              !nameText.toLowerCase().includes('storage') &&
              !nameText.toLowerCase().includes('duration') &&
              !nameText.toLowerCase().includes('maximum')) {
            details.fullName = nameText.trim();
          }
        }
      }
      
      // Extract registration number and verify it matches
      const regElement = await page.$('dt:has-text("Registration number") + dd, label:has-text("Registration number") + *, [data-field="registration"], .registration-number');
      if (regElement) {
        const regText = await regElement.textContent();
        if (regText) {
          foundRegistrationNumber = regText.trim();
          // Verify it matches what we searched for
          if (foundRegistrationNumber !== registrationNumber) {
            console.log(`[HCPC Scraper] Registration number mismatch: searched for ${registrationNumber}, found ${foundRegistrationNumber}`);
            // This might be a different registration, treat as not found
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
        }
      }
      
      // Extract location
      const locationElement = await page.$('dt:has-text("Location") + dd, label:has-text("Location") + *, [data-field="location"], .location');
      if (locationElement) {
        const locationText = await locationElement.textContent();
        if (locationText && locationText.trim().length > 0 && locationText.trim().length < 200) {
          // Filter out cookie policy text
          if (!locationText.toLowerCase().includes('cookie') && 
              !locationText.toLowerCase().includes('storage') &&
              !locationText.toLowerCase().includes('duration') &&
              !locationText.toLowerCase().includes('maximum') &&
              !locationText.toLowerCase().includes('indexeddb') &&
              !locationText.toLowerCase().includes('local storage')) {
            details.location = locationText.trim();
          }
        }
      }
      
      // Extract status
      const statusElement = await page.$('dt:has-text("Status") + dd, label:has-text("Status") + *, [data-field="status"], .status');
      if (statusElement) {
        const statusText = await statusElement.textContent();
        if (statusText && statusText.trim().length > 0 && statusText.trim().length < 100) {
          details.registrationStatus = statusText.trim();
        }
      }
      
      // Extract period
      const periodElement = await page.$('dt:has-text("Period") + dd, label:has-text("Period") + *, [data-field="period"], .period');
      if (periodElement) {
        const periodText = await periodElement.textContent();
        if (periodText && periodText.trim().length > 0 && periodText.trim().length < 100) {
          details.period = periodText.trim();
        }
      }
    } catch (e) {
      console.log('[HCPC Scraper] Error extracting via HTML structure:', e);
    }
    
    // Fallback: Try text-based extraction with better filtering
    if (!details.fullName || !foundRegistrationNumber) {
      const lines = pageContent.split(/\n|\r/).map(line => line.trim()).filter(line => line.length > 0 && line.length < 200);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        // Skip cookie policy lines
        if (line.toLowerCase().includes('cookie') || 
            line.toLowerCase().includes('storage duration') ||
            line.toLowerCase().includes('maximum storage') ||
            line.toLowerCase().includes('indexeddb') ||
            line.toLowerCase().includes('local storage')) {
          continue;
        }
        
        // Extract Name
        if (!details.fullName && (line.match(/^Name[:\s]*$/i) || (line.toLowerCase().startsWith('name:') && line.length < 10))) {
          const nameValue = nextLine || line.replace(/^Name[:\s]*/i, '').trim();
          if (nameValue && nameValue.length > 0 && nameValue.length < 100 &&
              !nameValue.toLowerCase().includes('cookie') &&
              !nameValue.toLowerCase().includes('registration number')) {
            details.fullName = nameValue;
          }
        }
        
        // Extract Registration number (verify it matches)
        if ((line.match(/^Registration number[:\s]*$/i) || (line.toLowerCase().startsWith('registration number:') && line.length < 25)) && !foundRegistrationNumber) {
          const regValue = nextLine || line.replace(/^Registration number[:\s]*/i, '').trim();
          if (regValue && regValue.length > 0) {
            foundRegistrationNumber = regValue;
            // Verify it matches
            if (foundRegistrationNumber !== registrationNumber) {
              console.log(`[HCPC Scraper] Registration number mismatch: searched for ${registrationNumber}, found ${foundRegistrationNumber}`);
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
          }
        }
        
        // Extract Location
        if (!details.location && (line.match(/^Location[:\s]*$/i) || (line.toLowerCase().startsWith('location:') && line.length < 12))) {
          const locationValue = nextLine || line.replace(/^Location[:\s]*/i, '').trim();
          if (locationValue && locationValue.length > 0 && locationValue.length < 200 &&
              !locationValue.toLowerCase().includes('cookie') &&
              !locationValue.toLowerCase().includes('storage') &&
              !locationValue.toLowerCase().includes('duration')) {
            details.location = locationValue;
          }
        }
        
        // Extract Status
        if (!details.registrationStatus && (line.match(/^Status[:\s]*$/i) || (line.toLowerCase().startsWith('status:') && line.length < 10))) {
          const statusValue = nextLine || line.replace(/^Status[:\s]*/i, '').trim();
          if (statusValue && statusValue.length > 0 && statusValue.length < 100) {
            details.registrationStatus = statusValue;
          }
        }
        
        // Extract Period
        if (!details.period && (line.match(/^Period[:\s]*$/i) || (line.toLowerCase().startsWith('period:') && line.length < 10))) {
          const periodValue = nextLine || line.replace(/^Period[:\s]*/i, '').trim();
          if (periodValue && periodValue.length > 0 && periodValue.length < 100) {
            details.period = periodValue;
          }
        }
      }
    }
    
    // Validate that we found the correct registration number
    if (!foundRegistrationNumber || foundRegistrationNumber !== registrationNumber) {
      console.log(`[HCPC Scraper] Could not find matching registration number. Searched for: ${registrationNumber}`);
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
    
    // Extract profession if available
    if (!details.profession) {
      const professionMatch = pageContent.match(/(?:Profession|Title)[:\s]+([^\n\r<]+)/i);
      if (professionMatch) details.profession = professionMatch[1].trim();
    }
    
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
    
    // Validate that we have at least some registration details
    // We must have found the registration number match, and ideally have name or status
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
    
    // If we didn't find matching registration details, it's not found
    if (!foundRegistrationNumber || foundRegistrationNumber !== registrationNumber) {
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
    console.error('[HCPC Scraper] Error:', error);
    
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
            console.error('[HCPC Scraper] Failed to capture error screenshot:', e);
          }
          
          try {
            const pdfBuffer = await page.pdf({ 
              format: 'A4',
              printBackground: true,
              margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });
            pdf = pdfBuffer.toString('base64');
          } catch (e) {
            console.error('[HCPC Scraper] Failed to capture error PDF:', e);
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

