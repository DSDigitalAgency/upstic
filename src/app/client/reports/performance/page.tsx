'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceReport {
  id: string;
  period: string;
  totalAssignments: number;
  completedAssignments: number;
  averageRating: number;
  responseTime: number;
  fillRate: number;
  clientSatisfaction: number;
  workerRetention: number;
  qualityMetrics: {
    metric: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  }[];
  topPerformers: Array<{
    name: string;
    role: string;
    assignments: number;
    rating: number;
  }>;
}

export default function ClientPerformanceReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');

  useEffect(() => {
    // Mock data for performance reports
    const mockReports: PerformanceReport[] = [
      {
        id: '1',
        period: 'January 2024',
        totalAssignments: 100,
        completedAssignments: 95,
        averageRating: 4.6,
        responseTime: 2.3,
        fillRate: 92,
        clientSatisfaction: 94,
        workerRetention: 88,
        qualityMetrics: [
          { metric: 'Patient Care Quality', value: 4.7, target: 4.5, status: 'excellent' },
          { metric: 'Documentation Accuracy', value: 4.3, target: 4.5, status: 'good' },
          { metric: 'Safety Compliance', value: 4.8, target: 4.5, status: 'excellent' },
          { metric: 'Communication Skills', value: 4.2, target: 4.5, status: 'needs_improvement' }
        ],
        topPerformers: [
          { name: 'Sarah Johnson', role: 'Registered Nurse', assignments: 15, rating: 4.9 },
          { name: 'Michael Chen', role: 'Healthcare Assistant', assignments: 12, rating: 4.8 },
          { name: 'Emma Wilson', role: 'Specialist Care Worker', assignments: 10, rating: 4.7 }
        ]
      },
      {
        id: '2',
        period: 'December 2023',
        totalAssignments: 98,
        completedAssignments: 94,
        averageRating: 4.5,
        responseTime: 2.5,
        fillRate: 90,
        clientSatisfaction: 92,
        workerRetention: 85,
        qualityMetrics: [
          { metric: 'Patient Care Quality', value: 4.6, target: 4.5, status: 'excellent' },
          { metric: 'Documentation Accuracy', value: 4.4, target: 4.5, status: 'good' },
          { metric: 'Safety Compliance', value: 4.7, target: 4.5, status: 'excellent' },
          { metric: 'Communication Skills', value: 4.1, target: 4.5, status: 'needs_improvement' }
        ],
        topPerformers: [
          { name: 'Sarah Johnson', role: 'Registered Nurse', assignments: 14, rating: 4.8 },
          { name: 'Michael Chen', role: 'Healthcare Assistant', assignments: 11, rating: 4.7 },
          { name: 'Emma Wilson', role: 'Specialist Care Worker', assignments: 9, rating: 4.6 }
        ]
      }
    ];

    setReports(mockReports);
    setLoading(false);
  }, [user]);

  const currentReport = reports.find(r => r.period.includes(selectedPeriod)) || reports[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs_improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Performance Reports</h1>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{currentReport?.completedAssignments}/{currentReport?.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{currentReport?.averageRating}/5.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Client Satisfaction</p>
              <p className="text-2xl font-semibold text-gray-900">{currentReport?.clientSatisfaction}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">{currentReport?.responseTime} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quality Metrics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentReport?.qualityMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{metric.metric}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-gray-900">{metric.value}/5.0</span>
                  <span className="text-sm text-gray-500">Target: {metric.target}/5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {currentReport?.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-gray-700">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{performer.name}</h4>
                    <p className="text-sm text-gray-500">{performer.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{performer.assignments} assignments</span>
                  <span className="text-sm font-medium text-gray-900">{performer.rating}/5.0 rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monthly Performance Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fill Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((report.completedAssignments / report.totalAssignments) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.averageRating}/5.0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.fillRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.clientSatisfaction}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.responseTime} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 