'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ComplianceAudit {
  id: string;
  auditType: 'INTERNAL' | 'EXTERNAL' | 'REGULATORY' | 'CERTIFICATION';
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startDate: string;
  endDate: string;
  auditor: string;
  score: number | null;
  findings: string[];
  recommendations: string[];
}

export default function ClientComplianceAuditsPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'>('all');

  useEffect(() => {
    // Mock data for compliance audits
    const mockAudits: ComplianceAudit[] = [
      {
        id: '1',
        auditType: 'REGULATORY',
        title: 'CQC Annual Review',
        description: 'Annual Care Quality Commission compliance review',
        status: 'COMPLETED',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        auditor: 'Care Quality Commission',
        score: 95,
        findings: [
          'Excellent patient care standards',
          'Strong documentation practices',
          'Minor improvement needed in staff training records'
        ],
        recommendations: [
          'Update staff training documentation',
          'Implement additional safety protocols'
        ]
      },
      {
        id: '2',
        auditType: 'INTERNAL',
        title: 'Health and Safety Audit',
        description: 'Internal health and safety compliance review',
        status: 'IN_PROGRESS',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        auditor: 'Internal Audit Team',
        score: null,
        findings: [],
        recommendations: []
      },
      {
        id: '3',
        auditType: 'CERTIFICATION',
        title: 'ISO 9001 Recertification',
        description: 'ISO 9001 quality management system recertification',
        status: 'PENDING',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        auditor: 'British Standards Institution',
        score: null,
        findings: [],
        recommendations: []
      },
      {
        id: '4',
        auditType: 'EXTERNAL',
        title: 'Data Protection Audit',
        description: 'GDPR compliance and data protection review',
        status: 'FAILED',
        startDate: '2023-12-01',
        endDate: '2023-12-10',
        auditor: 'Data Protection Officer',
        score: 65,
        findings: [
          'Insufficient data protection training',
          'Missing data breach procedures',
          'Inadequate access controls'
        ],
        recommendations: [
          'Implement comprehensive data protection training',
          'Develop data breach response procedures',
          'Strengthen access control systems'
        ]
      }
    ];

    setAudits(mockAudits);
    setLoading(false);
  }, [user]);

  const filteredAudits = audits.filter(audit => {
    if (filter === 'all') return true;
    return audit.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REGULATORY':
        return 'bg-red-100 text-red-800';
      case 'INTERNAL':
        return 'bg-blue-100 text-blue-800';
      case 'EXTERNAL':
        return 'bg-purple-100 text-purple-800';
      case 'CERTIFICATION':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-2xl font-semibold text-gray-900">Compliance Audits</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white"
          >
            <option value="all">All Audits</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {filteredAudits.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No compliance audits found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {audit.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {audit.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(audit.auditType)}`}>
                        {audit.auditType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                        {audit.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.auditor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.score ? `${audit.score}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 