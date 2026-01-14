/**
 * Authentication API
 * Functions for authentication-related API calls
 */

import { post } from '@/api';

/**
 * Login request payload
 */
export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

/**
 * User information returned from API
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'client' | 'admin';
  is_active: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
}

/**
 * Login user with email/username and password
 * @param credentials - Login credentials
 * @returns Promise resolving to login response with token and user info
 * @throws Error if login fails
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await post<LoginResponse, LoginRequest>('/auth/login', credentials);
    return response;
  } catch (error: unknown) {
    // Re-throw with more context if needed
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Login failed. Please try again.');
  }
};
