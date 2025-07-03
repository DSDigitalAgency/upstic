import { apiClient } from './api';

// --- Types ---
export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature_request' | string;
  status: 'open' | 'in_progress' | string;
  priority: 'high' | 'low' | 'medium' | string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: string;
  assignedTo: string | null;
  assignedToName?: string;
  createdAt: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  author: string;
  comment: string;
  createdAt: string;
}

export interface ReportAnalytics {
  total: number;
  open: number;
  closed: number;
  escalated: number;
}

export interface JobAnalytics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  fillRate: number;
  averageTimeToFill: number;
  topSkills: Array<{ skill: string; count: number }>;
  jobsByStatus: {
    open: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  trend: Array<{
    date: string;
    posted: number;
    filled: number;
  }>;
}

export interface WorkerAnalytics {
  totalWorkers: number;
  activeWorkers: number;
  averageRating: number;
  completedJobs: number;
  skillDistribution: Array<{ skill: string; count: number }>;
  statusBreakdown: {
    available: number;
    assigned: number;
    unavailable: number;
  };
  performanceMetrics: {
    onTimeArrival: number;
    completionRate: number;
    clientSatisfaction: number;
  };
}

export interface ApplicationAnalytics {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  conversionRate: number;
  averageProcessingTime: number;
  applicationsByJob: Array<{
    jobId: string;
    jobTitle: string;
    applications: number;
  }>;
  trend: Array<{
    date: string;
    received: number;
    processed: number;
  }>;
}

export interface PlacementAnalytics {
  totalPlacements: number;
  activePlacements: number;
  completedPlacements: number;
  averageDuration: number;
  satisfactionScore: number;
  placementsByFacility: Array<{
    facilityId: string;
    facilityName: string;
    placements: number;
  }>;
  trend: Array<{
    date: string;
    started: number;
    completed: number;
  }>;
}

export interface ReportsListResponse {
  success: boolean;
  data: {
    reports: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

// --- API Functions ---

/** Create a new report */
export const createReport = async (data: Partial<Report>) => {
  return apiClient.post<Report>('/api/reports', data);
};

/** Get all reports */
export const getAllReports = async () => {
  return apiClient.get<ReportsListResponse>('/api/reports');
};

/** Get my reports */
export const getMyReports = async () => {
  return apiClient.get<Report[]>('/api/reports/my-reports');
};

/** Get report by ID */
export const getReportById = async (id: string) => {
  return apiClient.get<Report>(`/api/reports/${id}`);
};

/** Cancel report */
export const cancelReport = async (id: string) => {
  return apiClient.delete(`/api/reports/${id}`);
};

/** Add comment to report */
export const addReportComment = async (id: string, comment: string) => {
  return apiClient.post<ReportComment>(`/api/reports/${id}/comments`, { comment });
};

/** Assign report to admin */
export const assignReport = async (id: string, adminId: string) => {
  return apiClient.put(`/api/reports/${id}/assign`, { adminId });
};

/** Update report status */
export const updateReportStatus = async (id: string, status: string) => {
  return apiClient.put(`/api/reports/${id}/status`, { status });
};

/** Escalate report */
export const escalateReport = async (id: string) => {
  return apiClient.put(`/api/reports/${id}/escalate`);
};

/** Resolve report */
export const resolveReport = async (id: string) => {
  return apiClient.put(`/api/reports/${id}/resolve`);
};

/** Close report */
export const closeReport = async (id: string) => {
  return apiClient.put(`/api/reports/${id}/close`);
};

/** Get report analytics overview */
export const getReportAnalytics = async () => {
  return apiClient.get<ReportAnalytics>('/api/reports/analytics/overview');
};

/** Get escalated reports */
export const getEscalatedReports = async () => {
  return apiClient.get<Report[]>('/api/reports/escalated');
};

/** Reassign escalated report */
export const reassignEscalatedReport = async (id: string, newAdminId: string) => {
  return apiClient.put(`/api/reports/${id}/reassign`, { adminId: newAdminId });
};

interface AnalyticsParams {
  startDate: string;
  endDate: string;
}

/** Get job posting analytics */
export const getJobAnalytics = async ({ startDate, endDate }: AnalyticsParams) => {
  return apiClient.get<JobAnalytics>(`/api/reports/analytics/jobs?startDate=${startDate}&endDate=${endDate}`);
};

/** Get worker analytics */
export const getWorkerAnalytics = async ({ startDate, endDate }: AnalyticsParams) => {
  return apiClient.get<WorkerAnalytics>(`/api/reports/analytics/workers?startDate=${startDate}&endDate=${endDate}`);
};

/** Get application analytics */
export const getApplicationAnalytics = async ({ startDate, endDate }: AnalyticsParams) => {
  return apiClient.get<ApplicationAnalytics>(`/api/reports/analytics/applications?startDate=${startDate}&endDate=${endDate}`);
};

/** Get placement analytics */
export const getPlacementAnalytics = async ({ startDate, endDate }: AnalyticsParams) => {
  return apiClient.get<PlacementAnalytics>(`/api/reports/analytics/placements?startDate=${startDate}&endDate=${endDate}`);
};

/** Download report */
export const downloadReport = async (id: string) => {
  return apiClient.get(`/api/reports/${id}/download`);
};

/** Schedule report */
export const scheduleReport = async (data: { reportType: string; frequency: string; recipients: string[] }) => {
  return apiClient.post('/api/reports/schedule', data);
};

/** Cancel scheduled report */
export const cancelScheduledReport = async (id: string) => {
  return apiClient.delete(`/api/reports/schedule/${id}`);
}; 