'use client';

import { useEffect, useState } from 'react';
import { WorkerDashboardStats } from '@/lib/api';
import { getWorkerDashboardStats } from '@/lib/worker';
import { useAuth } from '@/hooks/useAuth';

export default function WorkerDashboard() {
  const [dashboardData, setDashboardData] = useState<WorkerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await getWorkerDashboardStats();
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'worker') {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>Error: {error}</p>
        <p className="text-sm mt-1">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Dashboard</h2>
        <p className="text-gray-600">Manage your applications, interviews, and job opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* First row - 3 stats */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Open Jobs</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboardData?.openJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Applications</h3>
              <p className="text-2xl font-bold text-green-600">{dashboardData?.applicationsSubmitted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Interviews</h3>
              <p className="text-2xl font-bold text-yellow-600">{dashboardData?.upcomingInterviews || 0}</p>
            </div>
          </div>
        </div>

        {/* Second row - 3 stats */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Saved Jobs</h3>
              <p className="text-2xl font-bold text-purple-600">{dashboardData?.savedJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Candidates</h3>
              <p className="text-2xl font-bold text-indigo-600">{dashboardData?.totalCandidates || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Interviews Scheduled</h3>
              <p className="text-2xl font-bold text-pink-600">{dashboardData?.interviewsScheduled || 0}</p>
            </div>
          </div>
        </div>

        {/* Third row - 1 stat centered */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1 lg:col-start-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Hires</h3>
              <p className="text-2xl font-bold text-teal-600">{dashboardData?.recentHires || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-5">
            <button className="w-full text-left p-5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Browse Jobs</h4>
                  <p className="text-sm text-gray-600">Find new healthcare opportunities</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Job Alerts</h4>
                  <p className="text-sm text-gray-600">Set up notifications for new positions</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Update Documents</h4>
                  <p className="text-sm text-gray-600">Manage certifications and compliance documents</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Only show Job Market Overview if we have meaningful data */}
        {dashboardData && (
          dashboardData.totalCandidates > 0 || 
          dashboardData.interviewsScheduled > 0 || 
          dashboardData.recentHires > 0 || 
          dashboardData.openJobs > 0
        ) && (
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Job Market Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">HEALTHCARE OPPORTUNITIES</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardData?.openJobs || 0}</div>
                      <div className="text-sm text-gray-500">open positions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardData?.savedJobs || 0}</div>
                      <div className="text-sm text-gray-500">saved jobs</div>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((dashboardData?.openJobs || 0) / 10) * 100)}%`,
                        maxWidth: '100%'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">YOUR APPLICATION STATUS</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardData?.applicationsSubmitted || 0}</div>
                      <div className="text-sm text-gray-500">applications</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardData?.upcomingInterviews || 0}</div>
                      <div className="text-sm text-gray-500">upcoming interviews</div>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((dashboardData?.applicationsSubmitted || 0) / 5) * 100)}%`,
                        maxWidth: '100%'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">MARKET ACTIVITY</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardData?.interviewsScheduled || 0}</div>
                      <div className="text-sm text-gray-500">interviews this week</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardData?.recentHires || 0}</div>
                      <div className="text-sm text-gray-500">recent hires</div>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((dashboardData?.recentHires || 0) / 3) * 100)}%`,
                        maxWidth: '100%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 