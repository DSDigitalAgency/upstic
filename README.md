This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Worker Portal

The Worker Portal provides healthcare professionals with a comprehensive platform to manage their work activities, including:

### Key Features

- **Dashboard**: Overview of job statistics, upcoming interviews, and quick actions
- **Jobs**: Browse available jobs, view recommended positions, and track applications
- **Timesheets**: Submit and track timesheets for payment processing
- **Payments**: Access payment history, manage bank accounts, and view tax documents
- **Documents**: Upload and manage certifications and compliance documents
- **Work History**: Maintain professional experience records
- **Availability**: Set work availability preferences by day and shift
- **Settings**: Update profile, notifications, and job preferences

### API Integration

The Worker Portal integrates with the following API endpoints:

- `/api/workers/{id}` - Get/update worker profile
- `/api/workers/{id}/availability` - Get/update worker availability
- `/api/workers/{id}/jobs/recommended` - Get recommended jobs
- `/api/workers/{id}/applications` - Get/submit job applications
- `/api/workers/{id}/documents` - Get/upload worker documents
- `/api/workers/{id}/timesheets` - Get/submit timesheets
- `/api/workers/{id}/payments` - Get payment history
- `/api/workers/{id}/preferences` - Get/update preferences
- `/api/workers/{id}/work-history` - Get/add work history entries
