'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Worker } from '@/demo/func/api';

interface TaxDocument {
  id: string;
  workerId: string;
  name: string;
  year: number;
  issuedAt: string;
  url: string;
}

export default function TaxDocuments() {
  const { user } = useAuth();
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerId = async () => {
      if (!user?.id) return;
      const res = await (await import('@/demo/func/api')).apiClient.getWorkers(1, 100);
      if (res.success && res.data) {
        const worker = res.data.items.find((w: Worker) => w.userId === user.id);
        if (worker) setWorkerId(worker.id);
        else setWorkerId(null);
      } else {
        setWorkerId(null);
      }
    };
    fetchWorkerId();
  }, [user]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!workerId) return;
      setIsLoading(true);
      try {
        const response = await fetch('/api/demo-data/tax-documents.json');
        if (response.ok) {
          const allDocs: TaxDocument[] = await response.json();
          setDocuments(allDocs.filter(doc => doc.workerId === workerId));
        } else {
          setDocuments([]);
        }
      } catch {
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [workerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Documents</h2>
        <p className="text-gray-600">Access your tax forms and related documents</p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading tax documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No tax documents available yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{doc.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{doc.year}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatDate(doc.issuedAt)}</td>
                    <td className="px-4 py-2 text-sm">
                      <a href={doc.url} className="text-blue-600 hover:underline" download>
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 