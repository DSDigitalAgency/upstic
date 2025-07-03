"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";

export default function BankAccountsPage() {
  const [verifying, setVerifying] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerifyAccount = async () => {
    if (!workerId) return;
    
    setVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/payments/bank-account/verify/${workerId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      setSuccess(`Bank account for worker ${workerId} has been successfully submitted for verification.`);
      setWorkerId("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Failed to verify bank account:", err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bank Account Verification</h1>
        <p className="mt-2 text-gray-600">Manually trigger bank account verification for a worker.</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
        {success && <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">{success}</div>}

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            <div>
              <label htmlFor="workerId" className="block text-sm font-medium text-gray-700 mb-2">
                Worker ID
              </label>
              <Input
                type="text"
                id="workerId"
                placeholder="Enter Worker ID"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              />
            </div>
            
            <LoadingButton
              onClick={handleVerifyAccount}
              loading={verifying}
              disabled={!workerId || verifying}
              className="w-full"
            >
              Verify Bank Account
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
} 