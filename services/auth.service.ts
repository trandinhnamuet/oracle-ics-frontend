import { fetchWithAuth, fetchJsonWithAuth } from '@/lib/fetch-wrapper';
import { getClientIp } from '@/lib/ip-service';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company?: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

const ACCESS_TOKEN_KEY = 'oracle_access_token';

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    // Restore access token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Get client IP from ipify.org (public IP)
    const ipData = await getClientIp();
    console.log('Client IP data in login:', ipData);

    // Login should NOT use fetchWithAuth wrapper to avoid circular refresh
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: send cookies
      body: JSON.stringify({ email, password, ipv4: ipData.ipv4, ipv6: ipData.ipv6 }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    this.accessToken = data.accessToken;
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    return data;
  }

  async refresh(): Promise<string> {
    // Refresh should NOT use fetchWithAuth to avoid circular refresh
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.accessToken = data.accessToken;
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    return data.accessToken;
  }

  async logout(): Promise<void> {
    try {
      await fetchWithAuth(`${API_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout request failed:', error);
    } finally {
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await fetchWithAuth(`${API_URL}/auth/logout-all`, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout-all request failed:', error);
    } finally {
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // If no access token, try to refresh from cookie first
    if (!this.accessToken) {
      try {
        console.log('No access token, attempting refresh...');
        await this.refresh();
        console.log('Token refreshed successfully');
        // After refresh, access token should be set, fall through to fetch user
      } catch (error) {
        // No valid refresh token cookie
        console.log('Refresh failed, user not authenticated');
        return null;
      }
    }

    // Now we have accessToken, verify it's still valid
    if (!this.accessToken) {
      console.log('No access token after refresh attempt');
      return null;
    }

    try {
      console.log('Fetching current user with token...');
      const response = await fetchWithAuth(`${API_URL}/auth/me`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.log('Failed to fetch user, status:', response.status);
        if (response.status === 401) {
          // Token is invalid, clear it
          this.accessToken = null;
          if (typeof window !== 'undefined') {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
          }
        }
        return null;
      }

      const data = await response.json();
      console.log('Successfully fetched user:', data.user.email);
      return data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // On any error, clear token and return null
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }

  clearAccessToken(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export const authService = new AuthService();
