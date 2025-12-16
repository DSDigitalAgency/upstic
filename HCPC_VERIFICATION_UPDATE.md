# HCPC Verification Implementation Update

## Overview
Updated the HCPC (Health and Care Professions Council) verification scraper to support both registration number and profession selection.

---

## Changes Made

### 1. Updated HCPC Scraper (`src/lib/hcpcScraper.ts`)

#### Added Profession Support
- Added optional `profession` parameter to `HCPCVerificationRequest` interface
- Implemented profession dropdown selection logic
- Added profession name mapping for flexible input

#### Profession Mapping
The scraper now accepts profession names in various formats and maps them to the exact dropdown values:

| Input | Mapped To |
|-------|-----------|
| `occupational therapist`, `occupational` | `Occupational therapist` |
| `dietitian`, `dietician` | `Dietitian` |
| `arts therapist` | `Arts Therapist` |
| `biomedical scientist` | `Biomedical scientist` |
| `chiropodist`, `podiatrist` | `Chiropodist / podiatrist` |
| `clinical scientist` | `Clinical scientist` |
| `hearing aid dispenser` | `Hearing aid dispenser` |
| `operating department practitioner` | `Operating department practitioner` |
| `orthoptist` | `Orthoptist` |
| `paramedic` | `Paramedic` |
| `physiotherapist` | `Physiotherapist` |
| `practitioner psychologist`, `psychologist` | `Practitioner psychologist` |
| `prosthetist`, `orthotist` | `Prosthetist / orthotist` |
| `radiographer` | `Radiographer` |
| `speech and language therapist`, `speech therapist` | `Speech and language therapist` |

#### Search Flow
1. **Navigate** to HCPC register page
2. **Handle cookie consent** (if present)
3. **Select profession** (if provided) from dropdown
4. **Enter registration number** in search field
5. **Click search** button
6. **Parse results** and extract registration details

---

### 2. Updated API Route (`src/app/api/verify/[source]/route.ts`)

- Added `profession` parameter extraction from request body
- Passes profession to HCPC scraper when provided

**API Request Example:**
```json
{
  "registrationNumber": "OT61642",
  "profession": "Occupational therapist",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-15"
}
```

---

### 3. Created Test Script (`scripts/testHCPC.ts`)

Comprehensive test script with real test data:

**Test Cases:**
- ✅ Occupational Therapist - OT61642 (with profession)
- ✅ Occupational Therapist - OT74314 (with profession)
- ✅ Dietitian - DT035366 (with profession)
- ✅ Dietitian - DT034289 (with profession)
- ✅ Occupational Therapist - OT61642 (without profession)
- ✅ Dietitian - DT035366 (without profession)
- ❌ Invalid registration number

**Run Tests:**
```bash
npm run test:hcpc
```

---

## Website Structure

**URL:** `https://www.hcpc-uk.org/check-the-register/`

**Form Fields:**
1. **Surname or registration number** (text input)
   - Accepts either surname or registration number
   - Placeholder: "Surname or registration number"

2. **Choose a profession** (dropdown/select)
   - 15 profession options available
   - Optional field - can search without it

3. **Search button**
   - Submits the form

**Profession Options:**
- Arts Therapist
- Biomedical scientist
- Chiropodist / podiatrist
- Clinical scientist
- Dietitian
- Hearing aid dispenser
- Occupational therapist
- Operating department practitioner
- Orthoptist
- Paramedic
- Physiotherapist
- Practitioner psychologist
- Prosthetist / orthotist
- Radiographer
- Speech and language therapist

---

## Test Data

### Occupational Therapist
- **OT61642** - Should verify successfully
- **OT74314** - Should verify successfully

### Dietitian
- **DT035366** - Should verify successfully
- **DT034289** - Should verify successfully

---

## Usage Examples

### Via API
```bash
curl -X POST http://localhost:3000/api/verify/hcpc \
  -H "Content-Type: application/json" \
  -d '{
    "registrationNumber": "OT61642",
    "profession": "Occupational therapist"
  }'
```

### Via Code
```typescript
import { hcpcScraper } from '@/lib/hcpcScraper';

const result = await hcpcScraper({
  registrationNumber: 'OT61642',
  profession: 'Occupational therapist', // Optional
});
```

---

## Implementation Details

### Profession Selection Logic
1. Normalizes input profession name to lowercase
2. Maps to exact dropdown value using professionMap
3. Finds profession dropdown by checking:
   - Select elements with "profession" in name/id/class
   - Select elements containing profession-related text
4. Matches option by:
   - Exact text match
   - Case-insensitive match
   - Partial match (contains)
   - First word match
5. Selects profession from dropdown
6. Continues with registration number search

### Registration Number Search
1. Finds input field by:
   - Placeholder containing "surname" or "registration"
   - Name/id containing "registration" or "surname"
2. Fills in registration number
3. Clicks search button or presses Enter
4. Waits for results page
5. Parses registration details

### Result Parsing
Extracts:
- Full name
- Profession
- Registration status
- Determines if registration is active, inactive, suspended, or struck off

---

## Status

✅ **Fully Implemented**
- Profession selection support
- Registration number search
- Result parsing
- Error handling
- Test script created

---

## Next Steps

1. **Test the implementation:**
   ```bash
   npm run test:hcpc
   ```

2. **Verify with real data:**
   - Test OT61642 with "Occupational therapist"
   - Test OT74314 with "Occupational therapist"
   - Test DT035366 with "Dietitian"
   - Test DT034289 with "Dietitian"

3. **Monitor for any issues:**
   - Check if profession dropdown selectors work correctly
   - Verify registration number input field is found
   - Ensure results are parsed correctly

---

**Last Updated:** January 2025
