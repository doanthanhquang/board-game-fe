/**
 * Users API Client
 * Handles admin user management API calls
 */

import apiClient from './client';
import type { ApiResponse, PaginatedResponse, PaginationParams } from './types';

/**
 * User data structure
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'client' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/**
 * User list query parameters
 */
export interface ListUsersParams extends PaginationParams {
  search?: string;
  role?: 'client' | 'admin';
}

/**
 * Create user request data
 */
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  role?: 'client' | 'admin';
  is_active?: boolean;
}

/**
 * Update user request data
 */
export interface UpdateUserData {
  email?: string;
  username?: string;
  role?: 'client' | 'admin';
  is_active?: boolean;
}

/**
 * List all users with pagination and optional search/filtering
 * @param params - Query parameters (page, pageSize, search, role)
 * @returns Paginated list of users
 */
export const listUsers = async (
  params?: ListUsersParams
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
    params,
  });
  return response.data;
};

/**
 * Get user by ID
 * @param id - User ID
 * @returns User data
 */
export const getUser = async (id: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  return response.data;
};

/**
 * Create a new user
 * @param data - User creation data
 * @returns Created user data
 */
export const createUser = async (data: CreateUserData): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
  return response.data;
};

/**
 * Update user information
 * @param id - User ID
 * @param data - User update data
 * @returns Updated user data
 */
export const updateUser = async (id: string, data: UpdateUserData): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
  return response.data;
};

/**
 * Delete user (soft delete)
 * @param id - User ID
 * @returns Success response
 */
export const deleteUser = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/admin/users/${id}`);
  return response.data;
};
