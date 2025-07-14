

// Reports functions for admin
export const getComplianceReports = async () => {
  return {
    success: true,
    data: {
      items: [
        {
          id: 'compliance-001',
          type: 'Document Expiry',
          status: 'warning',
          count: 5,
          description: '5 workers have documents expiring within 30 days'
        },
        {
          id: 'compliance-002',
          type: 'Training Required',
          status: 'critical',
          count: 3,
          description: '3 workers need mandatory training updates'
        },
        {
          id: 'compliance-003',
          type: 'Background Checks',
          status: 'pending',
          count: 2,
          description: '2 new workers require background check completion'
        }
      ],
      total: 3,
      page: 1,
      limit: 10,
      pages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
};

export const getFinancialReports = async () => {
  return {
    success: true,
    data: {
      items: [
        {
          id: 'financial-001',
          period: 'January 2024',
          revenue: 85000,
          expenses: 45000,
          profit: 40000,
          status: 'completed'
        },
        {
          id: 'financial-002',
          period: 'February 2024',
          revenue: 92000,
          expenses: 48000,
          profit: 44000,
          status: 'pending'
        }
      ]
    }
  };
};

export const getPerformanceReports = async () => {
  return {
    success: true,
    data: {
      items: [
        {
          id: 'performance-001',
          metric: 'Client Satisfaction',
          value: 4.8,
          target: 4.5,
          status: 'exceeding'
        },
        {
          id: 'performance-002',
          metric: 'Worker Retention',
          value: 0.92,
          target: 0.90,
          status: 'meeting'
        },
        {
          id: 'performance-003',
          metric: 'Response Time',
          value: 2.1,
          target: 2.0,
          status: 'needs_improvement'
        }
      ]
    }
  };
}; 