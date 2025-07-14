# Upstic Healthcare Platform - UI Components

A modern healthcare staffing and recruitment platform built with Next.js and Tailwind CSS.

## 🎯 Project Overview

This is a **UI-only implementation** of the Upstic Healthcare Platform, focusing on the user interface and user experience. All functional code (API, data management, authentication) has been removed to provide a clean slate for UI development.

## 🏗️ Architecture

### **Three-Portal System**
- **Admin Portal** (`/admin`) - Platform management interface
- **Client Portal** (`/client`) - Healthcare facility management
- **Worker Portal** (`/worker`) - Healthcare professional interface

### **Technology Stack**
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **UI Components**: Custom component library

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages (UI only)
│   ├── admin/             # Admin portal UI pages
│   ├── client/            # Client portal UI pages  
│   ├── worker/            # Worker portal UI pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # UI components only
│   └── ui/               # Base UI components
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── email-notification.tsx
│       ├── input.tsx
│       ├── loading-button.tsx
│       ├── password-input.tsx
│       ├── sidebar.tsx
│       ├── table.tsx
│       └── textarea.tsx
├── hooks/                 # Custom React hooks (empty)
└── lib/                   # Utilities (empty)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd website

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎨 UI Components

### **Base Components**
- **Alert** - Success, error, warning notifications
- **Badge** - Status indicators and labels
- **Button** - Primary, secondary, loading states
- **Input** - Text, email, password fields
- **Table** - Data display and sorting
- **Textarea** - Multi-line text input

### **Portal-Specific Components**
- **Sidebar** - Navigation for each portal
- **Email Notification** - Email templates
- **Loading Button** - Interactive loading states

## 📱 Portal Features

### **Admin Portal** (`/admin`)
- Dashboard overview
- User management
- Job management
- Assignment tracking
- Reports and analytics

### **Client Portal** (`/client`)
- Staffing requests
- Assignment management
- Timesheet approval
- Billing and payments
- Compliance tracking

### **Worker Portal** (`/worker`)
- Job browsing
- Application management
- Assignment tracking
- Timesheet submission
- Payment history

## 🎯 Development Guidelines

### **UI/UX Standards**
- Follow Tailwind CSS conventions
- Maintain consistent spacing and typography
- Use semantic HTML elements
- Ensure accessibility compliance
- Mobile-first responsive design

### **Component Structure**
```tsx
interface ComponentProps {
  // Define props interface
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  return (
    <div className="component-styles">
      {/* Component content */}
    </div>
  );
}
```

### **Styling Guidelines**
- Use Tailwind utility classes
- Maintain consistent color scheme
- Follow component hierarchy
- Ensure proper contrast ratios
- Test on multiple screen sizes

## 🔧 Configuration

### **Tailwind CSS**
- Custom color palette
- Responsive breakpoints
- Component-specific utilities

### **Next.js**
- App Router configuration
- TypeScript strict mode
- ESLint and Prettier setup

## 📋 TODO

### **UI Enhancements**
- [ ] Add more interactive components
- [ ] Improve responsive design
- [ ] Add animations and transitions
- [ ] Enhance accessibility features
- [ ] Create component documentation

### **Portal Improvements**
- [ ] Enhance admin dashboard
- [ ] Improve client request forms
- [ ] Add worker job search filters
- [ ] Create better navigation flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or support, please open an issue in the repository.

---

**Note**: This is a UI-only implementation. All functional features (authentication, data management, API integration) have been removed to focus on the user interface and experience.
