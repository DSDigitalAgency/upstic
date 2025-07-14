'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { verifyBankAccount, getWorkerPaymentHistory, WorkerPayment } from '@/demo/func/payroll';

export default function WorkerPaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [payments, setPayments] = useState<WorkerPayment[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  const handleVerifyBankAccount = async () => {
    if (!workerId) return;
    
    setVerificationStatus('verifying');
    try {
      await verifyBankAccount();
      setVerificationStatus('success');
    } catch (error) {
      console.error('Failed to verify bank account:', error);
      setVerificationStatus('error');
    }
  };

  const handleFetchHistory = async () => {
    if (!workerId) return;
    
    setLoading(true);
    try {
      const response = await getWorkerPaymentHistory();
      if (response.success && response.data) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Worker Payments</h1>
        <p className="mt-2 text-gray-600">View payment history and verify bank accounts</p>
      </div>

      <div className="max-w-5xl">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Worker Details</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Worker ID"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="Enter worker ID"
              />
            </div>
            <div className="flex items-end">
              <LoadingButton 
                variant="secondary"
                onClick={handleFetchHistory}
                loading={loading}
                disabled={!workerId}
              >
                Fetch History
              </LoadingButton>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bank Account Verification</h2>
            <LoadingButton
              variant="primary"
              onClick={handleVerifyBankAccount}
              loading={verificationStatus === 'verifying'}
              disabled={!workerId}
            >
              Verify Bank Account
            </LoadingButton>
          </div>
          
          {verificationStatus === 'success' && (
            <div className="bg-green-50 text-green-800 px-4 py-2 rounded-md text-sm">
              Bank account verified successfully
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="bg-red-50 text-red-800 px-4 py-2 rounded-md text-sm">
              Failed to verify bank account
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timesheet ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.timesheetId}>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.timesheetId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.hours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">£{payment.rate.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">£{payment.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {workerId ? 'No payment history found' : 'Enter a worker ID to view payment history'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 