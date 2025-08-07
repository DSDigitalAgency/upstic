import { apiClient } from '@/demo/func/api';
import { WorkerDashboardStats } from '@/demo/func/api';

// Worker dashboard stats
export const getWorkerDashboardStats = async () => {
  return await apiClient.getWorkerDashboardStats();
};

// Re-export the WorkerDashboardStats type for convenience
export type { WorkerDashboardStats };
