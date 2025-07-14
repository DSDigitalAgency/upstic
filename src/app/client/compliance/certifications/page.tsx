'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Certification {
  id: string;
  title: string;
  description: string;
  issuingBody: string;
  status: 'VALID' | 'EXPIRED' | 'PENDING_RENEWAL' | 'EXPIRING_SOON';
  issueDate: string;
  expiryDate: string;
  certificateNumber: string;
  category: 'HEALTHCARE' | 'SAFETY' | 'QUALITY' | 'SPECIALIST';
}

export default function ClientComplianceCertificationsPage() {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'VALID' | 'EXPIRED' | 'PENDING_RENEWAL' | 'EXPIRING_SOON'>('all');

  useEffect(() => {
    // Mock data for certifications
    const mockCertifications: Certification[] = [
      {
        id: '1',
        title: 'CQC Registration',
        description: 'Care Quality Commission registration for healthcare services',
        issuingBody: 'Care Quality Commission',
        status: 'VALID',
        issueDate: '2022-01-15',
        expiryDate: '2027-01-15',
        certificateNumber: 'CQC-2022-001',
        category: 'HEALTHCARE'
      },
      {
        id: '2',
        title: 'ISO 9001 Quality Management',
        description: 'Quality management system certification',
        issuingBody: 'British Standards Institution',
        status: 'EXPIRING_SOON',
        issueDate: '2021-06-20',
        expiryDate: '2024-06-20',
        certificateNumber: 'ISO-9001-2021-002',
        category: 'QUALITY'
      },
      {
        id: '3',
        title: 'Health and Safety Management',
        description: 'Occupational health and safety management system',
        issuingBody: 'Health and Safety Executive',
        status: 'VALID',
        issueDate: '2023-03-10',
        expiryDate: '2026-03-10',
        certificateNumber: 'HSE-2023-003',
        category: 'SAFETY'
      },
      {
        id: '4',
        title: 'Specialist Dementia Care',
        description: 'Specialist certification for dementia care services',
        issuingBody: 'Alzheimer\'s Society',
        status: 'PENDING_RENEWAL',
        issueDate: '2022-09-15',
        expiryDate: '2024-09-15',
        certificateNumber: 'ADC-2022-004',
        category: 'SPECIALIST'
      }
    ];

    setCertifications(mockCertifications);
    setLoading(false);
  }, [user]);

  const filteredCertifications = certifications.filter(cert => {
    if (filter === 'all') return true;
    return cert.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'PENDING_RENEWAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRING_SOON':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'HEALTHCARE':
        return 'bg-blue-100 text-blue-800';
      case 'SAFETY':
        return 'bg-red-100 text-red-800';
      case 'QUALITY':
        return 'bg-green-100 text-green-800';
      case 'SPECIALIST':
        return 'bg-purple-100 text-purple-800';
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
        <h1 className="text-2xl font-semibold text-gray-900">Certifications</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'VALID' | 'EXPIRED' | 'PENDING_RENEWAL' | 'EXPIRING_SOON')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white"
          >
            <option value="all">All Certifications</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING_RENEWAL">Pending Renewal</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {filteredCertifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No certifications found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issuing Body
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertifications.map((certification) => (
                  <tr key={certification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {certification.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {certification.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(certification.category)}`}>
                        {certification.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {certification.issuingBody}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(certification.status)}`}>
                        {certification.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(certification.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(certification.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {certification.certificateNumber}
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