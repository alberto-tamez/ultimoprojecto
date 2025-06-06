import { 
  User, 
  ApiResponse, 
  LoginInitiationResponse,
  ApiError,
  ApiResult
} from './types';

/**
 * API Client for making HTTP requests to the backend
 * Handles authentication, error handling, and request/response transformation
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    // Load from environment variables with fallback for development
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make an HTTP request with proper error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        credentials: 'include', // Important for cookies/session
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || `Request failed with status ${response.status}`,
            code: data.code || `HTTP_${response.status}`,
            details: data.details
          }
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }

  // ===== Auth Methods =====
  
  /**
   * Initiate the login process
   * @returns The authorization URL to redirect to
   */
  async initiateLogin(): Promise<ApiResult<LoginInitiationResponse>> {
    return this.request<LoginInitiationResponse>('/api/auth/login', {
      method: 'GET',
      credentials: 'include'
    });
  }

  /**
   * Get the current authenticated user (MOCK for frontend testing)
   * In production, this should call the backend endpoint GET /api/auth/me.
   * Output matches MeResponse type.
   */
  async getCurrentUser(): Promise<ApiResult<import('./types').MeResponse>> {
    // Return dummy user data for frontend-only testing (matches backend contract)
    return {
      success: true,
      data: {
        id: 'user-123',
        workos_user_id: 'workos_user_xyz',
        email: 'user@example.com',
        full_name: 'User Full Name',
        is_admin: false,
        // ...add more fields as needed for your app
      }
    };
  }

  // ===== User Profile Methods =====
  
  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<ApiResult<User>> {
    return this.request<User>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
      credentials: 'include'
    });
  }

  // ===== Auth Methods =====

  /**
   * Logout the current user
   * POST /api/auth/logout
   * Output: { workos_logout_url: string }
   * In production, this should call the backend endpoint.
   */
  async logout(): Promise<{ workos_logout_url: string }> {
    // Call the backend logout endpoint
    const response = await this.request<{ workos_logout_url: string }>('auth/logout', {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  }

  // ===== Utility Methods =====
  
  /**
   * Check if the error is an API error
   */
  isApiError(error: unknown): error is { success: false; error: ApiError } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'success' in error &&
      error.success === false &&
      'error' in error &&
      typeof (error as any).error === 'object' &&
      'message' in (error as any).error
    );
  }

  /**
   * Simulate handling the WorkOS callback (should be backend-only in production!)
   *
   * @param input { code: string, state?: string }
   * @returns { user: User, session_token: string } on success OR { error: string } on error
   *
   * In production, this should be handled by the backend.
   * For frontend testing, this simulates the backend response.
   */
  async handleWorkOSCallback(input: { code: string; state?: string }): Promise<{ user: User; session_token: string } | { error: string }> {
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!input.code) {
      return { error: 'Missing code parameter' };
    }
    // Return dummy data for testing
    return {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      session_token: 'dummy-session-token',
    };
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Example usage:
/*
import { apiClient } from '@/lib/api/client';

// In a component or hook:
const { data: user, error } = await apiClient.getCurrentUser();
if (error) {
  console.error('Failed to fetch user:', error);
}
*/
