import axios, {type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  Product,
  Investment,
  InvestmentSummary,
  TeamCommission,
  TeamStats,
  TeamMember,
  AuthResponse
} from '../types';  // Use type imports

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://https://afroconnect-r668.onrender.com/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || 'https://afroconnect-r668.onrender.com'}/token/refresh/`,
              { refresh: refreshToken }
            );

            localStorage.setItem('access_token', response.data.access);
            this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            }

            return this.api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login/', credentials);
    return response.data;
  }

  async register(data: any): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register/', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me/');
    return response.data;
  }
  // Profile Management
  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
  }): Promise<User> {
    const response = await this.api.patch('/auth/profile/', data);
    return response.data;
  }

  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> {
    const response = await this.api.post('/auth/change-password/', data);
    return response.data;
  }

  async uploadProfilePicture(formData: FormData): Promise<{ profile_picture: string }> {
    const response = await this.api.post('/auth/upload-profile-picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async submitKYC(formData: FormData): Promise<{ status: string; message: string }> {
    const response = await this.api.post('/auth/submit-kyc/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getKYCStatus(): Promise<{
    status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
    message?: string;
  }> {
    const response = await this.api.get('/auth/kyc-status/');
    return response.data;
  }


  // In api.ts
  async getTransactions(): Promise<any[]> {
    try {
      const response = await this.api.get('/transactions/');
      console.log('Raw transactions response:', response.data);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results; // For paginated responses
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with data property
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }

      console.warn('Unexpected transactions response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(id: string): Promise<any> {
    const response = await this.api.get(`/transactions/${id}/`);
    return response.data;
  }

  async createDeposit(data: any): Promise<any> {
    const response = await this.api.post('/transactions/deposit/', data);
    return response.data;
  }


  async createWithdrawal(data: any): Promise<any> {
    const response = await this.api.post('/transactions/withdraw/', data);
    return response.data;
  }

  async cancelTransaction(id: string): Promise<any> {
    const response = await this.api.post(`/transactions/${id}/cancel/`);
    return response.data;
  }

  async getTransactionSummary(): Promise<any> {
    const response = await this.api.get('/transactions/summary/');
    return response.data;
  }

  async getAdminTransactions(status?: string): Promise<any[]> {
    const url = status ? `/admin/transactions/?status=${status}` : '/admin/transactions/';
    const response = await this.api.get(url);
    return response.data;
  }

  async approveTransaction(transactionId: string): Promise<any> {
    const response = await this.api.post(`/admin/transactions/${transactionId}/approve/`);
    return response.data;
  }

  async rejectTransaction(transactionId: string): Promise<any> {
    const response = await this.api.post(`/admin/transactions/${transactionId}/reject/`);
    return response.data;
  }

  // Payment Methods
  async getPaymentMethods(): Promise<any[]> {
    const response = await this.api.get('/payment-methods/');
    return response.data;
  }

  async createPaymentMethod(data: any): Promise<any> {
    const response = await this.api.post('/payment-methods/', data);
    return response.data;
  }

  async updatePaymentMethod(id: string, data: any): Promise<any> {
    const response = await this.api.put(`/payment-methods/${id}/`, data);
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<any> {
    const response = await this.api.delete(`/payment-methods/${id}/`);
    return response.data;
  }

  async setDefaultPaymentMethod(id: string): Promise<any> {
    const response = await this.api.post(`/payment-methods/${id}/set_default/`);
    return response.data;
  }

  async updateNotificationPreferences(preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    marketing_emails?: boolean;
  }): Promise<{ preferences: any }> {
    const response = await this.api.patch('/auth/notification-preferences/', preferences);
    return response.data;
  }

  async enableTwoFactor(): Promise<{ qr_code: string; secret: string }> {
    const response = await this.api.post('/auth/enable-2fa/');
    return response.data;
  }

  async verifyTwoFactor(code: string): Promise<{ message: string }> {
    const response = await this.api.post('/auth/verify-2fa/', { code });
    return response.data;
  }

  async disableTwoFactor(): Promise<{ message: string }> {
    const response = await this.api.post('/auth/disable-2fa/');
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.api.post('/auth/logout/', { refresh: refreshToken });
  }

    // In your api.ts, update the getProducts method:

   async getProducts(): Promise<Product[]> {
      try {
        const response = await this.api.get('/products/');
        const data = response.data;

        console.log('Raw API response:', data); // Debug log

        let products: Product[] = [];

        // Handle different response formats
        if (Array.isArray(data)) {
          products = data;
        } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
          products = data.results;
        } else {
          console.warn('Unexpected products response format:', data);
          return [];
        }

        // Parse numeric fields for each product
        const parsedProducts = products.map(product => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          daily_income: typeof product.daily_income === 'string' ? parseFloat(product.daily_income) : product.daily_income,
          validity_period: typeof product.validity_period === 'string' ? parseInt(product.validity_period, 10) : product.validity_period,
          total_return: typeof product.total_return === 'string' ? parseFloat(product.total_return) : product.total_return,
          roi_percentage: typeof product.roi_percentage === 'string' ? parseFloat(product.roi_percentage) : product.roi_percentage,
          b_commission: typeof product.b_commission === 'string' ? parseFloat(product.b_commission) : product.b_commission,
          c_commission: typeof product.c_commission === 'string' ? parseFloat(product.c_commission) : product.c_commission,
          d_commission: typeof product.d_commission === 'string' ? parseFloat(product.d_commission) : product.d_commission,
        }));

        console.log('Parsed products:', parsedProducts); // Debug log
        return parsedProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    }

  async updateUserCurrency(currencyCode: string): Promise<any> {
    const response = await this.api.post('/auth/currency/', {
      preferred_currency: currencyCode
    });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(`/products/${id}/`);
    return response.data;
  }

  async getActiveProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/active/');
    return response.data;
  }

  async calculateReturns(productId: string, amount?: number): Promise<any> {
    const url = amount
      ? `/products/${productId}/calculate_returns/?amount=${amount}`
      : `/products/${productId}/calculate_returns/`;
    const response = await this.api.get(url);
    return response.data;
  }

  // Admin product endpoints
  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await this.api.post('/products/', data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await this.api.put(`/products/${id}/`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/products/${id}/`);
  }

    // In api.ts, update the getInvestments method:

    async getInvestments(): Promise<Investment[]> {
      try {
        const response = await this.api.get('/investments/');
        console.log('Raw investments response:', response.data);

        // Handle paginated response with results array
        if (response.data && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // Handle direct array response
        else if (Array.isArray(response.data)) {
          return response.data;
        }
        // Handle response with count and results
        else if (response.data && typeof response.data === 'object') {
          if ('results' in response.data && Array.isArray(response.data.results)) {
            return response.data.results;
          }
        }

        console.warn('Unexpected investments response format:', response.data);
        return [];
      } catch (error) {
        console.error('Error fetching investments:', error);
        throw error;
      }
    }

  async getInvestment(id: string): Promise<Investment> {
    const response = await this.api.get(`/investments/${id}/`);
    return response.data;
  }

  async createInvestment(productId: string, amount: number): Promise<Investment> {
    const response = await this.api.post('/investments/', {
      product_id: productId,
      amount: amount
    });
    return response.data;
  }

  async cancelInvestment(id: string): Promise<void> {
    await this.api.post(`/investments/${id}/cancel/`);
  }

  async getInvestmentSummary(): Promise<InvestmentSummary> {
    const response = await this.api.get('/investments/summary/');
    return response.data;
  }

  // Team endpoints
  async getTeamCommissions(): Promise<TeamCommission[]> {
    const response = await this.api.get('/team/commissions/');
    return response.data;
  }

  async getTeamStats(): Promise<TeamStats> {
    const response = await this.api.get('/team/stats/my_stats/');
    return response.data;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await this.api.get('/team/team_members/');
    return response.data;
  }
  async checkInvestmentEligibility(amount: number): Promise<{
    can_invest: boolean;
    available_balance: number;
    required_amount: number;
    shortfall: number;
  }> {
    const response = await this.api.get(`/investments/can_invest/?amount=${amount}`);
    return response.data;
  }
  async getLevel1Members(): Promise<User[]> {
    const response = await this.api.get('/team/level_1/');
    return response.data;
  }

  async getLevel2Members(): Promise<User[]> {
    const response = await this.api.get('/team/level_2/');
    return response.data;
  }

  async getLevel3Members(): Promise<User[]> {
    const response = await this.api.get('/team/level_3/');
    return response.data;
  }

  async getCommissionsSummary(): Promise<any> {
    const response = await this.api.get('/team/commissions_summary/');
    return response.data;
  }

  async getCommissionHistory(level?: string, status?: string): Promise<TeamCommission[]> {
    let url = '/team/commission_history/';
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await this.api.get(url);
    return response.data;
  }

    async recalculateTeamStats(): Promise<TeamStats> {
      const response = await this.api.post('/team/stats/recalculate/');
      return response.data;
    }

  async getLevelBreakdown(): Promise<any> {
    const response = await this.api.get('/team/stats/level_breakdown/');
    return response.data;
  }
}

export default new ApiService();