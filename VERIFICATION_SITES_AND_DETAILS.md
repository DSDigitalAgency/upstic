# Verification Sites URLs and Required Details

This document provides a complete list of all verification service websites, URLs, and the details/fields required for each verification.

---

## 📋 Table of Contents

1. [DBS Verification](#1-dbs-verification)
2. [Professional Register Verification](#2-professional-register-verification)
3. [Right to Work Verification](#3-right-to-work-verification)
4. [Qualification Verification](#4-qualification-verification)
5. [ID Verification](#5-id-verification)
6. [Driver License Verification](#6-driver-license-verification)
7. [Training & Certificate Verification](#7-training--certificate-verification)
8. [Other Verification Services](#8-other-verification-services)

---

## 1. DBS Verification

### 1.1. DBS Certificate Verification
**Website URL:** `https://perform-check.upstic.com/status/check`  
**API Endpoint:** `POST /api/dbs-verify`  
**Status:** ✅ Fully Implemented & Working  
**Method:** Direct API Integration

**Required Details:**
- `certificateNumber` (string) - DBS certificate number (e.g., "001913551408")
- `applicantSurname` (string) - Surname of the certificate holder (e.g., "KUJU")
- `dob` (object) - Date of birth:
  - `day` (string) - Day (e.g., "27")
  - `month` (string) - Month (e.g., "5")
  - `year` (string) - Year (e.g., "1994")
- `organisationName` (string, optional) - Default: "Upstic Healthcare"
- `requesterForename` (string, optional) - Default: "Upstic"
- `requesterSurname` (string, optional) - Default: "Admin"

**Notes:**
- This is the only fully functional verification with real API integration
- Returns verification status: `clear_and_current`, `current`, or `not_current`
- No browser automation required - direct API call

---

### 1.2. DBS Update Service Verification
**Website URL:** `https://secure.crbonline.gov.uk/cro/check`  
**Public Info:** `https://www.gov.uk/dbs-update-service`  
**API Endpoint:** `POST /api/verify/dbs/update-service`  
**Status:** ✅ Implemented (Browser automation ready)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `certificateNumber` (string) - DBS certificate number
- `surname` (string) - Surname of the certificate holder
- `dob` (object) - Date of birth:
  - `day` (string)
  - `month` (string)
  - `year` (string)
- `format` (string, optional) - Output format: `"html"` or `"pdf"` (default: "html")

**Notes:**
- Requires browser automation (Playwright)
- Certificate holder must be subscribed to DBS Update Service
- HTML snapshot is free; PDF generation requires Playwright
- Can be automated via web scraping/browser automation

---

### 1.3. New DBS Check (E-bulk Plus)
**Website URL:** `https://ebulk.co.uk/dbs-check`  
**API Endpoint:** `POST /api/verify/dbs/new-check`  
**Status:** ✅ Implemented (Mock responses for demo)  
**Method:** Third-Party Integration / Redirect

**Required Details:**
- `redirectUrl` (string, optional) - Custom redirect URL after completion
- `applicantData` (object):
  - `firstName` (string) - First name
  - `lastName` (string) - Last name
  - `dateOfBirth` (string) - Date of birth (YYYY-MM-DD format)
  - `address` (string) - Full address

**Notes:**
- Third-party service integration
- Redirects to E-bulk Plus website for application
- Results need to be saved as PDF format

---

## 2. Professional Register Verification

### 2.1. NMC (Nursing and Midwifery Council)
**Website URL:** `https://www.nmc.org.uk/registration/check-the-register/`  
**API Endpoint:** `POST /api/verify/nmc`  
**Status:** ✅ Fully Implemented (Browser automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - NMC registration number (e.g., "12A3456")
- `firstName` (string, optional) - First name
- `lastName` (string, optional) - Last name
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Fully implemented with browser automation
- Uses web scraping to check the register

---

### 2.2. HCPC (Health and Care Professions Council)
**Website URL:** `https://www.hcpc-uk.org/check-the-register/`  
**API Endpoint:** `POST /api/verify/hcpc`  
**Status:** ✅ Fully Implemented (Browser automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - HCPC registration number (e.g., "OT61642", "DT035366")
- `profession` (string, optional) - Profession name to narrow down search. Supported values:
  - `"Occupational therapist"` or `"occupational therapist"`
  - `"Dietitian"` or `"dietitian"`
  - `"Arts Therapist"`, `"Biomedical scientist"`, `"Chiropodist / podiatrist"`, `"Clinical scientist"`, `"Hearing aid dispenser"`, `"Operating department practitioner"`, `"Orthoptist"`, `"Paramedic"`, `"Physiotherapist"`, `"Practitioner psychologist"`, `"Prosthetist / orthotist"`, `"Radiographer"`, `"Speech and language therapist"`
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Form Fields on Website:**
1. **Surname or registration number** (text input) - Required
2. **Choose a profession** (dropdown) - Optional, helps narrow down results

**Test Data:**
- Occupational Therapist: `OT61642`, `OT74314`
- Dietitian: `DT035366`, `DT034289`

**Notes:**
- Fully implemented with browser automation
- Uses web scraping to check the register
- Profession selection is optional but recommended for more accurate results
- Supports 15 different professions

---

### 2.3. GMC (General Medical Council)
**Website URL:** `https://www.gmc-uk.org/registration-and-licensing/the-medical-register`  
**API Endpoint:** `POST /api/verify/gmc`  
**Status:** ✅ Fully Implemented (Browser automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - GMC registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Fully implemented with browser automation
- Uses web scraping to check the medical register

---

### 2.4. GDC (General Dental Council)
**Website URL:** `https://olr.gdc-uk.org/searchregister`  
**Alternative URL:** `https://www.gdc-uk.org/check-a-register`  
**API Endpoint:** `POST /api/verify/gdc`  
**Status:** ✅ Fully Implemented (Browser automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - GDC registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Fully implemented with browser automation
- Uses web scraping to check the dental register

---

### 2.5. GPhC (General Pharmaceutical Council)
**Website URL:** `https://www.pharmacyregulation.org/registers`  
**API Endpoint:** `POST /api/verify/gphc`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - GPhC registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.6. GOC (General Optical Council)
**Website URL:** `https://str.optical.org`  
**Alternative URL:** `https://www.optical.org/en/Registration/Check-the-register/`  
**API Endpoint:** `POST /api/verify/goc`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - GOC registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.7. GCC (General Chiropractic Council)
**Website URL:** `https://www.gcc-uk.org/check-the-register`  
**API Endpoint:** `POST /api/verify/gcc`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - GCC registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.8. Social Work England
**Website URL:** `https://www.socialworkengland.org.uk/umbraco/surface/searchregister/results`  
**Alternative URL:** `https://www.socialworkengland.org.uk/registration/check-the-register/`  
**API Endpoint:** `POST /api/verify/social-work-england`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - Social Work England registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.9. PAMVR (Physician Associate Managed Voluntary Register)
**Website URL:** `https://www.fparcp.co.uk/pamvr/search`  
**API Endpoint:** `POST /api/verify/pamvr`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - PAMVR registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.10. Osteopathy (GOsC)
**Website URL:** `https://www.osteopathy.org.uk/register-search/`  
**Alternative URL:** `https://www.osteopathy.org.uk/register-check/`  
**API Endpoint:** `POST /api/verify/osteopathy`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - Osteopathy registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.11. PSNI (Pharmaceutical Society of Northern Ireland)
**Website URL:** `https://registers.psni.org.uk`  
**API Endpoint:** `POST /api/verify/psni`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - PSNI registration number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- No public API available

---

### 2.12. NHS Performers List
**Website URL:** `https://secure.pcse.england.nhs.uk/PerformersLists/`  
**Alternative URL:** `https://www.nhs.uk/service-search/other-services/GP/Results`  
**API Endpoint:** `POST /api/verify/nhs-performers`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `registrationNumber` (string) - NHS Performers List number
- `firstName` (string, optional)
- `lastName` (string, optional)
- `dateOfBirth` (string, optional) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Ready for browser automation implementation
- Secure portal - may require authentication
- No public API available

---

## 3. Right to Work Verification

### 3.1. Right to Work Share Code Verification
**Website URL:** `https://www.gov.uk/view-right-to-work`  
**Service URL:** `https://right-to-work.service.gov.uk`  
**API Endpoint:** `POST /api/verify/rtw/share-code`  
**Status:** ✅ Implemented (Browser automation ready)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `shareCode` (string) - 9-character alphanumeric share code (e.g., "ABC123DEF")
- `dateOfBirth` (string) - Date of birth (YYYY-MM-DD format)

**Notes:**
- Share codes are typically valid for 90 days
- Applicant must generate share code from their UKVI account
- Results need to be saved as PDF format
- Requires browser automation with user consent
- Compliance with UK Government service ToS required

---

### 3.2. British Citizen Right to Work Verification

#### 3.2.1. CREDAS
**Website URL:** `https://credas.com/verify`  
**Documentation:** Third-party integration  
**API Endpoint:** `POST /api/verify/rtw/british-citizen` (provider: "credas")  
**Status:** ✅ Implemented (Mock responses - ready for integration)  
**Method:** Third-Party Integration / Redirect

**Required Details:**
- `provider` (string) - Must be `"credas"`
- `redirectUrl` (string, optional) - Custom redirect URL

**Notes:**
- Third-party identity verification service
- Redirects to CREDAS website
- Results need to be saved as PDF format
- Requires API key/credentials from CREDAS

---

#### 3.2.2. E-bulk
**Website URL:** `https://ebulk.co.uk`  
**API Endpoint:** `POST /api/verify/rtw/british-citizen` (provider: "ebulk")  
**Status:** ✅ Implemented (Mock responses - ready for integration)  
**Method:** Third-Party Integration / Redirect

**Required Details:**
- `provider` (string) - Must be `"ebulk"`
- `redirectUrl` (string, optional) - Custom redirect URL

**Notes:**
- Third-party identity verification service
- Redirects to E-bulk website
- Results need to be saved as PDF format
- Requires API key/credentials from E-bulk

---

#### 3.2.3. Yoti
**Website URL:** `https://www.yoti.com`  
**Documentation:** `https://developers.yoti.com`  
**API Endpoint:** `POST /api/verify/rtw/british-citizen` (provider: "yoti")  
**Status:** ✅ Implemented (Mock responses - ready for integration)  
**Method:** Third-Party Integration / Redirect

**Required Details:**
- `provider` (string) - Must be `"yoti"`
- `redirectUrl` (string, optional) - Custom redirect URL

**Notes:**
- Third-party identity verification service
- Redirects to Yoti website
- Results need to be saved as PDF format
- Requires API key/credentials from Yoti

---

### 3.3. UKVI Account / Immigration Status Verification
**Website URL:** `https://www.gov.uk/get-access-evisa`  
**API Endpoint:** `POST /api/verify/rtw/ukvi`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `email` (string, optional) - For UKVI account access
- `shareCode` (string, optional) - For immigration status check
- `dateOfBirth` (string, optional) - Required if using shareCode (YYYY-MM-DD format)

**Notes:**
- Two types of verification:
  1. UKVI account access (requires email)
  2. Immigration status (requires shareCode + dateOfBirth)
- Requires browser automation with user consent
- Compliance with UK Government service ToS required

---

### 3.4. Employee Immigration Status Verification
**Website URL:** `https://www.gov.uk/employee-immigration-employment-status`  
**API Endpoint:** `POST /api/verify/rtw/immigration-status`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `shareCode` (string) - Share code from employee
- `dateOfBirth` (string) - Date of birth (YYYY-MM-DD format)
- `supplementaryDocument` (string, optional) - File reference for supplementary documents

**Notes:**
- For non-British citizens
- Results need to be saved as PDF format
- Option to upload supplementary documents
- Requires browser automation with user consent
- Compliance with UK Government service ToS required

---

### 3.5. Employer Checking Service (ECS)
**Website URL:** `https://www.gov.uk/employer-checking-service`  
**API Endpoint:** `POST /api/verify/ecs`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation (Playwright)

**Required Details:**
- `shareCode` (string) - ECS share code
- `dateOfBirth` (string) - Date of birth (YYYY-MM-DD format)

**Notes:**
- For employers to check right to work
- Requires browser automation with user consent
- Compliance with UK Government service ToS required

---

## 4. Qualification Verification

### 4.1. Ofqual Qualification Verification
**Website URL:** `https://register.ofqual.gov.uk`  
**API URL:** `https://register.ofqual.gov.uk/api/qualifications`  
**API Endpoint:** `GET /api/verify/ofqual/qualification` or `POST /api/verify/ofqual/qualification`  
**Status:** ✅ Implemented (Mock responses - ready for real API)  
**Method:** Direct API Integration (Optional)

**Required Details:**
- `qualificationNumber` (string) - Qualification number (e.g., "601/8830/6")
- `qualificationTitle` (string, optional) - Qualification title (e.g., "Level 3 Diploma")
- `awardingOrganisation` (string, optional) - Awarding organisation (e.g., "Pearson")

**Notes:**
- Open Ofqual API available (optional)
- Can use GET with query parameters or POST with JSON body
- Ready for real API integration

---

## 5. ID Verification

### 5.1. Onfido ID Verification
**Website URL:** `https://onfido.com`  
**Documentation:** `https://documentation.onfido.com`  
**API Endpoint:** `POST /api/verify/id/onfido`  
**Status:** ✅ Implemented (Mock responses - ready for integration)  
**Method:** Third-Party Integration / Redirect

**Required Details:**
- `redirectUrl` (string, optional) - Custom redirect URL after verification

**Notes:**
- Third-party identity verification service
- Redirects to Onfido website
- Requires API key/credentials from Onfido
- Results returned via redirect/webhook

---

### 5.2. GBG ID Verification
**Website URL:** `https://www.gbgplc.com`  
**API Endpoint:** `POST /api/verify/id/gbg`  
**Status:** ✅ Implemented (Mock responses - ready for integration)  
**Method:** Third-Party Integration / Redirect

**Required Details:**
- `redirectUrl` (string, optional) - Custom redirect URL after verification

**Notes:**
- GB Group identity verification service
- Redirects to GBG website
- Requires API key/credentials from GBG
- Results returned via redirect/webhook

---

## 6. Driver License Verification

### 6.1. DVLA Driver License Verification
**Website URL:** `https://www.gov.uk/dvla`  
**API Documentation:** DVLA APIs  
**API Endpoint:** `POST /api/verify/dvla`  
**Status:** ✅ Implemented (Mock responses - ready for DVLA API integration)  
**Method:** DVLA API Integration

**Required Details (varies by type):**

**Authentication (`type: "auth"`):**
- `type` (string) - Must be `"auth"`
- `licenseNumber` (string) - Driver license number
- `postcode` (string) - Postcode
- `dateOfBirth` (string) - Date of birth (YYYY-MM-DD format)

**Driver Data (`type: "driver-data"`):**
- `type` (string) - Must be `"driver-data"`
- `licenseNumber` (string) - Driver license number
- `postcode` (string) - Postcode

**Vehicle Check (`type: "vehicle"`):**
- `type` (string) - Must be `"vehicle"`
- `registrationNumber` (string) - Vehicle registration number

**Driver Image (`type: "driver-image"`):**
- `type` (string) - Must be `"driver-image"`
- `licenseNumber` (string) - Driver license number

**Notes:**
- DVLA provides multiple APIs:
  - Authentication API
  - Access to Driver Data API
  - Vehicle Enquiry Service
  - Driver Image API
- Requires API credentials from DVLA
- Each API serves a different purpose and is called independently

---

## 7. Training & Certificate Verification

### 7.1. Mandatory Training Certificate Verification
**Website URL:** `https://www.healthcare-register.co.uk`  
**API Endpoint:** `POST /api/verify/training-certificates`  
**Status:** ✅ Implemented (Mock responses - ready for automation)  
**Method:** Browser Automation + Email Automation

**Required Details:**
- `certificateNumber` (string) - Training certificate number (e.g., "CERT123456")
- `providerName` (string) - Training provider name (e.g., "Training Provider Ltd")
- `certificateType` (string) - Type of certificate (e.g., "Manual Handling")
- `email` (string) - Worker email address

**Notes:**
- No API available - requires browser automation
- Automated email sent to providers for verification
- Can be automated for Daily/Weekly/Monthly checks
- Uses browser automation to check healthcare register
- Automated email to providers for training verification

---

### 7.2. Certificate of Sponsorship (COS) Verification
**Website URL:** UK Home Office Sponsorship System  
**API Endpoint:** `POST /api/verify/cos`  
**Status:** ✅ Implemented (Mock responses - ready for email automation)  
**Method:** Email Automation

**Required Details:**
- `cosNumber` (string) - Certificate of Sponsorship number (e.g., "COS123456")
- `email` (string) - Worker email address
- `automatedEmail` (boolean) - Set to `true` for automated email

**Notes:**
- Email automation required
- Automated email sent for verification
- COS verification via email

---

### 7.3. HPAN Check
**Website URL:** NHS HPAN System  
**API Endpoint:** `POST /api/verify/hpan`  
**Status:** ✅ Implemented (Mock responses - ready for email automation)  
**Method:** Email Automation

**Required Details:**
- `hpanNumber` (string) - HPAN number (e.g., "HPAN123456")
- `email` (string) - Worker email address
- `automatedEmail` (boolean) - Set to `true` for automated email

**Notes:**
- HPAN (Healthcare Professional Alert Notice) checks
- Automated email verification
- Email automation required

---

## 8. Other Verification Services

### 8.1. Bank Account Verification
**Website URL:** Bank Verification Service (Third-party)  
**API Endpoint:** `POST /api/payments/bank-account/verify/{workerId}`  
**Status:** ✅ Implemented  
**Method:** Third-Party API Integration

**Required Details:**
- `accountNumber` (string) - Bank account number (e.g., "12345678")
- `sortCode` (string) - Bank sort code (e.g., "12-34-56")

**Notes:**
- Third-party bank verification service
- Requires API credentials from bank verification provider

---

## 📊 Summary Table

| Service | Website URL | Required Fields | Method | Status |
|---------|------------|----------------|--------|--------|
| **DBS Certificate** | `https://perform-check.upstic.com/status/check` | certificateNumber, applicantSurname, dob | API | ✅ Working |
| **DBS Update Service** | `https://secure.crbonline.gov.uk/cro/check` | certificateNumber, surname, dob | Browser Automation | ✅ Ready |
| **New DBS (E-bulk)** | `https://ebulk.co.uk/dbs-check` | applicantData (firstName, lastName, dob, address) | 3rd Party | ✅ Ready |
| **NMC** | `https://www.nmc.org.uk/registration/check-the-register/` | registrationNumber, firstName, lastName, dateOfBirth | Browser Automation | ✅ Working |
| **HCPC** | `https://www.hcpc-uk.org/check-the-register/` | registrationNumber, firstName, lastName, dateOfBirth | Browser Automation | ✅ Working |
| **GMC** | `https://www.gmc-uk.org/registration-and-licensing/the-medical-register` | registrationNumber, firstName, lastName, dateOfBirth | Browser Automation | ✅ Working |
| **GDC** | `https://olr.gdc-uk.org/searchregister` | registrationNumber, firstName, lastName, dateOfBirth | Browser Automation | ✅ Working |
| **RTW Share Code** | `https://www.gov.uk/view-right-to-work` | shareCode, dateOfBirth | Browser Automation | ✅ Ready |
| **RTW British Citizen** | CREDAS/E-bulk/Yoti | provider | 3rd Party | ✅ Ready |
| **UKVI** | `https://www.gov.uk/get-access-evisa` | email or shareCode, dateOfBirth | Browser Automation | ✅ Ready |
| **Immigration Status** | `https://www.gov.uk/employee-immigration-employment-status` | shareCode, dateOfBirth | Browser Automation | ✅ Ready |
| **ECS** | `https://www.gov.uk/employer-checking-service` | shareCode, dateOfBirth | Browser Automation | ✅ Ready |
| **Ofqual** | `https://register.ofqual.gov.uk/api/qualifications` | qualificationNumber, qualificationTitle, awardingOrganisation | API | ✅ Ready |
| **Onfido** | `https://onfido.com` | redirectUrl (optional) | 3rd Party | ✅ Ready |
| **GBG** | `https://www.gbgplc.com` | redirectUrl (optional) | 3rd Party | ✅ Ready |
| **DVLA** | `https://www.gov.uk/dvla` | type, licenseNumber, postcode, dateOfBirth (varies by type) | API | ✅ Ready |
| **Training Certificates** | `https://www.healthcare-register.co.uk` | certificateNumber, providerName, certificateType, email | Browser + Email | ✅ Ready |
| **COS** | UK Home Office | cosNumber, email | Email Automation | ✅ Ready |
| **HPAN** | NHS System | hpanNumber, email | Email Automation | ✅ Ready |

---

## 🔧 Implementation Requirements

### Browser Automation Services
These services require Playwright/browser automation:
- DBS Update Service
- All Professional Registers (NMC, HCPC, GMC, GDC, etc.)
- Right to Work Share Code
- UKVI Account/Immigration Status
- Employee Immigration Status
- ECS
- Training Certificates

### Third-Party Integration Services
These services require API keys/credentials:
- CREDAS (British Citizen RTW)
- E-bulk (British Citizen RTW, New DBS)
- Yoti (British Citizen RTW)
- Onfido (ID Verification)
- GBG (ID Verification)
- DVLA (Driver License)

### Email Automation Services
These services require email automation:
- COS Verification
- HPAN Check
- Training Certificate Verification (to providers)

### Direct API Services
These services have direct API access:
- DBS Certificate Verification (✅ Working)
- Ofqual Qualification Verification (Ready)

---

## 📝 Important Notes

1. **Browser Automation**: Most verification services require browser automation (Playwright) as they don't have public APIs. Compliance with each service's Terms of Service is required.

2. **Third-Party Services**: Services like Onfido, GBG, CREDAS, E-bulk, and Yoti require API keys and credentials from the respective providers.

3. **PDF Results**: Several services require results to be saved as PDF format:
   - Right to Work Share Code
   - Employee Immigration Status
   - British Citizen RTW (all providers)

4. **Share Codes**: Share codes for Right to Work and Immigration Status are typically valid for 90 days and must be generated by the applicant from their UKVI account.

5. **Automated Checks**: Some services support automated Daily/Weekly/Monthly checks:
   - Professional Registers
   - Training Certificates
   - HPAN Checks

---

**Last Updated:** January 2025
