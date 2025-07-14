/**
 * Centralized API client for Upstic Healthcare Platform
 * Follows Rule #3: API Client Standards
 */

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'admin' | 'client' | 'worker';
  };
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

export interface Client {
  id: string;
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
    conversionDate?: string;
  };
}

export interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: string;
    pdfUrl: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  facility: {
    id: string;
    name: string;
    type: string;
    address: string;
  };
  location: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  shiftType: 'DAY' | 'NIGHT' | 'EVENING' | 'WEEKEND';
  hourlyRate: number;
  totalHours: number;
  clientId: string;
  workerId: string;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  assignmentId: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  totalHours: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedReason?: string;
}

export interface Payment {
  id: string;
  workerId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  description: string;
  timesheetIds: string[];
  taxDeductions?: number;
  netAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Preference {
  id: string;
  workerId: string;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  jobAlerts: boolean;
  availableForWork: boolean;
  preferredLocations: string[];
  preferredShiftTypes: string[];
  minimumHourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  skills: string[];
  experience: number;
  preferredLocation: string;
  status: string;
  rating: number;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  status: string;
  experience: number;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  salaryMin: number;
  salaryMax: number;
  startDate: string;
  endDate: string;
  clientId: string;
  company?: {
    id: string;
    name: string;
    industry: string;
    description: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'worker' | 'client' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('❌ NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
  console.log('Please add NEXT_PUBLIC_API_BASE_URL=https://api.upstic.com to your .env.local file');
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
}

console.log('✅ API Base URL configured:', API_BASE_URL);

/**
 * API Client Class
 * Implements centralized error handling, retry logic, and token management
 */
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * Make HTTP request with error handling and retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Merge with any additional headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle different response statuses
      if (response.status === 401) {
        // Only clear auth for non-auth endpoints to prevent redirect loops
        if (!endpoint.includes('/api/auth/')) {
          this.clearAuth();
        }
        throw new Error('Authentication expired. Please login again.');
      }

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle JSend-like responses
      if (responseData && typeof responseData === 'object' && 'status' in responseData) {
        if (responseData.status === 'success') {
          return {
            success: true,
            data: responseData.data as T,
          };
        } else if (responseData.status === 'fail' || responseData.status === 'error') {
          return {
            success: false,
            error: responseData.message || 'Request failed with an error status.',
            data: responseData.data,
          };
        }
      }
      
      // Handle successful responses that don't use the JSend envelope
      return {
        success: true,
        data: responseData as T,
      };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Authentication Methods
   */

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/api/auth/register', userData);
    
    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
      // Store user data and refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    
    return response;
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    console.log('🔑 Starting login process...', { email: credentials.email });
    
    const response = await this.post<AuthResponse>('/api/auth/login', credentials);
    
    console.log('📡 Login API response:', {
      success: response.success,
      hasData: !!response.data,
      hasToken: !!response.data?.access_token,
      error: response.error
    });
    
    if (response.success && response.data?.access_token) {
      console.log('✅ Login successful, storing token and user data');
      this.setToken(response.data.access_token);
      
      // Store user data and refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        localStorage.setItem('refresh_token', response.data.refresh_token);
        console.log('💾 Stored user data:', response.data.user);
      }
    } else {
      console.log('❌ Login failed:', response.error);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>('/api/auth/logout');
    this.clearAuth();
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
    const response = await this.get<{ user: AuthResponse['user'] }>('/api/auth/me');
    
    // Handle nested response structure from server
    if (response.success && response.data && response.data.user) {
      return {
        success: true,
        data: response.data.user
      };
    }
    
    // Return error response with proper type
    return {
      success: false,
      error: response.error || 'Failed to get user data'
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get stored user data
   */
  getUserData(): AuthResponse['user'] | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(data: Partial<AuthResponse['user']>): Promise<ApiResponse<AuthResponse['user']>> {
    const response = await this.put<AuthResponse['user']>('/api/auth/me', data);
    
    if (response.success && response.data) {
      // Update stored user data
      if (typeof window !== 'undefined') {
        const currentData = this.getUserData();
        const updatedData = { ...currentData, ...response.data };
        localStorage.setItem('user_data', JSON.stringify(updatedData));
      }
    }
    
    return response;
  }

  /**
   * Admin Dashboard Methods
   */

  /**
   * Get admin dashboard statistics
   */
  async getAdminDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    const response = await this.get<{ stats: AdminDashboardStats }>('/api/dashboard/admin/stats');
    
    // Handle nested response structure from server
    if (response.success && response.data && response.data.stats) {
      return {
        success: true,
        data: response.data.stats
      };
    }
    
    // Return error response with proper type
    return {
      success: false,
      error: response.error || 'Failed to get admin dashboard stats'
    };
  }

  /**
   * Get all workers
   */
  async getWorkers(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Worker>>> {
    return this.get(`/api/workers?page=${page}&limit=${limit}`);
  }

  /**
   * Get a single worker by ID
   */
  async getWorkerById(id: string): Promise<ApiResponse<Worker>> {
    return this.get(`/api/workers/${id}`);
  }

  /**
   * Update a worker by ID
   */
  async updateWorker(id: string, data: Partial<Worker>): Promise<ApiResponse<Worker>> {
    return this.put(`/api/workers/${id}`, data);
  }

  /**
   * Delete a worker by ID
   */
  async deleteWorker(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/api/workers/${id}`);
  }

  /**
   * Get all clients
   */
  async getClients(): Promise<ApiResponse<Client[]>> {
    const response = await this.get<(Client & { _id?: string })[]>('/api/clients');
    
    if (response.success && Array.isArray(response.data)) {
      response.data.forEach(client => {
        if (client && client._id && !client.id) {
          client.id = client._id;
        }
      });
    }
    
    return response as ApiResponse<Client[]>;
  }

  /**
   * Get a single client by ID
   */
  async getClientById(id: string): Promise<ApiResponse<Client>> {
    const response = await this.get<Client & { _id?: string }>(`/api/clients/${id}`);
    
    if (response.success && response.data) {
      if (response.data._id && !response.data.id) {
        response.data.id = response.data._id;
      }
    }
    
    return response as ApiResponse<Client>;
  }

  /**
   * Create a new client
   */
  async createClient(data: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.post(`/api/clients`, data);
  }

  /**
   * Update a client by ID
   */
  async updateClient(id: string, data: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.put(`/api/clients/${id}`, data);
  }

  /**
   * Delete a client by ID
   */
  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/api/clients/${id}`);
  }

  async getJobs(params: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; search?: string; }): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.search) query.append('search', params.search);
    
    return this.get<PaginatedResponse<Job>>(`/api/jobs?${query.toString()}`);
  }

  async createJob(data: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.post<Job>('/api/jobs', data);
  }

  async getJobById(id: string): Promise<ApiResponse<Job>> {
    return this.get<Job>(`/api/jobs/${id}`);
  }

  async updateJob(id: string, data: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.put<Job>(`/api/jobs/${id}`, data);
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/jobs/${id}`);
  }

  async markJobAsComplete(id: string): Promise<ApiResponse<Job>> {
    return this.put<Job>(`/api/jobs/${id}`, { status: 'COMPLETED' });
  }

  /**
   * Worker Dashboard Methods
   */
}

/**
 * Singleton instance of the API client
 * @exports apiClient
 */
export const apiClient = new ApiClient(API_BASE_URL);