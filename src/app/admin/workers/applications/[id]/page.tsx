'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/demo/func/api';
import type { Worker } from '@/demo/func/api';
import DocumentViewer from '@/components/DocumentViewer';
import DBSStatusBadge from '@/components/DBSStatusBadge';

interface WorkerApplication extends Worker {
  applicationStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface DocumentToView {
  fileUrl: string | null | undefined;
  fileName: string;
  fileType: string;
}

export default function WorkerApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<WorkerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentToView | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!params?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.getWorker(params.id as string);
        
        if (response.success && response.data) {
          const workerData = response.data;
          
          // Fetch actual uploaded documents for this worker
          try {
            console.log('Fetching documents for worker:', workerData.id);
            const documentsResponse = await fetch(`/api/workers/documents?workerId=${workerData.id}`);
            const documentsData = await documentsResponse.json();
            
            console.log('Documents response:', documentsData);
            
            if (documentsData.success && documentsData.data) {
              console.log('Found documents:', documentsData.data);
              // Map uploaded documents to the worker's document structure
              const uploadedDocuments = documentsData.data.reduce((acc: Record<string, string>, doc: { title: string; category: string; fileUrl: string }) => {
                console.log('Processing document:', doc.title, doc.category);
                // Map document categories to the worker's document fields
                switch (doc.category) {
                  case 'COMPLIANCE':
                    if (doc.title.toLowerCase().includes('cv') || doc.title.toLowerCase().includes('resume')) {
                      acc.cv = doc.fileUrl;
                      console.log('Mapped CV document:', doc.fileUrl);
                    } else if (doc.title.toLowerCase().includes('right to work')) {
                      acc.rightToWork = doc.fileUrl;
                      console.log('Mapped Right to Work document:', doc.fileUrl);
                    } else if (doc.title.toLowerCase().includes('proof of address')) {
                      acc.proofOfAddress = doc.fileUrl;
                      console.log('Mapped Proof of Address document:', doc.fileUrl);
                    } else if (doc.title.toLowerCase().includes('photo')) {
                      acc.photo = doc.fileUrl;
                      console.log('Mapped Photo document:', doc.fileUrl);
                    }
                    break;
                  case 'CERTIFICATION':
                    if (doc.title.toLowerCase().includes('qualification')) {
                      acc.qualificationCertificates = doc.fileUrl;
                      console.log('Mapped Qualification document:', doc.fileUrl);
                    } else if (doc.title.toLowerCase().includes('dbs')) {
                      acc.dbsCertificate = doc.fileUrl;
                      console.log('Mapped DBS document:', doc.fileUrl);
                    }
                    break;
                  case 'IDENTIFICATION':
                    if (doc.title.toLowerCase().includes('sponsorship')) {
                      acc.certificateOfSponsorship = doc.fileUrl;
                      console.log('Mapped Sponsorship document:', doc.fileUrl);
                    }
                    break;
                  case 'OTHER':
                    if (doc.title.toLowerCase().includes('immunization')) {
                      acc.immunizationRecords = doc.fileUrl;
                      console.log('Mapped Immunization document:', doc.fileUrl);
                    } else if (doc.title.toLowerCase().includes('health')) {
                      acc.occupationalHealth = doc.fileUrl;
                      console.log('Mapped Health document:', doc.fileUrl);
                    } else if (doc.title.toLowerCase().includes('dbs update')) {
                      acc.dbsUpdateService = doc.fileUrl;
                      console.log('Mapped DBS Update document:', doc.fileUrl);
                    }
                    break;
                }
                return acc;
              }, {});
              
              console.log('Final uploaded documents mapping:', uploadedDocuments);
              
              // Merge uploaded documents with existing worker data
              workerData.documents = {
                ...workerData.documents,
                ...uploadedDocuments
              };
              
              console.log('Final worker documents:', workerData.documents);
            } else {
              console.log('No documents found or error in response');
            }
          } catch (docError) {
            console.warn('Failed to fetch uploaded documents:', docError);
            // Continue with existing document data if fetch fails
          }
          
          // Create application object
          const applicationData: WorkerApplication = {
            ...workerData,
            applicationStatus: workerData.status as 'pending' | 'approved' | 'rejected',
            submittedAt: workerData.createdAt,
            reviewedAt: workerData.updatedAt !== workerData.createdAt ? workerData.updatedAt : undefined,
            reviewedBy: workerData.status !== 'pending' ? 'admin' : undefined,
            rejectionReason: workerData.status === 'rejected' ? 'Application did not meet requirements' : undefined
          };
          
          setApplication(applicationData);
        } else {
          setError(response.error || 'Failed to load application details');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Application fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [params?.id]);

  const handleApplicationAction = async (action: 'approve' | 'reject') => {
    if (!application) return;
    
    try {
      setError(null);
      
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const updateData = {
        status: newStatus as 'pending' | 'approved' | 'rejected' | 'active' | 'inactive',
        updatedAt: new Date().toISOString(),
        ...(action === 'reject' && { rejectionReason })
      };
      
      const response = await apiClient.updateWorker(application.id, updateData);
      
      if (response.success) {
        // Update local state
        setApplication(prev => prev ? {
          ...prev,
          applicationStatus: newStatus as 'pending' | 'approved' | 'rejected',
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        } : null);
        setRejectionReason('');
        alert(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      } else {
        setError(`Failed to ${action} application: ${response.error}`);
      }
    } catch (err) {
      setError(`Failed to ${action} application`);
      console.error(`Application ${action} error:`, err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDocument = (fileUrl: string, fileName: string, fileType: string = 'application/pdf') => {
    console.log('handleViewDocument called with:', fileUrl, fileName, fileType);
    setSelectedDocument({
      fileUrl,
      fileName,
      fileType
    });
  };

  const getDocumentFileType = (fileUrl: string) => {
    if (!fileUrl || typeof fileUrl !== 'string') {
      return 'application/octet-stream';
    }
    
    // Extract filename from URL or use the full string
    const fileName = fileUrl.includes('/') ? fileUrl.split('/').pop() || fileUrl : fileUrl;
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  };

  const handleDocumentView = (documentUrl: string | null | undefined, documentName: string) => {
    console.log('handleDocumentView called with:', documentUrl, documentName);
    if (application?.documents && documentUrl && typeof documentUrl === 'string') {
      console.log('Calling handleViewDocument with:', documentUrl, documentName);
      handleViewDocument(documentUrl, documentName, getDocumentFileType(documentUrl));
    } else {
      console.log('handleDocumentView conditions not met:', {
        hasApplication: !!application,
        hasDocuments: !!application?.documents,
        documentUrl,
        documentUrlType: typeof documentUrl
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Application Not Found</h3>
              <p className="text-sm text-yellow-700 mt-1">The requested application could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Application Details - {application.firstName} {application.lastName}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage this worker application
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.applicationStatus)}`}>
            {application.applicationStatus.toUpperCase()}
          </span>
          
          {application.applicationStatus === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleApplicationAction('approve')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              
              <button
                onClick={() => handleApplicationAction('reject')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Input */}
      {application.applicationStatus === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason (Optional)</h3>
          <input
            type="text"
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Application Details */}
      <div className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-sm text-gray-900">{application.firstName} {application.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{application.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">{application.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-sm text-gray-900">{application.dateOfBirth || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{application.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">National Insurance</p>
              <p className="text-sm text-gray-900">{application.nationalInsurance || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              <p className="text-sm text-gray-900">Experience details available in profile</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Submitted</p>
              <p className="text-sm text-gray-900">{formatDate(application.submittedAt)}</p>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">DBS Verification Status</p>
              <div className="mt-2">
                <DBSStatusBadge verification={application.dbsVerification} showDetails={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        {application.education && application.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
            <div className="space-y-4">
              {application.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Degree</p>
                      <p className="text-sm text-gray-900">{edu.degree}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Institution</p>
                      <p className="text-sm text-gray-900">{edu.institution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Field of Study</p>
                      <p className="text-sm text-gray-900">{edu.fieldOfStudy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Graduation Year</p>
                      <p className="text-sm text-gray-900">{edu.graduationYear}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {application.workHistory && application.workHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work History</h3>
            <div className="space-y-4">
              {application.workHistory.map((work, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employer</p>
                      <p className="text-sm text-gray-900">{work.employer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Position</p>
                      <p className="text-sm text-gray-900">{work.position}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{work.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-sm text-gray-900">{work.startDate} - {work.isCurrent ? 'Present' : work.endDate}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm text-gray-900">{work.description}</p>
                    </div>
                    
                    {/* DBS Verification for this work entry */}
                    {work.dbsVerificationResult && (
                      <div className="md:col-span-2 mt-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">DBS Check Status</p>
                        <DBSStatusBadge verification={work.dbsVerificationResult} showDetails={true} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {application.skills && application.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {application.certifications && application.certifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
            <div className="space-y-4">
              {application.certifications.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{cert.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Issuing Body</p>
                      <p className="text-sm text-gray-900">{cert.issuingBody}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Issue Date</p>
                      <p className="text-sm text-gray-900">{cert.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                      <p className="text-sm text-gray-900">{cert.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Certificate Number</p>
                      <p className="text-sm text-gray-900">{cert.certificateNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {application.emergencyContact && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900">{application.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{application.emergencyContact.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Relationship</p>
                <p className="text-sm text-gray-900">{application.emergencyContact.relationship}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{application.emergencyContact.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Details */}
        {application.bankDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                <p className="text-sm text-gray-900">{application.bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="text-sm text-gray-900">{application.bankDetails.accountType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Number</p>
                <p className="text-sm text-gray-900">****{application.bankDetails.accountNumber.slice(-4)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Routing Number</p>
                <p className="text-sm text-gray-900">{application.bankDetails.routingNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Work Preferences */}
        {application.preferences && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Preferred Locations</p>
                <p className="text-sm text-gray-900">{application.preferences.preferredLocations?.join(', ') || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                <p className="text-sm text-gray-900">{application.preferences.hourlyRate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Max Travel Distance</p>
                <p className="text-sm text-gray-900">{application.preferences.maxTravelDistance || 'Not specified'} miles</p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Documents</h3>
          <div className="space-y-6">
            {/* Required Documents */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">Required Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${application.documents?.cv ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-900">CV</span>
                    {application.documents?.cv && (
                      <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                    )}
                  </div>
                  {application.documents?.cv && (
                    <button
                      onClick={() => handleDocumentView(application.documents?.cv, 'CV')}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${application.documents?.rightToWork ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-900">Right to Work</span>
                    {application.documents?.rightToWork && (
                      <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                    )}
                  </div>
                  {application.documents?.rightToWork && (
                    <button
                      onClick={() => handleDocumentView(application.documents?.rightToWork, 'Right to Work')}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${application.documents?.proofOfAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-900">Proof of Address</span>
                    {application.documents?.proofOfAddress && (
                      <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                    )}
                  </div>
                                     {application.documents?.proofOfAddress && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.proofOfAddress, 'Proof of Address')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${application.documents?.photo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-900">Photo</span>
                    {application.documents?.photo && (
                      <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                    )}
                  </div>
                                     {application.documents?.photo && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.photo, 'Photo')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Documents */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">Additional Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${application.documents?.certificateOfSponsorship ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-900">Certificate of Sponsorship</span>
                    {application.documents?.certificateOfSponsorship && (
                      <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                    )}
                  </div>
                                     {application.documents?.certificateOfSponsorship && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.certificateOfSponsorship, 'Certificate of Sponsorship')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View
                     </button>
                   )}
                 </div>
                 <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full ${application.documents?.qualificationCertificates ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                     <span className="text-sm text-gray-900">Qualification Certificates</span>
                     {application.documents?.qualificationCertificates && (
                       <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                     )}
                   </div>
                   {application.documents?.qualificationCertificates && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.qualificationCertificates, 'Qualification Certificates')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View
                     </button>
                   )}
                 </div>
                 <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full ${application.documents?.dbsCertificate ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                     <span className="text-sm text-gray-900">DBS Certificate</span>
                     {application.documents?.dbsCertificate && (
                       <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                     )}
                   </div>
                   {application.documents?.dbsCertificate && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.dbsCertificate, 'DBS Certificate')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View
                     </button>
                   )}
                 </div>
                 <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full ${application.documents?.dbsUpdateService ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                     <span className="text-sm text-gray-900">DBS Update Service</span>
                     {application.documents?.dbsUpdateService && (
                       <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                     )}
                   </div>
                   {application.documents?.dbsUpdateService && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.dbsUpdateService, 'DBS Update Service')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View
                     </button>
                   )}
                 </div>
                 <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full ${application.documents?.immunizationRecords ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                     <span className="text-sm text-gray-900">Immunization Records</span>
                     {application.documents?.immunizationRecords && (
                       <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                     )}
                   </div>
                   {application.documents?.immunizationRecords && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.immunizationRecords, 'Immunization Records')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View
                     </button>
                   )}
                 </div>
                 <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full ${application.documents?.occupationalHealth ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                     <span className="text-sm text-gray-900">Occupational Health</span>
                     {application.documents?.occupationalHealth && (
                       <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                     )}
                   </div>
                   {application.documents?.occupationalHealth && (
                     <button
                       onClick={() => handleDocumentView(application.documents?.occupationalHealth, 'Occupational Health')}
                       className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                     >
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View
                     </button>
                   )}
                </div>
              </div>
            </div>

            {/* Certifications and Licenses */}
            {(application.certifications && application.certifications.length > 0) || (application.licenses && application.licenses.length > 0) ? (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Certifications & Licenses</h4>
                <div className="space-y-3">
                  {/* Certifications */}
                  {application.certifications && application.certifications.map((cert, index) => (
                    <div key={`cert-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${cert.certificateFile ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <span className="text-sm text-gray-900 font-medium">{cert.name}</span>
                          <div className="text-xs text-gray-500">
                            {cert.issuingBody} • {cert.issueDate} - {cert.expiryDate}
                          </div>
                        </div>
                        {cert.certificateFile && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                      {cert.certificateFile && (
                        <button
                          onClick={() => handleDocumentView(cert.certificateFile, `${cert.name} Certificate`)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Licenses */}
                  {application.licenses && application.licenses.map((license, index) => (
                    <div key={`license-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${license.licenseFile ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <span className="text-sm text-gray-900 font-medium">{license.name}</span>
                          <div className="text-xs text-gray-500">
                            {license.issuingBody} • {license.issueDate} - {license.expiryDate}
                          </div>
                        </div>
                        {license.licenseFile && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                      {license.licenseFile && (
                        <button
                          onClick={() => handleDocumentView(license.licenseFile, `${license.name} License`)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Document Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Document Completion</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(() => {
                    const requiredDocs = ['cv', 'rightToWork', 'proofOfAddress', 'photo'];
                    const uploadedRequired = requiredDocs.filter(doc => application.documents?.[doc as keyof typeof application.documents]);
                    
                    // Count certifications and licenses
                    const certCount = application.certifications?.filter(cert => cert.certificateFile).length || 0;
                    const licenseCount = application.licenses?.filter(license => license.licenseFile).length || 0;
                    const totalDocs = uploadedRequired.length + certCount + licenseCount;
                    const totalPossible = requiredDocs.length + (application.certifications?.length || 0) + (application.licenses?.length || 0);
                    
                    return `${totalDocs}/${totalPossible} Total Documents`;
                  })()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(() => {
                      const requiredDocs = ['cv', 'rightToWork', 'proofOfAddress', 'photo'];
                      const uploadedRequired = requiredDocs.filter(doc => application.documents?.[doc as keyof typeof application.documents]);
                      
                      // Count certifications and licenses
                      const certCount = application.certifications?.filter(cert => cert.certificateFile).length || 0;
                      const licenseCount = application.licenses?.filter(license => license.licenseFile).length || 0;
                      const totalDocs = uploadedRequired.length + certCount + licenseCount;
                      const totalPossible = requiredDocs.length + (application.certifications?.length || 0) + (application.licenses?.length || 0);
                      
                      return totalPossible > 0 ? (totalDocs / totalPossible) * 100 : 0;
                    })()}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Licenses Files */}
        {(application.certifications?.some(cert => cert.certificateFile) || application.licenses?.some(license => license.licenseFile)) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certification & License Files</h3>
            <div className="space-y-3">
              {/* Certification Files */}
              {application.certifications?.map((cert, index) => (
                cert.certificateFile && (
                  <div key={`cert-${index}`} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-900">{cert.name} - Certificate File</span>
                    <span className="text-xs text-blue-600 font-medium">✓ Uploaded</span>
                  </div>
                )
              ))}
              
              {/* License Files */}
              {application.licenses?.map((license, index) => (
                license.licenseFile && (
                  <div key={`license-${index}`} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-900">{license.name} - License File</span>
                    <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Declarations */}
        {application.declarations && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Declarations & Consent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${application.declarations.gdprConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900">GDPR Consent</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${application.declarations.workPolicies ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900">Work Policies</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${application.declarations.dataProcessing ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900">Data Processing</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${application.declarations.backgroundCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900">Background Check</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${application.declarations.healthDeclaration ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900">Health Declaration</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${application.declarations.termsAccepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900">Terms Accepted</span>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Display */}
        {application.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h3>
            <p className="text-sm text-red-700">{application.rejectionReason}</p>
          </div>
        )}

        {/* Document Viewer Modal */}
        {selectedDocument && (
          <DocumentViewer
            fileUrl={selectedDocument.fileUrl}
            fileName={selectedDocument.fileName}
            fileType={selectedDocument.fileType}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </div>
  );
} 