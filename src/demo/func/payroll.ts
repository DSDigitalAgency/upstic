

// Payroll functions for admin
export const getPayrollStats = async () => {
  return {
    success: true,
    data: {
      totalPayroll: 45000,
      pendingPayments: 12000,
      processedThisMonth: 33000,
      averageHourlyRate: 25.50
    }
  };
};

export const getPayrollReports = async () => {
  return {
    success: true,
    data: {
      items: [
        {
          id: 'report-001',
          period: 'January 2024',
          totalPayroll: 45000,
          totalWorkers: 15,
          averageHours: 160,
          status: 'completed'
        },
        {
          id: 'report-002',
          period: 'February 2024',
          totalPayroll: 48000,
          totalWorkers: 18,
          averageHours: 165,
          status: 'pending'
        }
      ],
      total: 2,
      page: 1,
      limit: 10,
      pages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
};

export const getPayrollSettings = async () => {
  return {
    success: true,
    data: {
      paySchedule: 'weekly',
      taxRate: 0.20,
      overtimeRate: 1.5,
      holidayPay: true,
      pensionContribution: 0.05
    }
  };
};

export const updatePayrollSettings = async (settings: Record<string, unknown>) => {
  return { success: true, data: settings };
};

export const getTaxReports = async () => {
  return {
    success: true,
    data: {
      items: [
        {
          id: 'tax-001',
          period: 'Q1 2024',
          totalTax: 9000,
          workersCount: 15,
          status: 'filed'
        },
        {
          id: 'tax-002',
          period: 'Q2 2024',
          totalTax: 9600,
          workersCount: 18,
          status: 'pending'
        }
      ]
    }
  };
};

export const getWorkerPayroll = async () => {
  return {
    success: true,
    data: {
      workerId: 'worker-001',
      totalEarnings: 4500,
      totalHours: 180,
      averageRate: 25,
      taxDeductions: 900,
      netPay: 3600,
      payments: [
        {
          id: 'payment-001',
          period: 'Week 1',
          hours: 40,
          rate: 25,
          gross: 1000,
          tax: 200,
          net: 800
        }
      ]
    }
  };
};

export const getTaxConfig = async () => {
  return {
    success: true,
    data: {
      taxRate: 0.2,
      niRate: 0.12,
      pensionRate: 0.05,
      paySchedule: 'monthly',
      autoEnrollment: true,
      rtiEnabled: true
    }
  };
};

export const testPaymentServices = async () => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    message: 'Payment services are operational.'
  };
};

// Add missing functions
export const verifyBankAccount = async () => {
  // Simulate bank account verification
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    message: 'Bank account verified successfully'
  };
};

export const getWorkerPaymentHistory = async () => {
  // Simulate fetching payment history
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    data: [
      {
        timesheetId: 'TS-001',
        hours: 40,
        rate: 25.00,
        total: 1000.00,
        status: 'paid' as const
      },
      {
        timesheetId: 'TS-002',
        hours: 35,
        rate: 25.00,
        total: 875.00,
        status: 'pending' as const
      },
      {
        timesheetId: 'TS-003',
        hours: 42,
        rate: 25.00,
        total: 1050.00,
        status: 'paid' as const
      }
    ]
  };
};

// Export the WorkerPayment type
export interface WorkerPayment {
  timesheetId: string;
  hours: number;
  rate: number;
  total: number;
  status: 'paid' | 'pending' | 'processing';
} 