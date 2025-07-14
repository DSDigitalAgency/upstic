"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { getPayrollReports } from '@/demo/func/payroll';

interface PayrollReport {
  id: string;
  period: string;
  totalPayroll: number;
  totalWorkers: number;
  averageHours: number;
  status: string;
}

export default function PayrollHistoryPage() {
  const [reports, setReports] = useState<PayrollReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPayrollReports();
        if (res.success && res.data) {
          setReports(res.data.items);
        } else {
          setError('Failed to load payroll history');
        }
      } catch {
        setError('Failed to load payroll history');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payroll History</h1>
        <p className="mt-2 text-gray-600">View and manage past payroll runs</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Search payroll runs..."
                className="w-full sm:w-64"
                disabled
              />
              <select
                className="w-full sm:w-48 px-3 py-2 border rounded-lg shadow-sm text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="all"
                disabled
              >
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <LoadingButton variant="secondary" disabled>
              Export
            </LoadingButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workers Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-red-600">{error}</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No payroll history found</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 text-gray-900 font-medium">{report.period}</td>
                    <td className="px-6 py-4 text-gray-700">{`01 ${report.period}`}</td>
                    <td className="px-6 py-4 text-gray-900">{report.totalWorkers}</td>
                    <td className="px-6 py-4 text-gray-900">£{report.totalPayroll.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{report.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{reports.length}</span> results
            </div>
            <div className="flex-1 flex justify-end space-x-3">
              <LoadingButton variant="secondary" disabled>
                Previous
              </LoadingButton>
              <LoadingButton variant="secondary" disabled>
                Next
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 