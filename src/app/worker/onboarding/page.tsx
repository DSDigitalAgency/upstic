'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useResume } from '@/contexts/ResumeContext';
import { apiClient } from '@/demo/func/api';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OnboardingData {
  // Personal Information
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  nationalInsurance: string;
  
  // Education & Work History
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: string;
    fieldOfStudy: string;
  }>;
  
  workHistory: Array<{
    employer: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    dbsNumber?: string;
    dbsPosition?: string;
    dbsExpiryDate?: string;
    dbsCheckDate?: string;
    dbsVerificationResult?: any;
  }>;
  
  // Skills & Certifications
  skills: string;
  certifications: Array<{
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    certificateNumber: string;
    certificateFile: File | string | null;
  }>;
  licenses: Array<{
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    licenseNumber: string;
    licenseFile: File | string | null;
  }>;
  
  // Reference Details
  references: Array<{
    name: string;
    relationship: string;
    company: string;
    position: string;
    email: string;
    phone: string;
    isProfessional: boolean;
    yearsKnown: string;
  }>;
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  
  // Bank Details
  bankDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: string;
  };
  
  // Compliance Documents
  documents: {
    cv: File | string | null;
    rightToWork: File | string | null;
    certificateOfSponsorship: File | string | null;
    proofOfAddress: File | string | null;
    qualificationCertificates: File | string | null;
    dbsCertificate: File | string | null;
    dbsUpdateService: File | string | null;
    immunizationRecords: File | string | null;
    occupationalHealth: File | string | null;
    photo: File | string | null;
  };
  
  // Declarations & Consent
  declarations: {
    gdprConsent: boolean;
    workPolicies: boolean;
    dataProcessing: boolean;
    backgroundCheck: boolean;
    healthDeclaration: boolean;
    termsAccepted: boolean;
  };
  
  // Preferences
  preferences: {
    preferredShifts: string[];
    preferredLocations: string[];
    hourlyRate: string;
    maxTravelDistance: number;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export default function WorkerOnboarding() {
  const { user } = useAuth();
  const { resumeData, clearResumeData } = useResume();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalDocuments, setShowAdditionalDocuments] = useState(false);
  
  // DBS verification state
  const [dbsVerificationResults, setDbsVerificationResults] = useState<Record<number, any>>({});
  const [verifyingDBS, setVerifyingDBS] = useState<Record<number, boolean>>({});
  
  // Auto-fill form with resume data when available
  useEffect(() => {
    if (resumeData) {
      setFormData(prev => ({
        ...prev,
        // Personal Information
        firstName: resumeData.firstName || prev.firstName,
        lastName: resumeData.lastName || prev.lastName,
        phone: resumeData.phone || prev.phone,
        email: resumeData.email || prev.email,
        address: resumeData.address || prev.address,
        
        // Skills
        skills: resumeData.skills.join(', ') || prev.skills,
        
        // Work History
        workHistory: resumeData.experience.length > 0 ? resumeData.experience.map(exp => ({
          employer: exp.company,
          position: exp.title,
          location: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          description: exp.description,
          dbsNumber: '',
          dbsPosition: '',
          dbsExpiryDate: '',
          dbsCheckDate: ''
        })) : prev.workHistory,
        
        // Education
        education: resumeData.education.length > 0 ? resumeData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          graduationYear: edu.year,
          fieldOfStudy: ''
        })) : prev.education,
        
        // Certifications
        certifications: resumeData.certifications.length > 0 ? resumeData.certifications.map(cert => ({
          name: cert,
          issuingBody: '',
          issueDate: '',
          expiryDate: '',
          certificateNumber: '',
          certificateFile: null
        })) : prev.certifications,
      }));
      
      // Clear resume data after auto-filling
      clearResumeData();
    }
  }, [resumeData, clearResumeData]);
  
  const [formData, setFormData] = useState<OnboardingData>({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    nationalInsurance: '',
    
    // Education & Work History
    education: [{ degree: '', institution: '', graduationYear: '', fieldOfStudy: '' }],
    workHistory: [{
      employer: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      dbsNumber: '',
      dbsPosition: '',
      dbsExpiryDate: '',
      dbsCheckDate: ''
    }],
    
    // Skills & Certifications
    skills: '',
    certifications: [{
      name: '',
      issuingBody: '',
      issueDate: '',
      expiryDate: '',
      certificateNumber: '',
      certificateFile: null
    }],
    licenses: [{
      name: '',
      issuingBody: '',
      issueDate: '',
      expiryDate: '',
      licenseNumber: '',
      licenseFile: null
    }],
    
    // Reference Details
    references: [{
      name: '',
      relationship: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      isProfessional: true,
      yearsKnown: ''
    }],
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    
    // Bank Details
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: ''
    },
    
    // Compliance Documents
    documents: {
      cv: null,
      rightToWork: null,
      certificateOfSponsorship: null,
      proofOfAddress: null,
      qualificationCertificates: null,
      dbsCertificate: null,
      dbsUpdateService: null,
      immunizationRecords: null,
      occupationalHealth: null,
      photo: null
    },
    
    // Declarations & Consent
    declarations: {
      gdprConsent: false,
      workPolicies: false,
      dataProcessing: false,
      backgroundCheck: false,
      healthDeclaration: false,
      termsAccepted: false
    },
    
    // Preferences
    preferences: {
      preferredShifts: [],
      preferredLocations: [],
      hourlyRate: '',
      maxTravelDistance: 50,
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  });

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Education management functions
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', graduationYear: '', fieldOfStudy: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Work History management functions
  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, {
        employer: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        dbsNumber: '',
        dbsPosition: '',
        dbsExpiryDate: '',
        dbsCheckDate: ''
      }]
    }));
  };

  const removeWorkHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index)
    }));
  };

  const updateWorkHistory = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));
  };

  // Certifications management functions
  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuingBody: '',
        issueDate: '',
        expiryDate: '',
        certificateNumber: '',
        certificateFile: null
      }]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Licenses management functions
  const addLicense = () => {
    setFormData(prev => ({
      ...prev,
      licenses: [...prev.licenses, {
        name: '',
        issuingBody: '',
        issueDate: '',
        expiryDate: '',
        licenseNumber: '',
        licenseFile: null
      }]
    }));
  };

  const removeLicense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index)
    }));
  };

  const updateLicense = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.map((license, i) => 
        i === index ? { ...license, [field]: value } : license
      )
    }));
  };

  // References management functions
  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, {
        name: '',
        relationship: '',
        company: '',
        position: '',
        email: '',
        phone: '',
        isProfessional: true,
        yearsKnown: ''
      }]
    }));
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const updateReference = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  // Document upload handler
  const handleDocumentUpload = (documentType: keyof OnboardingData['documents'], file: File | null) => {
    console.log(`Document upload: ${documentType}`, file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  // Certification file upload handler
  const handleCertificationFileUpload = (index: number, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, certificateFile: file } : cert
      )
    }));
  };

  // License file upload handler
  const handleLicenseFileUpload = (index: number, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      licenses: prev.licenses.map((license, i) => 
        i === index ? { ...license, licenseFile: file } : license
      )
    }));
  };

  // Declaration update handler
  const updateDeclaration = (field: keyof OnboardingData['declarations'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      declarations: {
        ...prev.declarations,
        [field]: value
      }
    }));
  };

  // Preferences update handler
  const updatePreference = (field: keyof OnboardingData['preferences'], value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const updateNotificationPreference = (type: keyof OnboardingData['preferences']['notifications'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [type]: value
        }
      }
    }));
  };

  // DBS verification handler
  const handleDBSVerification = async (index: number) => {
    const work = formData.workHistory[index];
    
    if (!work.dbsNumber) {
      alert('Please enter a DBS certificate number first');
      return;
    }

    if (!formData.dateOfBirth) {
      alert('Please enter your date of birth in Step 1 first');
      return;
    }

    setVerifyingDBS(prev => ({ ...prev, [index]: true }));

    try {
      // Parse date of birth
      const dob = formData.dateOfBirth;
      if (!dob || typeof dob !== 'string') {
        alert('Please enter a valid date of birth in Step 1 first');
        setVerifyingDBS(prev => ({ ...prev, [index]: false }));
        return;
      }

      const [year, month, day] = dob.split('-');
      
      if (!year || !month || !day) {
        alert('Date of birth format is invalid. Please use YYYY-MM-DD format.');
        setVerifyingDBS(prev => ({ ...prev, [index]: false }));
        return;
      }

      const response = await fetch('/api/dbs-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateNumber: work.dbsNumber,
          applicantSurname: formData.lastName.toUpperCase(),
          dob: {
            day: day || '',
            month: month || '',
            year: year || ''
          }
        })
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse DBS verification response:', jsonError);
        alert('Failed to verify DBS certificate. Please try again.');
        return;
      }

      if (!response.ok) {
        let errorMessage = result.error || `Server error: ${response.status}`;
        let details = result.details ? `\n\nDetails: ${result.details}` : '';
        
        // Provide helpful message for service unavailable (503)
        if (response.status === 503) {
          errorMessage = 'DBS Verification Service Unavailable';
          details = '\n\nThe DBS verification service is currently not available. Please:\n' +
                   '1. Ensure the DBS service is running, or\n' +
                   '2. Contact support if this issue persists.';
        }
        
        alert(`${errorMessage}${details}`);
        return;
      }

      if (result.success && result.data) {
        // Store the verification result (even if verification failed)
        setDbsVerificationResults(prev => ({ 
          ...prev, 
          [index]: result.data 
        }));
        
        // If verification failed, show the error message
        if (result.data.ok === false) {
          const errorMsg = result.data.error || 'DBS verification failed';
          alert(`DBS Verification Failed\n\n${errorMsg}\n\nPlease check the certificate number, surname, and date of birth.`);
        } else {
          // Verification succeeded - auto-fill DBS information
          if (result.data.structured) {
            const verificationData = result.data.structured;
            updateWorkHistory(index, 'dbsPosition', verificationData.personName || work.dbsPosition);
            
            // Update expiry date if available from certificate print date
            if (verificationData.certificatePrintDate) {
              const printDate = verificationData.certificatePrintDate.split('/').reverse().join('-');
              updateWorkHistory(index, 'dbsCheckDate', printDate);
            }
          }
        }
      } else {
        const errorMessage = result.error || 'Failed to verify DBS certificate';
        const details = result.details ? `\n\nDetails: ${result.details}` : '';
        alert(`${errorMessage}${details}`);
      }
    } catch (error) {
      console.error('DBS verification error:', error);
      alert('Failed to verify DBS certificate. Please try again.');
    } finally {
      setVerifyingDBS(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      // Create worker profile with all the new data
      // Include DBS verification results in work history
      const workHistoryWithVerification = formData.workHistory.map((work, index) => ({
        ...work,
        dbsVerificationResult: dbsVerificationResults[index] || null
      }));

      // Get the most recent DBS verification from work history (if any)
      const latestDBSVerification = Object.values(dbsVerificationResults).find(result => result);

      const workerData = {
        id: `worker_${Date.now()}`,
        userId: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        nationalInsurance: formData.nationalInsurance,
        education: formData.education,
        workHistory: workHistoryWithVerification,
        dbsVerification: latestDBSVerification || null,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        certifications: formData.certifications,
        licenses: formData.licenses,
        references: formData.references,
        emergencyContact: formData.emergencyContact,
        bankDetails: formData.bankDetails,
        documents: {
          cv: null,
          rightToWork: null,
          certificateOfSponsorship: null,
          proofOfAddress: null,
          qualificationCertificates: null,
          dbsCertificate: null,
          dbsUpdateService: null,
          immunizationRecords: null,
          occupationalHealth: null,
          photo: null,
        },
        declarations: formData.declarations,
        preferences: formData.preferences,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Upload all documents to the worker's document directory and collect URLs
      const uploadDocument = async (file: File | null, title: string, category: string): Promise<string | null> => {
        if (!file) {
          console.log(`No file provided for ${title}`);
          return null;
        }
        
        try {
          console.log(`Uploading ${title} (${file.name}, ${file.size} bytes, ${file.type})`);
          const formData = new FormData();
          formData.append('title', title);
          formData.append('category', category);
          formData.append('workerId', workerData.id);
          formData.append('file', file);

          const response = await fetch('/api/workers/documents', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();
          console.log(`Upload result for ${title}:`, result);
          
          if (!response.ok) {
            console.error(`Failed to upload ${title}:`, result);
            return null;
          }
          
          // Return the uploaded file URL
          return result.data?.fileUrl || null;
        } catch (error) {
          console.error(`Error uploading ${title}:`, error);
          return null;
        }
      };

      // Upload resume if user has one
      let resumeUrl = null;
      if (user.resumeUrl) {
        try {
          const resumeFormData = new FormData();
          resumeFormData.append('title', 'Resume/CV');
          resumeFormData.append('category', 'COMPLIANCE');
          resumeFormData.append('workerId', workerData.id);
          
          // Create a file from the resume URL
          const resumeResponse = await fetch(user.resumeUrl);
          const resumeBlob = await resumeResponse.blob();
          
          // Extract original filename from the URL
          const urlParts = user.resumeUrl.split('/');
          const originalFileName = urlParts[urlParts.length - 1];
          
          // Determine file type from the original file extension
          const fileExtension = originalFileName.split('.').pop()?.toLowerCase();
          let fileType = 'application/octet-stream';
          if (fileExtension === 'pdf') {
            fileType = 'application/pdf';
          } else if (['jpg', 'jpeg'].includes(fileExtension || '')) {
            fileType = 'image/jpeg';
          } else if (fileExtension === 'png') {
            fileType = 'image/png';
          } else if (['doc', 'docx'].includes(fileExtension || '')) {
            fileType = 'application/msword';
          }
          
          const resumeFile = new File([resumeBlob], originalFileName, { type: fileType });
          resumeFormData.append('file', resumeFile);

          // Upload the resume to the worker's document directory
          const resumeUploadResponse = await fetch('/api/workers/documents', {
            method: 'POST',
            body: resumeFormData,
          });
          
          const resumeResult = await resumeUploadResponse.json();
          if (resumeUploadResponse.ok && resumeResult.data?.fileUrl) {
            resumeUrl = resumeResult.data.fileUrl;
            console.log('Resume uploaded successfully:', resumeUrl);
          }
        } catch (error) {
          console.error('Error copying resume to worker documents:', error);
        }
      }

      // Log available documents for debugging
      console.log('Available documents for upload:', {
        cv: formData.documents.cv ? (typeof formData.documents.cv === 'string' ? formData.documents.cv : `${formData.documents.cv.name} (${formData.documents.cv.size} bytes)`) : 'No file',
        rightToWork: formData.documents.rightToWork ? (typeof formData.documents.rightToWork === 'string' ? formData.documents.rightToWork : `${formData.documents.rightToWork.name} (${formData.documents.rightToWork.size} bytes)`) : 'No file',
        proofOfAddress: formData.documents.proofOfAddress ? (typeof formData.documents.proofOfAddress === 'string' ? formData.documents.proofOfAddress : `${formData.documents.proofOfAddress.name} (${formData.documents.proofOfAddress.size} bytes)`) : 'No file',
        photo: formData.documents.photo ? (typeof formData.documents.photo === 'string' ? formData.documents.photo : `${formData.documents.photo.name} (${formData.documents.photo.size} bytes)`) : 'No file',
        certificateOfSponsorship: formData.documents.certificateOfSponsorship ? (typeof formData.documents.certificateOfSponsorship === 'string' ? formData.documents.certificateOfSponsorship : `${formData.documents.certificateOfSponsorship.name} (${formData.documents.certificateOfSponsorship.size} bytes)`) : 'No file',
        qualificationCertificates: formData.documents.qualificationCertificates ? (typeof formData.documents.qualificationCertificates === 'string' ? formData.documents.qualificationCertificates : `${formData.documents.qualificationCertificates.name} (${formData.documents.qualificationCertificates.size} bytes)`) : 'No file',
        dbsCertificate: formData.documents.dbsCertificate ? (typeof formData.documents.dbsCertificate === 'string' ? formData.documents.dbsCertificate : `${formData.documents.dbsCertificate.name} (${formData.documents.dbsCertificate.size} bytes)`) : 'No file',
        dbsUpdateService: formData.documents.dbsUpdateService ? (typeof formData.documents.dbsUpdateService === 'string' ? formData.documents.dbsUpdateService : `${formData.documents.dbsUpdateService.name} (${formData.documents.dbsUpdateService.size} bytes)`) : 'No file',
        immunizationRecords: formData.documents.immunizationRecords ? (typeof formData.documents.immunizationRecords === 'string' ? formData.documents.immunizationRecords : `${formData.documents.immunizationRecords.name} (${formData.documents.immunizationRecords.size} bytes)`) : 'No file',
        occupationalHealth: formData.documents.occupationalHealth ? (typeof formData.documents.occupationalHealth === 'string' ? formData.documents.occupationalHealth : `${formData.documents.occupationalHealth.name} (${formData.documents.occupationalHealth.size} bytes)`) : 'No file',
      });

      // Upload all other documents and collect URLs
      const cvUrl = await uploadDocument(
        typeof formData.documents.cv === 'object' ? formData.documents.cv : null, 
        'CV - Professional Resume', 
        'COMPLIANCE'
      );
      const rightToWorkUrl = await uploadDocument(
        typeof formData.documents.rightToWork === 'object' ? formData.documents.rightToWork : null, 
        'Right to Work Document', 
        'COMPLIANCE'
      );
      const proofOfAddressUrl = await uploadDocument(
        typeof formData.documents.proofOfAddress === 'object' ? formData.documents.proofOfAddress : null, 
        'Proof of Address', 
        'COMPLIANCE'
      );
      const photoUrl = await uploadDocument(
        typeof formData.documents.photo === 'object' ? formData.documents.photo : null, 
        'Profile Photo', 
        'COMPLIANCE'
      );
      const certificateOfSponsorshipUrl = await uploadDocument(
        typeof formData.documents.certificateOfSponsorship === 'object' ? formData.documents.certificateOfSponsorship : null, 
        'Certificate of Sponsorship', 
        'IDENTIFICATION'
      );
      const qualificationCertificatesUrl = await uploadDocument(
        typeof formData.documents.qualificationCertificates === 'object' ? formData.documents.qualificationCertificates : null, 
        'Qualification Certificates', 
        'CERTIFICATION'
      );
      const dbsCertificateUrl = await uploadDocument(
        typeof formData.documents.dbsCertificate === 'object' ? formData.documents.dbsCertificate : null, 
        'DBS Certificate', 
        'CERTIFICATION'
      );
      const dbsUpdateServiceUrl = await uploadDocument(
        typeof formData.documents.dbsUpdateService === 'object' ? formData.documents.dbsUpdateService : null, 
        'DBS Update Service', 
        'CERTIFICATION'
      );
      const immunizationRecordsUrl = await uploadDocument(
        typeof formData.documents.immunizationRecords === 'object' ? formData.documents.immunizationRecords : null, 
        'Immunization Records', 
        'COMPLIANCE'
      );
      const occupationalHealthUrl = await uploadDocument(
        typeof formData.documents.occupationalHealth === 'object' ? formData.documents.occupationalHealth : null, 
        'Occupational Health Report', 
        'COMPLIANCE'
      );

      // Upload certification files from Step 3
      const certificationUrls: string[] = [];
      for (let i = 0; i < formData.certifications.length; i++) {
        const cert = formData.certifications[i];
        if (cert.certificateFile && typeof cert.certificateFile === 'object') {
          const certUrl = await uploadDocument(
            cert.certificateFile, 
            `Certification - ${cert.name}`, 
            'CERTIFICATION'
          );
          if (certUrl) {
            certificationUrls.push(certUrl);
          }
        }
      }

      // Upload license files from Step 3
      const licenseUrls: string[] = [];
      for (let i = 0; i < formData.licenses.length; i++) {
        const license = formData.licenses[i];
        if (license.licenseFile && typeof license.licenseFile === 'object') {
          const licenseUrl = await uploadDocument(
            license.licenseFile, 
            `License - ${license.name}`, 
            'CERTIFICATION'
          );
          if (licenseUrl) {
            licenseUrls.push(licenseUrl);
          }
        }
      }

      // Update worker's documents object with actual URLs
      workerData.documents = {
        cv: resumeUrl || cvUrl,
        rightToWork: rightToWorkUrl,
        certificateOfSponsorship: certificateOfSponsorshipUrl,
        proofOfAddress: proofOfAddressUrl,
        qualificationCertificates: qualificationCertificatesUrl,
        dbsCertificate: dbsCertificateUrl,
        dbsUpdateService: dbsUpdateServiceUrl,
        immunizationRecords: immunizationRecordsUrl,
        occupationalHealth: occupationalHealthUrl,
        photo: photoUrl,
      } as any; // Type assertion to bypass strict typing for now

      // Update certifications and licenses with uploaded file URLs
      workerData.certifications = formData.certifications.map((cert, index) => ({
        ...cert,
        certificateFile: certificationUrls[index] || null
      }));

      workerData.licenses = formData.licenses.map((license, index) => ({
        ...license,
        licenseFile: licenseUrls[index] || null
      }));

      console.log('Final worker documents with URLs:', workerData.documents);
      console.log('Certification URLs:', certificationUrls);
      console.log('License URLs:', licenseUrls);

      // Create preferences
      const preferencesData = {
        id: `pref_${Date.now()}`,
        userId: user.id,
        notifications: formData.preferences.notifications,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save worker profile
      await apiClient.createWorker(workerData);
      
      // Save preferences
      await apiClient.createPreferences(preferencesData);

      // Redirect to pending approval page
      router.push('/worker/pending-approval');
    } catch (error) {
      console.error('Error during onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
        <p className="text-gray-800 mb-6">Please provide your basic personal information.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => updateFormData('firstName', e.target.value)}
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => updateFormData('lastName', e.target.value)}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          required
        />
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          required
        />
        <Input
          label="National Insurance Number"
          value={formData.nationalInsurance}
          onChange={(e) => updateFormData('nationalInsurance', e.target.value)}
          placeholder="e.g., AB123456C"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            required
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            required
          />
          <Input
            label="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Education & Work History</h3>
        <p className="text-gray-800 mb-6">Tell us about your educational background and work experience.</p>
      </div>
      
      <div className="space-y-6">
        {formData.education.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-black">Education Entry {index + 1}</h4>
              {formData.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Degree/Certificate"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="e.g., Bachelor of Science in Nursing"
                required
              />
              <Input
                label="Institution"
                value={edu.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                placeholder="e.g., University of Health Sciences"
                required
              />
              <Input
                label="Field of Study"
                value={edu.fieldOfStudy}
                onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                placeholder="e.g., Nursing, Healthcare Management"
                required
              />
              <Input
                label="Graduation Year"
                type="number"
                value={edu.graduationYear}
                onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)}
                placeholder="2020"
                required
              />
            </div>
          </div>
        ))}
        
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Education
          </button>
        </div>

        <div className="mt-6">
                      <h3 className="text-lg font-semibold text-black mb-4">Work History</h3>
          <p className="text-gray-800 mb-6">Please list your previous employment history.</p>
          {formData.workHistory.map((work, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Work Entry {index + 1}</h4>
                {formData.workHistory.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorkHistory(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Employer"
                  value={work.employer}
                  onChange={(e) => updateWorkHistory(index, 'employer', e.target.value)}
                  placeholder="e.g., Hospital A"
                  required
                />
                <Input
                  label="Position"
                  value={work.position}
                  onChange={(e) => updateWorkHistory(index, 'position', e.target.value)}
                  placeholder="e.g., Registered Nurse"
                  required
                />
                <Input
                  label="Location"
                  value={work.location}
                  onChange={(e) => updateWorkHistory(index, 'location', e.target.value)}
                  placeholder="e.g., London, UK"
                  required
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={work.startDate}
                  onChange={(e) => updateWorkHistory(index, 'startDate', e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={work.endDate}
                  onChange={(e) => updateWorkHistory(index, 'endDate', e.target.value)}
                  placeholder="Current job"
                  disabled={work.isCurrent}
                />
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={work.isCurrent}
                    onChange={(e) => updateWorkHistory(index, 'isCurrent', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">Is Current Job</span>
                </div>
                <Textarea
                  label="Description"
                  value={work.description}
                  onChange={(e) => updateWorkHistory(index, 'description', e.target.value)}
                  placeholder="e.g., Responsibilities, achievements"
                />
                <div className="space-y-2">
                  <Input
                    label="DBS Number (if applicable)"
                    value={work.dbsNumber}
                    onChange={(e) => updateWorkHistory(index, 'dbsNumber', e.target.value)}
                    placeholder="e.g., 123456789"
                  />
                  <button
                    type="button"
                    onClick={() => handleDBSVerification(index)}
                    disabled={verifyingDBS[index] || !work.dbsNumber}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {verifyingDBS[index] ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify DBS Certificate'
                    )}
                  </button>
                </div>
                <Input
                  label="DBS Position"
                  value={work.dbsPosition}
                  onChange={(e) => updateWorkHistory(index, 'dbsPosition', e.target.value)}
                  placeholder="e.g., Nurse"
                />
                <Input
                  label="DBS Expiry Date"
                  type="date"
                  value={work.dbsExpiryDate}
                  onChange={(e) => updateWorkHistory(index, 'dbsExpiryDate', e.target.value)}
                />
                <Input
                  label="DBS Check Date"
                  type="date"
                  value={work.dbsCheckDate}
                  onChange={(e) => updateWorkHistory(index, 'dbsCheckDate', e.target.value)}
                />
                
                {/* DBS Verification Results */}
                {dbsVerificationResults[index] && (
                  <div className="col-span-full">
                    {/* Show success message only if verification passed (ok: true) */}
                    {dbsVerificationResults[index].ok !== false && dbsVerificationResults[index].structured?.outcome ? (
                      <div className={`mt-4 p-4 rounded-lg border ${
                        dbsVerificationResults[index].structured?.outcome === 'clear_and_current' 
                          ? 'bg-green-50 border-green-200' 
                          : dbsVerificationResults[index].structured?.outcome === 'current'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-start">
                          {dbsVerificationResults[index].structured?.outcome === 'clear_and_current' ? (
                            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              dbsVerificationResults[index].structured?.outcome === 'clear_and_current' 
                                ? 'text-green-800' 
                                : 'text-blue-800'
                            }`}>
                              DBS Certificate Verified
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {dbsVerificationResults[index].structured?.outcomeText || 'Verification completed'}
                            </p>
                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                              {dbsVerificationResults[index].structured?.personName && (
                                <p><strong>Person:</strong> {dbsVerificationResults[index].structured.personName}</p>
                              )}
                              {dbsVerificationResults[index].structured?.certificateNumber && (
                                <p><strong>Certificate Number:</strong> {dbsVerificationResults[index].structured.certificateNumber}</p>
                              )}
                              {dbsVerificationResults[index].structured?.certificatePrintDate && (
                                <p><strong>Print Date:</strong> {dbsVerificationResults[index].structured.certificatePrintDate}</p>
                              )}
                              <p className={`font-medium ${
                                dbsVerificationResults[index].structured?.outcome === 'clear_and_current' 
                                  ? 'text-green-600' 
                                  : 'text-blue-600'
                              }`}>
                                Status: {dbsVerificationResults[index].structured?.outcome === 'clear_and_current' ? 'Clear and Current' : 'Current'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Show error message if verification failed */
                      <div className="mt-4 p-4 rounded-lg border bg-red-50 border-red-200">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="font-medium text-red-800">
                              DBS Verification Failed
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {dbsVerificationResults[index].error || 'The certificate details do not match our records. Please verify the certificate number, surname, and date of birth.'}
                            </p>
                            {work.dbsNumber && (
                              <p className="text-xs text-gray-600 mt-2">
                                <strong>Submitted Certificate Number:</strong> {work.dbsNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addWorkHistory}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Work Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Skills & Certifications</h3>
        <p className="text-gray-800 mb-6">Please provide your professional skills and certifications.</p>
      </div>
      
      <div className="space-y-4">
        <Textarea
          label="Skills"
          value={formData.skills}
          onChange={(e) => updateFormData('skills', e.target.value)}
          placeholder="e.g., Registered Nurse, ICU, Emergency Care, Pediatrics"
          helperText="Separate multiple skills with commas"
          required
        />
        <div>
          <h4 className="font-medium mb-3 text-black">Certifications</h4>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
                {formData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={cert.name}
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  placeholder="e.g., Registered Nurse"
                  required
                />
                <Input
                  label="Issuing Body"
                  value={cert.issuingBody}
                  onChange={(e) => updateCertification(index, 'issuingBody', e.target.value)}
                  placeholder="e.g., Nursing and Midwifery Council"
                  required
                />
                <Input
                  label="Issue Date"
                  type="date"
                  value={cert.issueDate}
                  onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                  required
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={cert.expiryDate}
                  onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                />
                <Input
                  label="Certificate Number"
                  value={cert.certificateNumber}
                  onChange={(e) => updateCertification(index, 'certificateNumber', e.target.value)}
                  placeholder="e.g., 123456789"
                />
                <Input
                  label="Upload Certificate File"
                  type="file"
                  onChange={(e) => handleCertificationFileUpload(index, e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  helperText="Upload the certificate document (PDF, Word, or Image)"
                  required
                />
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addCertification}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Certification
            </button>
          </div>
        </div>

        <div className="mt-6">
                      <h3 className="text-lg font-semibold text-black mb-4">Licenses</h3>
          <p className="text-gray-800 mb-6">Please provide your professional licenses.</p>
          {formData.licenses.map((license, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">License {index + 1}</h4>
                {formData.licenses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLicense(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={license.name}
                  onChange={(e) => updateLicense(index, 'name', e.target.value)}
                  placeholder="e.g., Registered Nurse"
                  required
                />
                <Input
                  label="Issuing Body"
                  value={license.issuingBody}
                  onChange={(e) => updateLicense(index, 'issuingBody', e.target.value)}
                  placeholder="e.g., Nursing and Midwifery Council"
                  required
                />
                <Input
                  label="Issue Date"
                  type="date"
                  value={license.issueDate}
                  onChange={(e) => updateLicense(index, 'issueDate', e.target.value)}
                  required
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={license.expiryDate}
                  onChange={(e) => updateLicense(index, 'expiryDate', e.target.value)}
                />
                <Input
                  label="License Number"
                  value={license.licenseNumber}
                  onChange={(e) => updateLicense(index, 'licenseNumber', e.target.value)}
                  placeholder="e.g., 123456789"
                />
                <Input
                  label="Upload License File"
                  type="file"
                  onChange={(e) => handleLicenseFileUpload(index, e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  helperText="Upload the license document (PDF, Word, or Image)"
                  required
                />
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addLicense}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another License
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Reference Details</h3>
        <p className="text-gray-800 mb-6">Please provide contact details for your references.</p>
      </div>
      
      <div className="space-y-4">
        {formData.references.map((ref, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Reference {index + 1}</h4>
              {formData.references.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={ref.name}
                onChange={(e) => updateReference(index, 'name', e.target.value)}
                placeholder="e.g., Dr. Jane Smith"
                required
              />
              <Input
                label="Relationship"
                value={ref.relationship}
                onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                placeholder="e.g., Employer, Colleague"
                required
              />
              <Input
                label="Company"
                value={ref.company}
                onChange={(e) => updateReference(index, 'company', e.target.value)}
                placeholder="e.g., Hospital A"
                required
              />
              <Input
                label="Position"
                value={ref.position}
                onChange={(e) => updateReference(index, 'position', e.target.value)}
                placeholder="e.g., Medical Director"
              />
              <Input
                label="Email"
                type="email"
                value={ref.email}
                onChange={(e) => updateReference(index, 'email', e.target.value)}
                placeholder="e.g., jane.smith@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={ref.phone}
                onChange={(e) => updateReference(index, 'phone', e.target.value)}
                placeholder="e.g., +44 123 456 7890"
              />
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={ref.isProfessional}
                  onChange={(e) => updateReference(index, 'isProfessional', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800">Is Professional Reference</span>
              </div>
              <Input
                label="Years Known"
                value={ref.yearsKnown}
                onChange={(e) => updateReference(index, 'yearsKnown', e.target.value)}
                placeholder="e.g., 2 years"
              />
            </div>
          </div>
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addReference}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Reference
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Emergency Contact</h3>
        <p className="text-gray-800 mb-6">Please provide an emergency contact person.</p>
      </div>
      
      <div className="space-y-4">
        <Input
          label="Emergency Contact Name"
          value={formData.emergencyContact.name}
          onChange={(e) => updateFormData('emergencyContact', { ...formData.emergencyContact, name: e.target.value })}
          required
        />
        <Input
          label="Emergency Contact Phone"
          type="tel"
          value={formData.emergencyContact.phone}
          onChange={(e) => updateFormData('emergencyContact', { ...formData.emergencyContact, phone: e.target.value })}
          placeholder="e.g., 07123456789"
          required
        />
        <Input
          label="Emergency Contact Email"
          type="email"
          value={formData.emergencyContact.email}
          onChange={(e) => updateFormData('emergencyContact', { ...formData.emergencyContact, email: e.target.value })}
          placeholder="e.g., emergency@example.com"
        />
        <Input
          label="Relationship"
          value={formData.emergencyContact.relationship}
          onChange={(e) => updateFormData('emergencyContact', { ...formData.emergencyContact, relationship: e.target.value })}
          placeholder="e.g., Spouse, Parent, Friend"
          required
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Bank Details</h3>
        <p className="text-gray-800 mb-6">Please provide your banking information for payments.</p>
      </div>
      
      <div className="space-y-4">
        <Input
          label="Bank Name"
          value={formData.bankDetails.bankName}
          onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, bankName: e.target.value })}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Account Number"
            type="password"
            value={formData.bankDetails.accountNumber}
            onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, accountNumber: e.target.value })}
            required
          />
          <Input
            label="Routing Number"
            value={formData.bankDetails.routingNumber}
            onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, routingNumber: e.target.value })}
            required
          />
        </div>
        <Input
          label="Account Type"
          value={formData.bankDetails.accountType}
          onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, accountType: e.target.value })}
          placeholder="e.g., Checking, Savings"
          required
        />
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Compliance Documents</h3>
        <p className="text-gray-800 mb-6">Please upload your compliance documents.</p>
      </div>
      
      <div className="space-y-4">
        {/* Required Documents */}
        <div>
          <h4 className="font-medium mb-3 text-black">Required Documents</h4>
          <div className="space-y-4">
            <Input
              label="Upload CV"
              type="file"
              onChange={(e) => handleDocumentUpload('cv', e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx"
              helperText="Upload your current CV (PDF or Word Document)"
              required
            />
            <Input
              label="Upload Right to Work Document"
              type="file"
              onChange={(e) => handleDocumentUpload('rightToWork', e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx"
              helperText="Upload a document proving your right to work in the UK"
              required
            />
            <Input
              label="Upload Proof of Address"
              type="file"
              onChange={(e) => handleDocumentUpload('proofOfAddress', e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx"
              helperText="Upload a document proving your current address"
              required
            />
            <Input
              label="Upload Photo"
              type="file"
              onChange={(e) => handleDocumentUpload('photo', e.target.files?.[0] || null)}
              accept="image/*"
              helperText="Upload a clear, professional photo of yourself"
              required
            />
          </div>
        </div>

        {/* Additional Documents Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdditionalDocuments(!showAdditionalDocuments)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg 
              className={`w-4 h-4 mr-2 transition-transform ${showAdditionalDocuments ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showAdditionalDocuments ? 'Hide Additional Documents' : 'Show Additional Documents'}
          </button>
        </div>

        {/* Additional Documents */}
        {showAdditionalDocuments && (
          <div>
            <h4 className="font-medium mb-3 text-black">Additional Documents (Optional)</h4>
            <div className="space-y-4">
              <Input
                label="Upload Certificate of Sponsorship (if applicable)"
                type="file"
                onChange={(e) => handleDocumentUpload('certificateOfSponsorship', e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                helperText="Upload your Certificate of Sponsorship (if you are sponsored)"
              />
              <Input
                label="Upload Qualification Certificates"
                type="file"
                onChange={(e) => handleDocumentUpload('qualificationCertificates', e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                helperText="Upload copies of your relevant qualification certificates"
              />
              <Input
                label="Upload DBS Certificate (if applicable)"
                type="file"
                onChange={(e) => handleDocumentUpload('dbsCertificate', e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                helperText="Upload your Disclosure and Barring Service (DBS) Certificate"
              />
              <Input
                label="Upload DBS Update Service (if applicable)"
                type="file"
                onChange={(e) => handleDocumentUpload('dbsUpdateService', e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                helperText="Upload your Disclosure and Barring Service (DBS) Certificate Update Service"
              />
              <Input
                label="Upload Immunization Records"
                type="file"
                onChange={(e) => handleDocumentUpload('immunizationRecords', e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                helperText="Upload your immunization records"
              />
              <Input
                label="Upload Occupational Health Report"
                type="file"
                onChange={(e) => handleDocumentUpload('occupationalHealth', e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                helperText="Upload your occupational health report"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Declarations & Consent</h3>
        <p className="text-gray-800 mb-6">Please review and accept our terms and conditions.</p>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declarations.gdprConsent}
            onChange={(e) => updateDeclaration('gdprConsent', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-800">
            I consent to the processing of my personal data in accordance with the{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declarations.workPolicies}
            onChange={(e) => updateDeclaration('workPolicies', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-800">
            I have read and agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Worker Terms of Service
            </a>
            .
          </span>
        </label>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declarations.dataProcessing}
            onChange={(e) => updateDeclaration('dataProcessing', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-800">
            I consent to the processing of my personal data for the purpose of my employment application and subsequent employment.
          </span>
        </label>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declarations.backgroundCheck}
            onChange={(e) => updateDeclaration('backgroundCheck', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-800">
            I confirm that all information provided in this application is true and accurate to the best of my knowledge.
          </span>
        </label>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declarations.healthDeclaration}
            onChange={(e) => updateDeclaration('healthDeclaration', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-800">
            I declare that I am in good health and do not have any infectious diseases or conditions that would prevent me from performing the duties of the position for which I am applying.
          </span>
        </label>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.declarations.termsAccepted}
            onChange={(e) => updateDeclaration('termsAccepted', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
            required
          />
          <span className="text-sm text-gray-800">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep9 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Work Preferences</h3>
        <p className="text-gray-800 mb-6">Set your work preferences and notification settings.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3 text-black">Preferred Shifts</h4>
          <div className="space-y-2">
            {['Day', 'Night', 'Weekend', 'Bank Holiday'].map((shift) => (
              <label key={shift} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.preferences.preferredShifts.includes(shift)}
                  onChange={(e) => {
                    const currentShifts = formData.preferences.preferredShifts;
                    const newShifts = e.target.checked
                      ? [...currentShifts, shift]
                      : currentShifts.filter(s => s !== shift);
                    updatePreference('preferredShifts', newShifts);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800">{shift}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 text-black">Preferred Locations</h4>
          <div className="space-y-2">
            {['Central London', 'North London', 'South London', 'East London', 'West London', 'Outside London'].map((location) => (
              <label key={location} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.preferences.preferredLocations.includes(location)}
                  onChange={(e) => {
                    const currentLocations = formData.preferences.preferredLocations;
                    const newLocations = e.target.checked
                      ? [...currentLocations, location]
                      : currentLocations.filter(l => l !== location);
                    updatePreference('preferredLocations', newLocations);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800">{location}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Hourly Rate (£)"
            type="number"
            value={formData.preferences.hourlyRate}
            onChange={(e) => updatePreference('hourlyRate', e.target.value)}
            placeholder="25.00"
            required
          />
          <Input
            label="Maximum Travel Distance (miles)"
            type="number"
            value={formData.preferences.maxTravelDistance}
            onChange={(e) => updatePreference('maxTravelDistance', parseInt(e.target.value) || 50)}
            placeholder="50"
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-3 text-black">Notification Preferences</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.preferences.notifications.email}
                onChange={(e) => updateNotificationPreference('email', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-800">Email notifications</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.preferences.notifications.sms}
                onChange={(e) => updateNotificationPreference('sms', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-800">SMS notifications</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.preferences.notifications.push}
                onChange={(e) => updateNotificationPreference('push', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-800">Push notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      case 9:
        return renderStep9();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone && formData.email && formData.dateOfBirth && 
               formData.address && formData.city && formData.state && formData.zipCode && formData.nationalInsurance;
      case 2:
        return formData.education.length > 0 && 
               formData.education.every(edu => 
                 edu.degree && edu.institution && edu.graduationYear && edu.fieldOfStudy
               ) &&
               formData.workHistory.length > 0 &&
               formData.workHistory.every(work => 
                 work.employer && work.position && work.location && work.startDate
               );
      case 3:
        return formData.skills && 
               formData.certifications.length > 0 && 
               formData.certifications.every(cert => 
                 cert.name && cert.issuingBody && cert.issueDate && cert.certificateFile
               ) &&
               formData.licenses.length > 0 &&
               formData.licenses.every(license => 
                 license.name && license.issuingBody && license.issueDate && license.licenseFile
               );
      case 4:
        return formData.references.length > 0 &&
               formData.references.every(ref => 
                 ref.name && ref.relationship && ref.company && ref.position && ref.phone
               );
      case 5:
        return formData.emergencyContact.name && formData.emergencyContact.phone && formData.emergencyContact.relationship;
      case 6:
        return formData.bankDetails.bankName && formData.bankDetails.accountNumber && formData.bankDetails.routingNumber && formData.bankDetails.accountType;
      case 7:
        return formData.documents.cv && formData.documents.rightToWork && 
               formData.documents.proofOfAddress && formData.documents.photo;
      case 8:
        return formData.declarations.gdprConsent && formData.declarations.workPolicies && 
               formData.declarations.dataProcessing && formData.declarations.backgroundCheck && 
               formData.declarations.healthDeclaration && formData.declarations.termsAccepted;
      case 9:
        return formData.preferences.preferredShifts.length > 0 && formData.preferences.preferredLocations.length > 0 && 
               formData.preferences.hourlyRate && formData.preferences.maxTravelDistance > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-black">Complete Your Profile</h1>
            <p className="text-gray-800 mt-1">Step {currentStep} of 9</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 9) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-800">
              <span className="text-gray-800">Personal</span>
              <span className="text-gray-800">Education</span>
              <span className="text-gray-800">Skills</span>
              <span className="text-gray-800">References</span>
              <span className="text-gray-800">Emergency</span>
              <span className="text-gray-800">Bank</span>
              <span className="text-gray-800">Documents</span>
              <span className="text-gray-800">Declarations</span>
              <span className="text-gray-800">Preferences</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between">
              <LoadingButton
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="secondary"
              >
                Previous
              </LoadingButton>
              
              <div className="flex space-x-3">
                {currentStep < 9 ? (
                  <LoadingButton
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    loading={isSubmitting}
                  >
                    Complete Setup
                  </LoadingButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 