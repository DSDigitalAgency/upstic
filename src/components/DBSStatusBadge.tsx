'use client';

import { DBSVerificationResult } from '@/demo/func/api';

interface DBSStatusBadgeProps {
  verification: DBSVerificationResult | null;
  showDetails?: boolean;
}

export default function DBSStatusBadge({ verification, showDetails = true }: DBSStatusBadgeProps) {
  if (!verification) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <span className="text-sm text-gray-600">Not Verified</span>
      </div>
    );
  }

  const outcome = verification.structured?.outcome;

  const getStatusInfo = () => {
    switch (outcome) {
      case 'clear_and_current':
        return {
          label: 'Clear & Current',
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'current':
        return {
          label: 'Current',
          color: 'blue',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'not_current':
        return {
          label: 'Not Current',
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          label: 'Unknown',
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          icon: null
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border text-xs font-medium`}>
        {statusInfo.icon && <span className={statusInfo.iconColor}>{statusInfo.icon}</span>}
        <span>{statusInfo.label}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} p-3`}>
      <div className="flex items-start space-x-2">
        {statusInfo.icon && (
          <div className={`flex-shrink-0 ${statusInfo.iconColor}`}>
            {statusInfo.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`text-sm font-medium ${statusInfo.textColor}`}>
              DBS Status: {statusInfo.label}
            </h4>
          </div>
          {verification.structured?.outcomeText && (
            <p className="text-xs text-gray-600 mt-1">
              {verification.structured.outcomeText}
            </p>
          )}
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            {verification.structured?.certificateNumber && (
              <p><strong>Certificate #:</strong> {verification.structured.certificateNumber}</p>
            )}
            {verification.structured?.certificatePrintDate && (
              <p><strong>Print Date:</strong> {verification.structured.certificatePrintDate}</p>
            )}
            {verification.verificationDate && (
              <p><strong>Verified:</strong> {new Date(verification.verificationDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
