'use client';

import { useState, useEffect } from 'react';

interface ClientPreferences {
  staffing: {
    autoApproveAssignments: boolean;
    requireApprovalForOvertime: boolean;
    preferredWorkerTypes: string[];
    maxBudgetPerAssignment: number;
    preferredShiftTypes: string[];
  };
  billing: {
    autoGenerateInvoices: boolean;
    paymentTerms: string;
    currency: string;
    taxIncluded: boolean;
  };
  compliance: {
    requireDocumentVerification: boolean;
    autoExpiryNotifications: boolean;
    complianceCheckFrequency: string;
  };
  reporting: {
    reportFrequency: string;
    includeCostBreakdown: boolean;
    includePerformanceMetrics: boolean;
    autoExportReports: boolean;
  };
}

export default function ClientSettingsPreferencesPage() {
  const [preferences, setPreferences] = useState<ClientPreferences>({
    staffing: {
      autoApproveAssignments: false,
      requireApprovalForOvertime: true,
      preferredWorkerTypes: ['Registered Nurse', 'Healthcare Assistant'],
      maxBudgetPerAssignment: 500,
      preferredShiftTypes: ['Day', 'Night']
    },
    billing: {
      autoGenerateInvoices: true,
      paymentTerms: '30 days',
      currency: 'GBP',
      taxIncluded: true
    },
    compliance: {
      requireDocumentVerification: true,
      autoExpiryNotifications: true,
      complianceCheckFrequency: 'weekly'
    },
    reporting: {
      reportFrequency: 'monthly',
      includeCostBreakdown: true,
      includePerformanceMetrics: true,
      autoExportReports: false
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleToggle = (category: keyof ClientPreferences, setting: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleInputChange = (category: keyof ClientPreferences, setting: string, value: string | number | boolean | string[]) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Preferences</h1>
        <button
          onClick={() => {/* Mock save */}}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Preferences
        </button>
      </div>

      {/* Staffing Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Staffing Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-approve Assignments</h4>
              <p className="text-sm text-gray-500">Automatically approve new assignments without manual review</p>
            </div>
            <button
              onClick={() => handleToggle('staffing', 'autoApproveAssignments')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.staffing.autoApproveAssignments ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.staffing.autoApproveAssignments ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Require Approval for Overtime</h4>
              <p className="text-sm text-gray-500">Require manual approval for overtime assignments</p>
            </div>
            <button
              onClick={() => handleToggle('staffing', 'requireApprovalForOvertime')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.staffing.requireApprovalForOvertime ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.staffing.requireApprovalForOvertime ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Maximum Budget per Assignment
            </label>
            <input
              type="number"
              value={preferences.staffing.maxBudgetPerAssignment}
              onChange={(e) => handleInputChange('staffing', 'maxBudgetPerAssignment', parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Preferred Worker Types
            </label>
            <select
              multiple
              value={preferences.staffing.preferredWorkerTypes}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleInputChange('staffing', 'preferredWorkerTypes', selected);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="Registered Nurse">Registered Nurse</option>
              <option value="Healthcare Assistant">Healthcare Assistant</option>
              <option value="Specialist Care Worker">Specialist Care Worker</option>
              <option value="Support Worker">Support Worker</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billing Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Billing Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-generate Invoices</h4>
              <p className="text-sm text-gray-500">Automatically generate invoices for completed assignments</p>
            </div>
            <button
              onClick={() => handleToggle('billing', 'autoGenerateInvoices')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.billing.autoGenerateInvoices ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.billing.autoGenerateInvoices ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Payment Terms
              </label>
              <select
                value={preferences.billing.paymentTerms}
                onChange={(e) => handleInputChange('billing', 'paymentTerms', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="7 days">7 days</option>
                <option value="14 days">14 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Currency
              </label>
              <select
                value={preferences.billing.currency}
                onChange={(e) => handleInputChange('billing', 'currency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Include Tax in Invoices</h4>
              <p className="text-sm text-gray-500">Automatically include tax calculations in invoices</p>
            </div>
            <button
              onClick={() => handleToggle('billing', 'taxIncluded')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.billing.taxIncluded ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.billing.taxIncluded ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Compliance Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Require Document Verification</h4>
              <p className="text-sm text-gray-500">Require verification of worker documents before assignment</p>
            </div>
            <button
              onClick={() => handleToggle('compliance', 'requireDocumentVerification')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.compliance.requireDocumentVerification ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.compliance.requireDocumentVerification ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Expiry Notifications</h4>
              <p className="text-sm text-gray-500">Send automatic notifications for expiring documents</p>
            </div>
            <button
              onClick={() => handleToggle('compliance', 'autoExpiryNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.compliance.autoExpiryNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.compliance.autoExpiryNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Compliance Check Frequency
            </label>
            <select
              value={preferences.compliance.complianceCheckFrequency}
              onChange={(e) => handleInputChange('compliance', 'complianceCheckFrequency', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reporting Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reporting Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Report Frequency
            </label>
            <select
              value={preferences.reporting.reportFrequency}
              onChange={(e) => handleInputChange('reporting', 'reportFrequency', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Include Cost Breakdown</h4>
              <p className="text-sm text-gray-500">Include detailed cost breakdown in reports</p>
            </div>
            <button
              onClick={() => handleToggle('reporting', 'includeCostBreakdown')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.reporting.includeCostBreakdown ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.reporting.includeCostBreakdown ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Include Performance Metrics</h4>
              <p className="text-sm text-gray-500">Include performance and quality metrics in reports</p>
            </div>
            <button
              onClick={() => handleToggle('reporting', 'includePerformanceMetrics')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.reporting.includePerformanceMetrics ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.reporting.includePerformanceMetrics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Export Reports</h4>
              <p className="text-sm text-gray-500">Automatically export reports to email</p>
            </div>
            <button
              onClick={() => handleToggle('reporting', 'autoExportReports')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.reporting.autoExportReports ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.reporting.autoExportReports ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 