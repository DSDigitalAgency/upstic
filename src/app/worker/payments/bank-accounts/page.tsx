'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

export default function BankAccounts() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    sortCode: '',
    bankName: ''
  });

  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Mock data for demo
        const mockAccounts: BankAccount[] = [
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
      } catch (err) {
        setError('Failed to load bank accounts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankAccounts();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsAdding(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        accountName: formData.accountName,
        accountNumber: `****${formData.accountNumber.slice(-4)}`,
        sortCode: formData.sortCode,
        bankName: formData.bankName,
        isDefault: bankAccounts.length === 0,
        isVerified: false,
        createdAt: new Date().toISOString()
      };
      
      setBankAccounts(prev => [...prev, newAccount]);
      setSuccessMessage('Bank account added successfully!');
      
      // Reset form
      setFormData({
        accountName: '',
        accountNumber: '',
        sortCode: '',
        bankName: ''
      });
      
      setIsAdding(false);
    } catch (err) {
      setError('Failed to add bank account');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      setBankAccounts(prev => 
        prev.map(account => ({
          ...account,
          isDefault: account.id === accountId
        }))
      );
      setSuccessMessage('Default account updated successfully!');
    } catch (err) {
      setError('Failed to update default account');
      console.error(err);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      setBankAccounts(prev => prev.filter(account => account.id !== accountId));
      setSuccessMessage('Bank account deleted successfully!');
    } catch (err) {
      setError('Failed to delete bank account');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Accounts</h2>
        <p className="text-gray-600">Manage your payment methods and bank account details</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Accounts</p>
              <p className="text-2xl font-semibold text-gray-900">{bankAccounts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bankAccounts.filter(account => account.isVerified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bankAccounts.filter(account => !account.isVerified).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Account */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Bank Account</h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isAdding ? 'Cancel' : 'Add Account'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Main Account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Barclays Bank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="8 digits"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sortCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Code
                </label>
                <input
                  type="text"
                  id="sortCode"
                  name="sortCode"
                  value={formData.sortCode}
                  onChange={handleInputChange}
                  required
                  placeholder="12-34-56"
                  pattern="[0-9]{2}-[0-9]{2}-[0-9]{2}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add Account'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bank Accounts List */}
      {bankAccounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Bank Accounts</h3>
            <p className="mt-1 text-sm text-gray-500">Add a bank account to receive payments.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Bank Accounts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {bankAccounts.map((account) => (
              <div key={account.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{account.accountName}</h4>
                        {account.isDefault && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                        {account.isVerified ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{account.bankName}</p>
                      <p className="text-sm text-gray-700">
                        Account: <span className="text-gray-900">{account.accountNumber}</span> • Sort Code: <span className="text-gray-900">{account.sortCode}</span>
                      </p>
                      <p className="text-xs text-gray-500">Added {formatDate(account.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!account.isDefault && (
                      <button
                        onClick={() => handleSetDefault(account.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Your bank account details are encrypted and stored securely. We only display the last 4 digits of your account number for security purposes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 