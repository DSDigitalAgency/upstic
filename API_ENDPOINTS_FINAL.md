# Upstic Healthcare Recruitment Platform - API Endpoints

## Overview
This document provides a comprehensive list of all API endpoints for the Upstic healthcare recruitment platform. The endpoints are organized by domain and functionality.

## Table of Contents
1. [Authentication](#authentication)
2. [Admin Portal](#admin-portal)
3. [Client Portal](#client-portal)
4. [Worker Portal](#worker-portal)
5. [Job Management](#job-management)
6. [Document Management](#document-management)
7. [Timesheet Management](#timesheet-management)
8. [Chat System](#chat-system)
9. [Reports & Analytics](#reports--analytics)
10. [System Management](#system-management)
11. [Payroll & Payments](#payroll--payments)

---

## Authentication

### User Authentication
```http
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login user
POST   /api/auth/logout             # Logout user
GET    /api/auth/me                 # Get current user profile
POST   /api/auth/refresh-token      # Refresh access token
```

### Password Management
```http
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password
```

---

## Admin Portal

### User Management
```http
GET    /api/admin/users                    # Get all users
GET    /api/admin/users/workers            # Get all workers
GET    /api/admin/users/clients            # Get all clients
GET    /api/admin/users/recruiters         # Get all recruiters
GET    /api/admin/users/{id}               # Get user by ID
PUT    /api/admin/users/{id}               # Update user
DELETE /api/admin/users/{id}               # Delete user
```

### Staff Management
```http
GET    /api/admin/staff                    # Get all staff members
POST   /api/admin/staff                    # Create staff member
GET    /api/admin/staff/analytics          # Get staff analytics
GET    /api/admin/staff/{id}               # Get staff member
PUT    /api/admin/staff/{id}               # Update staff member
DELETE /api/admin/staff/{id}               # Delete staff member
PUT    /api/admin/staff/{id}/permissions   # Update permissions
PUT    /api/admin/staff/{id}/assignment    # Update assignment
POST   /api/admin/staff/bulk-update        # Bulk update staff
```

### Admin Management
```http
GET    /api/admin/admins                   # Get all admins
POST   /api/admin/admins                   # Create admin
PUT    /api/admin/admins/{id}/permissions  # Update permissions
```

### System Configuration
```http
GET    /api/admin/settings                 # Get settings
PUT    /api/admin/settings                 # Update settings
GET    /api/admin/email-templates          # Get email templates
PUT    /api/admin/email-templates/{id}     # Update template
```

### Subscription Management
```http
GET    /api/admin/subscription-plans       # Get plans
POST   /api/admin/subscription-plans       # Create plan
PUT    /api/admin/subscription-plans/{id}  # Update plan
DELETE /api/admin/subscription-plans/{id}  # Delete plan
```

---

## Client Portal

### Client Management
```http
GET    /api/clients                        # Get all clients
POST   /api/clients                        # Create client
GET    /api/clients/{id}                   # Get client
PUT    /api/clients/{id}                   # Update client
DELETE /api/clients/{id}                   # Delete client
GET    /api/clients/from-user/{userId}     # Get client info
```

### Client Operations
```http
GET    /api/clients/{id}/workers           # Get workers
GET    /api/clients/{id}/contracts         # Get contracts
GET    /api/clients/{id}/billing           # Get billing
```

### Contact Management
```http
POST   /api/clients/{id}/contacts          # Add contact
PUT    /api/clients/{id}/contacts/{contactId} # Update contact
DELETE /api/clients/{id}/contacts/{contactId} # Delete contact
```

### Compliance Management
```http
GET    /api/clients/compliance/overview     # Get overview
GET    /api/clients/compliance/candidates/{id} # Get details
PUT    /api/clients/compliance/candidates/{id} # Update details
```

### Agency Management
```http
GET    /api/clients/agencies               # Get agencies
GET    /api/clients/agencies/metrics       # Get metrics
PATCH  /api/clients/agencies/{id}/status   # Update status
PATCH  /api/clients/agencies/{id}/convert-trial # Convert trial
PATCH  /api/clients/agencies/{id}/revenue  # Update revenue
POST   /api/clients/agencies/bulk-action   # Bulk action
```

---

## Worker Portal

### Profile Management
```http
GET    /api/workers                        # Get all workers
POST   /api/workers                        # Create worker
GET    /api/workers/{id}                   # Get worker
PUT    /api/workers/{id}                   # Update worker
DELETE /api/workers/{id}                   # Delete worker
```

### Onboarding Process
```http
POST   /api/workers/onboarding/personal-info        # Personal info
POST   /api/workers/onboarding/education-history    # Education
POST   /api/workers/onboarding/skills-certifications # Skills
POST   /api/workers/onboarding/references           # References
POST   /api/workers/onboarding/declarations-consent # Consent
POST   /api/workers/onboarding/health-questionnaire # Health
POST   /api/workers/onboarding/workplace-readiness  # Readiness
```

### Availability Management
```http
GET    /api/workers/{id}/availability      # Get availability
PUT    /api/workers/{id}/availability      # Update availability
GET    /api/workers/{id}/preferences       # Get preferences
PUT    /api/workers/{id}/preferences       # Update preferences
```

### Job Applications
```http
GET    /api/workers/{id}/jobs/recommended  # Get recommended
GET    /api/workers/{id}/applications      # Get applications
POST   /api/workers/{id}/applications/{jobId} # Apply for job
```

### Work History
```http
GET    /api/workers/{id}/work-history      # Get history
POST   /api/workers/{id}/work-history      # Add entry
```

---

## Job Management

### Basic Operations
```http
GET    /api/jobs                           # Get all jobs
POST   /api/jobs                           # Create job
GET    /api/jobs/search                    # Search jobs
GET    /api/jobs/{id}                      # Get job
PUT    /api/jobs/{id}                      # Update job
DELETE /api/jobs/{id}                      # Delete job
POST   /api/jobs/{id}/publish              # Publish job
```

### Applications & Matching
```http
GET    /api/jobs/{id}/applications         # Get applications
PUT    /api/jobs/{jobId}/applications/{applicationId} # Update status
GET    /api/jobs/{id}/matches              # Get matches
GET    /api/jobs/{id}/recommended          # Get recommended
```

---

## Document Management

### Document Operations
```http
POST   /api/documents                      # Upload document
GET    /api/documents                      # Get all documents
GET    /api/documents/{id}                 # Get document
PUT    /api/documents/{id}                 # Update metadata
DELETE /api/documents/{id}                 # Delete document
GET    /api/documents/download/{id}        # Download document
```

### Document Access
```http
GET    /api/documents/by-user/{userId}     # Get by user
GET    /api/documents/by-worker/{workerId} # Get by worker
GET    /api/documents/by-client/{clientId} # Get by client
GET    /api/documents/by-job/{jobId}       # Get by job
```

---

## Timesheet Management

### Basic Operations
```http
POST   /api/timesheets                     # Create timesheet
GET    /api/timesheets                     # Get all timesheets
GET    /api/timesheets/pending             # Get pending
GET    /api/timesheets/{id}                # Get timesheet
PUT    /api/timesheets/{id}                # Update timesheet
DELETE /api/timesheets/{id}                # Delete timesheet
```

### Approval Process
```http
PUT    /api/timesheets/{id}/approve        # Approve timesheet
PUT    /api/timesheets/{id}/reject         # Reject timesheet
PUT    /api/timesheets/{id}/submit         # Submit for approval
```

### Filtered Views
```http
GET    /api/timesheets/worker/{workerId}   # Get by worker
GET    /api/timesheets/job/{jobId}         # Get by job
```

---

## Payroll & Payments

### Payroll Processing
```http
POST   /api/payments/payroll/process        # Process payroll for approved timesheets
POST   /api/payments/calculate/{workerId}/{timesheetId} # Calculate payment for specific timesheet
GET    /api/payments/summary                  # Get payroll summary and statistics
```

### Worker Payments
```http
POST   /api/payments/bank-account/verify/{workerId} # Verify worker bank account details
GET    /api/payments/history/{workerId}             # Get payment history for worker
```

### Reports
```http
GET    /api/payments/reports/tax-summary      # Get tax summary report for HMRC submission
GET    /api/payments/reports/bacs-summary/{fileId} # Get BACS file summary report
```

### Compliance
```http
GET    /api/payments/compliance/rtip1         # Generate RTI P1 submission data
POST   /api/payments/compliance/submit-rti    # Submit RTI data to HMRC (simulation)
```

### Admin
```http
GET    /api/payments/admin/tax-config         # Get current tax configuration
GET    /api/payments/admin/test               # Test payment services (admin only)
```

---

## Chat System

### Chat Rooms
```http
POST   /api/chat/rooms                     # Create room
GET    /api/chat/rooms                     # Get user rooms
GET    /api/chat/rooms/{roomId}            # Get room details
PUT    /api/chat/rooms/{roomId}/archive    # Archive/unarchive
```

### Messages
```http
POST   /api/chat/rooms/{roomId}/messages   # Send message
GET    /api/chat/rooms/{roomId}/messages   # Get messages
PUT    /api/chat/rooms/{roomId}/messages/read # Mark as read
DELETE /api/chat/messages/{messageId}      # Delete message
GET    /api/chat/unread-count              # Get unread count
```

### Participants
```http
POST   /api/chat/rooms/{roomId}/participants # Add participant
DELETE /api/chat/rooms/{roomId}/participants/{userId} # Remove
```

### Specialized Rooms
```http
POST   /api/chat/rooms/job/{jobId}         # Create job room
POST   /api/chat/rooms/shift/{shiftId}     # Create shift room
POST   /api/chat/rooms/agency/{agencyId}   # Create agency room
POST   /api/chat/rooms/direct/{userId}     # Create direct chat
```

---

## Reports & Analytics

### Dashboard Statistics
```http
GET    /api/dashboard/stats                # General stats
GET    /api/dashboard/recruiter/stats      # Recruiter stats
GET    /api/dashboard/healthcare/stats     # Healthcare stats
GET    /api/dashboard/admin/stats          # Admin stats
```

### Report Management
```http
POST   /api/reports                        # Create report
GET    /api/reports                        # Get all reports
GET    /api/reports/my-reports             # Get my reports
GET    /api/reports/{id}                   # Get report
DELETE /api/reports/{id}                   # Cancel report
```

### Report Actions
```http
POST   /api/reports/{id}/comments          # Add comment
PUT    /api/reports/{id}/assign            # Assign to admin
PUT    /api/reports/{id}/status            # Update status
PUT    /api/reports/{id}/escalate          # Escalate report
PUT    /api/reports/{id}/resolve           # Resolve report
PUT    /api/reports/{id}/close             # Close report
```

### Analytics
```http
GET    /api/reports/analytics/overview     # Get overview
GET    /api/reports/analytics/jobs         # Job analytics
GET    /api/reports/analytics/workers      # Worker analytics
GET    /api/reports/analytics/applications # Application analytics
GET    /api/reports/analytics/placements   # Placement analytics
```

---

## System Management

### System Maintenance
```http
GET    /api/admin/logs                     # Get system logs
GET    /api/admin/audit-logs               # Get audit logs
POST   /api/admin/backup                   # Create backup
POST   /api/admin/restore                  # Restore backup
POST   /api/admin/system/maintenance       # Run maintenance
POST   /api/admin/system/flush-cache       # Flush cache
```

### System Monitoring
```http
GET    /api/admin/system/stats             # Get statistics
GET    /api/admin/system/performance       # Get performance
```

---

Last Updated: [Current Date]
Status: Production Ready 