import * as React from 'react';
import { apiClient } from '../api/client';
import { MeResponse, ApiError, ApiResult } from '../api/types';

// Debug logging helper
const debugLog = (message: string, ...args: any[]) => {
  if (typeof globalThis.process !== 'undefined' && globalThis.process.env.NODE_ENV === 'development') {
    globalThis.console.log(`[useWorkOSAuth] ${message}`, ...args);
  }
};



// Use globalThis.process for browser compatibility
const DEBUG_BYPASS_BACKEND_USER_FETCH = (typeof globalThis.process !== 'undefined' && globalThis.process.env && globalThis.process.env.NEXT_PUBLIC_DEBUG_BYPASS_BACKEND_USER_FETCH === 'true');

const DEBUG_HARDCODED_USER: MeResponse = {
  id: 'debug-user-id',
  email: 'debug@example.com',
  is_admin: true,
  workos_user_id: 'debug-workos-user-id',
  full_name: 'Debug User',
  // Removed 'session' property to match MeResponse type
};

// No-op: AuthKit removed. This hook is now a stub.
export function useWorkOSAuth() {
  return {};
}
