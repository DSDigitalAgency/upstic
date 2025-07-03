'use client';

import React, { useState, useEffect } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { getTaxConfig, testPaymentServices } from '@/lib/payroll';

export default function PayrollSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await getTaxConfig();
        if (response.success && response.data) {
          setConfig(response.data as Record<string, unknown>);
        }
      } catch (error) {
        console.error('Failed to fetch tax configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleTestServices = async () => {
    setTesting(true);
    try {
      await testPaymentServices();
      setTestStatus('success');
    } catch (error) {
      console.error('Service test failed:', error);
      setTestStatus('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Settings</h1>
        <p className="mt-2 text-gray-600">Configure tax settings and test payment services</p>
      </div>

      <div className="max-w-5xl">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tax Configuration</h2>
            <LoadingButton variant="secondary" disabled>
              Update Config
            </LoadingButton>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : config ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {Object.entries(config).map(([key, value]) => (
                    <div key={key} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center">Failed to load tax configuration</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Health</h2>
            <LoadingButton
              variant="primary"
              loading={testing}
              onClick={handleTestServices}
            >
              Test Services
            </LoadingButton>
          </div>

          {testStatus !== 'idle' && (
            <div className={`mt-4 p-4 rounded-md ${
              testStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {testStatus === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    testStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testStatus === 'success' ? 'All services are operational' : 'Service test failed'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    testStatus === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <p>
                      {testStatus === 'success' 
                        ? 'Payment processing, BACS, and tax services are working correctly.'
                        : 'One or more services are not responding correctly. Please check the logs for details.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Endpoints</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">BACS API</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">HMRC RTI API</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Gateway</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 