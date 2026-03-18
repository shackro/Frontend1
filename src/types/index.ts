// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  referral_code: string;
  referral_link: string;
  referral_count: number;
  referred_by: string | null;
  balance: number;
  total_invested: number;
  total_earned: number;
  total_withdrawn: number;
  available_balance: number;
  is_kyc_verified: boolean;
  is_staff: boolean;
  profile: UserProfile;
  created_at: string;
  preferred_currency?: 'USD' | 'KES' | 'EUR'; // Add this
}

export interface UserProfile {
  profile_picture: string | null;
  date_of_birth: string | null;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  occupation: string;
  two_factor_enabled: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  daily_income: number;
  validity_period: number;
  b_commission: number;
  c_commission: number;
  d_commission: number;
  description: string;
  min_investment: number | null;
  max_investment: number | null;
  is_active: boolean;
  image: string | null;
  total_return: number;
  roi_percentage: number;
  daily_roi_percentage: number;
  created_at: string;
}

// Investment Types
export interface Investment {
  id: string;
  user: string;
  product: Product;
  product_details: Product;
  amount: number;
  daily_income: number;
  start_date: string;
  end_date: string;
  last_payout_date: string | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  total_expected_return: number;
  total_paid: number;
  remaining_payouts: number;
  days_remaining: number;
  progress_percentage: number;
  earned_so_far: number;
  created_at: string;
}

export interface InvestmentSummary {
  total_investments: number;
  total_invested: number;
  active_investments: number;
  active_amount: number;
  total_earned: number;
  expected_returns: number;
  projected_profit: number;
}

// Team Types
export interface TeamCommission {
  id: string;
  user: string;
  from_user: string;
  from_user_details: User;
  investment: string;
  investment_details: Investment;
  level: 'B' | 'C' | 'D';
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_date: string | null;
  created_at: string;
}

export interface TeamStats {
  id: string;
  user: string;
  user_details: User;
  total_referrals: number;
  level_1_count: number;
  level_2_count: number;
  level_3_count: number;
  active_referrals: number;
  level_1_volume: number;
  level_2_volume: number;
  level_3_volume: number;
  team_volume: number;
  personal_volume: number;
  total_commission_earned: number;
  pending_commission: number;
  level_1_commission: number;
  level_2_commission: number;
  level_3_commission: number;
  total_bonus_earned: number;      // Add this
  bonus_count: number;              // Add this
  current_level: 'B' | 'C' | 'D';
  base_currency: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  depth: number;
  referral_level: string;
  total_invested: number;
  joined_at: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  referral_code?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}