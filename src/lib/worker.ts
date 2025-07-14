import { apiClient, WorkerDashboardStats, ApiResponse, PaginatedResponse, Worker, Job, Document, Timesheet, Payment, Preference } from './api';

/**
 * Fetch worker dashboard statistics
 * @returns Promise with dashboard statistics
 */
export async function getWorkerDashboardStats(): Promise<ApiResponse<WorkerDashboardStats>> {
  const response = await apiClient.get<{ stats: WorkerDashboardStats }>('/api/dashboard/healthcare/stats');
  
  // Handle nested response structure from server
  if (response.success && response.data && response.data.stats) {
    return {
      success: true,
      data: response.data.stats
    };
  }
  
  // Return error response with proper type
  return {
    success: false,
    error: response.error || 'Failed to get worker dashboard stats'
  };
}

/**
 * Get worker by ID
 * @param id Worker ID
 * @returns Promise with worker data
 */
export async function getWorkerById(id: string): Promise<ApiResponse<Worker>> {
  return apiClient.get<Worker>(`/api/workers/${id}`);
}

/**
 * Update worker
 * @param id Worker ID
 * @param data Worker data to update
 * @returns Promise with updated worker data
 */
export async function updateWorker(id: string, data: Partial<Worker>): Promise<ApiResponse<Worker>> {
  return apiClient.put<Worker>(`/api/workers/${id}`, data);
}

/**
 * Get worker availability
 * @param workerId Worker ID
 * @returns Promise with worker availability
 */
export async function getWorkerAvailability(workerId: string): Promise<ApiResponse<any>> {
  return apiClient.get(`/api/workers/${workerId}/availability`);
}

/**
 * Update worker availability
 * @param workerId Worker ID
 * @param availabilityData Availability data
 * @returns Promise with updated availability
 */
export async function updateAvailability(workerId: string, availabilityData: any): Promise<ApiResponse<any>> {
  return apiClient.put(`/api/workers/${workerId}/availability`, availabilityData);
}

/**
 * Get all available jobs
 * @param params Optional parameters for pagination, sorting, and filtering
 * @returns Promise with available jobs
 */
export async function getAllJobs(params: { 
  page?: number; 
  limit?: number; 
  sortBy?: string; 
  sortOrder?: 'asc' | 'desc'; 
  search?: string;
} = {}): Promise<ApiResponse<PaginatedResponse<Job>>> {
  return apiClient.getJobs(params);
}

/**
 * Get job details by ID
 * @param jobId Job ID
 * @returns Promise with job details
 */
export async function getJobById(jobId: string): Promise<ApiResponse<Job>> {
  return apiClient.getJobById(jobId);
}

/**
 * Get recommended jobs for worker
 * @param workerId Worker ID
 * @returns Promise with recommended jobs
 */
export async function getRecommendedJobs(workerId: string): Promise<ApiResponse<PaginatedResponse<Job>>> {
  return apiClient.get<PaginatedResponse<Job>>(`/api/workers/${workerId}/jobs/recommended`);
}

/**
 * Get worker applications
 * @param workerId Worker ID
 * @returns Promise with worker applications
 */
export async function getWorkerApplications(workerId: string): Promise<ApiResponse<PaginatedResponse<any>>> {
  return apiClient.get<PaginatedResponse<any>>(`/api/workers/${workerId}/applications`);
}

/**
 * Apply for a job
 * @param workerId Worker ID
 * @param jobId Job ID
 * @returns Promise with application result
 */
export async function applyForJob(workerId: string, jobId: string): Promise<ApiResponse<any>> {
  return apiClient.post(`/api/workers/${workerId}/applications/${jobId}`);
}

/**
 * Get worker documents
 * @param workerId Worker ID
 * @returns Promise with worker documents
 */
export async function getWorkerDocuments(workerId: string): Promise<ApiResponse<PaginatedResponse<Document>>> {
  return apiClient.get<PaginatedResponse<Document>>(`/api/workers/${workerId}/documents`);
}

/**
 * Upload worker document
 * @param workerId Worker ID
 * @param documentData Document data
 * @returns Promise with uploaded document
 */
export async function uploadWorkerDocument(workerId: string, documentData: FormData): Promise<ApiResponse<Document>> {
  return apiClient.post<Document>(`/api/workers/${workerId}/documents`, documentData);
}

/**
 * Get worker timesheets
 * @param workerId Worker ID
 * @returns Promise with worker timesheets
 */
export async function getWorkerTimesheets(workerId: string): Promise<ApiResponse<PaginatedResponse<Timesheet>>> {
  return apiClient.get<PaginatedResponse<Timesheet>>(`/api/workers/${workerId}/timesheets`);
}

/**
 * Submit timesheet
 * @param workerId Worker ID
 * @param timesheetData Timesheet data
 * @returns Promise with submitted timesheet
 */
export async function submitTimesheet(workerId: string, timesheetData: any): Promise<ApiResponse<Timesheet>> {
  return apiClient.post<Timesheet>(`/api/workers/${workerId}/timesheets`, timesheetData);
}

/**
 * Get worker payments
 * @param workerId Worker ID
 * @returns Promise with worker payments
 */
export async function getWorkerPayments(workerId: string): Promise<ApiResponse<PaginatedResponse<Payment>>> {
  return apiClient.get<PaginatedResponse<Payment>>(`/api/workers/${workerId}/payments`);
}

/**
 * Get worker preferences
 * @param workerId Worker ID
 * @returns Promise with worker preferences
 */
export async function getWorkerPreferences(workerId: string): Promise<ApiResponse<Preference>> {
  return apiClient.get<Preference>(`/api/workers/${workerId}/preferences`);
}

/**
 * Update worker preferences
 * @param workerId Worker ID
 * @param preferencesData Preferences data
 * @returns Promise with updated preferences
 */
export async function updatePreferences(workerId: string, preferencesData: any): Promise<ApiResponse<Preference>> {
  return apiClient.put<Preference>(`/api/workers/${workerId}/preferences`, preferencesData);
}

/**
 * Get worker work history
 * @param workerId Worker ID
 * @returns Promise with worker work history
 */
export async function getWorkHistory(workerId: string): Promise<ApiResponse<PaginatedResponse<any>>> {
  return apiClient.get<PaginatedResponse<any>>(`/api/workers/${workerId}/work-history`);
}

/**
 * Add work history entry
 * @param workerId Worker ID
 * @param workHistoryData Work history data
 * @returns Promise with added work history entry
 */
export async function addWorkHistoryEntry(workerId: string, workHistoryData: any): Promise<ApiResponse<any>> {
  return apiClient.post(`/api/workers/${workerId}/work-history`, workHistoryData);
}

/**
 * Get pending timesheets for the current worker
 * @param workerId Worker ID
 * @returns Promise with pending timesheets
 */
export async function getPendingTimesheets(workerId: string): Promise<ApiResponse<PaginatedResponse<Timesheet>>> {
  return apiClient.get<PaginatedResponse<Timesheet>>(`/api/workers/${workerId}/timesheets?status=pending`);
} 