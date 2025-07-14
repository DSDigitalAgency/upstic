'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface BillingStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  pdfUrl: string;
  description: string;
  timesheetIds: string[];
}

export default function BillingPage() {
  const [stats, setStats] = useState<BillingStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'reports'>('overview');

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch assignments and timesheets to generate invoices
        const assignmentsResponse = await apiClient.getAssignments();
        const assignmentsData = assignmentsResponse.data || [];

        const timesheetsResponse = await apiClient.getTimesheets();
        const timesheetsData = timesheetsResponse.data || [];

        // Generate mock invoices from assignments
        const mockInvoices: Invoice[] = assignmentsData.map((assignment, index) => {
          const assignmentTimesheets = timesheetsData.filter(t => t.assignmentId === assignment.id);
          const totalHours = assignmentTimesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0);
          const amount = totalHours * (assignment.hourlyRate || 0);
          
          return {
            id: `inv-${assignment.id}`,
            date: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString(),
            amount,
            status: index % 3 === 0 ? 'PAID' : index % 3 === 1 ? 'PENDING' : 'OVERDUE',
            pdfUrl: '#',
            description: `Invoice for ${assignment.title}`,
            timesheetIds: assignmentTimesheets.map(t => t.id),
          };
        });

        // Calculate stats
        const paidInvoices = mockInvoices.filter(i => i.status === 'PAID');
        const pendingInvoices = mockInvoices.filter(i => i.status === 'PENDING');
        const overdueInvoices = mockInvoices.filter(i => i.status === 'OVERDUE');
        
        const totalAmount = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const outstandingAmount = totalAmount - paidAmount;

        setStats({
          totalInvoices: mockInvoices.length,
          paidInvoices: paidInvoices.length,
          pendingInvoices: pendingInvoices.length,
          overdueInvoices: overdueInvoices.length,
          totalAmount,
          paidAmount,
          outstandingAmount,
        });

        setInvoices(mockInvoices);

      } catch (err) {
        setError('Failed to load billing data');
        console.error('Billing data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const handleDownloadInvoice = (invoiceId: string) => {
    // Mock download functionality
    console.log(`Downloading invoice ${invoiceId}`);
    alert('Invoice download started (mock functionality)');
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      // Mock payment processing
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'PAID' as const }
          : invoice
      );
      
      setInvoices(updatedInvoices);
      
      // Update stats
      const paidInvoices = updatedInvoices.filter(i => i.status === 'PAID');
      const pendingInvoices = updatedInvoices.filter(i => i.status === 'PENDING');
      const overdueInvoices = updatedInvoices.filter(i => i.status === 'OVERDUE');
      
      const totalAmount = updatedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const outstandingAmount = totalAmount - paidAmount;

      setStats({
        totalInvoices: updatedInvoices.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: pendingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        totalAmount,
        paidAmount,
        outstandingAmount,
      });
    } catch (err) {
      console.error('Failed to process payment:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600">Manage your invoices and payment history</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Invoices</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Paid</h3>
              <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Overdue</h3>
              <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Amount</h3>
              <p className="text-3xl font-bold text-gray-900">£{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Paid Amount</h3>
              <p className="text-3xl font-bold text-green-600">£{stats.paidAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Outstanding</h3>
              <p className="text-3xl font-bold text-red-600">£{stats.outstandingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'invoices', label: 'Invoices' },
              { id: 'payments', label: 'Payments' },
              { id: 'reports', label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'invoices' | 'payments' | 'reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()} • £{invoice.amount.toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Credit Card</p>
                          <p className="text-xs text-gray-500">**** **** **** 1234</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600">Default</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                          <p className="text-xs text-gray-500">Account ending in 5678</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">All Invoices</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Download All
                </button>
              </div>
              
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{invoice.description}</p>
                      <p className="text-xs text-gray-500">
                        Invoice #{invoice.id} • {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {invoice.timesheetIds.length} timesheets included
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        £{invoice.amount.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Download
                        </button>
                        {invoice.status !== 'PAID' && (
                          <button
                            onClick={() => handlePayInvoice(invoice.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Payment history view coming soon. This will show detailed payment records and transaction history.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Billing Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Monthly Summary</h4>
                  <p className="text-sm text-gray-600">
                    Generate monthly billing summaries and reports.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cost Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Analyze costs by department, service, or time period.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 