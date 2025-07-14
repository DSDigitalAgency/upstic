'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Assignment, Worker } from '@/lib/api';
import { saveJob } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface StaffingStats {
  totalRequests: number;
  activeStaff: number;
  pendingApprovals: number;
  totalCost: number;
  averageRating: number;
}

export default function StaffingPage() {
  const [stats, setStats] = useState<StaffingStats>({
    totalRequests: 0,
    activeStaff: 0,
    pendingApprovals: 0,
    totalCost: 0,
    averageRating: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'schedule'>('overview');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const { user } = useAuth();
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    skills: '',
    requirements: '',
    responsibilities: '',
    experience: 0,
    min: 0,
    max: 0,
  });
  const [newJobError, setNewJobError] = useState<string | null>(null);
  const [newJobLoading, setNewJobLoading] = useState(false);

  useEffect(() => {
    const fetchStaffingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch assignments
        const assignmentsResponse = await apiClient.getAssignments();
        const assignmentsData = assignmentsResponse.data || [];

        // Fetch workers
        const workersResponse = await apiClient.getWorkers();
        const workersData = workersResponse.data?.items || [];

        // Calculate stats
        const activeAssignments = assignmentsData.filter(a => a.status === 'active');
        const pendingAssignments = assignmentsData.filter(a => a.status === 'pending');
        const totalCost = activeAssignments.reduce((sum, assignment) => {
          return sum + (assignment.rate * assignment.hoursPerWeek);
        }, 0);

        const averageRating = workersData.length > 0 
          ? workersData.reduce((sum, worker) => sum + worker.rating, 0) / workersData.length
          : 0;

        setStats({
          totalRequests: assignmentsData.length,
          activeStaff: activeAssignments.length,
          pendingApprovals: pendingAssignments.length,
          totalCost,
          averageRating: Math.round(averageRating * 10) / 10,
        });

        setAssignments(assignmentsData);
        setWorkers(workersData);

      } catch (err) {
        setError('Failed to load staffing data');
        console.error('Staffing data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffingData();
  }, []);

  const handleApproveRequest = async (assignmentId: string) => {
    try {
      // Mock approve request - in a real app this would update the assignment
      console.log(`Approving assignment ${assignmentId}`);
      
      // Refresh data
      const assignmentsResponse = await apiClient.getAssignments();
      const assignmentsData = assignmentsResponse.data || [];
      setAssignments(assignmentsData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeStaff: prev.activeStaff + 1,
        pendingApprovals: prev.pendingApprovals - 1,
      }));
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleRejectRequest = async (assignmentId: string) => {
    try {
      // Mock reject request - in a real app this would update the assignment
      console.log(`Rejecting assignment ${assignmentId}`);
      
      // Refresh data
      const assignmentsResponse = await apiClient.getAssignments();
      const assignmentsData = assignmentsResponse.data || [];
      setAssignments(assignmentsData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
      }));
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };



  const handleNewJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleNewJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewJobLoading(true);
    setNewJobError(null);
    try {
      const response = await saveJob({
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        startDate: newJob.startDate,
        endDate: newJob.endDate,
        skills: newJob.skills.split(',').map(s => s.trim()),
        requirements: newJob.requirements.split(',').map(s => s.trim()),
        responsibilities: newJob.responsibilities,
        experience: Number(newJob.experience),
        salaryMin: Number(newJob.min),
        salaryMax: Number(newJob.max),
        clientId: user?.id,
        company: { name: user?.firstName || 'Client' },
      });
      if (response.success) {
        setShowNewRequest(false);
        setNewJob({ title: '', description: '', location: '', startDate: '', endDate: '', skills: '', requirements: '', responsibilities: '', experience: 0, min: 0, max: 0 });
        // Refresh assignments
        const assignmentsResponse = await apiClient.getAssignments();
        setAssignments(assignmentsResponse.data || []);
      } else {
        setNewJobError('Failed to create request.');
      }
    } catch {
      setNewJobError('An unexpected error occurred.');
    } finally {
      setNewJobLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Staffing Management</h1>
        <p className="text-gray-600">Manage your staffing requests and active assignments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <h3 className="text-lg font-medium text-gray-900">Total Requests</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Staff</h3>
              <p className="text-2xl font-bold text-green-600">{stats.activeStaff}</p>
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
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'requests', label: 'Staffing Requests' },
              { id: 'schedule', label: 'Schedule' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'requests' | 'schedule')}
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Requests</h3>
                  <div className="space-y-3">
                    {assignments.slice(0, 5).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-xs text-gray-500">
                            {assignment.location || 'Unknown Facility'} • {assignment.shiftType}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                    ))}
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
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{worker.rating}/5</span>
                          <span className="text-xs text-gray-500">({worker.completedJobs} jobs)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Staffing Requests</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" onClick={() => setShowNewRequest(true)}>
                  New Request
                </button>
              </div>
              {showNewRequest && (
                <form onSubmit={handleNewJobSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="title" value={newJob.title} onChange={handleNewJobChange} placeholder="Job Title" required className="border rounded px-3 py-2 w-full" />
                    <input name="location" value={newJob.location} onChange={handleNewJobChange} placeholder="Location" required className="border rounded px-3 py-2 w-full" />
                  </div>
                  <textarea name="description" value={newJob.description} onChange={handleNewJobChange} placeholder="Description" required className="border rounded px-3 py-2 w-full" rows={3} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="skills" value={newJob.skills} onChange={handleNewJobChange} placeholder="Skills (comma-separated)" className="border rounded px-3 py-2 w-full" />
                    <input name="requirements" value={newJob.requirements} onChange={handleNewJobChange} placeholder="Requirements (comma-separated)" className="border rounded px-3 py-2 w-full" />
                    <input name="responsibilities" value={newJob.responsibilities} onChange={handleNewJobChange} placeholder="Responsibilities (comma-separated)" className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="startDate" type="date" value={newJob.startDate} onChange={handleNewJobChange} required className="border rounded px-3 py-2 w-full" />
                    <input name="endDate" type="date" value={newJob.endDate} onChange={handleNewJobChange} required className="border rounded px-3 py-2 w-full" />
                    <input name="experience" type="number" value={newJob.experience} onChange={handleNewJobChange} placeholder="Experience (Years)" className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="min" type="number" value={newJob.min} onChange={handleNewJobChange} placeholder="Min Salary" className="border rounded px-3 py-2 w-full" />
                    <input name="max" type="number" value={newJob.max} onChange={handleNewJobChange} placeholder="Max Salary" className="border rounded px-3 py-2 w-full" />
                  </div>
                  {newJobError && <p className="text-red-500 text-sm">{newJobError}</p>}
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowNewRequest(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" disabled={newJobLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{newJobLoading ? 'Creating...' : 'Create Request'}</button>
                  </div>
                </form>
              )}
              
              <div className="space-y-3">
                {assignments.filter(a => a.status === 'pending').map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                      <p className="text-xs text-gray-500">
                        {assignment.location} • {assignment.shiftType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        £{assignment.hourlyRate}/hr • {assignment.totalHours} hours
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveRequest(assignment.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(assignment.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Staff Schedule</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Schedule view coming soon. This will show a calendar view of all staff assignments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 