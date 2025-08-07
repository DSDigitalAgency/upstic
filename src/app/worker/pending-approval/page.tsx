'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check approval status every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/demo-data/workers.json');
        const workers = await response.json();
        const worker = workers.find((w: any) => w.userId === user?.id);
        
        if (worker) {
          if (worker.status === 'approved') {
            router.push('/worker');
          }
          // Note: Rejected status is handled by the layout, so we don't redirect here
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-black mb-4">
            Pending Approval
          </h1>
          
          <p className="text-gray-800 mb-6">
            Thank you for submitting your profile information. Your application is currently under review by our admin team.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our admin team will review your profile</li>
              <li>• They will verify your credentials and information</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• This page will automatically refresh when approved</li>
            </ul>
          </div>

          <div className="text-sm text-gray-700">
            <p>This usually takes 1-2 business days.</p>
            <p className="mt-2">
              If you have any questions, please contact{' '}
              <a href="mailto:support@upstic.com" className="text-blue-600 hover:underline">
                support@upstic.com
              </a>
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 