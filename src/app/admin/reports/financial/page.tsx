'use client';

export default function FinancialReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Reports</h2>
        <p className="text-gray-600">Revenue, costs, and financial performance analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">£1,284,250</p>
          <p className="text-sm text-green-600 mt-1">+18.5% vs last quarter</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Platform Fees</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">£192,638</p>
          <p className="text-sm text-blue-600 mt-1">15% commission rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Outstanding</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">£45,120</p>
          <p className="text-sm text-yellow-600 mt-1">Pending payments</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Net Profit</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">£156,890</p>
          <p className="text-sm text-purple-600 mt-1">12.2% margin</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Financial Analytics</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Financial Reporting Dashboard</h3>
            <p className="mt-2 text-gray-600">
              Comprehensive financial analytics including revenue tracking, cost analysis, and profitability reports.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Revenue and commission tracking</div>
              <div>• Payment processing analytics</div>
              <div>• Cost breakdown and margins</div>
              <div>• Facility payment reports</div>
              <div>• Worker compensation analysis</div>
              <div>• Tax and compliance reporting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 