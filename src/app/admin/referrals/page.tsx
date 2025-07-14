'use client';

import { useState, useEffect } from 'react';
import referrals from '@/demo/data/referrals.json';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  sentReferrals: number;
  registeredReferrals: number;
  totalBonusPaid: number;
  conversionRate: number;
  topReferrers?: Array<{
    id: string;
    name: string;
    referrals: number;
    completed: number;
    bonusEarned: number;
  }>;
  monthlyStats?: Array<{
    month: string;
    referrals: number;
    registrations: number;
    completions: number;
    bonusPaid: number;
  }>;
}

export default function AdminReferrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrers' | 'trends'>('overview');

  // Helper to compute admin referral stats from mock data
  function getAdminReferralStats(): ReferralStats {
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED').length;
    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length;
    const sentReferrals = referrals.filter(r => r.status === 'SENT').length;
    const registeredReferrals = referrals.filter(r => r.status === 'REGISTERED').length;
    const totalBonusPaid = referrals.filter(r => r.bonusStatus === 'PAID').reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
    const conversionRate = totalReferrals > 0 ? completedReferrals / totalReferrals : 0;
    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      sentReferrals,
      registeredReferrals,
      totalBonusPaid,
      conversionRate
    };
  }

  useEffect(() => {
    setIsLoading(true);
    try {
      const stats = getAdminReferralStats();
      setStats(stats);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        <p>No referral data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Analytics</h2>
        <p className="text-gray-600">Track referral performance and bonus payouts</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'referrers', label: 'Top Referrers' },
            { id: 'trends', label: 'Monthly Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'referrers' | 'trends')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalReferrals}</p>
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
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completedReferrals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bonus Paid</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.totalBonusPaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatPercentage(stats.conversionRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-gray-900">{stats.pendingReferrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sent</span>
                  <span className="text-sm font-medium text-gray-900">{stats.sentReferrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Registered</span>
                  <span className="text-sm font-medium text-gray-900">{stats.registeredReferrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-gray-900">{stats.completedReferrals}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Referrals</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalReferrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Successful Conversions</span>
                  <span className="text-sm font-medium text-gray-900">{stats.completedReferrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPercentage(stats.conversionRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Bonus</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalReferrals > 0 
                      ? formatCurrency(stats.totalBonusPaid / stats.totalReferrals)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Referrers Tab */}
      {activeTab === 'referrers' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Referrers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topReferrers && stats.topReferrers.length === 0 ? ( // Changed to stats.topReferrers
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No referrer data available
                    </td>
                  </tr>
                ) : (
                  stats.topReferrers && stats.topReferrers.map((referrer, index) => ( // Changed to stats.topReferrers
                    <tr key={referrer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {referrer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{referrer.name}</div>
                            <div className="text-sm text-gray-500">#{index + 1} Top Referrer</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referrer.referrals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referrer.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referrer.referrals > 0 
                          ? formatPercentage(referrer.completed / referrer.referrals)
                          : '0%'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(referrer.bonusEarned)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Monthly Stats Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.monthlyStats && stats.monthlyStats.length === 0 ? ( // Changed to stats.monthlyStats
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No monthly data available
                      </td>
                    </tr>
                  ) : (
                    stats.monthlyStats && stats.monthlyStats.map((monthData) => ( // Changed to stats.monthlyStats
                      <tr key={monthData.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {monthData.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {monthData.referrals}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {monthData.registrations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {monthData.completions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {monthData.referrals > 0 
                            ? formatPercentage(monthData.completions / monthData.referrals)
                            : '0%'
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Best Performing Month</h4>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.monthlyStats && stats.monthlyStats.length > 0 
                  ? stats.monthlyStats.reduce((best, current) => 
                      current.completions > best.completions ? current : best
                    )?.month
                  : 'N/A'
                }
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Average Monthly Referrals</h4>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.monthlyStats && stats.monthlyStats.length > 0 
                  ? Math.round(stats.monthlyStats.reduce((sum, month) => sum + month.referrals, 0) / stats.monthlyStats.length)
                  : 0
                }
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Average Monthly Completions</h4>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.monthlyStats && stats.monthlyStats.length > 0 
                  ? Math.round(stats.monthlyStats.reduce((sum, month) => sum + month.completions, 0) / stats.monthlyStats.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 