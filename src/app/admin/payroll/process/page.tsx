'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { apiClient } from '@/demo/func/api';

interface WorkerPayment {
  timesheetId: string;
  name: string;
  hours: number;
  rate: number;
  total: number;
  status: string;
}

export default function PayrollProcessPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerPayment[]>([]);
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalWorkers: 0,
    totalHours: 0
  });

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setPayPeriodStart(startOfMonth.toISOString().split('T')[0]);
    setPayPeriodEnd(endOfMonth.toISOString().split('T')[0]);
    setPaymentDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchTimesheets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch approved timesheets for the period
      const [timesheetsRes, workersRes] = await Promise.all([
        apiClient.getTimesheets(),
        apiClient.getWorkers(1, 100)
      ]);

      if (timesheetsRes.success && timesheetsRes.data && workersRes.success && workersRes.data) {
        const timesheets = timesheetsRes.data;
        const workers = workersRes.data.items;
        
        // Filter for approved timesheets within the selected period
        const filteredTimesheets = timesheets.filter(timesheet => 
          timesheet.status === 'approved' &&
          new Date(timesheet.weekStarting) >= new Date(payPeriodStart) &&
          new Date(timesheet.weekEnding) <= new Date(payPeriodEnd)
        );
        
        // Group timesheets by worker and calculate totals
        const workerMap = new Map<string, WorkerPayment>();

        for (const timesheet of filteredTimesheets) {
          const key = timesheet.workerId;
          const workerData = workers.find(w => w.id === timesheet.workerId);
          
          if (!workerMap.has(key)) {
            workerMap.set(key, {
              timesheetId: timesheet.id,
              name: workerData ? `${workerData.firstName} ${workerData.lastName}` : 'Unknown Worker',
              hours: 0,
              rate: timesheet.rate || 15, // Default rate
              total: 0,
              status: timesheet.status
            });
          }

          const workerPayment = workerMap.get(key)!;
          workerPayment.hours += timesheet.totalHours || 0;
          workerPayment.total += timesheet.totalPay || 0;
        }

        const payments = Array.from(workerMap.values());
        setWorkers(payments);

        // Calculate summary
        const totalAmount = payments.reduce((sum, worker) => sum + worker.total, 0);
        const totalHours = payments.reduce((sum, worker) => sum + worker.hours, 0);

        setSummary({
          totalAmount,
          totalWorkers: payments.length,
          totalHours
        });
      } else {
        setError(timesheetsRes.error || workersRes.error || 'Failed to load timesheets');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Timesheets fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [payPeriodStart, payPeriodEnd]);

  useEffect(() => {
    if (payPeriodStart && payPeriodEnd) {
      fetchTimesheets();
    }
  }, [payPeriodStart, payPeriodEnd, fetchTimesheets]);

  const handleProcessPayroll = async () => {
    if (!payPeriodStart || !payPeriodEnd || !paymentDate || selectedTimesheets.length === 0) {
      setError('Please select a pay period, payment date, and at least one timesheet');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await apiClient.post();

      if (response.success) {
        // Redirect to payroll history or show success message
        router.push('/admin/payroll/history');
      } else {
        setError(response.error || 'Failed to process payroll');
      }
    } catch (error) {
      setError('Failed to process payroll');
      console.error("Failed to process payroll:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTimesheets(workers.map(w => w.timesheetId));
    } else {
      setSelectedTimesheets([]);
    }
  };

  const handleSelectTimesheet = (timesheetId: string, checked: boolean) => {
    if (checked) {
      setSelectedTimesheets([...selectedTimesheets, timesheetId]);
    } else {
      setSelectedTimesheets(selectedTimesheets.filter(id => id !== timesheetId));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Process Payroll</h1>
        <p className="mt-2 text-gray-600">Review and process payments for approved timesheets</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pay Period Selection Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Pay Period Selection</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="payPeriodStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Period Start
                </label>
                <Input
                  type="date"
                  id="payPeriodStart"
                  value={payPeriodStart}
                  onChange={e => setPayPeriodStart(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="payPeriodEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Period End
                </label>
                <Input
                  type="date"
                  id="payPeriodEnd"
                  value={payPeriodEnd}
                  onChange={e => setPayPeriodEnd(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date
                </label>
                <Input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600">Total Amount</div>
                <div className="mt-1 text-2xl font-semibold text-blue-900">{formatCurrency(summary.totalAmount)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600">Total Workers</div>
                <div className="mt-1 text-2xl font-semibold text-green-900">{summary.totalWorkers}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600">Total Hours</div>
                <div className="mt-1 text-2xl font-semibold text-purple-900">{summary.totalHours.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timesheets Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Timesheets to Process</h2>
            <LoadingButton 
              variant="secondary" 
              onClick={fetchTimesheets} 
              className="text-sm"
              loading={isLoading}
            >
              Refresh List
            </LoadingButton>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedTimesheets.length === workers.length && workers.length > 0}
                      disabled={workers.length === 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <tr key={worker.timesheetId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedTimesheets.includes(worker.timesheetId)}
                          onChange={(e) => handleSelectTimesheet(worker.timesheetId, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{worker.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{worker.hours.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatCurrency(worker.rate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{formatCurrency(worker.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${worker.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            worker.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {worker.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 bg-gray-50">
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Loading timesheets...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-base">No timesheets found for the selected period</p>
                          <p className="text-sm mt-1">Try selecting a different date range</p>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Selected: <span className="font-medium text-gray-900">{selectedTimesheets.length} timesheet(s)</span>
            {selectedTimesheets.length > 0 && (
              <span className="ml-4">
                Total: <span className="font-medium text-gray-900">
                  {formatCurrency(workers.filter(w => selectedTimesheets.includes(w.timesheetId)).reduce((sum, w) => sum + w.total, 0))}
                </span>
              </span>
            )}
          </div>
          <div className="space-x-4">
            <LoadingButton 
              variant="secondary"
              onClick={() => router.back()}
              disabled={isProcessing}
            >
              Cancel
            </LoadingButton>
            <LoadingButton 
              variant="primary"
              onClick={handleProcessPayroll}
              loading={isProcessing}
              disabled={selectedTimesheets.length === 0}
            >
              Process Payroll
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
} 