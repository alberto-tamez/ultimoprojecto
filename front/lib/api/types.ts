// Base API response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// User type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Add other user fields as needed
}

// Auth types

/**
 * Logout (POST /api/auth/logout)
 * Output: { workos_logout_url: string }
 */
export interface LogoutResponse {
  workos_logout_url: string;
}

/**
 * Get Authenticated User (GET /api/auth/me)
 * Input: (session cookie sent implicitly)
 * Output: {
 *   id: string;
 *   workos_user_id: string;
 *   email: string;
 *   full_name: string;
 *   is_admin: boolean;
 *   // ...other app-specific fields
 * }
 */
export interface MeResponse {
  id: string;
  workos_user_id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  // You can add more fields as needed
}

/**
 * Initiate Login (GET /api/auth/login)
 * Output: { authorization_url: string }
 */
export interface LoginInitiationResponse {
  authorization_url: string;
}

/**
 * Handle WorkOS OAuth Callback (GET /api/auth/callback)
 * Input: { code: string, state?: string } (from query params)
 * Output: { user: User, session_token: string } on success
 *         { error: string } on error
 *
 * In production, this should be handled by the backend.
 * For frontend testing, this interface is used for simulation.
 */
export interface CallbackInput {
  code: string;
  state?: string;
}

export interface CallbackSuccess {
  user: User;
  session_token: string;
}

export interface CallbackError {
  error: string;
}


// Error response type
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// API response with error handling
export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };
