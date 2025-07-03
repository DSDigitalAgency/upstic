'use client';

import React, { useState, useEffect } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { getTaxSummary, getRtiP1Data, submitRti, TaxSummary, RtiData } from '@/lib/payroll';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Submission {
  id: string;
  date: string;
  type: 'RTI' | 'P60' | 'CIS';
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
}

export default function TaxAndRtiPage() {
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRti, setLoadingRti] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [rtiData, setRtiData] = useState<RtiData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSummary(true);
        const summaryData = await getTaxSummary();
        if (summaryData.success && summaryData.data && typeof summaryData.data === 'object') {
          setTaxSummary(summaryData.data);
        } else {
          setTaxSummary(null);
          if (!summaryData.success) {
            throw new Error(summaryData.error || 'Failed to fetch tax summary');
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoadingSummary(false);
      }
      
      try {
        setLoadingRti(true);
        const rtiP1Data = await getRtiP1Data();
        if (rtiP1Data.success && rtiP1Data.data && typeof rtiP1Data.data === 'object' && 'submissionId' in rtiP1Data.data) {
          setRtiData(rtiP1Data.data as RtiData);
        } else {
          setRtiData(null);
          if (!rtiP1Data.success) {
            throw new Error(rtiP1Data.error || 'Failed to fetch RTI data');
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoadingRti(false);
      }

      // Mock recent submissions for now
      setSubmissions([
        { id: '1', date: '2024-02-20', type: 'RTI', status: 'Success', reference: 'AB123456' },
        { id: '2', date: '2024-01-20', type: 'RTI', status: 'Success', reference: 'CD789012' },
        { id: '3', date: '2024-01-05', type: 'P60', status: 'Success', reference: 'EF345678' },
      ]);
    };

    fetchData();
  }, []);

  const handleSubmitRti = async () => {
    if (!rtiData) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await submitRti(rtiData);
      if (result.success) {
        setSuccess('RTI submitted successfully to HMRC!');
        // Refresh data after submission
        const rtiP1Data = await getRtiP1Data();
        if (rtiP1Data.success && rtiP1Data.data && typeof rtiP1Data.data === 'object' && 'submissionId' in rtiP1Data.data) {
          setRtiData(rtiP1Data.data as RtiData);
        } else {
          setRtiData(null);
        }
      } else {
        throw new Error(result.error || 'Failed to submit RTI');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: Submission['status']) => {
    switch (status) {
      case 'Success': return 'success';
      case 'Pending': return 'secondary';
      case 'Failed': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tax & RTI</h1>
          <p className="mt-2 text-base text-slate-600">
            Manage tax submissions and Real Time Information reporting to HMRC
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Submissions</h2>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-600">Date</TableHead>
                      <TableHead className="text-slate-600">Type</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Reference</TableHead>
                      <TableHead className="text-right text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length > 0 ? (
                      submissions.map((submission) => (
                        <TableRow key={submission.id} className="hover:bg-slate-50">
                          <TableCell className="text-slate-900">
                            {new Date(submission.date).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell className="text-slate-900">{submission.type}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(submission.status)}>
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-slate-900">{submission.reference}</TableCell>
                          <TableCell className="text-right">
                            <button className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                              View Details
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          No recent submissions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Tax Summary</h2>
            {loadingSummary ? (
              <div className="space-y-4">
                <div className="h-5 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-5 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-5 bg-slate-100 rounded animate-pulse"></div>
              </div>
            ) : taxSummary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-600">Period</span>
                  <span className="font-medium text-slate-900">{taxSummary.period}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-600">Total Tax</span>
                  <span className="font-medium text-slate-900">£{(taxSummary.totalTax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-600">Total NI</span>
                  <span className="font-medium text-slate-900">£{(taxSummary.totalNI || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-600">Submissions</span>
                  <span className="font-medium text-slate-900">{taxSummary.submissions || 0}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                Failed to load tax summary
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">RTI Status</h2>
            {loadingRti ? (
              <div className="space-y-4">
                <div className="h-5 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-5 bg-slate-100 rounded animate-pulse"></div>
              </div>
            ) : rtiData && rtiData.status === 'ready' ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>RTI Submission Ready</AlertTitle>
                  <AlertDescription className="text-slate-600">
                    {rtiData.details || 'RTI data is ready for submission to HMRC. Please review before submitting.'}
                  </AlertDescription>
                </Alert>

                <LoadingButton
                  onClick={handleSubmitRti}
                  loading={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Submit RTI to HMRC
                </LoadingButton>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                RTI is up-to-date or data is unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 