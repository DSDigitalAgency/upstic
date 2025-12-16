# Documentation Check Endpoints - Complete API Reference

This document provides a complete list of all endpoints related to documentation checks, verifications, and document management in the Upstic Healthcare Platform.

---

## 📋 Table of Contents

1. [DBS Verification](#1-dbs-verification)
2. [Professional Register Verification](#2-professional-register-verification)
3. [Right to Work Verification](#3-right-to-work-verification)
4. [Qualification Verification](#4-qualification-verification)
5. [ID Verification](#5-id-verification)
6. [Driver License Verification](#6-driver-license-verification)
7. [Training & Certificate Verification](#7-training--certificate-verification)
8. [Document Management](#8-document-management)
9. [Other Verification Services](#9-other-verification-services)

---

## 1. DBS Verification

### 1.1. DBS Certificate Verification
**Endpoint:** `POST /api/dbs-verify`  
**Status:** ✅ Fully Implemented & Working  
**External Service:** `https://perform-check.upstic.com/status/check`

**Request Body:**
```json
{
  "certificateNumber": "001913551408",
  "applicantSurname": "KUJU",
  "dob": {
    "day": "27",
    "month": "5",
    "year": "1994"
  },
  "organisationName": "Upstic Healthcare",
  "requesterForename": "Upstic",
  "requesterSurname": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "structured": {
      "personName": "ADEROJU KUJU",
      "dateOfBirth": "27/05/1994",
      "certificateNumber": "001913551408",
      "certificatePrintDate": "13/02/2025",
      "outcomeText": "This Certificate did not reveal any information...",
      "outcome": "clear_and_current" | "current" | "not_current"
    },
    "verificationDate": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### 1.2. DBS Update Service Verification
**Endpoint:** `POST /api/verify/dbs/update-service`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "certificateNumber": "001913551408",
  "surname": "KUJU",
  "dob": {
    "day": "27",
    "month": "5",
    "year": "1994"
  },
  "format": "html" | "pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "format": "html",
    "certificateNumber": "001913551408",
    "status": "verified",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "DBS Update Service check completed (HTML snapshot)"
  }
}
```

---

### 1.3. New DBS Check (E-bulk Plus)
**Endpoint:** `POST /api/verify/dbs/new-check`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "redirectUrl": "optional-custom-redirect-url",
  "applicantData": {
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1990-05-15",
    "address": "123 Main Street"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "provider": "ebulk_plus",
    "redirectUrl": "https://ebulk.co.uk/dbs-check",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "New DBS check application initiated via E-bulk Plus",
    "applicationId": null,
    "status": "pending"
  }
}
```

---

## 2. Professional Register Verification

### 2.1. Professional Register Verification (Generic)
**Endpoint:** `POST /api/verify/{source}`  
**Status:** ✅ Implemented (NMC, HCPC, GMC, GDC fully implemented; others mock)

**Supported Sources:**
- `gdc` - General Dental Council
- `gmc` - General Medical Council
- `nmc` - Nursing and Midwifery Council ✅ (Fully implemented)
- `hcpc` - Health and Care Professions Council ✅ (Fully implemented)
- `gphc` - General Pharmaceutical Council
- `goc` - General Optical Council
- `gcc` - General Chiropractic Council
- `social-work-england` - Social Work England
- `pamvr` - Physician Associate Managed Voluntary Register
- `osteopathy` - Osteopathy
- `psni` - Pharmaceutical Society of Northern Ireland
- `nhs-performers` - NHS Performers List

**Request Body:**
```json
{
  "registrationNumber": "12A3456",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "source": "nmc",
    "registrationNumber": "12A3456",
    "status": "verified",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "registerUrl": "https://www.nmc.org.uk/registration/check-the-register/",
    "details": {
      "name": "John Smith",
      "registrationStatus": "active",
      "expiryDate": null
    }
  }
}
```

---

## 3. Right to Work Verification

### 3.1. Right to Work Share Code Verification
**Endpoint:** `POST /api/verify/rtw/share-code`  
**Status:** ✅ Implemented (Browser automation ready)

**Request Body:**
```json
{
  "shareCode": "ABC123DEF456",
  "dateOfBirth": "1990-05-15"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "shareCode": "ABC123DEF456",
    "dateOfBirth": "1990-05-15",
    "status": "verified",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Right to Work check completed via share code",
    "details": {
      "workStatus": "allowed",
      "expiryDate": null
    },
    "serviceUrl": "https://www.gov.uk/view-right-to-work"
  }
}
```

---

### 3.2. British Citizen Right to Work Verification
**Endpoint:** `POST /api/verify/rtw/british-citizen`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "provider": "credas" | "ebulk" | "yoti",
  "redirectUrl": "optional-custom-redirect-url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "provider": "credas",
    "redirectUrl": "https://credas.com/verify",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "British Citizen Right to Work verification initiated via CREDAS",
    "pdfResultUrl": null
  }
}
```

---

### 3.3. UKVI Account / Immigration Status Verification
**Endpoint:** `POST /api/verify/rtw/ukvi`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "email": "user@example.com",
  "shareCode": "ABC123DEF456",
  "dateOfBirth": "1990-05-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "type": "ukvi_account_access" | "immigration_status",
    "email": "user@example.com",
    "shareCode": "ABC123DEF456",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "UKVI account access verification initiated",
    "redirectUrl": "https://www.gov.uk/get-access-evisa"
  }
}
```

---

### 3.4. Employee Immigration Status Verification
**Endpoint:** `POST /api/verify/rtw/immigration-status`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "shareCode": "ABC123DEF456",
  "dateOfBirth": "1990-05-15",
  "supplementaryDocument": "optional-file-reference"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "shareCode": "ABC123DEF456",
    "dateOfBirth": "1990-05-15",
    "status": "verified",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Employee immigration status check completed",
    "pdfResultUrl": null,
    "supplementaryDocumentUploaded": false,
    "details": {
      "workStatus": "allowed",
      "expiryDate": null,
      "restrictions": []
    }
  }
}
```

---

### 3.5. Employer Checking Service (ECS)
**Endpoint:** `POST /api/verify/ecs`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "shareCode": "XYZ789GHI012",
  "dateOfBirth": "1988-11-25"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "shareCode": "XYZ789GHI012",
    "dateOfBirth": "1988-11-25",
    "status": "verified",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Employer Checking Service check completed",
    "details": {
      "workStatus": "allowed",
      "expiryDate": null
    }
  }
}
```

---

## 4. Qualification Verification

### 4.1. Ofqual Qualification Verification
**Endpoint:** `GET /api/verify/ofqual/qualification` or `POST /api/verify/ofqual/qualification`  
**Status:** ✅ Implemented (Mock responses for demo)

**GET Request:**
```
GET /api/verify/ofqual/qualification?qualificationNumber=601/8830/6&qualificationTitle=Level%203%20Diploma&awardingOrganisation=Pearson
```

**POST Request Body:**
```json
{
  "qualificationNumber": "601/8830/6",
  "qualificationTitle": "Level 3 Diploma in Health and Social Care",
  "awardingOrganisation": "Pearson"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "qualification": {
      "qualificationNumber": "601/8830/6",
      "qualificationTitle": "Level 3 Diploma in Health and Social Care",
      "awardingOrganisation": "Pearson",
      "level": "Level 3",
      "status": "Current"
    },
    "verificationDate": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 5. ID Verification

### 5.1. Onfido ID Verification
**Endpoint:** `POST /api/verify/id/onfido`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "redirectUrl": "optional-custom-redirect-url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "provider": "onfido",
    "redirectUrl": "https://onfido.com/verify",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Onfido ID verification initiated",
    "resultUrl": null
  }
}
```

---

### 5.2. GBG ID Verification
**Endpoint:** `POST /api/verify/id/gbg`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "redirectUrl": "optional-custom-redirect-url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "provider": "gbg",
    "redirectUrl": "https://gbg.com/verify",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "GBG ID verification initiated",
    "resultUrl": null
  }
}
```

---

## 6. Driver License Verification

### 6.1. DVLA Driver License Verification
**Endpoint:** `POST /api/verify/dvla`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "type": "auth" | "driver-data" | "vehicle" | "driver-image",
  "licenseNumber": "AB12345678",
  "postcode": "SW1A 1AA",
  "dateOfBirth": "1990-05-15",
  "registrationNumber": "AB12 CDE"
}
```

**Response (Authentication):**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "type": "authentication",
    "licenseNumber": "AB12345678",
    "verified": true,
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Driver license authentication successful"
  }
}
```

**Response (Driver Data):**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "type": "driver_data",
    "licenseNumber": "AB12345678",
    "isValid": true,
    "endorsements": [],
    "penaltyPoints": 0,
    "vehicleCategories": ["B", "BE"],
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Driver data check completed"
  }
}
```

**Response (Vehicle Check):**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "type": "vehicle_check",
    "registrationNumber": "AB12 CDE",
    "taxStatus": "taxed",
    "motStatus": "valid",
    "motExpiryDate": "2026-12-31",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Vehicle check completed"
  }
}
```

**Response (Driver Image):**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "type": "driver_image",
    "licenseNumber": "AB12345678",
    "imageMatch": true,
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Driver image verification completed"
  }
}
```

---

## 7. Training & Certificate Verification

### 7.1. Mandatory Training Certificate Verification
**Endpoint:** `POST /api/verify/training-certificates`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "certificateNumber": "CERT123456",
  "providerName": "Training Provider Ltd",
  "certificateType": "Manual Handling",
  "email": "worker@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "certificateNumber": "CERT123456",
    "providerName": "Training Provider Ltd",
    "certificateType": "Manual Handling",
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Training certificate verification initiated",
    "emailSent": true,
    "details": {
      "status": "verified",
      "expiryDate": null,
      "providerResponse": "Email sent to provider for verification"
    }
  }
}
```

---

### 7.2. Certificate of Sponsorship (COS) Verification
**Endpoint:** `POST /api/verify/cos`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "cosNumber": "COS123456",
  "email": "worker@example.com",
  "automatedEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "cosNumber": "COS123456",
    "email": "worker@example.com",
    "automatedEmailSent": true,
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "Certificate of Sponsorship verification initiated",
    "details": {
      "status": "pending_verification",
      "emailSent": true
    }
  }
}
```

---

### 7.3. HPAN Check
**Endpoint:** `POST /api/verify/hpan`  
**Status:** ✅ Implemented (Mock responses for demo)

**Request Body:**
```json
{
  "hpanNumber": "HPAN123456",
  "email": "worker@example.com",
  "automatedEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "hpanNumber": "HPAN123456",
    "email": "worker@example.com",
    "automatedEmailSent": true,
    "verificationDate": "2025-01-15T10:30:00.000Z",
    "message": "HPAN check initiated via automated email",
    "details": {
      "status": "pending_verification",
      "emailSent": true
    }
  }
}
```

---

## 8. Document Management

### 8.1. Upload Document
**Endpoint:** `POST /api/workers/documents`  
**Status:** ✅ Implemented

**Request (FormData):**
```
title: string
description: string (optional)
category: "CERTIFICATION" | "COMPLIANCE" | "IDENTIFICATION" | "OTHER"
expiryDate: string (optional)
documentId: string (optional)
file: File
workerId: string
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-1234567890",
    "title": "DBS Certificate",
    "description": "Enhanced DBS check",
    "fileUrl": "/uploads/documents/worker_123/dbs_cert_1234567890.pdf",
    "fileType": "application/pdf",
    "fileSize": 245678,
    "category": "CERTIFICATION",
    "status": "PENDING_REVIEW",
    "expiryDate": "2026-12-31",
    "uploadedAt": "2025-01-15T10:30:00.000Z",
    "workerId": "worker_123",
    "verifiedAt": null,
    "verifiedBy": null,
    "tags": []
  },
  "message": "Document uploaded successfully"
}
```

---

### 8.2. Get Worker Documents
**Endpoint:** `GET /api/workers/documents?workerId={workerId}`  
**Status:** ✅ Implemented

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-1234567890",
      "title": "DBS Certificate",
      "description": "Enhanced DBS check",
      "fileUrl": "/uploads/documents/worker_123/dbs_cert_1234567890.pdf",
      "fileType": "application/pdf",
      "fileSize": 245678,
      "category": "CERTIFICATION",
      "status": "VALID",
      "expiryDate": "2026-12-31",
      "uploadedAt": "2025-01-15T10:30:00.000Z",
      "workerId": "worker_123",
      "verifiedAt": "2025-01-15T10:35:00.000Z",
      "verifiedBy": "admin-1",
      "tags": ["certification"]
    }
  ]
}
```

---

### 8.3. Read Document Content
**Endpoint:** `POST /api/read-document`  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "fileUrl": "/uploads/documents/worker_123/document.docx"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "title": "document",
    "htmlContent": "<p>Document content as HTML...</p>",
    "paragraphs": [
      "Paragraph 1",
      "Paragraph 2"
    ],
    "metadata": {
      "wordCount": 500,
      "pageCount": 2,
      "lastModified": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 8.4. Convert Document
**Endpoint:** `POST /api/convert-document`  
**Status:** ✅ Implemented

**Request (FormData):**
```
file: File
targetFormat: "html" | "pdf" | "text"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalFile": "document.docx",
    "convertedFile": "document.html",
    "format": "html",
    "content": "<p>Converted content...</p>"
  }
}
```

---

## 9. Other Verification Services

### 9.1. Bank Account Verification
**Endpoint:** `POST /api/payments/bank-account/verify/{workerId}`  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "accountNumber": "12345678",
  "sortCode": "12-34-56"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "accountNumber": "12345678",
    "sortCode": "12-34-56",
    "accountName": "JOHN SMITH",
    "verificationDate": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 📊 Summary

### Total Endpoints: **25+**

**By Category:**
- **DBS Verification**: 3 endpoints
- **Professional Registers**: 1 endpoint (supports 12 registers)
- **Right to Work**: 5 endpoints
- **Qualification**: 1 endpoint (GET & POST)
- **ID Verification**: 2 endpoints
- **Driver License**: 1 endpoint (4 types)
- **Training/Certificates**: 3 endpoints
- **Document Management**: 4 endpoints
- **Other**: 1 endpoint

**Implementation Status:**
- ✅ **Fully Functional**: DBS Certificate Verification
- ✅ **Partially Functional**: NMC, HCPC, GMC, GDC (with browser automation)
- ✅ **Mock/Ready**: All other services (ready for production integration)

---

## 🔗 External Services

- **DBS API**: `https://perform-check.upstic.com/status/check` (Production)
- **Ofqual API**: `https://register.ofqual.gov.uk/api/qualifications` (Optional)
- **UK Government Services**: Various (requires browser automation)
- **Third-Party Services**: Onfido, GBG, CREDAS, E-bulk, Yoti (redirect-based)

---

## 📝 Notes

1. Most verification services use mock responses for demo purposes
2. Production integration requires:
   - Browser automation (Playwright) for web scraping
   - API keys for third-party services
   - Compliance with Terms of Service for each service
3. DBS verification is the only service currently fully functional with real API integration
4. All endpoints return consistent response structures with `success`, `data`, and `verificationDate` fields

---

**Last Updated:** January 2025
