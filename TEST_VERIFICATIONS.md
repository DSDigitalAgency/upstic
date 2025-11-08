# Verification Services Test Guide

This guide explains how to test all the verification services that have been integrated into the worker onboarding process.

## Available Test Scripts

### 1. Node.js Test Script (Recommended)

The Node.js test script provides detailed output and is easier to read.

**Prerequisites:**
- Node.js 18+ (for native fetch support)

**Usage:**
```bash
# Test against localhost:3000 (default)
npm run test:verifications

# Or run directly
node test-verifications.js

# Test against a different URL
BASE_URL=http://localhost:3001 node test-verifications.js
```

### 2. Bash/Curl Test Script

The bash script uses curl and works on any system with bash and curl installed.

**Prerequisites:**
- bash
- curl

**Usage:**
```bash
# Test against localhost:3000 (default)
./test-verifications.sh

# Test against a different URL
./test-verifications.sh http://localhost:3001
```

## What Gets Tested

The test scripts verify the following endpoints:

### 1. Ofqual Qualification Verification
- **Endpoint:** `GET/POST /api/verify/ofqual/qualification`
- **Purpose:** Verify qualifications against the Ofqual register
- **Test Data:** Sample qualification number and title

### 2. DBS Update Service Verification
- **Endpoint:** `POST /api/verify/dbs/update-service`
- **Purpose:** Verify DBS Update Service status
- **Test Data:** Sample DBS certificate number, surname, and date of birth

### 3. Professional Register Verification
Tests multiple professional registers:
- **NMC** (Nursing and Midwifery Council): `POST /api/verify/nmc`
- **GMC** (General Medical Council): `POST /api/verify/gmc`
- **HCPC** (Health and Care Professions Council): `POST /api/verify/hcpc`
- **GDC** (General Dental Council): `POST /api/verify/gdc`
- **GPhC** (General Pharmaceutical Council): `POST /api/verify/gphc`
- **GOC** (General Optical Council): `POST /api/verify/goc`
- **GCC** (General Chiropractic Council): `POST /api/verify/gcc`
- **Social Work England**: `POST /api/verify/social-work-england`
- **NHS Performers List**: `POST /api/verify/nhs-performers`

### 4. Right to Work Verification
- **Endpoint:** `POST /api/verify/rtw/share-code`
- **Purpose:** Verify right to work status using share code
- **Test Data:** Sample share code and date of birth

### 5. ECS (Employer Checking Service) Verification
- **Endpoint:** `POST /api/verify/ecs`
- **Purpose:** Verify work status via Employer Checking Service
- **Test Data:** Sample share code and date of birth

### 6. Error Handling Tests
- Invalid professional register (should return 400)
- Missing required fields (should return 400)

## Expected Results

### Successful Tests
- HTTP status code matches expected (usually 200)
- Response contains `success: true`
- Response contains `data` object with verification results

### Verification Results
- `ok: true` - Verification successful (may not always be true with test data)
- `ok: false` - Verification failed (expected for invalid test data)
- Error messages are displayed when verification fails

## Manual Testing

You can also test endpoints manually using curl:

### Example: Test Ofqual Verification
```bash
curl -X POST http://localhost:3000/api/verify/ofqual/qualification \
  -H "Content-Type: application/json" \
  -d '{
    "qualificationNumber": "601/8830/6",
    "qualificationTitle": "Level 3 Diploma in Health and Social Care",
    "awardingOrganisation": "Pearson"
  }'
```

### Example: Test DBS Update Service
```bash
curl -X POST http://localhost:3000/api/verify/dbs/update-service \
  -H "Content-Type: application/json" \
  -d '{
    "certificateNumber": "001913551408",
    "surname": "KUJU",
    "dob": {
      "day": "27",
      "month": "5",
      "year": "1994"
    },
    "format": "html"
  }'
```

### Example: Test Professional Register (NMC)
```bash
curl -X POST http://localhost:3000/api/verify/nmc \
  -H "Content-Type: application/json" \
  -d '{
    "registrationNumber": "12A3456",
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1990-01-15"
  }'
```

### Example: Test Right to Work
```bash
curl -X POST http://localhost:3000/api/verify/rtw/share-code \
  -H "Content-Type: application/json" \
  -d '{
    "shareCode": "ABC123DEF456",
    "dateOfBirth": "1990-05-15"
  }'
```

## Notes

1. **Test Data**: The test scripts use sample data. Real verification results depend on the actual external services being available and the data matching real records.

2. **Mock Responses**: Currently, the verification endpoints return mock/successful responses. In production, these would connect to actual verification services.

3. **Error Handling**: The scripts test both success and error scenarios to ensure proper error handling.

4. **Service Availability**: Some services (like RTW, ECS, Professional Registers) require browser automation (Playwright) in production. The current implementation returns mock responses.

## Troubleshooting

### Server Not Running
If you get connection errors, make sure your Next.js development server is running:
```bash
npm run dev
```

### Port Conflicts
If port 3000 is in use, start the server on a different port:
```bash
npm run dev -- -p 3001
```
Then update the BASE_URL in the test script.

### Node.js Version
If you get "fetch is not available" error, ensure you're using Node.js 18+:
```bash
node --version
```

## Integration with Onboarding

These verification services are integrated into the worker onboarding form:
- **Step 3**: Certifications and Licenses can be verified with Ofqual and Professional Registers
- **Step 7**: Right to Work, DBS Update Service, and ECS can be verified

All verification results are saved to the worker profile and can be viewed by admins and clients.

