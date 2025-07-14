'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ClientSidebar } from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const timeoutId = setTimeout(() => {
          router.push('/');
        }, 100);
        return () => clearTimeout(timeoutId);
      } else if (user?.role !== 'client') {
        const roleRoutes = {
          admin: '/admin',
          worker: '/worker'
        };
        const targetRoute = roleRoutes[user?.role as keyof typeof roleRoutes];
        if (targetRoute) {
          router.push(targetRoute);
        } else {
          router.push('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'client') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <ClientSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Healthcare Facility Portal
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