"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RTIData {
  status: string;
  submissionDate?: string;
  employeeCount?: number;
  totalPayments?: number;
  errors?: string[];
}

export default function PayrollCompliancePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rtiData, setRtiData] = useState<RTIData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateRTI = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/payments/compliance/rtip1`);
      if (!response.ok) {
        throw new Error("Failed to generate RTI data. Please try again.");
      }
      const data = await response.json();
      setRtiData(data);
      setSuccessMessage("RTI data generated successfully!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate RTI data");
      setRtiData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitRTI = async () => {
    if (!rtiData) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/payments/compliance/submit-rti`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rtiData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit RTI data to HMRC. Please try again.");
      }
      
      setSuccessMessage("RTI data submitted successfully to HMRC!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit RTI data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Compliance</h1>
          <p className="mt-2 text-base text-slate-600">
            Manage and monitor payroll compliance requirements and RTI submissions
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>
      
      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        {/* RTI Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">RTI Submission</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Generate and submit Real Time Information (RTI) to HMRC for payroll compliance
                </p>
              </div>
              <div className="flex gap-3">
                <LoadingButton
                  onClick={handleGenerateRTI}
                  loading={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Generate RTI Data
                </LoadingButton>
                
                {rtiData && (
                  <LoadingButton
                    onClick={handleSubmitRTI}
                    loading={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                  >
                    Submit to HMRC
                  </LoadingButton>
                )}
              </div>
            </div>

            {/* RTI Data Preview */}
            {rtiData && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">RTI Data Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Status</p>
                    <p className="mt-1 text-slate-900 font-medium">{rtiData.status || "Pending"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Submission Date</p>
                    <p className="mt-1 text-slate-900 font-medium">
                      {rtiData.submissionDate 
                        ? new Date(rtiData.submissionDate).toLocaleDateString('en-GB')
                        : "Not submitted"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Employee Count</p>
                    <p className="mt-1 text-slate-900 font-medium">{rtiData.employeeCount || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Total Payments</p>
                    <p className="mt-1 text-slate-900 font-medium">£{(rtiData.totalPayments || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                {rtiData.errors && rtiData.errors.length > 0 && (
                  <div className="mt-4">
                    <Alert variant="destructive">
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {rtiData.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Compliance Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-800">RTI Status</p>
                  <p className="mt-1 text-emerald-700">Up to date</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Last Submission</p>
                  <p className="mt-1 text-blue-700">Processing</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Next Due Date</p>
                  <p className="mt-1 text-slate-700">End of current tax month</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 