# Upstic Healthcare Worker Management Application - Development Context

## Project Overview

**Upstic** is a comprehensive healthcare recruitment and worker management platform designed as a multi-tenant SaaS solution. The platform connects healthcare facilities (hospitals, clinics) with qualified healthcare professionals through specialized agencies.

### Architecture Model
- **Multi-tenant SaaS**: Each agency gets their own subdomain (e.g., `agencyname.upstic.com`)
- **White-label solution**: Agencies can customize branding and settings
- **Three-portal system**: Admin/Agency, Client (hospitals), Worker (healthcare professionals)

## User Roles & Portal Structure

### 1. Admin/Agency Portal
**Primary Users**: Healthcare staffing agencies, recruiters, agency administrators

**Core Responsibilities**:
- Manage internal staff and recruiters
- Recruit and onboard healthcare workers
- Manage client relationships (hospitals/facilities)
- Post jobs and manage placements
- Handle shift scheduling and timesheet approvals
- Process payroll and billing
- Monitor compliance and certifications
- Generate reports and analytics

### 2. Client Portal (Hospitals/Healthcare Facilities)
**Primary Users**: Hospital managers, HR departments, ward supervisors

**Core Responsibilities**:
- Submit staffing requests and job requirements
- View and approve assigned workers
- Manage shift schedules and coverage
- Approve timesheets and hours worked
- Monitor costs and billing
- Track compliance requirements
- Communicate with agencies and workers

### 3. Worker Portal (Healthcare Professionals)
**Primary Users**: Nurses, doctors, healthcare assistants, specialists

**Core Responsibilities**:
- Complete onboarding and profile setup
- Manage availability and preferences
- Search and apply for jobs/shifts
- Submit timesheets and track hours
- Manage compliance documents and certifications
- Track earnings and payment history
- Complete training and certifications
- Communicate with agencies and facilities

## Current Technical State

### Technology Stack
- **Frontend**: Next.js 15 with App Router
- **Backend**: Ready API at https://api.upstic.com
- **UI Framework**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Runtime**: React 19

### Current Development Status
- **Phase**: Frontend development with API integration
- **Backend Status**: ✅ Complete - API ready at https://api.upstic.com
- **Frontend Status**: Initial setup (basic Next.js boilerplate)
- **Infrastructure**: Backend API ready, frontend requires complete build
- **API Configuration**: NEXT_PUBLIC_API_BASE_URL=https://api.upstic.com

## Key Features & Modules Required

### 1. Authentication & Authorization
- Multi-role authentication system
- Role-based access control (RBAC)
- JWT token management
- Password security and 2FA
- Session management

### 2. Multi-Portal Architecture
- Dynamic routing for portals
- Role-based dashboard rendering
- Portal-specific navigation
- Responsive design for all portals

### 3. Worker Management System
- Comprehensive onboarding workflow
- Profile and document management
- Skills and certification tracking
- Availability scheduling
- Work history and references
- Compliance monitoring

### 4. Job & Placement Management
- Job posting and requirements
- Worker matching and recommendations
- Application processing
- Placement tracking
- Performance monitoring

### 5. Shift & Timesheet Management
- Shift scheduling and assignments
- Real-time availability tracking
- Timesheet submission and approval
- Hours calculation and overtime
- Integration with payroll

### 6. Compliance & Certification Tracking
- Document expiry monitoring
- Training requirement tracking
- Professional registration management
- Health and safety compliance
- Audit trail maintenance

### 7. Financial Management
- Timesheet-based billing
- Invoice generation
- Payment processing
- Cost tracking per client
- Margin calculation
- Financial reporting

### 8. Communication System
- Real-time messaging
- Chat rooms for jobs/shifts
- Notifications and alerts
- Email integration
- Mobile notifications

### 9. Reports & Analytics
- Performance dashboards
- Financial reporting
- Compliance reports
- Worker utilization analytics
- Client satisfaction metrics

### 10. Document Management
- File upload and storage
- Document categorization
- Access control and sharing
- Version control
- Secure document viewing

## Multi-Tenant Architecture Requirements

### Subdomain Management
- Automated DNS provisioning for new agencies
- Agency-specific branding and customization
- Isolated data and user management per tenant
- Scalable infrastructure for multiple agencies

### Super Admin Features (Future Scope)
- Platform-wide monitoring and management
- Agency provisioning and subscription management
- Global analytics and reporting
- System maintenance and updates

## API Architecture

**Backend Status**: ✅ **READY** - Complete API available at https://api.upstic.com

### Available API Modules
1. **Authentication APIs** ✅ - Login, registration, token management
2. **Admin Portal APIs** ✅ - User management, staff operations, settings
3. **Client Portal APIs** ✅ - Facility management, job requests, billing
4. **Worker Portal APIs** ✅ - Profiles, applications, timesheets
5. **Job Management APIs** ✅ - Posting, matching, applications
6. **Document APIs** ✅ - Upload, storage, access control
7. **Timesheet APIs** ✅ - Creation, approval, billing integration
8. **Chat APIs** ✅ - Real-time messaging, room management
9. **Reports APIs** ✅ - Analytics, dashboard stats, exports
10. **System APIs** ✅ - Monitoring, maintenance, audit logs

### Frontend Integration Focus
- Connect all frontend components to existing API endpoints
- Implement proper error handling and loading states
- Ensure data consistency across all portals
- Optimize API calls and implement caching where appropriate

## Development Priorities

### Phase 1: Foundation & API Integration (Weeks 1-3)
1. Project structure and configuration
2. API client setup and authentication integration
3. Basic portal routing and layout structure
4. Environment configuration and API connection
5. Core frontend components and state management

### Phase 2: Portal Development & Features (Weeks 4-10)
1. Admin/Agency portal with API integration
2. Client portal with real-time data
3. Worker portal with complete functionality
4. Authentication flow and role-based access
5. Document upload and management UI

### Phase 3: Advanced Features & Polish (Weeks 11-16)
1. Real-time communication system
2. Advanced reporting and analytics dashboards
3. Compliance tracking interfaces
4. Payment and billing integration UI
5. Mobile responsiveness optimization

### Phase 4: Production Ready (Weeks 17-20)
1. Security hardening and error handling
2. Performance optimization and caching
3. Comprehensive testing and QA
4. Production deployment preparation
5. Documentation and user guides

## Quality & Security Requirements

### Security Measures
- Data encryption at rest and in transit
- GDPR compliance for healthcare data
- Role-based access controls
- Audit logging for all actions
- Regular security assessments

### Performance Standards
- Sub-3 second page load times
- Real-time messaging with <1s latency
- 99.9% uptime availability
- Mobile-first responsive design
- Progressive web app capabilities

### Compliance Requirements
- Healthcare data protection
- Employment law compliance
- Financial data security
- Accessibility standards (WCAG 2.1)
- Cross-browser compatibility

## Success Metrics

### Technical Metrics
- Page load performance
- API response times
- System uptime and reliability
- User adoption rates
- Mobile usage statistics

### Business Metrics
- Agency onboarding rate
- Worker placement success
- Client satisfaction scores
- Revenue per agency
- Platform growth metrics

---

**Last Updated**: January 2025  
**Status**: Development Planning Phase  
**Next Milestone**: Architecture Design & Foundation Setup 