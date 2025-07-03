import { apiClient } from './api';

export interface PayrollSummary {
  nextPayrollDate: string;
  lastPayrollDate: string;
  activeWorkers: number;
  pendingPayments: number;
  totalPendingAmount: number;
}

export interface WorkerPayment {
  workerId: string;
  name: string;
  timesheetId: string;
  hours: number;
  rate: number;
  total: number;
  status: 'pending' | 'approved' | 'paid';
}

export interface BacsFile {
  fileId: string;
  createdAt: string;
  totalAmount: number;
  totalWorkers: number;
  status: 'pending' | 'submitted' | 'processed' | 'completed';
}

export interface TaxSummary {
  period: string;
  totalTax: number;
  totalNI: number;
  submissions: number;
}

export interface RtiData {
  submissionId: string;
  status: 'ready' | 'submitted' | 'failed';
  details: string;
}

// Payroll Processing
export const processPayroll = async (timesheetIds: string[]) => {
  return apiClient.post('/api/payments/payroll/process', { timesheetIds });
};

export const calculatePayment = async (workerId: string, timesheetId: string) => {
  return apiClient.post(`/api/payments/calculate/${workerId}/${timesheetId}`);
};

// Worker Payments
export const verifyBankAccount = async (workerId: string) => {
  return apiClient.post(`/api/payments/bank-account/verify/${workerId}`);
};

export const getWorkerPaymentHistory = async (workerId: string) => {
  return apiClient.get<WorkerPayment[]>(`/api/payments/history/${workerId}`);
};

// Summary and Reports
export const getPayrollSummary = async () => {
  return apiClient.get<PayrollSummary>('/api/payments/summary');
};

export const getTaxSummary = async () => {
  return apiClient.get<TaxSummary>('/api/payments/reports/tax-summary');
};

// Tax & Compliance
export const getRtiP1Data = async () => {
  return apiClient.get('/api/payments/compliance/rtip1');
};

export const submitRti = async (data: RtiData) => {
  return apiClient.post('/api/payments/compliance/submit-rti', data);
};

// Admin & Configuration
export const getTaxConfig = async () => {
  return apiClient.get('/api/payments/admin/tax-config');
};

export const testPaymentServices = async () => {
  return apiClient.get('/api/payments/admin/test');
}; 