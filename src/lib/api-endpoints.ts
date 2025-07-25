import { enhancedApiClient } from './enhanced-api-client';
import type { ApiResponse } from './enhanced-api-client';

// Auth API endpoints
export const authApi = {
  // Login (no auth required)
  login: (credentials: { username: string; password: string }) =>
    enhancedApiClient.publicPost<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        full_name: string;
      };
      token: string;
    }>('/auth/login', credentials),

  // Get profile (auth required)
  getProfile: () =>
    enhancedApiClient.get<{
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        full_name: string;
      };
    }>('/auth/profile'),

  // Change password (auth required)
  changePassword: (passwords: { oldPassword: string; newPassword: string }) =>
    enhancedApiClient.put<{ message: string }>('/auth/change-password', passwords),
};

// User API endpoints
export const userApi = {
  // Get all users
  getUsers: () =>
    enhancedApiClient.get<any[]>('/user'),

  // Get user by ID
  getUser: (userId: string) =>
    enhancedApiClient.get<any>(`/user/${userId}`),
};

// Transaction API endpoints
export const transactionApi = {
  // Get transactions with filters
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    vehicle_id?: string;
    personnel_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{
      transactions: any[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/transactions${queryString}`);
  },

  // Get single transaction
  getTransaction: (id: string) =>
    enhancedApiClient.get<any>(`/transactions/${id}`),

  // Create transaction
  createTransaction: (data: {
    vehicle_id: string;
    category_id: string;
    amount: number;
    expense?: number;
    is_expense?: boolean;
    description: string;
    transaction_date: string;
  }) =>
    enhancedApiClient.post<{ message: string; transaction: any }>('/transactions', data),

  // Update transaction
  updateTransaction: (id: string, data: {
    vehicle_id?: string;
    personnel_id?: string | null;
    category_id?: string;
    amount?: number;
    expense?: number;
    is_expense?: boolean;
    description?: string;
    date?: string;
    payment_method?: string;
    notes?: string;
  }) =>
    enhancedApiClient.put<{ message: string; transaction: any }>(`/transactions/${id}`, data),

  // Delete transaction
  deleteTransaction: (id: string) =>
    enhancedApiClient.delete<{ message: string }>(`/transactions/${id}`),

  // Get transactions by vehicle plate
  getTransactionsByVehicle: (plate: string) =>
    enhancedApiClient.get<{ transactions: any[] }>(`/transactions/by-plate/${plate}`),

  // Get transactions by category
  getTransactionsByCategory: (categoryId: string) =>
    enhancedApiClient.get<{ transactions: any[] }>(`/transactions/category/${categoryId}`),

  // Get transaction history
  getTransactionHistory: (transactionId: string) =>
    enhancedApiClient.get<{ history: any[] }>(`/transactions/${transactionId}/history`),

  // Update transaction status
  updateTransactionStatus: (transactionId: string, data: { status: string; notes?: string }) =>
    enhancedApiClient.patch<{ message: string }>(`/transactions/${transactionId}/status`, data),

  // Get transaction statistics
  getTransactionStats: (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{
      stats: {
        total_transactions: number;
        total_revenue: number;
        total_expenses: number;
        net_profit: number;
      };
    }>(`/transactions/stats/overview${queryString}`);
  },

  // Get transaction summary stats
  getTransactionsSummaryStats: (params?: {
    vehicle_id?: string;
    personnel_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{
      stats: {
        total_revenue: number;
        total_expenses: number;
        net_profit: number;
        transaction_count: number;
      };
    }>(`/transactions/stats/summary${queryString}`);
  },
};

// Vehicle API endpoints
export const vehicleApi = {
  // Get vehicles with pagination and search
  getVehicles: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{
      vehicles: any[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/vehicles${queryString}`);
  },

  // Get customers (vehicles grouped by customer)
  getCustomers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{
      customers: any[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/vehicles/customers${queryString}`);
  },

  // Get single vehicle by plate
  getVehicle: (plate: string) =>
    enhancedApiClient.get<{ vehicle: any }>(`/vehicles/${plate}`),

  // Create vehicle
  createVehicle: (data: {
    plate: string;
    year: number;
    customer_email?: string;
    customer_phone?: string;
  }) =>
    enhancedApiClient.post<{ message: string; vehicle: any }>('/vehicles', data),

  // Update vehicle
  updateVehicle: (plate: string, data: {
    year?: number;
    customer_email?: string;
    customer_phone?: string;
  }) =>
    enhancedApiClient.put<{ message: string; vehicle: any }>(`/vehicles/${plate}`, data),

  // Delete vehicle
  deleteVehicle: (plate: string) =>
    enhancedApiClient.delete<{ message: string }>(`/vehicles/${plate}`),

  // Get vehicle statistics
  getVehicleStats: () =>
    enhancedApiClient.get<{
      stats: {
        total_vehicles: number;
        active_vehicles: number;
      };
    }>('/vehicles/stats/overview'),

  // Get customer statistics
  getCustomerStats: () =>
    enhancedApiClient.get<{
      stats: {
        total_customers: number;
        customers_with_transactions: number;
      };
    }>('/vehicles/customer-stats'),

  // Get top customers
  getTopCustomers: (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return enhancedApiClient.get<any[]>(`/vehicles/top-customers${queryString}`);
  },

  // Get customer revenue share
  getCustomerRevenueShare: () =>
    enhancedApiClient.get<any[]>('/vehicles/customer-revenue-share'),
};

// Personnel API endpoints
export const personnelApi = {
  // Get personnel with filters
  getPersonnel: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{
      personnel: any[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/personnel${queryString}`);
  },

  // Get personnel by ID
  getPersonnelById: (id: string) =>
    enhancedApiClient.get<{ personnel: any }>(`/personnel/${id}`),

  // Create personnel
  createPersonnel: (data: {
    full_name: string;
    username?: string;
    email: string;
    phone?: string;
    hire_date?: string;
    status: string;
    notes?: string;
    password?: string;
    role?: string;
  }) =>
    enhancedApiClient.post<{ message: string; personnel: any }>('/personnel', data),

  // Update personnel
  updatePersonnel: (id: string, data: {
    full_name?: string;
    username?: string;
    email?: string;
    phone?: string;
    hire_date?: string;
    status?: string;
    notes?: string;
    is_active?: boolean;
    role?: string;
  }) =>
    enhancedApiClient.put<{ message: string; personnel: any }>(`/personnel/${id}`, data),

  // Delete personnel
  deletePersonnel: (id: string) =>
    enhancedApiClient.delete<{ message: string }>(`/personnel/${id}`),

  // Get personnel statistics
  getPersonnelStats: () =>
    enhancedApiClient.get<{
      stats: {
        active_personnel: number;
        total_personnel: number;
      };
    }>('/personnel/stats/overview'),
};

// Transaction Categories API endpoints
export const categoryApi = {
  // Get all categories
  getTransactionCategories: () =>
    enhancedApiClient.get<{ categories: any[] }>('/transaction-categories'),

  // Create category
  createTransactionCategory: (data: { name: string }) =>
    enhancedApiClient.post<{ message: string; category: any }>('/transaction-categories', data),

  // Update category
  updateTransactionCategory: (id: string, data: { name: string }) =>
    enhancedApiClient.put<{ message: string; category: any }>(`/transaction-categories/${id}`, data),

  // Delete category
  deleteTransactionCategory: (id: string) =>
    enhancedApiClient.delete<{ message: string }>(`/transaction-categories/${id}`),
};

// Activities API endpoints
export const activityApi = {
  // Get activities
  getActivities: () =>
    enhancedApiClient.get<any[]>('/activities'),

  // Get total revenue
  getTotalRevenue: () =>
    enhancedApiClient.get<{ total_revenue: number }>('/activities/total-revenue'),

  // Get monthly revenue
  getMonthlyRevenue: (params?: { year?: number; month?: number }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{ revenue: number; period: string }>(`/activities/monthly-revenue${queryString}`);
  },

  // Get yearly revenue
  getYearlyRevenue: (params?: { year?: number }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{ revenue: number; year: number }>(`/activities/yearly-revenue${queryString}`);
  },

  // Get category revenue
  getCategoryRevenue: (params?: {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}` : '';
    
    return enhancedApiClient.get<{ revenue: number; category: string }>(`/activities/category-revenue${queryString}`);
  },

  // Get category yearly revenue
  getCategoryYearlyRevenue: (params: { categoryId?: string; year?: number }) => {
    const queryString = `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}`;
    
    return enhancedApiClient.get<{ revenue: number }>(`/activities/category-yearly-revenue${queryString}`);
  },

  // Get category monthly revenue
  getCategoryMonthlyRevenue: (params: { categoryId?: string; year?: number; month?: number }) => {
    const queryString = `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}`;
    
    return enhancedApiClient.get<{ revenue: number }>(`/activities/category-monthly-revenue${queryString}`);
  },

  // Get category weekly revenue
  getCategoryWeeklyRevenue: (params: { categoryId?: string; year?: number; week?: number }) => {
    const queryString = `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}`;
    
    return enhancedApiClient.get<{ revenue: number }>(`/activities/category-weekly-revenue${queryString}`);
  },

  // Get category daily revenue
  getCategoryDailyRevenue: (params: { categoryId?: string; date?: string }) => {
    const queryString = `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}`;
    
    return enhancedApiClient.get<{ revenue: number }>(`/activities/category-daily-revenue${queryString}`);
  },

  // Get category custom date range revenue
  getCategoryCustomRevenue: (params: {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryString = `?${new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()}`;
    
    return enhancedApiClient.get<{ revenue: number }>(`/activities/category-custom-revenue${queryString}`);
  },
};

// Health check endpoint
export const healthApi = {
  // Health check (public endpoint)
  check: () => enhancedApiClient.healthCheck(),
};

// Export everything as a combined API object
export const api = {
  auth: authApi,
  user: userApi,
  transaction: transactionApi,
  vehicle: vehicleApi,
  personnel: personnelApi,
  category: categoryApi,
  activity: activityApi,
  health: healthApi,
};

// Export individual APIs for convenience
export {
  authApi,
  userApi,
  transactionApi,
  vehicleApi,
  personnelApi,
  categoryApi,
  activityApi,
  healthApi,
};

export default api; 