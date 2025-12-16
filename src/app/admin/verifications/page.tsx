'use client';

import { useState } from 'react';

interface VerificationResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  details?: string;
}

interface VerificationSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  orange: { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-200', light: 'bg-teal-50' },
  pink: { bg: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
  red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
  cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
};

const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white placeholder-gray-400";
const selectClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white";

export default function VerificationsPage() {
  const [results, setResults] = useState<Record<string, VerificationResult | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Form states for each verification type
  const [dbsUpdateForm, setDbsUpdateForm] = useState({
    certificateNumber: '',
    firstName: '',
    lastName: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
  });

  const [rtwShareCodeForm, setRtwShareCodeForm] = useState({
    shareCode: '',
    dateOfBirth: '',
  });

  const [ecsForm, setEcsForm] = useState({
    shareCode: '',
    dateOfBirth: '',
  });

  const [dvlaForm, setDvlaForm] = useState({
    type: 'auth',
    licenseNumber: '',
    postcode: '',
    dateOfBirth: '',
    registrationNumber: '',
  });

  const [professionalRegisterForm, setProfessionalRegisterForm] = useState({
    source: 'hcpc',
    registrationNumber: '',
    profession: '',
  });

  const [cosForm, setCosForm] = useState({
    cosNumber: '',
    email: '',
  });

  const [hpanForm, setHpanForm] = useState({
    hpanNumber: '',
    email: '',
  });

  const [ofqualForm, setOfqualForm] = useState({
    qualificationNumber: '',
    qualificationName: '',
    awardingOrganisation: '',
  });

  const [trainingForm, setTrainingForm] = useState({
    certificateNumber: '',
    providerName: '',
    certificateType: '',
    email: '',
  });

  const [ukviForm, setUkviForm] = useState({
    casId: '',
    name: '',
    dateOfBirth: '',
  });

  const sections: VerificationSection[] = [
    {
      id: 'dbs',
      title: 'DBS Update Service',
      description: 'Verify existing DBS certificates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      id: 'rtw',
      title: 'Right to Work',
      description: 'UK Right to Work verification',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      color: 'green',
    },
    {
      id: 'id',
      title: 'ID Verification',
      description: 'Identity document verification (Onfido/GBG)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      color: 'purple',
    },
    {
      id: 'dvla',
      title: 'DVLA',
      description: 'Driver and vehicle licensing checks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'orange',
    },
    {
      id: 'professional',
      title: 'Professional Registers',
      description: 'NMC, GMC, HCPC and other professional bodies',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'indigo',
    },
    {
      id: 'ecs',
      title: 'Employer Checking Service',
      description: 'Home Office Employer Checking Service',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
        </svg>
      ),
      color: 'teal',
    },
    {
      id: 'cos',
      title: 'Certificate of Sponsorship',
      description: 'COS verification via email',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'pink',
    },
    {
      id: 'hpan',
      title: 'HPAN Checks',
      description: 'Health Professional Alert Notice',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'red',
    },
    {
      id: 'ofqual',
      title: 'Ofqual Qualifications',
      description: 'Qualification verification via Ofqual',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      color: 'cyan',
    },
    {
      id: 'training',
      title: 'Training Certificates',
      description: 'Mandatory training verification',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'amber',
    },
    {
      id: 'ukvi',
      title: 'UKVI Check',
      description: 'UK Visas and Immigration verification',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
    },
  ];

  const verify = async (endpoint: string, body: Record<string, unknown>, key: string) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setResults(prev => ({ ...prev, [key]: null }));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [key]: {
          success: false,
          error: 'Request failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderResult = (key: string) => {
    const result = results[key] as VerificationResult & { verified?: boolean };
    if (!result) return null;

    // For DBS/RTW checks, use 'verified' field if available, otherwise fall back to 'success'
    const isVerified = result.verified !== undefined ? result.verified : result.success;
    const data = result.data as Record<string, unknown> | undefined;

    // Determine the status color and message
    let statusColor = 'red';
    let statusText = 'Verification Failed';
    
    if (result.success && isVerified) {
      statusColor = 'green';
      statusText = 'Verified ✓';
    } else if (result.success && !isVerified) {
      statusColor = 'amber';
      statusText = 'Not Verified - Manual Review Required';
    }

    const resultColorClasses = {
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-500' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-500' },
    };

    const colors = resultColorClasses[statusColor as keyof typeof resultColorClasses];

    // Create a display-friendly version of data (without the long screenshot/pdf base64)
    const displayData = data ? { ...data } : { ...result };
    const screenshot = data?.screenshot || result.screenshot;
    const pdf = data?.pdf || result.pdf;
    if (displayData.screenshot) {
      delete displayData.screenshot;
    }
    if (displayData.pdf) {
      delete displayData.pdf;
    }

    return (
      <div className={`mt-4 p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
        <div className="flex items-start">
          {statusColor === 'green' ? (
            <svg className={`w-5 h-5 ${colors.icon} mt-0.5 mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : statusColor === 'amber' ? (
            <svg className={`w-5 h-5 ${colors.icon} mt-0.5 mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${colors.icon} mt-0.5 mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${colors.text}`}>
              {statusText}
            </p>
            {data?.message && (
              <p className="mt-1 text-sm text-gray-600">{String(data.message)}</p>
            )}
            
            {/* Show details if available */}
            {data?.details && typeof data.details === 'object' && Object.keys(data.details as object).length > 0 && (
              <div className="mt-3 p-3 bg-white/70 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Registration Details</p>
                <dl className="space-y-2 text-xs">
                  {data.details.fullName && (
                    <div className="flex items-start border-b border-gray-200 pb-2">
                      <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Name:</dt>
                      <dd className="text-gray-900 font-semibold flex-1">{String(data.details.fullName)}</dd>
                    </div>
                  )}
                  {data.registrationNumber && (
                    <div className="flex items-start border-b border-gray-200 pb-2">
                      <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Registration number:</dt>
                      <dd className="text-gray-900 font-semibold flex-1">{String(data.registrationNumber)}</dd>
                    </div>
                  )}
                  {data.details.location && (
                    <div className="flex items-start border-b border-gray-200 pb-2">
                      <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Location:</dt>
                      <dd className="text-gray-900 font-semibold flex-1">{String(data.details.location)}</dd>
                    </div>
                  )}
                  {data.details.registrationStatus && (
                    <div className="flex items-start border-b border-gray-200 pb-2">
                      <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Status:</dt>
                      <dd className={`font-semibold flex-1 ${
                        String(data.details.registrationStatus).toLowerCase().includes('registered') 
                          ? 'text-green-600' 
                          : 'text-gray-900'
                      }`}>
                        {String(data.details.registrationStatus)}
                      </dd>
                    </div>
                  )}
                  {data.details.period && (
                    <div className="flex items-start border-b border-gray-200 pb-2">
                      <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Period:</dt>
                      <dd className="text-gray-900 font-semibold flex-1">{String(data.details.period)}</dd>
                    </div>
                  )}
                  {data.details.profession && (
                    <div className="flex items-start border-b border-gray-200 pb-2">
                      <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Profession:</dt>
                      <dd className="text-gray-900 font-semibold flex-1">{String(data.details.profession)}</dd>
                    </div>
                  )}
                  {/* Show any other details that weren't explicitly handled */}
                  {Object.entries(data.details as Record<string, unknown>)
                    .filter(([k]) => !['fullName', 'location', 'registrationStatus', 'period', 'profession'].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="flex items-start border-b border-gray-200 pb-2">
                        <dt className="text-gray-600 font-medium w-32 flex-shrink-0 capitalize">
                          {k.replace(/([A-Z])/g, ' $1').trim()}:
                        </dt>
                        <dd className="text-gray-900 font-semibold flex-1">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
            
            {/* Screenshot and PDF download buttons */}
            {(screenshot || pdf) && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {screenshot && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${screenshot}`;
                      link.download = `hcpc-verification-${data?.registrationNumber || 'result'}-${new Date().toISOString().split('T')[0]}.png`;
                      link.click();
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Download Screenshot
                  </button>
                )}
                {pdf && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:application/pdf;base64,${pdf}`;
                      link.download = `hcpc-verification-${data?.registrationNumber || 'result'}-${new Date().toISOString().split('T')[0]}.pdf`;
                      link.click();
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Download PDF
                  </button>
                )}
                {screenshot && (
                  <div className="mt-2 w-full">
                    <img 
                      src={`data:image/png;base64,${screenshot}`} 
                      alt="Verification result screenshot" 
                      className="max-w-full h-auto rounded border border-gray-300 shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
            
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">View raw response</summary>
              <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-words text-gray-700 bg-white/50 p-2 rounded">
                {JSON.stringify(displayData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  };

  const renderVerifyButton = (onClick: () => void, isLoading: boolean, color: string) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
        isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : `${colorClasses[color].bg} hover:opacity-90 active:scale-[0.98]`
      }`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Verifying...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verify</span>
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verification Services</h2>
          <p className="text-gray-600 mt-1">Test and verify all compliance checks in one place</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-amber-700">Demo Mode</span>
        </div>
      </div>

      {/* Section Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              activeSection === section.id
                ? `${colorClasses[section.color].border} ${colorClasses[section.color].light} shadow-md`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[section.color].light} ${colorClasses[section.color].text}`}>
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{section.title}</h3>
                <p className="text-xs text-gray-500 truncate">{section.description}</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${activeSection === section.id ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* DBS Section */}
      {activeSection === 'dbs' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.blue.light} border-b ${colorClasses.blue.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.blue.text}`}>DBS Update Service</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbsUpdateForm.certificateNumber}
                    onChange={(e) => setDbsUpdateForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                    placeholder="12 digit number"
                    maxLength={12}
                    className={inputClassName}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dbsUpdateForm.firstName}
                      onChange={(e) => setDbsUpdateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="e.g., John"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dbsUpdateForm.lastName}
                      onChange={(e) => setDbsUpdateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="e.g., Smith"
                      className={inputClassName}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={dbsUpdateForm.dobDay}
                      onChange={(e) => setDbsUpdateForm(prev => ({ ...prev, dobDay: e.target.value }))}
                      placeholder="DD"
                      maxLength={2}
                      className={inputClassName}
                    />
                    <input
                      type="text"
                      value={dbsUpdateForm.dobMonth}
                      onChange={(e) => setDbsUpdateForm(prev => ({ ...prev, dobMonth: e.target.value }))}
                      placeholder="MM"
                      maxLength={2}
                      className={inputClassName}
                    />
                    <input
                      type="text"
                      value={dbsUpdateForm.dobYear}
                      onChange={(e) => setDbsUpdateForm(prev => ({ ...prev, dobYear: e.target.value }))}
                      placeholder="YYYY"
                      maxLength={4}
                      className={inputClassName}
                    />
                  </div>
                </div>
                {renderVerifyButton(
                  () => verify('/api/verify/dbs/update-service', {
                    certificateNumber: dbsUpdateForm.certificateNumber,
                    firstName: dbsUpdateForm.firstName,
                    lastName: dbsUpdateForm.lastName,
                    dob: {
                      day: dbsUpdateForm.dobDay,
                      month: dbsUpdateForm.dobMonth,
                      year: dbsUpdateForm.dobYear,
                    },
                  }, 'dbs-update'),
                  loading['dbs-update'] || false,
                  'blue'
                )}
                {renderResult('dbs-update')}
              </div>

              {/* Live Verification Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Live DBS Verification
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  This performs a real-time check against the official DBS Update Service website using browser automation.
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Connects to secure.crbonline.gov.uk</li>
                    <li>Submits certificate details</li>
                    <li>Scrapes verification result</li>
                    <li>Returns screenshot as proof</li>
                  </ul>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  <strong>Note:</strong> Certificate holder must be subscribed to the DBS Update Service for verification to work.
                </div>
                <a 
                  href="https://www.gov.uk/dbs-update-service" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 text-sm text-blue-700 hover:text-blue-900 font-medium"
                >
                  <span>About DBS Update Service</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right to Work Section */}
      {activeSection === 'rtw' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.green.light} border-b ${colorClasses.green.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.green.text}`}>Right to Work - Share Code Verification</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Share Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rtwShareCodeForm.shareCode}
                    onChange={(e) => setRtwShareCodeForm(prev => ({ ...prev, shareCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g., ABC123DEF"
                    maxLength={9}
                    className={inputClassName}
                  />
                  <p className="text-xs text-gray-500 mt-1">9-character alphanumeric code provided by the applicant</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={rtwShareCodeForm.dateOfBirth}
                    onChange={(e) => setRtwShareCodeForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={inputClassName}
                  />
                </div>
                {renderVerifyButton(
                  () => verify('/api/verify/rtw/share-code', {
                    shareCode: rtwShareCodeForm.shareCode,
                    dateOfBirth: rtwShareCodeForm.dateOfBirth,
                  }, 'rtw-share'),
                  loading['rtw-share'] || false,
                  'green'
                )}
                {renderResult('rtw-share')}
              </div>

              {/* Live Verification Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Live RTW Verification
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  This performs a real-time check against the official Home Office Right to Work service using browser automation.
                </p>
                <div className="space-y-2 text-sm text-green-800">
                  <p className="font-medium">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Connects to right-to-work.service.gov.uk</li>
                    <li>Enters share code and DOB</li>
                    <li>Retrieves work status and restrictions</li>
                    <li>Returns screenshot as proof</li>
                  </ul>
                </div>
                <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                  <strong>Note:</strong> The applicant must generate a share code from their UKVI account. Share codes are typically valid for 90 days.
                </div>
                <a 
                  href="https://www.gov.uk/view-right-to-work" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                >
                  <span>About Share Code Verification</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ID Verification Section */}
      {activeSection === 'id' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.purple.light} border-b ${colorClasses.purple.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.purple.text}`}>ID Verification</h3>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Onfido */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Onfido ID Verification</h4>
              <p className="text-sm text-gray-600">Third-party identity verification service</p>
              {renderVerifyButton(
                () => verify('/api/verify/id/onfido', {}, 'id-onfido'),
                loading['id-onfido'] || false,
                'purple'
              )}
              {renderResult('id-onfido')}
            </div>

            {/* GBG */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">GBG ID Verification</h4>
              <p className="text-sm text-gray-600">GB Group identity verification service</p>
              {renderVerifyButton(
                () => verify('/api/verify/id/gbg', {}, 'id-gbg'),
                loading['id-gbg'] || false,
                'purple'
              )}
              {renderResult('id-gbg')}
            </div>
          </div>
        </div>
      )}

      {/* DVLA Section */}
      {activeSection === 'dvla' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.orange.light} border-b ${colorClasses.orange.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.orange.text}`}>DVLA Verification</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Type</label>
              <select
                value={dvlaForm.type}
                onChange={(e) => setDvlaForm(prev => ({ ...prev, type: e.target.value }))}
                className={selectClassName}
              >
                <option value="auth">Driver License Authentication</option>
                <option value="driver-data">Driver Data Check</option>
                <option value="vehicle">Vehicle Check</option>
                <option value="driver-image">Driver Image Verification</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {(dvlaForm.type === 'auth' || dvlaForm.type === 'driver-data' || dvlaForm.type === 'driver-image') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dvlaForm.licenseNumber}
                    onChange={(e) => setDvlaForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    placeholder="e.g., SMITH901020JN9AB"
                    className={inputClassName}
                  />
                </div>
              )}
              {(dvlaForm.type === 'auth' || dvlaForm.type === 'driver-data') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dvlaForm.postcode}
                    onChange={(e) => setDvlaForm(prev => ({ ...prev, postcode: e.target.value }))}
                    placeholder="e.g., SW1A 1AA"
                    className={inputClassName}
                  />
                </div>
              )}
              {dvlaForm.type === 'auth' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dvlaForm.dateOfBirth}
                    onChange={(e) => setDvlaForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={inputClassName}
                  />
                </div>
              )}
              {dvlaForm.type === 'vehicle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dvlaForm.registrationNumber}
                    onChange={(e) => setDvlaForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="e.g., AB12 CDE"
                    className={inputClassName}
                  />
                </div>
              )}
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/dvla', {
                type: dvlaForm.type,
                licenseNumber: dvlaForm.licenseNumber,
                postcode: dvlaForm.postcode,
                dateOfBirth: dvlaForm.dateOfBirth,
                registrationNumber: dvlaForm.registrationNumber,
              }, 'dvla'),
              loading['dvla'] || false,
              'orange'
            )}
            {renderResult('dvla')}
          </div>
        </div>
      )}

      {/* Professional Registers Section */}
      {activeSection === 'professional' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.indigo.light} border-b ${colorClasses.indigo.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.indigo.text}`}>Professional Register Verification</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Register</label>
              <select
                value={professionalRegisterForm.source}
                onChange={(e) => setProfessionalRegisterForm(prev => ({ ...prev, source: e.target.value, profession: '' }))}
                className={selectClassName}
              >
                <option value="nmc">NMC - Nursing and Midwifery Council</option>
                <option value="gmc">GMC - General Medical Council</option>
                <option value="hcpc">HCPC - Health and Care Professions Council</option>
                <option value="gdc">GDC - General Dental Council</option>
                <option value="goc">GOC - General Optical Council</option>
                <option value="gphc">GPhC - General Pharmaceutical Council</option>
                <option value="gcc">GCC - General Chiropractic Council</option>
                <option value="osteopathy">GOsC - General Osteopathic Council</option>
                <option value="social-work-england">Social Work England</option>
                <option value="psni">PSNI - Pharmaceutical Society NI</option>
                <option value="pamvr">PAMVR</option>
                <option value="nhs-performers">NHS Performers List</option>
              </select>
            </div>

            {/* HCPC-specific fields */}
            {professionalRegisterForm.source === 'hcpc' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession <span className="text-red-500">*</span>
                </label>
                <select
                  value={professionalRegisterForm.profession}
                  onChange={(e) => setProfessionalRegisterForm(prev => ({ ...prev, profession: e.target.value }))}
                  className={selectClassName}
                  required={professionalRegisterForm.source === 'hcpc'}
                >
                  <option value="">{professionalRegisterForm.source === 'hcpc' ? 'Choose a profession (Required)' : 'Choose a profession (Optional)'}</option>
                  <option value="Arts Therapist">Arts Therapist</option>
                  <option value="Biomedical scientist">Biomedical scientist</option>
                  <option value="Chiropodist / podiatrist">Chiropodist / podiatrist</option>
                  <option value="Clinical scientist">Clinical scientist</option>
                  <option value="Dietitian">Dietitian</option>
                  <option value="Hearing aid dispenser">Hearing aid dispenser</option>
                  <option value="Occupational therapist">Occupational therapist</option>
                  <option value="Operating department practitioner">Operating department practitioner</option>
                  <option value="Orthoptist">Orthoptist</option>
                  <option value="Paramedic">Paramedic</option>
                  <option value="Physiotherapist">Physiotherapist</option>
                  <option value="Practitioner psychologist">Practitioner psychologist</option>
                  <option value="Prosthetist / orthotist">Prosthetist / orthotist</option>
                  <option value="Radiographer">Radiographer</option>
                  <option value="Speech and language therapist">Speech and language therapist</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={professionalRegisterForm.registrationNumber}
                onChange={(e) => setProfessionalRegisterForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                placeholder={
                  professionalRegisterForm.source === 'hcpc' ? "e.g., OT61642, DT035366" :
                  professionalRegisterForm.source === 'gmc' ? "e.g., 7596231, A8142667" :
                  "e.g., 12A3456B"
                }
                className={inputClassName}
              />
            </div>

            {/* Quick Test Buttons for HCPC */}
            {professionalRegisterForm.source === 'hcpc' && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-indigo-900">Quick Test Data</h4>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: '',
                      profession: '',
                    }))}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: 'OT61642',
                      profession: 'Occupational therapist',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    OT61642 (Occupational Therapist)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: 'OT74314',
                      profession: 'Occupational therapist',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    OT74314 (Occupational Therapist)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: 'DT035366',
                      profession: 'Dietitian',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    DT035366 (Dietitian)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: 'DT034289',
                      profession: 'Dietitian',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    DT034289 (Dietitian)
                  </button>
                </div>
              </div>
            )}

            {/* Quick Test Buttons for GMC */}
            {professionalRegisterForm.source === 'gmc' && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-indigo-900">Quick Test Data</h4>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: '',
                    }))}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: '7596231',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    7596231
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: '7488738',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    7488738
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: '6166983',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    6166983
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfessionalRegisterForm(prev => ({
                      ...prev,
                      registrationNumber: 'A8142667',
                    }))}
                    className="px-3 py-2 bg-white border border-indigo-300 rounded-md text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    A8142667
                  </button>
                </div>
              </div>
            )}

            {renderVerifyButton(
              () => {
                // Validate HCPC requires profession
                if (professionalRegisterForm.source === 'hcpc' && !professionalRegisterForm.profession) {
                  alert('Profession is required for HCPC verification. Please select a profession.');
                  return;
                }
                verify(`/api/verify/${professionalRegisterForm.source}`, {
                  registrationNumber: professionalRegisterForm.registrationNumber,
                  ...(professionalRegisterForm.source === 'hcpc' && professionalRegisterForm.profession && { profession: professionalRegisterForm.profession }),
                }, 'professional');
              },
              loading['professional'] || false,
              'indigo'
            )}
            {renderResult('professional')}
          </div>
        </div>
      )}

      {/* ECS Section */}
      {activeSection === 'ecs' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.teal.light} border-b ${colorClasses.teal.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.teal.text}`}>Employer Checking Service</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ecsForm.shareCode}
                  onChange={(e) => setEcsForm(prev => ({ ...prev, shareCode: e.target.value }))}
                  placeholder="e.g., ABC123DEF"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={ecsForm.dateOfBirth}
                  onChange={(e) => setEcsForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className={inputClassName}
                />
              </div>
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/ecs', {
                shareCode: ecsForm.shareCode,
                dateOfBirth: ecsForm.dateOfBirth,
              }, 'ecs'),
              loading['ecs'] || false,
              'teal'
            )}
            {renderResult('ecs')}
          </div>
        </div>
      )}

      {/* COS Section */}
      {activeSection === 'cos' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.pink.light} border-b ${colorClasses.pink.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.pink.text}`}>Certificate of Sponsorship</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COS Number</label>
                <input
                  type="text"
                  value={cosForm.cosNumber}
                  onChange={(e) => setCosForm(prev => ({ ...prev, cosNumber: e.target.value }))}
                  placeholder="e.g., S12345678"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (for verification)</label>
                <input
                  type="email"
                  value={cosForm.email}
                  onChange={(e) => setCosForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., hr@company.com"
                  className={inputClassName}
                />
              </div>
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/cos', {
                cosNumber: cosForm.cosNumber,
                email: cosForm.email,
                automatedEmail: true,
              }, 'cos'),
              loading['cos'] || false,
              'pink'
            )}
            {renderResult('cos')}
          </div>
        </div>
      )}

      {/* HPAN Section */}
      {activeSection === 'hpan' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.red.light} border-b ${colorClasses.red.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.red.text}`}>HPAN Checks</h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">Health Professional Alert Notice verification via automated email</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HPAN Number</label>
                <input
                  type="text"
                  value={hpanForm.hpanNumber}
                  onChange={(e) => setHpanForm(prev => ({ ...prev, hpanNumber: e.target.value }))}
                  placeholder="e.g., HPAN123456"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (for verification)</label>
                <input
                  type="email"
                  value={hpanForm.email}
                  onChange={(e) => setHpanForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., verification@nhs.uk"
                  className={inputClassName}
                />
              </div>
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/hpan', {
                hpanNumber: hpanForm.hpanNumber,
                email: hpanForm.email,
                automatedEmail: true,
              }, 'hpan'),
              loading['hpan'] || false,
              'red'
            )}
            {renderResult('hpan')}
          </div>
        </div>
      )}

      {/* Ofqual Section */}
      {activeSection === 'ofqual' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.cyan.light} border-b ${colorClasses.cyan.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.cyan.text}`}>Ofqual Qualifications</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Number</label>
                <input
                  type="text"
                  value={ofqualForm.qualificationNumber}
                  onChange={(e) => setOfqualForm(prev => ({ ...prev, qualificationNumber: e.target.value }))}
                  placeholder="e.g., 601/1234/5"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Name</label>
                <input
                  type="text"
                  value={ofqualForm.qualificationName}
                  onChange={(e) => setOfqualForm(prev => ({ ...prev, qualificationName: e.target.value }))}
                  placeholder="e.g., Level 3 Diploma"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Awarding Organisation</label>
                <input
                  type="text"
                  value={ofqualForm.awardingOrganisation}
                  onChange={(e) => setOfqualForm(prev => ({ ...prev, awardingOrganisation: e.target.value }))}
                  placeholder="e.g., City & Guilds"
                  className={inputClassName}
                />
              </div>
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/ofqual/qualification', {
                qualificationNumber: ofqualForm.qualificationNumber,
                qualificationName: ofqualForm.qualificationName,
                awardingOrganisation: ofqualForm.awardingOrganisation,
              }, 'ofqual'),
              loading['ofqual'] || false,
              'cyan'
            )}
            {renderResult('ofqual')}
          </div>
        </div>
      )}

      {/* Training Certificates Section */}
      {activeSection === 'training' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.amber.light} border-b ${colorClasses.amber.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.amber.text}`}>Training Certificates</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <input
                  type="text"
                  value={trainingForm.certificateNumber}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  placeholder="e.g., CERT-2024-001"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                <input
                  type="text"
                  value={trainingForm.providerName}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, providerName: e.target.value }))}
                  placeholder="e.g., Skills for Health"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
                <input
                  type="text"
                  value={trainingForm.certificateType}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, certificateType: e.target.value }))}
                  placeholder="e.g., Basic Life Support"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (for verification)</label>
                <input
                  type="email"
                  value={trainingForm.email}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., training@provider.com"
                  className={inputClassName}
                />
              </div>
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/training-certificates', {
                certificateNumber: trainingForm.certificateNumber,
                providerName: trainingForm.providerName,
                certificateType: trainingForm.certificateType,
                email: trainingForm.email,
              }, 'training'),
              loading['training'] || false,
              'amber'
            )}
            {renderResult('training')}
          </div>
        </div>
      )}

      {/* UKVI Section */}
      {activeSection === 'ukvi' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${colorClasses.emerald.light} border-b ${colorClasses.emerald.border}`}>
            <h3 className={`text-lg font-semibold ${colorClasses.emerald.text}`}>UKVI Check</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAS ID</label>
                <input
                  type="text"
                  value={ukviForm.casId}
                  onChange={(e) => setUkviForm(prev => ({ ...prev, casId: e.target.value }))}
                  placeholder="e.g., CAS-123456"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={ukviForm.name}
                  onChange={(e) => setUkviForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., John Smith"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={ukviForm.dateOfBirth}
                  onChange={(e) => setUkviForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className={inputClassName}
                />
              </div>
            </div>
            {renderVerifyButton(
              () => verify('/api/verify/rtw/ukvi', {
                casId: ukviForm.casId,
                name: ukviForm.name,
                dateOfBirth: ukviForm.dateOfBirth,
              }, 'ukvi'),
              loading['ukvi'] || false,
              'emerald'
            )}
            {renderResult('ukvi')}
          </div>
        </div>
      )}

      {/* No Section Selected */}
      {!activeSection && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Verification Service</h3>
          <p className="text-gray-500">Click on any card above to start testing verification services</p>
        </div>
      )}
    </div>
  );
}
