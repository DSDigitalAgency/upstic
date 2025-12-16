# Files Making Verification API Requests

This document lists all files in the codebase that send API requests to verification endpoints.

---

## 📁 Main Files Making Verification API Calls

### 1. **Worker Onboarding Page** (Primary File)
**File:** `src/app/worker/onboarding/page.tsx`  
**Purpose:** Main worker onboarding form with all verification handlers

**Verification Handlers in this file:**

#### DBS Verification
- **Line 667:** `handleDBSVerification()` - Calls `/api/dbs-verify`
  ```typescript
  const response = await fetch('/api/dbs-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      certificateNumber: work.dbsNumber,
      applicantSurname: formData.lastName.toUpperCase(),
      dob: { day, month, year }
    })
  });
  ```

#### Ofqual Qualification Verification
- **Line 755:** `handleOfqualVerification()` - Calls `/api/verify/ofqual/qualification`
  ```typescript
  const response = await fetch('/api/verify/ofqual/qualification', {
    method: 'POST',
    body: JSON.stringify({
      qualificationNumber: cert.certificateNumber,
      qualificationTitle: cert.name,
      awardingOrganisation: cert.issuingBody
    })
  });
  ```

#### Professional Register Verification
- **Line 812:** `handleProfessionalRegisterVerification()` - Calls `/api/verify/{source}`
  ```typescript
  const response = await fetch(`/api/verify/${source}`, {
    method: 'POST',
    body: JSON.stringify({
      registrationNumber,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth
    })
  });
  ```
  - Supports: `nmc`, `hcpc`, `gmc`, `gdc`, `goc`, `gphc`, `gcc`, `social-work-england`, `nhs-performers`, etc.

#### DBS Update Service Verification
- **Line 860:** `handleDBSUpdateServiceVerification()` - Calls `/api/verify/dbs/update-service`
  ```typescript
  const response = await fetch('/api/verify/dbs/update-service', {
    method: 'POST',
    body: JSON.stringify({
      certificateNumber: dbsNumber,
      surname: formData.lastName,
      dob: { day, month, year },
      format: 'html'
    })
  });
  ```

#### Right to Work Share Code Verification
- **Line 905:** `handleRTWVerification()` - Calls `/api/verify/rtw/share-code`
  ```typescript
  const response = await fetch('/api/verify/rtw/share-code', {
    method: 'POST',
    body: JSON.stringify({
      shareCode,
      dateOfBirth: formData.dateOfBirth
    })
  });
  ```

#### Employer Checking Service (ECS)
- **Line 948:** `handleECSVerification()` - Calls `/api/verify/ecs`
  ```typescript
  const response = await fetch('/api/verify/ecs', {
    method: 'POST',
    body: JSON.stringify({
      shareCode,
      dateOfBirth: formData.dateOfBirth
    })
  });
  ```

#### British Citizen Right to Work
- **Line 979:** `handleBritishCitizenRTW()` - Calls `/api/verify/rtw/british-citizen`
  ```typescript
  const response = await fetch('/api/verify/rtw/british-citizen', {
    method: 'POST',
    body: JSON.stringify({ provider })
  });
  ```

#### UKVI Verification
- **Line 1013:** `handleUKVIVerification()` - Calls `/api/verify/rtw/ukvi`
  ```typescript
  const response = await fetch('/api/verify/rtw/ukvi', {
    method: 'POST',
    body: JSON.stringify({
      email,
      shareCode,
      dateOfBirth: shareCode ? formData.dateOfBirth : undefined
    })
  });
  ```

#### Immigration Status Verification
- **Line 1049:** `handleImmigrationStatusVerification()` - Calls `/api/verify/rtw/immigration-status`
  ```typescript
  const response = await fetch('/api/verify/rtw/immigration-status', {
    method: 'POST',
    body: JSON.stringify({
      shareCode,
      dateOfBirth: formData.dateOfBirth
    })
  });
  ```

#### DVLA Verification
- **Line 1092:** `handleDVLAVerification()` - Calls `/api/verify/dvla`
  ```typescript
  const response = await fetch('/api/verify/dvla', {
    method: 'POST',
    body: JSON.stringify({
      type,
      licenseNumber,
      postcode,
      dateOfBirth: type === 'auth' ? formData.dateOfBirth : undefined,
      registrationNumber
    })
  });
  ```

#### Onfido ID Verification
- **Line 1121:** `handleOnfidoVerification()` - Calls `/api/verify/id/onfido`
  ```typescript
  const response = await fetch('/api/verify/id/onfido', {
    method: 'POST',
    body: JSON.stringify({})
  });
  ```

#### GBG ID Verification
- **Line 1147:** `handleGBGVerification()` - Calls `/api/verify/id/gbg`
  ```typescript
  const response = await fetch('/api/verify/id/gbg', {
    method: 'POST',
    body: JSON.stringify({})
  });
  ```

#### Training Certificate Verification
- **Line 1178:** `handleTrainingCertificateVerification()` - Calls `/api/verify/training-certificates`
  ```typescript
  const response = await fetch('/api/verify/training-certificates', {
    method: 'POST',
    body: JSON.stringify({
      certificateNumber,
      providerName,
      certificateType,
      email
    })
  });
  ```

#### Certificate of Sponsorship (COS)
- **Line 1209:** `handleCOSVerification()` - Calls `/api/verify/cos`
  ```typescript
  const response = await fetch('/api/verify/cos', {
    method: 'POST',
    body: JSON.stringify({
      cosNumber,
      email,
      automatedEmail: true
    })
  });
  ```

#### HPAN Check
- **Line 1239:** `handleHPANVerification()` - Calls `/api/verify/hpan`
  ```typescript
  const response = await fetch('/api/verify/hpan', {
    method: 'POST',
    body: JSON.stringify({
      hpanNumber,
      email,
      automatedEmail: true
    })
  });
  ```

#### New DBS Check
- **Line 1266:** `handleNewDBSCheck()` - Calls `/api/verify/dbs/new-check`
  ```typescript
  const response = await fetch('/api/verify/dbs/new-check', {
    method: 'POST',
    body: JSON.stringify({
      applicantData: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address?.line1 || ''
      }
    })
  });
  ```

#### Batch DBS Verification (On Submit)
- **Line 1331:** `runAllVerifications()` - Calls `/api/dbs-verify` for all work history entries
  ```typescript
  const response = await fetch('/api/dbs-verify', {
    method: 'POST',
    body: JSON.stringify({
      certificateNumber: work.dbsNumber,
      applicantSurname: work.dbsSurname,
      dob: work.dbsDob
    })
  });
  ```

---

### 2. **Admin Verifications Page** (Testing/Admin Interface)
**File:** `src/app/admin/verifications/page.tsx`  
**Purpose:** Admin interface for testing all verification services

**Verification Calls:**
- **Line 501:** DBS Update Service - `/api/verify/dbs/update-service`
- **Line 593:** Right to Work Share Code - `/api/verify/rtw/share-code`
- **Line 655:** Onfido ID - `/api/verify/id/onfido`
- **Line 667:** GBG ID - `/api/verify/id/gbg`
- **Line 755:** DVLA - `/api/verify/dvla`
- **Line 842:** Professional Registers - `/api/verify/{source}`
- **Line 889:** ECS - `/api/verify/ecs`
- **Line 931:** COS - `/api/verify/cos`
- **Line 975:** HPAN - `/api/verify/hpan`
- **Line 1028:** Ofqual - `/api/verify/ofqual/qualification`
- **Line 1091:** Training Certificates - `/api/verify/training-certificates`
- **Line 1144:** UKVI - `/api/verify/rtw/ukvi`

**Generic Verify Function:**
```typescript
const verify = async (endpoint: string, data: any, key: string) => {
  setLoading(prev => ({ ...prev, [key]: true }));
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    setResults(prev => ({ ...prev, [key]: result }));
  } catch (error) {
    console.error('Verification error:', error);
  } finally {
    setLoading(prev => ({ ...prev, [key]: false }));
  }
};
```

---

## 📄 Document Management API Calls

### 3. **Worker Onboarding - Document Upload**
**File:** `src/app/worker/onboarding/page.tsx`
- **Line 1563:** Upload document - `POST /api/workers/documents`
- **Line 1618:** Resume upload - `POST /api/workers/documents`

### 4. **Document Viewer Component**
**File:** `src/components/DocumentViewer.tsx`
- **Line 30:** Read document content - `POST /api/read-document`
  ```typescript
  const response = await fetch('/api/read-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl })
  });
  ```

### 5. **Admin Workers Applications**
**File:** `src/app/admin/workers/applications/[id]/page.tsx`
- **Line 49:** Get worker documents - `GET /api/workers/documents?workerId={id}`

### 6. **Admin Documents Page**
**File:** `src/app/admin/documents/page.tsx`
- **Line 43:** Get worker documents - `GET /api/workers/documents?workerId={id}`

### 7. **Worker Documents API Client**
**File:** `src/demo/func/worker.ts`
- **Line 35:** Get documents - `GET /api/workers/documents`
- **Line 40:** Upload document - `POST /api/workers/documents`

---

## 🔍 Summary

### Files Making Verification API Calls:

1. **`src/app/worker/onboarding/page.tsx`** ⭐ (Primary)
   - 15+ verification handlers
   - All verification endpoints called from here
   - Document upload endpoints

2. **`src/app/admin/verifications/page.tsx`** (Admin Testing)
   - Generic verify function for all services
   - Testing interface for all verification endpoints

3. **`src/components/DocumentViewer.tsx`** (Document Reading)
   - Reads document content via `/api/read-document`

4. **`src/app/admin/workers/applications/[id]/page.tsx`** (Admin View)
   - Fetches worker documents

5. **`src/app/admin/documents/page.tsx`** (Admin Documents)
   - Fetches documents for workers

6. **`src/demo/func/worker.ts`** (API Client)
   - Document management functions

---

## 📊 API Endpoints Called

### Verification Endpoints:
- ✅ `/api/dbs-verify` (2 places: onboarding + batch verification)
- ✅ `/api/verify/ofqual/qualification`
- ✅ `/api/verify/{source}` (Professional registers)
- ✅ `/api/verify/dbs/update-service`
- ✅ `/api/verify/rtw/share-code`
- ✅ `/api/verify/ecs`
- ✅ `/api/verify/rtw/british-citizen`
- ✅ `/api/verify/rtw/ukvi`
- ✅ `/api/verify/rtw/immigration-status`
- ✅ `/api/verify/dvla`
- ✅ `/api/verify/id/onfido`
- ✅ `/api/verify/id/gbg`
- ✅ `/api/verify/training-certificates`
- ✅ `/api/verify/cos`
- ✅ `/api/verify/hpan`
- ✅ `/api/verify/dbs/new-check`

### Document Management Endpoints:
- ✅ `POST /api/workers/documents` (Upload)
- ✅ `GET /api/workers/documents?workerId={id}` (Fetch)
- ✅ `POST /api/read-document` (Read content)

---

## 🎯 Key Patterns

### 1. **Standard Fetch Pattern:**
```typescript
const response = await fetch('/api/verify/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await response.json();
```

### 2. **Error Handling:**
All handlers include try-catch blocks and user-friendly error messages via alerts.

### 3. **Loading States:**
All verification handlers manage loading states using React state hooks.

### 4. **Result Storage:**
Verification results are stored in component state for display in the UI.

---

**Last Updated:** January 2025
