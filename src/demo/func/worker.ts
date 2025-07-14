import { apiClient } from './api';
import { Application, Preference, Availability, WorkHistory } from './api';

// Worker dashboard stats
export const getWorkerDashboardStats = async () => {
  return await apiClient.getWorkerDashboardStats();
};

// Worker jobs
export const getAllJobs = async (params: { page?: number; limit?: number; search?: string } = {}) => {
  return await apiClient.getJobs(params);
};

export const getJobById = async (id: string) => {
  return await apiClient.getJobById(id);
};

export const applyForJob = async (workerId: string, jobId: string, applicationData: Partial<Application>) => {
  return await apiClient.post(`/api/workers/applications/${jobId}`, applicationData);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecommendedJobs = async (_workerId: string) => {
  return await apiClient.getJobs({ limit: 10 });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getWorkerApplications = async (_workerId: string) => {
  return await apiClient.get('/api/workers/applications');
};

// Worker documents
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getWorkerDocuments = async (_workerId: string) => {
  return await apiClient.get('/api/workers/documents');
};

export const uploadWorkerDocument = async (documentData: FormData) => {
  return await apiClient.post('/api/workers/documents', documentData);
};

// Worker timesheets
export const getWorkerTimesheets = async (workerId?: string) => {
  return await apiClient.getTimesheets(workerId);
};

export const submitTimesheet = async (workerId: string, timesheetData: { jobId: string; weekStarting: string; totalHours: number; hours: Record<string, number> }) => {
  // Create a new timesheet entry
  const newTimesheet = {
    id: `timesheet-${Date.now()}`,
    workerId,
    jobId: timesheetData.jobId,
    clientId: 'client-001', // Default client
    weekStarting: timesheetData.weekStarting,
    weekEnding: new Date(new Date(timesheetData.weekStarting).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    totalHours: timesheetData.totalHours || 0,
    rate: 45, // Default rate
    totalPay: (timesheetData.totalHours || 0) * 45,
    submittedAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null,
    days: Object.entries(timesheetData.hours).map(([day, hours]) => ({
      date: new Date(new Date(timesheetData.weekStarting).getTime() + ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hours: hours as number,
      startTime: '08:00',
      endTime: '16:00',
      breakMinutes: 30
    }))
  };
  
  return { success: true, data: newTimesheet };
};

export const getPendingTimesheets = async (workerId?: string) => {
  const response = await apiClient.getTimesheets(workerId);
  if (response.success && response.data) {
    const pendingTimesheets = response.data.filter(ts => ts.status === 'pending');
    return { success: true, data: { items: pendingTimesheets, total: pendingTimesheets.length, page: 1, limit: pendingTimesheets.length, pages: 1, hasNext: false, hasPrev: false } };
  }
  return response;
};

// Worker payments
export const getWorkerPayments = async (workerId?: string) => {
  return await apiClient.getPayments(workerId);
};

// Worker preferences
export const getWorkerPreferences = async (workerId?: string) => {
  return await apiClient.getPreferences(workerId);
};

export const updatePreferences = async (workerId: string, preferencesData: Partial<Preference>) => {
  return await apiClient.updatePreferences(workerId, preferencesData);
};

// Worker availability
export const getWorkerAvailability = async (workerId?: string) => {
  return await apiClient.getAvailability(workerId);
};

export const updateAvailability = async (workerId: string, availabilityData: Partial<Availability>) => {
  return await apiClient.updateAvailability(workerId, availabilityData);
};

// Worker work history
export const getWorkHistory = async (workerId?: string) => {
  return await apiClient.getWorkHistory(workerId);
};

export const addWorkHistoryEntry = async (workerId: string, entryData: Partial<WorkHistory>) => {
  return await apiClient.addWorkHistoryEntry(workerId, entryData);
}; 