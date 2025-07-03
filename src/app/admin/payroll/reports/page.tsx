"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { getTaxSummary, TaxSummary } from '@/lib/payroll';

export default function PayrollReportsPage() {
  const [taxLoading, setTaxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taxReport, setTaxReport] = useState<TaxSummary | null>(null);

  const handleGetTaxSummary = async () => {
    setTaxLoading(true);
    setError(null);
    setTaxReport(null);
    try {
      const response = await getTaxSummary();
      if (response.success && response.data) {
        setTaxReport(response.data);
      } else {
        setError(response.message || 'Failed to fetch tax summary.');
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching tax summary.");
      console.error(err);
    } finally {
      setTaxLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payroll Reports</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">Generate and view detailed financial summaries for tax and BACS payments.</p>
          </div>
        </div>
      
        <div className="space-y-6">
          {error && (
            <div className="animate-fadeIn bg-red-50 border-l-4 border-red-400 p-4 rounded-lg" role="alert">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tax Summary Report */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Tax Summary Report (HMRC)</h2>
                  <p className="mt-1 text-sm text-gray-600">Generate a comprehensive summary of tax and NI contributions.</p>
                </div>
                <LoadingButton 
                  onClick={handleGetTaxSummary} 
                  loading={taxLoading}
                  className="w-full md:w-auto"
                >
                  {taxLoading ? 'Generating Report...' : 'Generate Tax Summary'}
                </LoadingButton>
              </div>
            </div>

            {taxReport && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="mb-4 flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-700">Report Period: <span className="font-semibold text-gray-900">{taxReport.period}</span></h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 transform transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <svg className="h-6 w-6 text-blue-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-800">Total Tax</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">£{taxReport.totalTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 transform transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <svg className="h-6 w-6 text-green-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-green-800">Total National Insurance</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">£{taxReport.totalNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 transform transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <svg className="h-6 w-6 text-purple-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-purple-800">Total Submissions</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{taxReport.submissions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 