'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { WorkerPayment } from '@/lib/payroll';

export default function PayrollProcessPage() {
  const router = useRouter();
  const workers: WorkerPayment[] = [];
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
  const summary = {
    totalAmount: 0,
    totalWorkers: 0,
    totalHours: 0
  };

  const handleProcessPayroll = async () => {
    if (!payPeriodStart || !payPeriodEnd || !paymentDate) {
      return;
    }

    try {
      const body = {
        payPeriod: {
          start: payPeriodStart,
          end: payPeriodEnd,
        },
        paymentDate: new Date(paymentDate).toISOString(),
      };
      await fetch("/api/payments/payroll/process", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error("Failed to process payroll:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Process Payroll</h1>
        <p className="mt-2 text-gray-600">Review and process payments for approved timesheets</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
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
                <div className="mt-1 text-2xl font-semibold text-blue-900">£{summary.totalAmount.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600">Total Workers</div>
                <div className="mt-1 text-2xl font-semibold text-green-900">{summary.totalWorkers}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600">Total Hours</div>
                <div className="mt-1 text-2xl font-semibold text-purple-900">{summary.totalHours}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timesheets Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Timesheets to Process</h2>
            <LoadingButton variant="secondary" onClick={() => {}} className="text-sm">
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTimesheets(workers.map(w => w.timesheetId));
                        } else {
                          setSelectedTimesheets([]);
                        }
                      }}
                      checked={selectedTimesheets.length === workers.length && workers.length > 0}
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
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTimesheets([...selectedTimesheets, worker.timesheetId]);
                            } else {
                              setSelectedTimesheets(selectedTimesheets.filter(id => id !== worker.timesheetId));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{worker.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{worker.hours}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">£{worker.rate.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">£{worker.total.toFixed(2)}</td>
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
                      <p className="text-base">No timesheets found for the selected period</p>
                      <p className="text-sm mt-1">Try selecting a different date range</p>
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
          </div>
          <div className="space-x-4">
            <LoadingButton 
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </LoadingButton>
            <LoadingButton 
              variant="primary"
              onClick={handleProcessPayroll}
            >
              Process Payroll
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
} 