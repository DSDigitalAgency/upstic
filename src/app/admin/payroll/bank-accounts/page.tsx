"use client";

import { useState, useEffect } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { apiClient } from "@/demo/func/api";

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function BankAccountsPage() {
  const [verifying, setVerifying] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    async function fetchWorkers() {
      const res = await apiClient.getWorkers(1, 100);
      if (res.success && res.data) {
        setWorkers(
          res.data.items.map((w: { id: string; firstName: string; lastName: string }) => ({
            id: w.id,
            name: `${w.firstName} ${w.lastName}`
          }))
        );
      }
    }
    fetchWorkers();
  }, []);

  useEffect(() => {
    // Fetch mock bank accounts for the selected worker
    if (!workerId) {
      setBankAccounts([]);
      return;
    }
    // Use the same mock as in worker/payments/bank-accounts/page.tsx
    const mockAccounts = [
      {
        id: '1',
        accountName: 'Main Account',
        accountNumber: '****1234',
        sortCode: '12-34-56',
        bankName: 'Barclays Bank',
        isDefault: true,
        isVerified: true,
        createdAt: '2025-07-10T10:30:00Z'
      },
      {
        id: '2',
        accountName: 'Savings Account',
        accountNumber: '****5678',
        sortCode: '98-76-54',
        bankName: 'HSBC',
        isDefault: false,
        isVerified: true,
        createdAt: '2025-07-08T14:45:00Z'
      },
      {
        id: '3',
        accountName: 'Travel Account',
        accountNumber: '****4321',
        sortCode: '22-33-44',
        bankName: 'NatWest',
        isDefault: false,
        isVerified: false,
        createdAt: '2025-07-12T09:00:00Z'
      }
    ];
    setBankAccounts(mockAccounts);
  }, [workerId]);

  const handleVerifyAccount = async () => {
    if (!workerId) return;
    
    setVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/payments/bank-account/verify/${workerId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      setSuccess(`Bank account for worker ${workerId} has been successfully submitted for verification.`);
      setWorkerId("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Failed to verify bank account:", err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bank Account Verification</h1>
        <p className="mt-2 text-gray-600">Manually trigger bank account verification for a worker.</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
        {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">{success}</div>}

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            <div>
              <label htmlFor="workerId" className="block text-sm font-medium text-gray-700 mb-2">
                Worker
              </label>
              <select
                id="workerId"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white w-full"
                value={workerId}
                onChange={e => setWorkerId(e.target.value)}
              >
                <option value="">Select a worker</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            
            <LoadingButton
              onClick={handleVerifyAccount}
              loading={verifying}
              disabled={!workerId || verifying}
              className="w-full"
            >
              Verify Bank Account
            </LoadingButton>

            {/* Show bank accounts for selected worker */}
            {workerId && bankAccounts.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Accounts for Selected Worker</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sort Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bankAccounts.map(account => (
                        <tr key={account.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{account.accountName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-700">{account.bankName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-900">{account.accountNumber}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-900">{account.sortCode}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {account.isVerified ? (
                              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Verified</span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-500 text-xs">{new Date(account.createdAt).toLocaleDateString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 