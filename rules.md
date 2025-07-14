# Upstic Healthcare Platform - Development Rules

## 🎯 **Core Development Principles**

### 1. **Workflow-Based Development**
- Always follow the established workflow patterns
- Use existing components and patterns before creating new ones
- Maintain consistency with the current codebase structure
- Follow the established file organization and naming conventions

### 2. **Data Source Management**
- **ALWAYS use data from the server folder** (`src/lib/mock/server/`)
- Never create static mock data in components
- Import data from JSON files in the server folder
- Use the existing `fileSystem.ts` utilities for data operations
- Keep server folder data updated and comprehensive

### 3. **No Data Creation in Components**
- **NEVER create hardcoded data in components**
- All data must come from the server folder JSON files
- Use the mock API client for data operations
- Maintain data consistency across the application

### 4. **Text Color Guidelines**
- **NEVER use white color for input text and labels**
- Use `text-gray-900` for labels and important text
- Use `text-gray-700` for secondary text
- Use `text-gray-500` for placeholder text
- Ensure proper contrast ratios for accessibility
- Always add `bg-white` to form inputs for proper visibility

## 🎨 **UI/UX Standards**

### **Color Usage**
```css
/* ✅ CORRECT - Good contrast and visibility */
text-gray-900  /* Primary text, labels, headings */
text-gray-700  /* Secondary text */
text-gray-500  /* Placeholder text */
bg-white       /* Form input backgrounds */

/* ❌ AVOID - Poor visibility */
text-white     /* Never for input text */
text-gray-300  /* Too light for important text */
```

### **Form Elements**
```jsx
// ✅ CORRECT - Proper text visibility
<input 
  className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white placeholder-gray-500"
/>

<select 
  className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white"
/>

<label className="text-sm font-medium text-gray-900">
```

## 📁 **File Organization Rules**

### **Component Structure**
```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin portal pages
│   ├── client/            # Client portal pages
│   └── worker/            # Worker portal pages
├── components/            # Reusable components
│   └── ui/               # Base UI components
├── lib/                   # Utilities and configurations
│   ├── mock/             # Mock data and API
│   │   └── server/       # JSON data files
│   └── api.ts            # API client
└── hooks/                # Custom React hooks
```

### **Naming Conventions**
- **Files**: `kebab-case` (e.g., `user-profile.tsx`)
- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Functions**: `camelCase` (e.g., `getUserData`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

## 🔧 **Code Quality Standards**

### **TypeScript Usage**
- Use TypeScript for all new code
- Define proper interfaces for all data structures
- Avoid `any` type - use proper typing
- Export types from dedicated type files

### **Component Guidelines**
```tsx
// ✅ CORRECT - Proper component structure
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

export default function Component({ data, onAction }: ComponentProps) {
  // Component logic
}
```

### **Error Handling**
- Always implement proper error handling
- Show user-friendly error messages
- Log errors for debugging
- Handle loading states appropriately

## 📊 **Data Management Rules**

### **Server Folder Structure**
```
src/lib/mock/server/
├── jobs.json              # Job listings
├── workers.json           # Worker profiles
├── clients.json           # Client information
├── assignments.json       # Job assignments
├── timesheets.json        # Time tracking
├── payments.json          # Payment records
├── applications.json      # Job applications
├── referrals.json         # Referral system
├── documents.json         # Document management
├── preferences.json       # User preferences
├── stats.json            # Analytics data
├── users.json            # User accounts
└── work-history.json     # Employment history
```

### **Data Operations**
- Use `getData()` to read from server files
- Use `saveData()` to persist changes
- Use `addItem()`, `updateItem()`, `deleteItem()` for CRUD operations
- Always validate data before operations

## 🚀 **Performance Guidelines**

### **Loading States**
- Always show loading indicators for async operations
- Use skeleton loaders for better UX
- Implement proper error boundaries

### **Optimization**
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Use debouncing for search operations
- Optimize bundle size with proper imports

## 🔒 **Security & Best Practices**

### **Input Validation**
- Always validate user inputs
- Sanitize data before processing
- Use proper form validation libraries

### **Accessibility**
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Maintain proper color contrast ratios

## 📝 **Documentation Standards**

### **Code Comments**
```tsx
/**
 * Component description
 * @param props - Component props description
 * @returns JSX element
 */
export default function Component(props: ComponentProps) {
  // Implementation
}
```

### **README Updates**
- Update README.md when adding new features
- Document API changes
- Include setup instructions for new developers

## 🧪 **Testing Guidelines**

### **Component Testing**
- Write tests for critical user flows
- Test error states and edge cases
- Mock external dependencies properly

### **Data Testing**
- Verify data integrity from server files
- Test CRUD operations thoroughly
- Validate data transformations

## 🔄 **Workflow Integration**

### **Git Workflow**
- Use descriptive commit messages
- Create feature branches for new development
- Review code before merging
- Keep commits atomic and focused

### **Development Process**
1. **Plan**: Understand requirements and existing patterns
2. **Implement**: Follow established conventions
3. **Test**: Verify functionality and data integrity
4. **Review**: Check against all rules and guidelines
5. **Deploy**: Ensure smooth integration

## ⚠️ **Common Pitfalls to Avoid**

### **Data Issues**
- ❌ Creating static data in components
- ❌ Using hardcoded values instead of server data
- ❌ Ignoring data consistency across files

### **UI Issues**
- ❌ Using white text on light backgrounds
- ❌ Poor contrast ratios
- ❌ Inconsistent styling patterns

### **Code Issues**
- ❌ Ignoring TypeScript types
- ❌ Not handling loading/error states
- ❌ Poor error handling

## 📋 **Checklist for New Features**

- [ ] Data comes from server folder
- [ ] No hardcoded data in components
- [ ] Proper text colors and contrast
- [ ] Loading and error states implemented
- [ ] TypeScript types defined
- [ ] Follows existing patterns
- [ ] Proper error handling
- [ ] Accessibility considerations
- [ ] Performance optimized
- [ ] Documentation updated

---

**Remember**: These rules ensure consistency, maintainability, and quality across the Upstic Healthcare Platform. Always refer to this document when making changes or adding new features. 