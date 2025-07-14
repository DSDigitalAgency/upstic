'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Assignment, Timesheet, Worker } from '@/lib/api';

interface ReportStats {
  totalAssignments: number;
  completedAssignments: number;
  activeAssignments: number;
  totalHours: number;
  totalCost: number;
  averageRating: number;
  totalWorkers: number;
  averageWorkerRating: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalAssignments: 0,
    completedAssignments: 0,
    activeAssignments: 0,
    totalHours: 0,
    totalCost: 0,
    averageRating: 0,
    totalWorkers: 0,
    averageWorkerRating: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'staffing' | 'costs' | 'performance'>('staffing');

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data
        const assignmentsResponse = await apiClient.getAssignments();
        const assignmentsData = assignmentsResponse.data || [];

        const timesheetsResponse = await apiClient.getTimesheets();
        const timesheetsData = timesheetsResponse.data || [];

        const workersResponse = await apiClient.getWorkers();
        const workersData = workersResponse.data?.items || [];

        // Calculate stats
        const completedAssignments = assignmentsData.filter(a => a.status === 'completed');
        const activeAssignments = assignmentsData.filter(a => a.status === 'active');
        
        const totalHours = timesheetsData.reduce((sum, timesheet) => sum + timesheet.totalHours, 0);
        const totalCost = assignmentsData.reduce((sum, assignment) => {
          const assignmentTimesheets = timesheetsData.filter(t => t.assignmentId === assignment.id);
          const hours = assignmentTimesheets.reduce((h, t) => h + t.totalHours, 0);
          const rate = assignment.hourlyRate !== undefined ? assignment.hourlyRate : assignment.rate;
          return sum + (hours * rate);
        }, 0);

        const averageRating = completedAssignments.length > 0 
          ? completedAssignments.reduce((sum, assignment) => sum + (assignment.workerId ? 4.5 : 0), 0) / completedAssignments.length
          : 0;

        const averageWorkerRating = workersData.length > 0
          ? workersData.reduce((sum, worker) => sum + worker.rating, 0) / workersData.length
          : 0;

        setStats({
          totalAssignments: assignmentsData.length,
          completedAssignments: completedAssignments.length,
          activeAssignments: activeAssignments.length,
          totalHours,
          totalCost,
          averageRating: Math.round(averageRating * 10) / 10,
          totalWorkers: workersData.length,
          averageWorkerRating: Math.round(averageWorkerRating * 10) / 10,
        });

        setAssignments(assignmentsData);
        setTimesheets(timesheetsData);
        setWorkers(workersData);

      } catch (err) {
        setError('Failed to load reports data');
        console.error('Reports data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, []);

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

  const departmentData = assignments.reduce((acc, assignment) => {
    const dept = assignment.location || 'Unknown';
    const assignmentTimesheets = timesheets.filter(t => t.assignmentId === assignment.id);
    const hours = assignmentTimesheets.reduce((sum, t) => sum + t.totalHours, 0);
    const rate = assignment.hourlyRate !== undefined ? assignment.hourlyRate : assignment.rate;
    const cost = hours * rate;
    if (!acc[dept]) acc[dept] = { hours: 0, cost: 0 };
    acc[dept].hours += hours;
    acc[dept].cost += cost;
    return acc;
  }, {} as Record<string, { hours: number; cost: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">View detailed reports and analytics for your facility</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Assignments</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</p>
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
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedAssignments}</p>
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
              <h3 className="text-lg font-medium text-gray-900">Total Cost</h3>
              <p className="text-2xl font-bold text-purple-600">£{stats.totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Avg Rating</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.averageRating}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Hours</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalHours}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Active Staff</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Worker Rating</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.averageWorkerRating}/5</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'staffing', label: 'Staffing Reports' },
              { id: 'costs', label: 'Cost Analysis' },
              { id: 'performance', label: 'Performance Metrics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'staffing' | 'costs' | 'performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'staffing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Summary</h3>
                  <div className="space-y-3">
                    {assignments.slice(0, 5).map((assignment) => {
                      const assignmentTimesheets = timesheets.filter(t => t.assignmentId === assignment.id);
                      const totalHours = assignmentTimesheets.reduce((sum, t) => sum + t.totalHours, 0);
                      const totalCost = totalHours * (assignment.hourlyRate ?? assignment.rate);
                      
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-xs text-gray-500">
                              {assignment.location} • {assignment.shiftType}
                            </p>
                            <p className="text-xs text-gray-500">
                              {totalHours} hours • £{totalCost.toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Workers</h3>
                  <div className="space-y-3">
                    {workers.slice(0, 5).map((worker) => (
                      <div key={worker.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {worker.firstName} {worker.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {worker.skills.join(', ')} • {worker.experience} years exp
                          </p>
                          <p className="text-xs text-gray-500">
                            {worker.completedJobs} completed jobs
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{worker.rating}/5</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            worker.rating >= 4.0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {worker.rating >= 4.0 ? 'Excellent' : 'Good'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total Staffing Cost</p>
                        <p className="text-xs text-gray-500">All assignments and timesheets</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">£{stats.totalCost.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Average Hourly Rate</p>
                        <p className="text-xs text-gray-500">Across all assignments</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        £{assignments.length > 0 ? (assignments.reduce((sum, a) => sum + (a.hourlyRate !== undefined ? a.hourlyRate : a.rate), 0) / assignments.length).toFixed(2) : '0'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total Hours</p>
                        <p className="text-xs text-gray-500">All timesheet hours</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{stats.totalHours}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by Department</h3>
                  <div className="space-y-3">
                    {Object.entries(departmentData).map(([dept, data]: [string, { hours: number; cost: number }]) => (
                      <div key={dept} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dept}</p>
                          <p className="text-xs text-gray-500">{data.hours} hours</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">£{data.cost.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                        <p className="text-xs text-gray-500">Completed vs total assignments</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0}%
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Average Rating</p>
                        <p className="text-xs text-gray-500">Across all assignments</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">{stats.averageRating}/5</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Worker Satisfaction</p>
                        <p className="text-xs text-gray-500">Average worker rating</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{stats.averageWorkerRating}/5</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Performance</h3>
                  <div className="space-y-3">
                    {assignments.filter(a => a.status === 'completed').slice(0, 5).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-xs text-gray-500">
                            {assignment.location} • {new Date(assignment.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">4.5/5</span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Excellent
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 