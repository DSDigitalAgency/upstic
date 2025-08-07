'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { useRouter } from 'next/navigation';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    children: [
      { id: 'workers', label: 'Worker Management', href: '/admin/workers', icon: null },
      { id: 'workers-applications', label: 'Worker Applications', href: '/admin/workers/applications', icon: null },
      { id: 'clients', label: 'Client Management', href: '/admin/clients', icon: null },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs & Assignments',
    href: '/admin/jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
      </svg>
    ),
    children: [
      { id: 'jobs-active', label: 'Active Jobs', href: '/admin/jobs/active', icon: null },
      { id: 'jobs-pending', label: 'Pending Approval', href: '/admin/jobs/pending', icon: null },
      { id: 'jobs-completed', label: 'Completed Jobs', href: '/admin/jobs/completed', icon: null },
      { id: 'jobs-rejected', label: 'Rejected Jobs', href: '/admin/jobs/rejected', icon: null },
      { id: 'jobs-assignments', label: 'Assignments', href: '/admin/jobs/assignments', icon: null },
      { id: 'applications', label: 'Applications', href: '/admin/applications', icon: null },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    href: '/admin/payroll/process',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      { id: 'payroll-process', label: 'Process Payroll', href: '/admin/payroll/process', icon: null },
      { id: 'payroll-bank-accounts', label: 'Bank Accounts', href: '/admin/payroll/bank-accounts', icon: null },
      { id: 'payroll-history', label: 'Payment History', href: '/admin/payroll/history', icon: null },
      { id: 'payroll-reports', label: 'Reports', href: '/admin/payroll/reports', icon: null },
      { id: 'payroll-compliance', label: 'Compliance & RTI', href: '/admin/payroll/compliance', icon: null },
      { id: 'payroll-tax', label: 'Tax Settings', href: '/admin/payroll/tax', icon: null },
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    href: '/admin/compliance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    children: [
      { id: 'compliance-documents', label: 'Documents', href: '/admin/compliance/documents', icon: null },
      { id: 'documents', label: 'Worker Documents', href: '/admin/documents', icon: null },
      { id: 'compliance-expiry', label: 'Expiry Tracking', href: '/admin/compliance/expiry', icon: null },
      { id: 'compliance-audits', label: 'Audit Logs', href: '/admin/compliance/audits', icon: null },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/admin/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    children: [
      { id: 'reports-performance', label: 'Performance', href: '/admin/reports/performance', icon: null },
      { id: 'reports-compliance', label: 'Compliance', href: '/admin/reports/compliance', icon: null },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { id: 'settings-general', label: 'General', href: '/admin/settings/general', icon: null },
      { id: 'settings-notifications', label: 'Notifications', href: '/admin/settings/notifications', icon: null },
    ],
  },
  {
    id: 'referrals',
    label: 'Referrals',
    href: '/admin/referrals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
];

// Worker sidebar items
const workerSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/worker',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'jobs',
    label: 'Jobs',
    href: '/worker/jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
      </svg>
    ),
    children: [
      { id: 'jobs-all', label: 'All Jobs', href: '/worker/jobs', icon: null },
      { id: 'jobs-recommended', label: 'Recommended', href: '/worker/jobs/recommended', icon: null },
      { id: 'jobs-applications', label: 'My Applications', href: '/worker/jobs/applications', icon: null },
    ],
  },
  {
    id: 'assignments',
    label: 'Assignments',
    href: '/worker/assignments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    href: '/worker/timesheets',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    children: [
      { id: 'timesheets-submit', label: 'Submit Timesheet', href: '/worker/timesheets/submit', icon: null },
      { id: 'timesheets-pending', label: 'Pending Approval', href: '/worker/timesheets/pending', icon: null },
      { id: 'timesheets-history', label: 'Timesheet History', href: '/worker/timesheets/history', icon: null },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/worker/payments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      { id: 'payments-history', label: 'Payment History', href: '/worker/payments/history', icon: null },
      { id: 'payments-bank-accounts', label: 'Bank Accounts', href: '/worker/payments/bank-accounts', icon: null },
      { id: 'payments-tax', label: 'Tax Documents', href: '/worker/payments/tax', icon: null },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    href: '/worker/documents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: [
      { id: 'documents-certifications', label: 'Certifications', href: '/worker/documents/certifications', icon: null },
      { id: 'documents-compliance', label: 'Compliance', href: '/worker/documents/compliance', icon: null },
      { id: 'documents-upload', label: 'Upload Documents', href: '/worker/documents/upload', icon: null },
    ],
  },
  {
    id: 'referrals',
    label: 'Referrals',
    href: '/worker/referrals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    id: 'work-history',
    label: 'Work History',
    href: '/worker/work-history',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  {
    id: 'availability',
    label: 'Availability',
    href: '/worker/availability',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/worker/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { id: 'settings-profile', label: 'Profile', href: '/worker/settings/profile', icon: null },
      { id: 'settings-notifications', label: 'Notifications', href: '/worker/settings/notifications', icon: null },
      { id: 'settings-preferences', label: 'Preferences', href: '/worker/settings/preferences', icon: null },
    ],
  },
];

// Client sidebar items
const clientSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/client',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'staffing',
    label: 'Staffing',
    href: '/client/staffing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      { id: 'staffing-requests', label: 'Staffing Requests', href: '/client/staffing/requests', icon: null },
      { id: 'staffing-schedule', label: 'Schedule', href: '/client/staffing/schedule', icon: null },
      { id: 'staffing-assignments', label: 'Assignments', href: '/client/assignments', icon: null },
    ],
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    href: '/client/timesheets',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    children: [
      { id: 'timesheets-pending', label: 'Pending Approval', href: '/client/timesheets/pending', icon: null },
      { id: 'timesheets-approved', label: 'Approved', href: '/client/timesheets/approved', icon: null },
      { id: 'timesheets-history', label: 'History', href: '/client/timesheets/history', icon: null },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    href: '/client/billing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      { id: 'billing-invoices', label: 'Invoices', href: '/client/billing/invoices', icon: null },
      { id: 'billing-payments', label: 'Payments', href: '/client/billing/payments', icon: null },
      { id: 'billing-reports', label: 'Reports', href: '/client/billing/reports', icon: null },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    href: '/client/compliance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    children: [
      { id: 'compliance-documents', label: 'Documents', href: '/client/compliance/documents', icon: null },
      { id: 'compliance-certifications', label: 'Certifications', href: '/client/compliance/certifications', icon: null },
      { id: 'compliance-audits', label: 'Audit Logs', href: '/client/compliance/audits', icon: null },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/client/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    children: [
      { id: 'reports-staffing', label: 'Staffing', href: '/client/reports/staffing', icon: null },
      { id: 'reports-costs', label: 'Costs', href: '/client/reports/costs', icon: null },
      { id: 'reports-performance', label: 'Performance', href: '/client/reports/performance', icon: null },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/client/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { id: 'settings-profile', label: 'Profile', href: '/client/settings/profile', icon: null },
      { id: 'settings-notifications', label: 'Notifications', href: '/client/settings/notifications', icon: null },
      { id: 'settings-preferences', label: 'Preferences', href: '/client/settings/preferences', icon: null },
    ],
  },
  {
    id: 'referrals',
    label: 'Referrals',
    href: '/client/referrals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isActive = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  useEffect(() => {
    const activeItem = sidebarItems.find(item => item.href && isActive(item.href));
    if (activeItem && !expandedItems.includes(activeItem.id) && !isCollapsed) {
      const newExpanded = [activeItem.id];
      if (activeItem.id.startsWith('settings-users')) {
        newExpanded.push('settings');
      }
      setExpandedItems(current => [...new Set([...current, ...newExpanded])]);
    }
  }, [pathname, expandedItems, isActive, isCollapsed]);

  const toggleExpanded = (itemId: string) => {
    if (!isCollapsed) {
      setExpandedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const renderSidebarItems = (items: SidebarItem[], isSubmenu = false) => {
    return (
      <ul className={`space-y-0.5 ${isSubmenu ? 'mt-1' : ''}`}>
        {items.map((item) => (
          <li key={item.id}>
            <div className={isSubmenu && !isCollapsed ? 'ml-4 border-l border-gray-200 pl-4' : ''}>
              {item.children ? (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    {item.icon && !isSubmenu && (
                      <div className={`flex-shrink-0 transition-colors duration-200 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.icon}
                      </div>
                    )}
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <svg
                      className={`flex-shrink-0 w-4 h-4 ml-2 transition-transform duration-200 ${
                        expandedItems.includes(item.id) ? 'rotate-90' : ''
                      } ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`group flex items-center min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon && !isSubmenu && (
                    <div className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {item.icon}
                    </div>
                  )}
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                </Link>
              )}

              {item.children && expandedItems.includes(item.id) && !isCollapsed && (
                <div className="animate-slideDown">
                  {renderSidebarItems(item.children, true)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <aside 
      className={`relative bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Admin Portal</h1>
              {user && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  Welcome, {user.username}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-4 top-20 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors group"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="flex items-center justify-center w-5 h-5">
          <svg
            className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {renderSidebarItems(sidebarItems)}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

interface ClientSidebarProps {
  className?: string;
}

export function ClientSidebar({ className = '' }: ClientSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isActive = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === '/client') {
      return pathname === '/client';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  useEffect(() => {
    const activeItem = clientSidebarItems.find(item => item.href && isActive(item.href));
    if (activeItem && !expandedItems.includes(activeItem.id) && !isCollapsed) {
      const newExpanded = [activeItem.id];
      setExpandedItems(current => [...new Set([...current, ...newExpanded])]);
    }
  }, [pathname, expandedItems, isActive, isCollapsed]);

  const toggleExpanded = (itemId: string) => {
    if (!isCollapsed) {
      setExpandedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const renderSidebarItems = (items: SidebarItem[], isSubmenu = false) => {
    return (
      <ul className={`space-y-0.5 ${isSubmenu ? 'mt-1' : ''}`}>
        {items.map((item) => (
          <li key={item.id}>
            <div className={isSubmenu && !isCollapsed ? 'ml-4 border-l border-gray-200 pl-4' : ''}>
              {item.children ? (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    {item.icon && !isSubmenu && (
                      <div className={`flex-shrink-0 transition-colors duration-200 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.icon}
                      </div>
                    )}
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <svg
                      className={`flex-shrink-0 w-4 h-4 ml-2 transition-transform duration-200 ${
                        expandedItems.includes(item.id) ? 'rotate-90' : ''
                      } ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`group flex items-center min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon && !isSubmenu && (
                    <div className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {item.icon}
                    </div>
                  )}
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                </Link>
              )}

              {item.children && expandedItems.includes(item.id) && !isCollapsed && (
                <div className="animate-slideDown">
                  {renderSidebarItems(item.children, true)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <aside 
      className={`relative bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Client Portal</h1>
              {user && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  Welcome, {user.username}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-4 top-20 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors group"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="flex items-center justify-center w-5 h-5">
          <svg
            className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {renderSidebarItems(clientSidebarItems)}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

interface WorkerSidebarProps {
  className?: string;
}

export function WorkerSidebar({ className = '' }: WorkerSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isActive = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === '/worker') {
      return pathname === '/worker';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  useEffect(() => {
    const activeItem = workerSidebarItems.find(item => item.href && isActive(item.href));
    if (activeItem && !expandedItems.includes(activeItem.id) && !isCollapsed) {
      const newExpanded = [activeItem.id];
      setExpandedItems(current => [...new Set([...current, ...newExpanded])]);
    }
  }, [pathname, expandedItems, isActive, isCollapsed]);

  const toggleExpanded = (itemId: string) => {
    if (!isCollapsed) {
      setExpandedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const renderSidebarItems = (items: SidebarItem[], isSubmenu = false) => {
    return (
      <ul className={`space-y-0.5 ${isSubmenu ? 'mt-1' : ''}`}>
        {items.map((item) => (
          <li key={item.id}>
            <div className={isSubmenu && !isCollapsed ? 'ml-4 border-l border-gray-200 pl-4' : ''}>
              {item.children ? (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    {item.icon && !isSubmenu && (
                      <div className={`flex-shrink-0 transition-colors duration-200 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.icon}
                      </div>
                    )}
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <svg
                      className={`flex-shrink-0 w-4 h-4 ml-2 transition-transform duration-200 ${
                        expandedItems.includes(item.id) ? 'rotate-90' : ''
                      } ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`group flex items-center min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon && !isSubmenu && (
                    <div className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {item.icon}
                    </div>
                  )}
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                </Link>
              )}

              {item.children && expandedItems.includes(item.id) && !isCollapsed && (
                <div className="animate-slideDown">
                  {renderSidebarItems(item.children, true)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <aside 
      className={`relative bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Worker Portal</h1>
              {user && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  Welcome, {user.username}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-4 top-20 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors group"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="flex items-center justify-center w-5 h-5">
          <svg
            className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {renderSidebarItems(workerSidebarItems)}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
} 