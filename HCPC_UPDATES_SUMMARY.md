# HCPC Verification Updates Summary

## Changes Completed

### 1. ✅ Updated HCPC Scraper (`src/lib/hcpcScraper.ts`)
- Added `profession` parameter support
- Implemented profession dropdown selection
- Added profession name mapping (15 professions)
- Improved input field detection for "Surname or registration number"

### 2. ✅ Updated API Route (`src/app/api/verify/[source]/route.ts`)
- Added `profession` parameter extraction
- Passes profession to HCPC scraper when provided

### 3. ✅ Updated Admin Verifications Page (`src/app/admin/verifications/page.tsx`)

#### Added Profession Dropdown
- Profession dropdown appears when HCPC is selected
- 15 profession options available
- Optional field (helps narrow down search)

#### Added Quick Test Buttons
Four quick-fill buttons for testing:
- **OT61642** (Occupational Therapist) - Auto-fills registration number and profession
- **OT74314** (Occupational Therapist) - Auto-fills registration number and profession
- **DT035366** (Dietitian) - Auto-fills registration number and profession
- **DT034289** (Dietitian) - Auto-fills registration number and profession

**Features:**
- One-click test data filling
- Clear button to reset form
- Visual feedback with colored buttons
- Organized in a grid layout

#### Updated Form Fields
- Registration number placeholder updated to show HCPC format examples
- Profession field conditionally shown only for HCPC
- Default register changed to HCPC for easier testing

### 4. ✅ Updated Worker Onboarding Page (`src/app/worker/onboarding/page.tsx`)

#### Auto-Detection of Profession
The system now automatically detects profession from:
- Certification/License name (e.g., "Occupational Therapist", "Dietitian")
- Registration number prefix (e.g., "OT" = Occupational Therapist, "DT" = Dietitian)
- Issuing body name

**Auto-Detection Logic:**
- `occupational` or `ot` → "Occupational therapist"
- `dietitian`, `dietician`, or `dt` → "Dietitian"
- `physiotherapist` or `physio` → "Physiotherapist"
- `paramedic` → "Paramedic"
- `radiographer` → "Radiographer"
- `speech` or `language therapist` → "Speech and language therapist"
- And 9 more profession mappings

#### Added Verify Buttons
- **Certifications Section**: "Verify Professional Register" button
- **Licenses Section**: "Verify Professional Register" button
- Shows verification status (✓ Verified / ✗ Not Verified)
- Disabled state during verification
- Only shows when certificate/license number and issuing body are provided

#### Updated Placeholders
- Certificate number placeholder: `"e.g., OT61642, DT035366"`
- License number placeholder: `"e.g., OT61642, DT035366"`

### 5. ✅ Created Test Script (`scripts/testHCPC.ts`)
- Comprehensive test script with all test cases
- Tests with and without profession
- Includes invalid registration number test
- Run with: `npm run test:hcpc`

### 6. ✅ Updated Documentation
- `HCPC_VERIFICATION_UPDATE.md` - Implementation details
- `VERIFICATION_SITES_AND_DETAILS.md` - Updated with profession field
- `HCPC_UPDATES_SUMMARY.md` - This file

---

## How to Use

### Admin Verifications Page

1. **Navigate to:** `/admin/verifications`
2. **Select:** "Professional Registers" card
3. **Choose:** "HCPC - Health and Care Professions Council"
4. **Quick Test Options:**
   - Click any of the 4 quick test buttons to auto-fill test data
   - Or manually enter:
     - Registration Number: `OT61642` or `DT035366`
     - Profession: Select from dropdown (optional but recommended)
5. **Click:** "Verify" button

### Worker Onboarding Page

1. **Navigate to:** `/worker/onboarding`
2. **Go to:** Step 3 - Certifications & Licenses
3. **Fill in:**
   - Name: e.g., "Occupational Therapist"
   - Issuing Body: e.g., "HCPC" or "Health and Care Professions Council"
   - Certificate Number: e.g., `OT61642`
4. **Click:** "Verify Professional Register" button
5. **System will:**
   - Auto-detect profession from name/number
   - Include profession in API call
   - Show verification result

---

## Test Data

### Occupational Therapist
- **OT61642** ✅
- **OT74314** ✅

### Dietitian
- **DT035366** ✅
- **DT034289** ✅

---

## API Usage

### With Profession
```json
POST /api/verify/hcpc
{
  "registrationNumber": "OT61642",
  "profession": "Occupational therapist",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-15"
}
```

### Without Profession (Still Works)
```json
POST /api/verify/hcpc
{
  "registrationNumber": "OT61642",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-15"
}
```

---

## UI Improvements

### Admin Page
- ✅ Profession dropdown (15 options)
- ✅ Quick test buttons (4 test cases)
- ✅ Clear button to reset form
- ✅ Better placeholders

### Worker Onboarding
- ✅ Auto-detection of profession
- ✅ Verify buttons for certifications
- ✅ Verify buttons for licenses
- ✅ Visual status indicators
- ✅ Better placeholders

---

## Next Steps

1. **Test the implementation:**
   ```bash
   npm run test:hcpc
   ```

2. **Test in Admin UI:**
   - Go to `/admin/verifications`
   - Click "Professional Registers"
   - Use quick test buttons
   - Verify results

3. **Test in Worker Onboarding:**
   - Go to `/worker/onboarding`
   - Step 3 - Add certification with HCPC
   - Click verify button
   - Check auto-detection works

---

**Status:** ✅ All updates completed and ready for testing!

**Last Updated:** January 2025
