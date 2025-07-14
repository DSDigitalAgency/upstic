'use client';

import { useEffect, useState } from 'react';
import { getComplianceReports } from '@/demo/func/reports';

interface ComplianceReport {
  id: string;
  type: string;
  status: string;
  count: number;
  description: string;
}

export default function ComplianceReportsPage() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getComplianceReports();
        if (response.success && response.data) {
          setReports(response.data.items);
        } else {
          setError('Failed to fetch reports.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Error fetching reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);



  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Reports</h2>
        <p className="text-gray-600">Regulatory compliance and audit trail reports</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading reports...</div>
          ) : error ? (
            <div className="text-center text-red-500">Error: {error}</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-gray-500">No compliance reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{report.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{report.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 