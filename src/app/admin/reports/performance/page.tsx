'use client';

import { useEffect, useState } from 'react';
import { getPerformanceReports } from '@/demo/func/reports';

interface PerformanceMetric {
  id: string;
  metric: string;
  value: number;
  target: number;
  status: string;
}

export default function PerformanceAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    async function fetchPerformance() {
      try {
        const res = await getPerformanceReports();
        if (res.success && res.data && Array.isArray(res.data.items)) {
          setPerformanceData(res.data.items);
        } else {
          setPerformanceData([]);
        }
      } catch {
        setError('Failed to load performance analytics');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-800">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md max-w-md">
          <div className="text-red-700 text-lg font-medium mb-2">Error Loading Data</div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // Check if we have any data at all
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-gray-50 p-6 rounded-lg shadow-md max-w-md">
          <div className="text-gray-800 text-lg font-medium mb-2">No Data Available</div>
          <div className="text-gray-700">No analytics data is currently available for display.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Performance Analytics</h2>
        <p className="text-gray-700 font-medium">Platform usage, job fill rates, and user engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceData.map((metric: PerformanceMetric) => (
          <div key={metric.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{metric.metric}</h3>
              <p className="text-4xl font-bold text-blue-700 mb-2">{metric.value}</p>
              <p className="text-sm text-gray-700 mb-1">Target: <span className="font-semibold text-gray-900">{metric.target}</span></p>
            </div>
            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                metric.status === 'exceeding' ? 'bg-green-100 text-green-800' :
                metric.status === 'meeting' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {metric.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 