# Development Rules & Guidelines - Upstic Healthcare Platform

## 🔧 **API Integration Rules**

### 1. **API Base URL - MANDATORY**
- ✅ **ALWAYS use**: `process.env.NEXT_PUBLIC_API_BASE_URL` from `.env.local`
- ❌ **NEVER use**: `localhost`, `127.0.0.1`, or hardcoded URLs
- ❌ **NEVER use**: Mock data or dummy responses
- 🔧 **Configuration**: `NEXT_PUBLIC_API_BASE_URL=https://api.upstic.com`

### 2. **Real Data Only**
- ✅ **ALWAYS**: Fetch data from the API endpoints
- ✅ **ALWAYS**: Handle API responses (success, error, loading states)
- ❌ **NEVER**: Use mock data, dummy arrays, or placeholder content
- ❌ **NEVER**: Hardcode user data or business logic

### 3. **API Client Standards**
- ✅ **ALWAYS**: Use a centralized API client/service
- ✅ **ALWAYS**: Include proper error handling and retry logic
- ✅ **ALWAYS**: Implement loading states for all API calls
- ✅ **ALWAYS**: Handle authentication tokens properly

## 🏗️ **Architecture Rules**

### 4. **Component Structure**
- ✅ **ALWAYS**: Create reusable components for common UI elements
- ✅ **ALWAYS**: Separate presentation components from data-fetching logic
- ✅ **ALWAYS**: Use TypeScript interfaces for all API responses
- ✅ **ALWAYS**: Implement proper props validation

### 5. **State Management**
- ✅ **ALWAYS**: Use React hooks for local state management
- ✅ **ALWAYS**: Implement proper state updates for API responses
- ✅ **ALWAYS**: Handle loading and error states consistently
- ❌ **AVOID**: Unnecessary global state for simple operations

### 6. **Routing & Navigation**
- ✅ **ALWAYS**: Use Next.js App Router for all routing
- ✅ **ALWAYS**: Implement role-based route protection
- ✅ **ALWAYS**: Handle portal-specific navigation correctly
- ✅ **ALWAYS**: Implement proper redirects for unauthorized access

## 🔐 **Security & Authentication Rules**

### 7. **Authentication Flow**
- ✅ **ALWAYS**: Validate authentication status before API calls
- ✅ **ALWAYS**: Handle token expiration and refresh properly
- ✅ **ALWAYS**: Implement role-based access control (RBAC)
- ✅ **ALWAYS**: Clear sensitive data on logout

### 8. **Data Protection**
- ✅ **ALWAYS**: Validate all user inputs
- ✅ **ALWAYS**: Sanitize data before display
- ✅ **ALWAYS**: Implement proper error boundaries
- ❌ **NEVER**: Log sensitive information to console

## 💻 **Code Quality Rules**

### 9. **TypeScript Standards**
- ✅ **ALWAYS**: Use strict TypeScript configuration
- ✅ **ALWAYS**: Define interfaces for all API responses
- ✅ **ALWAYS**: Type all function parameters and returns
- ❌ **NEVER**: Use `any` type (use `unknown` if necessary)

### 10. **Error Handling**
- ✅ **ALWAYS**: Implement try-catch blocks for async operations
- ✅ **ALWAYS**: Provide user-friendly error messages
- ✅ **ALWAYS**: Log errors appropriately for debugging
- ✅ **ALWAYS**: Implement fallback UI for error states

### 11. **Performance Standards**
- ✅ **ALWAYS**: Implement loading states for better UX
- ✅ **ALWAYS**: Use React.memo for expensive components
- ✅ **ALWAYS**: Optimize images and assets
- ✅ **ALWAYS**: Implement proper caching strategies

## 🎨 **UI/UX Rules**

### 12. **Design Consistency**
- ✅ **ALWAYS**: Use Tailwind CSS classes consistently
- ✅ **ALWAYS**: Follow the established design system
- ✅ **ALWAYS**: Implement responsive design (mobile-first)
- ✅ **ALWAYS**: Maintain consistent spacing and typography

### 13. **User Experience**
- ✅ **ALWAYS**: Provide immediate feedback for user actions
- ✅ **ALWAYS**: Implement proper loading indicators
- ✅ **ALWAYS**: Show clear success and error messages
- ✅ **ALWAYS**: Ensure keyboard accessibility

### 14. **Forms & Validation**
- ✅ **ALWAYS**: Implement client-side validation
- ✅ **ALWAYS**: Show validation errors clearly
- ✅ **ALWAYS**: Disable submit buttons during API calls
- ✅ **ALWAYS**: Reset forms after successful submission

## 🏥 **Healthcare Platform Specific Rules**

### 15. **Data Sensitivity**
- ✅ **ALWAYS**: Handle healthcare data with extra care
- ✅ **ALWAYS**: Implement audit trails for sensitive operations
- ✅ **ALWAYS**: Follow GDPR compliance guidelines
- ❌ **NEVER**: Cache sensitive personal data unnecessarily

### 16. **Compliance Features**
- ✅ **ALWAYS**: Track document expiry dates accurately
- ✅ **ALWAYS**: Implement proper notification systems
- ✅ **ALWAYS**: Maintain complete audit logs
- ✅ **ALWAYS**: Ensure data integrity for compliance reports

### 17. **Multi-Portal Considerations**
- ✅ **ALWAYS**: Respect role-based permissions
- ✅ **ALWAYS**: Implement portal-specific navigation
- ✅ **ALWAYS**: Handle multi-tenant data properly
- ❌ **NEVER**: Show data from wrong portal/tenant

## 🧪 **Development Process Rules**

### 18. **Testing Standards**
- ✅ **ALWAYS**: Test API integration thoroughly
- ✅ **ALWAYS**: Test error scenarios and edge cases
- ✅ **ALWAYS**: Test with real API responses
- ❌ **NEVER**: Test with mock data only

### 19. **Git & Version Control**
- ✅ **ALWAYS**: Use descriptive commit messages
- ✅ **ALWAYS**: Keep commits focused and atomic
- ✅ **ALWAYS**: Test before committing
- ❌ **NEVER**: Commit API keys or sensitive data

### 20. **Environment Management**
- ✅ **ALWAYS**: Use environment variables for configuration
- ✅ **ALWAYS**: Validate environment variables on startup
- ✅ **ALWAYS**: Document required environment variables
- ❌ **NEVER**: Hardcode environment-specific values

## 📝 **Documentation Rules**

### 21. **Code Documentation**
- ✅ **ALWAYS**: Document complex business logic
- ✅ **ALWAYS**: Add JSDoc comments for reusable functions
- ✅ **ALWAYS**: Keep README files updated
- ✅ **ALWAYS**: Document API integration patterns

### 22. **Component Documentation**
- ✅ **ALWAYS**: Document component props and usage
- ✅ **ALWAYS**: Provide examples for complex components
- ✅ **ALWAYS**: Document portal-specific components
- ✅ **ALWAYS**: Maintain component library documentation

## 🚀 **Deployment Rules**

### 23. **Production Readiness**
- ✅ **ALWAYS**: Remove console.log statements before production
- ✅ **ALWAYS**: Optimize bundle size
- ✅ **ALWAYS**: Test with production API endpoints
- ✅ **ALWAYS**: Implement proper monitoring

### 24. **Environment Configuration**
- ✅ **ALWAYS**: Use different API endpoints for different environments
- ✅ **ALWAYS**: Validate environment configuration
- ✅ **ALWAYS**: Implement proper error reporting
- ❌ **NEVER**: Deploy with development configurations

---

## 🎯 **Quick Reference Checklist**

Before implementing any feature:
- [ ] API endpoint identified and tested
- [ ] TypeScript interfaces defined
- [ ] Error handling implemented
- [ ] Loading states designed
- [ ] Role-based access verified
- [ ] Mobile responsiveness checked
- [ ] Real data integration confirmed

---

**Last Updated**: January 2025  
**Status**: Development Guidelines v1.0  
**Compliance**: Healthcare Data Protection Ready 