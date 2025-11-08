// Basic types for the demo API
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'worker' | 'client' | 'admin';
  phone?: string;
}

export interface DBSVerificationResult {
  ok: boolean;
  structured: {
    personName: string;
    dateOfBirth: string;
    certificateNumber: string;
    certificatePrintDate: string;
    outcomeText: string;
    outcome: 'clear_and_current' | 'current' | 'not_current';
  };
  verificationDate: string;
  error?: string;
}

export interface OfqualVerificationResult {
  ok: boolean;
  qualification?: any;
  verificationDate: string;
  error?: string;
}

export interface DBSUpdateServiceResult {
  ok: boolean;
  format: 'html' | 'pdf';
  certificateNumber: string;
  status: string;
  verificationDate: string;
  message?: string;
  error?: string;
}

export interface ProfessionalRegisterResult {
  ok: boolean;
  source: string;
  registrationNumber: string;
  status: string;
  verificationDate: string;
  registerUrl?: string;
  details?: {
    name?: string;
    registrationStatus: string;
    expiryDate?: string | null;
  };
  error?: string;
}

export interface RTWVerificationResult {
  ok: boolean;
  shareCode: string;
  dateOfBirth: string;
  status: string;
  verificationDate: string;
  details?: {
    workStatus: string;
    expiryDate?: string | null;
  };
  error?: string;
}

export interface ECSVerificationResult {
  ok: boolean;
  shareCode: string;
  dateOfBirth: string;
  status: string;
  verificationDate: string;
  details?: {
    workStatus: string;
    expiryDate?: string | null;
  };
  error?: string;
}

export interface Worker {
  id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  nationalInsurance?: string;
  dbsVerification?: DBSVerificationResult;
  verifications?: {
    ofqual?: OfqualVerificationResult[];
    dbsUpdateService?: DBSUpdateServiceResult;
    professionalRegisters?: ProfessionalRegisterResult[];
    rightToWork?: RTWVerificationResult;
    ecs?: ECSVerificationResult;
  };
  education?: Array<{
    degree: string;
    institution: string;
    graduationYear: string;
    fieldOfStudy: string;
  }>;
  workHistory?: Array<{
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
    dbsVerificationResult?: DBSVerificationResult;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    certificateNumber: string;
    certificateFile?: string | null;
    ofqualVerification?: OfqualVerificationResult;
    professionalRegisterVerification?: ProfessionalRegisterResult;
  }>;
  licenses?: Array<{
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    licenseNumber: string;
    licenseFile?: string | null;
    professionalRegisterVerification?: ProfessionalRegisterResult;
  }>;
  references?: Array<{
    name: string;
    relationship: string;
    company: string;
    position: string;
    email: string;
    phone: string;
    isProfessional: boolean;
    yearsKnown: string;
  }>;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: string;
  };
  documents?: {
    cv: string | null;
    rightToWork: string | null;
    certificateOfSponsorship: string | null;
    proofOfAddress: string | null;
    qualificationCertificates: string | null;
    dbsCertificate: string | null;
    dbsUpdateService: string | null;
    immunizationRecords: string | null;
    occupationalHealth: string | null;
    photo: string | null;
  };
  declarations?: {
    gdprConsent: boolean;
    workPolicies: boolean;
    dataProcessing: boolean;
    backgroundCheck: boolean;
    healthDeclaration: boolean;
    termsAccepted: boolean;
  };
  preferences?: {
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
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  rating: number;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId?: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  description: string;
  industry: 'HOSPITAL' | 'CLINIC' | 'CARE_HOME' | 'OTHER';
  subscriptionPlan: string;
  trialDetails?: {
    startDate: string;
    endDate: string;
    isConverted: boolean;
    conversionDate: string;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  clientId: string;
  location: string;
  department: string;
  shift: string;
  duration: string;
  rate: number;
  status: 'active' | 'inactive' | 'completed' | 'pending' | 'ACTIVE' | 'PENDING' | 'COMPLETE' | 'APPLIED';
  requirements: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  assignedWorkerId?: string | null;
  // Additional properties that components expect
  experience?: number;
  skills?: string[];
  responsibilities?: string | string[];
  currency?: string;
  salaryMin?: number;
  salaryMax?: number;
  salary?: {
    currency?: string;
  };
  company?: {
    name: string;
    industry?: string;
    description?: string;
  };
}

export interface Assignment {
  id: string;
  jobId: string;
  workerId: string | null;
  clientId: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  assignedAt: string | null;
  assignedBy: string | null;
  notes: string;
  hoursPerWeek: number;
  rate: number;
  // Additional properties that components expect
  title?: string;
  description?: string;
  location?: string;
  shiftType?: string;
  hourlyRate?: number;
  totalHours?: number;
  contactPerson?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: 'CERTIFICATION' | 'COMPLIANCE' | 'IDENTIFICATION' | 'OTHER';
  status: 'VALID' | 'EXPIRED' | 'PENDING_REVIEW';
  expiryDate?: string;
  uploadedAt: string;
  workerId: string;
  verifiedAt?: string;
  verifiedBy?: string;
  tags?: string[];
}

export interface Timesheet {
  id: string;
  workerId: string;
  jobId: string;
  clientId: string;
  weekStarting: string;
  weekEnding: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  totalHours: number;
  rate: number;
  totalPay: number;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  days: Array<{
    date: string;
    hours: number;
    startTime: string;
    endTime: string;
    breakMinutes: number;
  }>;
  // Additional properties that components expect
  assignmentId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
  notes?: string;
  rejectedReason?: string;
}

export interface Payment {
  id: string;
  workerId: string;
  timesheetId: string;
  jobId: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentDate: string | null;
  paymentMethod: string | null;
  reference: string | null;
  description: string;
  hours: number;
  rate: number;
  taxDeduction: number;
  netAmount: number;
  createdAt: string;
  // Additional properties that components expect
  currency?: string;
  processedAt?: string;
}

export interface Preference {
  id: string;
  workerId: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
    showContactInfo: boolean;
  };
  preferences: {
    preferredShiftType: string[];
    maxTravelDistance: number;
    minimumHourlyRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredEmail: string;
  referredName: string;
  referredPhone?: string;
  referredRole: 'worker' | 'client';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'SENT' | 'REGISTERED';
  message?: string;
  bonusAmount?: number | null;
  bonusStatus?: 'PENDING' | 'PAID' | null;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkHistory {
  id: string;
  workerId: string;
  employer: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  day: string;
  available: boolean;
  shifts: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

export interface Availability {
  id: string;
  workerId: string;
  availableDays: DayAvailability[];
  availableFromDate: string;
  notes: string;
  updatedAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  acceptedReferrals: number;
  totalEarned: number;
  pendingAmount: number;
}

export interface AdminDashboardStats {
  openJobs: number;
  totalCandidates: number;
  interviewsScheduled: number;
  recentHires: number;
  totalUsers: number;
  newUsersThisWeek: number;
  activeRecruiters: number;
  conversionRate: number;
}

export interface WorkerDashboardStats {
  openJobs: number;
  totalCandidates: number;
  interviewsScheduled: number;
  recentHires: number;
  applicationsSubmitted: number;
  upcomingInterviews: number;
  savedJobs: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ASSIGNMENT_CREATED';
  coverLetter?: string;
  notes?: string;
  expectedRate?: number;
  availability?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Helper function to read JSON files
async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    const response = await fetch(`/api/demo-data/${filename}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error(`Failed to read ${filename}:`, error);
    return [];
  }
}

// Simple API client for demo
export const apiClient = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const response = await fetch('/api/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // Authentication status methods
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('user');
    }
    return false;
  },

  getUserData(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Workers
  async getWorkers(page = 1, limit = 10): Promise<{ success: boolean; data?: PaginatedResponse<Worker>; error?: string }> {
    try {
      const workers = await readJsonFile<Worker>('workers.json');
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedWorkers = workers.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          items: paginatedWorkers,
          total: workers.length,
          page,
          limit,
          pages: Math.ceil(workers.length / limit),
          hasNext: endIndex < workers.length,
          hasPrev: page > 1
        }
      };
    } catch {
      return { success: false, error: 'Failed to load workers' };
    }
  },

  async getWorkerByUserId(userId: string): Promise<{ success: boolean; data?: Worker; error?: string }> {
    try {
      const workers = await readJsonFile<Worker>('workers.json');
      const worker = workers.find(w => w.userId === userId);
      if (worker) {
        return { success: true, data: worker };
      }
      return { success: false, error: 'Worker not found' };
    } catch {
      return { success: false, error: 'Failed to load worker' };
    }
  },

  async getWorker(id: string): Promise<{ success: boolean; data?: Worker; error?: string }> {
    try {
      const workers = await readJsonFile<Worker>('workers.json');
      const worker = workers.find(w => w.id === id);
      if (worker) {
        return { success: true, data: worker };
      }
      return { success: false, error: 'Worker not found' };
    } catch {
      return { success: false, error: 'Failed to load worker' };
    }
  },

  // Clients
  async getClients(): Promise<{ success: boolean; data?: Client[]; error?: string }> {
    try {
      const clients = await readJsonFile<Client>('clients.json');
      return { success: true, data: clients };
    } catch {
      return { success: false, error: 'Failed to load clients' };
    }
  },

  // Jobs
  async getJobs(params: { page?: number; limit?: number } = {}): Promise<{ success: boolean; data?: PaginatedResponse<Job>; error?: string }> {
    try {
      const jobs = await readJsonFile<Job>('jobs.json');
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedJobs = jobs.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          items: paginatedJobs,
          total: jobs.length,
          page,
          limit,
          pages: Math.ceil(jobs.length / limit),
          hasNext: endIndex < jobs.length,
          hasPrev: page > 1
        }
      };
    } catch {
      return { success: false, error: 'Failed to load jobs' };
    }
  },

  async getJobById(id: string): Promise<{ success: boolean; data?: Job; error?: string }> {
    try {
      const jobs = await readJsonFile<Job>('jobs.json');
      const job = jobs.find(j => j.id === id);
      if (job) {
        return { success: true, data: job };
      }
      return { success: false, error: 'Job not found' };
    } catch {
      return { success: false, error: 'Failed to load job' };
    }
  },

  // Assignments
  async getAssignments(): Promise<{ success: boolean; data?: Assignment[]; error?: string }> {
    try {
      const assignments = await readJsonFile<Assignment>('assignments.json');
      return { success: true, data: assignments };
    } catch {
      return { success: false, error: 'Failed to load assignments' };
    }
  },

  async getAssignmentById(id: string): Promise<{ success: boolean; data?: Assignment; error?: string }> {
    try {
      const assignments = await readJsonFile<Assignment>('assignments.json');
      const assignment = assignments.find(a => a.id === id);
      if (assignment) {
        return { success: true, data: assignment };
      }
      return { success: false, error: 'Assignment not found' };
    } catch {
      return { success: false, error: 'Failed to load assignment' };
    }
  },

  // Applications
  async getApplications(): Promise<{ success: boolean; data?: Application[]; error?: string }> {
    try {
      const applications = await readJsonFile<Application>('applications.json');
      return { success: true, data: applications };
    } catch {
      return { success: false, error: 'Failed to load applications' };
    }
  },

  // Timesheets
  async getTimesheets(workerId?: string): Promise<{ success: boolean; data?: Timesheet[]; error?: string }> {
    try {
      const timesheets = await readJsonFile<Timesheet>('timesheets.json');
      if (workerId) {
        const filteredTimesheets = timesheets.filter(t => t.workerId === workerId);
        return { success: true, data: filteredTimesheets };
      }
      return { success: true, data: timesheets };
    } catch {
      return { success: false, error: 'Failed to load timesheets' };
    }
  },

  async getTimesheetById(id: string): Promise<{ success: boolean; data?: Timesheet; error?: string }> {
    try {
      const timesheets = await readJsonFile<Timesheet>('timesheets.json');
      const timesheet = timesheets.find(t => t.id === id);
      if (timesheet) {
        return { success: true, data: timesheet };
      }
      return { success: false, error: 'Timesheet not found' };
    } catch {
      return { success: false, error: 'Failed to load timesheet' };
    }
  },

  // Payments
  async getPayments(workerId?: string): Promise<{ success: boolean; data?: Payment[]; error?: string }> {
    try {
      const payments = await readJsonFile<Payment>('payments.json');
      if (workerId) {
        const filteredPayments = payments.filter(p => p.workerId === workerId);
        return { success: true, data: filteredPayments };
      }
      return { success: true, data: payments };
    } catch {
      return { success: false, error: 'Failed to load payments' };
    }
  },

  async getPaymentById(id: string): Promise<{ success: boolean; data?: Payment; error?: string }> {
    try {
      const payments = await readJsonFile<Payment>('payments.json');
      const payment = payments.find(p => p.id === id);
      if (payment) {
        return { success: true, data: payment };
      }
      return { success: false, error: 'Payment not found' };
    } catch {
      return { success: false, error: 'Failed to load payment' };
    }
  },

  // Dashboard stats
  async getAdminDashboardStats(): Promise<{ success: boolean; data?: AdminDashboardStats; error?: string }> {
    try {
      const workers = await readJsonFile<Worker>('workers.json');
      const clients = await readJsonFile<Client>('clients.json');
      const jobs = await readJsonFile<Job>('jobs.json');
      const assignments = await readJsonFile<Assignment>('assignments.json');
      
      const activeJobs = jobs.filter(job => job.status === 'active');
      const activeAssignments = assignments.filter(assignment => assignment.status === 'active');
      
      return {
        success: true,
        data: {
          openJobs: activeJobs.length,
          totalCandidates: workers.length,
          interviewsScheduled: 8,
          recentHires: activeAssignments.length,
          totalUsers: workers.length + clients.length,
          newUsersThisWeek: 3,
          activeRecruiters: 4,
          conversionRate: 0.75
        }
      };
    } catch {
      return {
        success: true,
        data: {
          openJobs: 0,
          totalCandidates: 0,
          interviewsScheduled: 0,
          recentHires: 0,
          totalUsers: 0,
          newUsersThisWeek: 0,
          activeRecruiters: 0,
          conversionRate: 0
        }
      };
    }
  },

  async getWorkerDashboardStats(): Promise<{ success: boolean; data?: WorkerDashboardStats; error?: string }> {
    try {
      const jobs = await readJsonFile<Job>('jobs.json');
      const assignments = await readJsonFile<Assignment>('assignments.json');
      const workers = await readJsonFile<Worker>('workers.json');
      
      const activeJobs = jobs.filter(job => job.status === 'active');
      const pendingJobs = jobs.filter(job => job.status === 'pending');
      const activeAssignments = assignments.filter(assignment => assignment.status === 'active');
      
      return {
        success: true,
        data: {
          openJobs: activeJobs.length + pendingJobs.length,
          totalCandidates: workers.length,
          interviewsScheduled: 3,
          recentHires: activeAssignments.length,
          applicationsSubmitted: 5,
          upcomingInterviews: 2,
          savedJobs: 2
        }
      };
    } catch {
      return {
        success: true,
        data: {
          openJobs: 0,
          totalCandidates: 0,
          interviewsScheduled: 0,
          recentHires: 0,
          applicationsSubmitted: 0,
          upcomingInterviews: 0,
          savedJobs: 0
        }
      };
    }
  },

  // Generic methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get<T>(_url?: string): Promise<{ success: boolean; data?: T; error?: string }> {
    return { success: true, data: [] as unknown as T };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post<T>(_url?: string, _data?: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
    // Mock implementation
    return { success: true, data: {} as T };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async put<T>(_url?: string, _data?: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
    // Mock implementation
    return { success: true, data: {} as T };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete<T>(_url?: string): Promise<{ success: boolean; data?: T; error?: string }> {
    // Mock implementation
    return { success: true, data: {} as T };
  },

  // Worker creation method
  async createWorker(workerData: any): Promise<{ success: boolean; data?: Worker; error?: string }> {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
      return { success: false, error: 'Failed to create worker' };
    } catch (error) {
      console.error('Error creating worker:', error);
      return { success: false, error: 'Failed to create worker' };
    }
  },

  // Preferences creation method
  async createPreferences(preferencesData: any): Promise<{ success: boolean; data?: Preference; error?: string }> {
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencesData),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
      return { success: false, error: 'Failed to create preferences' };
    } catch {
      return { success: false, error: 'Failed to create preferences' };
    }
  },

  // Additional methods for worker/client management
  async updateWorker(workerId: string, update: Partial<Worker>): Promise<{ success: boolean; data?: Worker; error?: string }> {
    try {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
      return { success: false, error: 'Failed to update worker' };
    } catch (error) {
      console.error('Error updating worker:', error);
      return { success: false, error: 'Failed to update worker' };
    }
  },

  async deleteWorker(workerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        return { success: true };
      }
      return { success: false, error: 'Failed to delete worker' };
    } catch {
      return { success: false, error: 'Failed to delete worker' };
    }
  },

  async updateClient(): Promise<{ success: boolean; data?: Client; error?: string }> {
    return { success: true, data: {} as Client };
  },

  async deleteClient(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  },

  // Job management methods
  async updateJob(): Promise<{ success: boolean; data?: Job; error?: string }> {
    return { success: true, data: {} as Job };
  },

  async markJobAsComplete(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  },

  async createJob(): Promise<{ success: boolean; data?: Job; error?: string }> {
    return { success: true, data: {} as Job };
  },

  // Referrals
  async getReferrals(referrerId: string): Promise<{ success: boolean; data?: PaginatedResponse<Referral>; error?: string }> {
    try {
      const referrals = await readJsonFile<Referral>('referrals.json');
      const userReferrals = referrals.filter(r => r.referrerId === referrerId);
      
      return {
        success: true,
        data: {
          items: userReferrals,
          total: userReferrals.length,
          page: 1,
          limit: userReferrals.length,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch {
      return { success: false, error: 'Failed to load referrals' };
    }
  },

  async createReferral(referrerId: string, data: {
    referredEmail: string;
    referredName: string;
    referredPhone?: string;
    referredRole: 'worker' | 'client';
    message?: string;
  }): Promise<{ success: boolean; data?: Referral; error?: string }> {
    try {
      const newReferral: Referral = {
        id: `ref-${Date.now()}`,
        referrerId,
        referredEmail: data.referredEmail,
        referredName: data.referredName,
        referredPhone: data.referredPhone,
        referredRole: data.referredRole,
        status: 'SENT',
        message: data.message,
        bonusAmount: null,
        bonusStatus: null,
        referralCode: `REF${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { success: true, data: newReferral };
    } catch {
      return { success: false, error: 'Failed to create referral' };
    }
  },

  async getReferralBonus(referrerId: string): Promise<{ success: boolean; data?: { totalEarned: number; pending: number; paid: number }; error?: string }> {
    try {
      const referrals = await readJsonFile<Referral>('referrals.json');
      const userReferrals = referrals.filter(r => r.referrerId === referrerId);
      
      const totalEarned = userReferrals
        .filter(r => r.bonusAmount && r.bonusStatus === 'PAID')
        .reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
      
      const pending = userReferrals
        .filter(r => r.bonusAmount && r.bonusStatus === 'PENDING')
        .reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
      
      const paid = userReferrals
        .filter(r => r.bonusAmount && r.bonusStatus === 'PAID')
        .reduce((sum, r) => sum + (r.bonusAmount || 0), 0);

      return {
        success: true,
        data: {
          totalEarned,
          pending,
          paid
        }
      };
    } catch {
      return { success: false, error: 'Failed to load referral bonus data' };
    }
  },

  // Work History methods
  async getWorkHistory(workerId?: string): Promise<{ success: boolean; data?: PaginatedResponse<WorkHistory>; error?: string }> {
    try {
      const workHistory = await readJsonFile<WorkHistory>('work-history.json');
      if (workerId) {
        // Map user ID to worker ID
        const workers = await readJsonFile<Worker>('workers.json');
        const worker = workers.find(w => w.userId === workerId);
        if (worker) {
          const filteredHistory = workHistory.filter(wh => wh.workerId === worker.id);
          return {
            success: true,
            data: {
              items: filteredHistory,
              total: filteredHistory.length,
              page: 1,
              limit: filteredHistory.length,
              pages: 1,
              hasNext: false,
              hasPrev: false
            }
          };
        }
      }
      return {
        success: true,
        data: {
          items: workHistory,
          total: workHistory.length,
          page: 1,
          limit: workHistory.length,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch {
      return { success: false, error: 'Failed to load work history' };
    }
  },

  async addWorkHistoryEntry(workerId: string, entryData: Partial<WorkHistory>): Promise<{ success: boolean; data?: WorkHistory; error?: string }> {
    try {
      // Map user ID to worker ID
      const workers = await readJsonFile<Worker>('workers.json');
      const currentWorker = workers.find(w => w.id === workerId);
      
      if (!currentWorker) {
        return { success: false, error: 'Worker not found' };
      }

      const newEntry: WorkHistory = {
        id: `history-${Date.now()}`,
        workerId,
        employer: entryData.employer || 'Unknown',
        position: entryData.position || 'Unknown',
        location: entryData.location || 'Unknown',
        startDate: entryData.startDate || new Date().toISOString(),
        endDate: entryData.endDate,
        description: entryData.description || '',
        isCurrent: entryData.isCurrent || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { success: true, data: newEntry };
    } catch {
      return { success: false, error: 'Failed to add work history entry' };
    }
  },

  // Availability methods
  async getAvailability(workerId?: string): Promise<{ success: boolean; data?: Availability; error?: string }> {
    try {
      const availability = await readJsonFile<Availability>('availability.json');
      
      if (workerId) {
        // Map user ID to worker ID
        const workers = await readJsonFile<Worker>('workers.json');
        const worker = workers.find(w => w.userId === workerId);
        if (worker) {
          const workerAvailability = availability.find(a => a.workerId === worker.id);
          if (workerAvailability) {
            return { success: true, data: workerAvailability };
          }
        }
        return { success: false, error: 'Availability not found' };
      }
      
      return { success: false, error: 'Worker ID required' };
    } catch {
      return { success: false, error: 'Failed to load availability' };
    }
  },

  async updateAvailability(workerId: string, availabilityData: Partial<Availability>): Promise<{ success: boolean; data?: Availability; error?: string }> {
    try {
      // Map user ID to worker ID
      const workers = await readJsonFile<Worker>('workers.json');
      const currentWorker = workers.find(w => w.id === workerId);
      
      if (!currentWorker) {
        return { success: false, error: 'Worker not found' };
      }

      const updatedAvailability: Availability = {
        id: `availability-${workerId}`,
        workerId,
        availableDays: availabilityData.availableDays || [],
        availableFromDate: availabilityData.availableFromDate || new Date().toISOString(),
        notes: availabilityData.notes || '',
        updatedAt: new Date().toISOString()
      };

      return { success: true, data: updatedAvailability };
    } catch {
      return { success: false, error: 'Failed to update availability' };
    }
  },

  // Preference methods
  async getPreferences(workerId?: string): Promise<{ success: boolean; data?: Preference; error?: string }> {
    try {
      const preferences = await readJsonFile<Preference>('preferences.json');
      
      if (workerId) {
        // Map user ID to worker ID
        const workers = await readJsonFile<Worker>('workers.json');
        const worker = workers.find(w => w.userId === workerId);
        if (worker) {
          const workerPreferences = preferences.find(p => p.workerId === worker.id);
          if (workerPreferences) {
            return { success: true, data: workerPreferences };
          }
        }
        return { success: false, error: 'Preferences not found' };
      }
      
      return { success: false, error: 'Worker ID required' };
    } catch {
      return { success: false, error: 'Failed to load preferences' };
    }
  },

  async updatePreferences(workerId: string, preferencesData: Partial<Preference>): Promise<{ success: boolean; data?: Preference; error?: string }> {
    try {
      // Map user ID to worker ID
      const workers = await readJsonFile<Worker>('workers.json');
      const worker = workers.find(w => w.userId === workerId);
      
      if (!worker) {
        return { success: false, error: 'Worker not found' };
      }

      const updatedPreferences: Preference = {
        id: `pref-${Date.now()}`,
        workerId: worker.id,
        notifications: preferencesData.notifications || {
          email: true,
          sms: false,
          push: true
        },
        privacy: preferencesData.privacy || {
          profileVisibility: 'PUBLIC',
          showContactInfo: true
        },
        preferences: preferencesData.preferences || {
          preferredShiftType: ['Day'],
          maxTravelDistance: 30,
          minimumHourlyRate: 20
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { success: true, data: updatedPreferences };
    } catch {
      return { success: false, error: 'Failed to update preferences' };
    }
  },

  async getDocuments(): Promise<{ success: boolean; data?: Document[]; error?: string }> {
    try {
      const documents = await readJsonFile<Document>('documents.json');
      return { success: true, data: documents };
    } catch {
      return { success: false, error: 'Failed to load documents' };
    }
  }
};

// Export saveJob function that was referenced
export const saveJob = async (jobData: Partial<Job>) => {
  return { success: true, data: jobData };
}; 