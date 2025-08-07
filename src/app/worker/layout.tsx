'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WorkerSidebar } from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { apiClient } from '@/demo/func/api';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Check if current route should show the full layout (with sidebar and header)
  const shouldShowFullLayout = !pathname?.includes('/onboarding') && !pathname?.includes('/pending-approval') && !pathname?.includes('/rejected');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const timeoutId = setTimeout(() => {
          router.push('/');
        }, 100);
        return () => clearTimeout(timeoutId);
      } else if (user?.role !== 'worker') {
        const roleRoutes = {
          admin: '/admin',
          client: '/client'
        };
        const targetRoute = roleRoutes[user?.role as keyof typeof roleRoutes];
        if (targetRoute) {
          router.push(targetRoute);
        } else {
          router.push('/');
        }
      } else {
        // Check if worker has completed onboarding
        checkOnboardingStatus();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const checkOnboardingStatus = async () => {
    if (!user?.id) return;
    
    try {
      const result = await apiClient.getWorkerByUserId(user.id);
      if (!result.success) {
        // Worker profile doesn't exist, redirect to onboarding
        router.push('/worker/onboarding');
        return;
      }
      
      // Check worker status and redirect accordingly
      if (result.data?.status === 'pending') {
        // Worker is waiting for admin approval
        router.push('/worker/pending-approval');
        return;
      }
      
      if (result.data?.status === 'rejected') {
        // Worker is rejected, redirect to rejected page
        router.push('/worker/rejected');
        return;
      }
      
      if (result.data?.status === 'approved') {
        setIsCheckingOnboarding(false);
      } else {
        // Worker profile exists but not approved, redirect to onboarding
        router.push('/worker/onboarding');
      }
    } catch (error) {
      // If there's an error, assume onboarding is needed
      router.push('/worker/onboarding');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'worker') {
    return null;
  }

  // If this is onboarding or pending approval page, just render children without layout
  if (!shouldShowFullLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <WorkerSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Healthcare Professional Portal
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[2000px] mx-auto transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 