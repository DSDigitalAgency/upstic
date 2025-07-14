'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Assignment, Timesheet, Client, Worker, Job } from '@/lib/api';
import Link from 'next/link';

interface ClientDashboardStats {
  activeStaff: number;
  openRequests: number;
  pendingApprovals: number;
  monthlyCost: number;
  totalAssignments: number;
  completedAssignments: number;
  averageRating: number;
}

interface AssignmentWithDetails extends Assignment {
  job?: Job;
  worker?: Worker;
}

export default function ClientDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [stats, setStats] = useState<ClientDashboardStats>({
    activeStaff: 0,
    openRequests: 0,
    pendingApprovals: 0,
    monthlyCost: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageRating: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<AssignmentWithDetails[]>([]);
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Fetching dashboard data for user:', user.id);
        
        // 1. Fetch client profile by userId
        const clientRes = await apiClient.getClients();
        console.log('📋 All clients:', clientRes.data);
        
        const allClients = clientRes.data || [];
        const client = allClients.find(c => c.userId === user.id);
        console.log('🏥 Found client:', client);
        
        setClientProfile(client || null);
        
        if (!client) {
          setError('No client profile found for this user. Please contact support or try a different account.');
          setIsLoading(false);
          return;
        }

        const clientId = client.id;
        console.log('🎯 Using client ID:', clientId);

        // 2. Fetch all data from server folder
        const [assignmentsResponse, timesheetsResponse, workersResponse, jobsResponse] = await Promise.all([
          apiClient.getAssignments(),
          apiClient.getTimesheets(),
          apiClient.getWorkers(),
          apiClient.getJobs()
        ]);

        const assignments: Assignment[] = (assignmentsResponse.data || []).filter((a: Assignment) => a.clientId === clientId);
        const timesheets: Timesheet[] = (timesheetsResponse.data || []).filter((t: Timesheet) => t.clientId === clientId);
        const allWorkers: Worker[] = workersResponse.data?.items || [];
        const allJobs: Job[] = jobsResponse.data?.items || [];

        // 3. Enrich assignments with job and worker details
        const enrichedAssignments: AssignmentWithDetails[] = assignments.map((assignment: Assignment) => {
          const job = allJobs.find((j: Job) => j.id === assignment.jobId);
          const worker = allWorkers.find((w: Worker) => w.id === assignment.workerId);
          return { ...assignment, job, worker };
        });

        // 4. Calculate stats
        const activeAssignments = enrichedAssignments.filter((a: AssignmentWithDetails) => a.status === 'active');
        const pendingTimesheetsList = timesheets.filter((t: Timesheet) => t.status === 'pending');
        const completedAssignments = enrichedAssignments.filter((a: AssignmentWithDetails) => a.status === 'completed');
        const pendingAssignments = enrichedAssignments.filter((a: AssignmentWithDetails) => a.status === 'pending');

        // Calculate monthly cost (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTimesheets = timesheets.filter((t: Timesheet) => {
          const timesheetDate = new Date(t.weekStarting);
          return timesheetDate.getMonth() === currentMonth && 
                 timesheetDate.getFullYear() === currentYear &&
                 t.status === 'approved';
        });

        const monthlyCost = monthlyTimesheets.reduce((sum: number, timesheet: Timesheet) => {
          const assignment = enrichedAssignments.find((a: AssignmentWithDetails) => a.id === timesheet.assignmentId);
          return sum + (assignment?.rate || 0) * timesheet.totalHours;
        }, 0);

        // Calculate average rating from completed assignments
        const completedWithWorkers = completedAssignments.filter((assignment: AssignmentWithDetails) => assignment.worker);
        const averageRating = completedWithWorkers.length > 0 
          ? completedWithWorkers.reduce((sum: number, assignment: AssignmentWithDetails) => sum + (assignment.worker?.rating || 0), 0) / completedWithWorkers.length
          : 0;

        console.log('📈 Calculated stats:', {
          activeStaff: activeAssignments.length,
          openRequests: pendingAssignments.length,
          pendingApprovals: pendingTimesheetsList.length,
          monthlyCost: Math.round(monthlyCost),
          totalAssignments: assignments.length,
          completedAssignments: completedAssignments.length,
          averageRating: Math.round(averageRating * 10) / 10,
        });

        // Update stats
        setStats({
          activeStaff: activeAssignments.length,
          openRequests: pendingAssignments.length,
          pendingApprovals: pendingTimesheetsList.length,
          monthlyCost: Math.round(monthlyCost),
          totalAssignments: assignments.length,
          completedAssignments: completedAssignments.length,
          averageRating: Math.round(averageRating * 10) / 10,
        });

        // Update recent assignments (last 5)
        setRecentAssignments(enrichedAssignments.slice(0, 5));
        
        // Update pending timesheets (last 3)
        setPendingTimesheets(pendingTimesheetsList.slice(0, 3));
        
        // Update workers for reference
        setWorkers(allWorkers);
        
      } catch (err) {
        console.error('❌ Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  const handleApproveTimesheet = async (timesheetId: string) => {
    try {
      // Mock approve timesheet - in a real app this would update the timesheet
      console.log(`Approving timesheet ${timesheetId}`);
      
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to approve timesheet:', err);
    }
  };

  const handleRejectTimesheet = async (timesheetId: string) => {
    try {
      // Mock reject timesheet - in a real app this would update the timesheet
      console.log(`Rejecting timesheet ${timesheetId}`);
      
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to reject timesheet:', err);
    }
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facility Dashboard</h1>
        <p className="text-gray-600">Manage your staffing requests and healthcare professionals</p>
        {clientProfile && (
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {clientProfile.companyName}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Staff</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.activeStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Open Requests</h3>
              <p className="text-2xl font-bold text-green-600">{stats.openRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Monthly Cost</h3>
              <p className="text-2xl font-bold text-purple-600">£{stats.monthlyCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Assignments</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}/5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link href="/client/staffing/requests/new" className="block w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Request Staff</h4>
                  <p className="text-sm text-gray-600">Submit a new staffing request for your facility</p>
                </div>
              </div>
            </Link>

            <Link href="/client/timesheets/pending" className="block w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Approve Timesheets</h4>
                  <p className="text-sm text-gray-600">Review and approve pending timesheet submissions</p>
                </div>
              </div>
            </Link>

            <Link href="/client/staffing/schedule" className="block w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-4-6V1" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Manage Schedule</h4>
                  <p className="text-sm text-gray-600">View and manage staff scheduling</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Timesheets</h3>
          </div>
          <div className="p-6">
            {pendingTimesheets.length > 0 ? (
              <div className="space-y-4">
                {pendingTimesheets.map((timesheet) => (
                  <div key={timesheet.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getWorkerName(timesheet.workerId)} - {new Date(timesheet.weekStarting).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {timesheet.totalHours} hours • Week of {new Date(timesheet.weekStarting).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveTimesheet(timesheet.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectTimesheet(timesheet.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending timesheets</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Assignments</h3>
        </div>
        <div className="p-6">
          {recentAssignments.length > 0 ? (
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {assignment.job?.title || 'Unknown Job'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {assignment.job?.location} • {assignment.job?.department} • {assignment.job?.shift}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Worker: {assignment.worker ? `${assignment.worker.firstName} ${assignment.worker.lastName}` : 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      £{assignment.rate}/hr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent assignments</p>
          )}
        </div>
      </div>
    </div>
  );
} 