import apiClient from '@/api/client';
import type { QueryParams, RequestConfig } from '@/api/types';

/**
 * HTTP GET request
 *
 * @template T - The expected response data type
 * @param {string} url - The endpoint URL (relative to base URL)
 * @param {QueryParams} params - Optional query parameters
 * @param {RequestConfig} config - Optional Axios request configuration
 * @returns {Promise<T>} The response data
 *
 * @example
 * ```typescript
 * interface User { id: number; name: string; }
 * const user = await api.get<User>('/users/123');
 * const users = await api.get<User[]>('/users', { page: 1, limit: 10 });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function get<T = any>(
  url: string,
  params?: QueryParams,
  config?: RequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(url, {
    ...config,
    params,
  });
  return response.data;
}

/**
 * HTTP POST request
 *
 * @template T - The expected response data type
 * @template D - The request body data type
 * @param {string} url - The endpoint URL (relative to base URL)
 * @param {D} data - The request body data
 * @param {RequestConfig} config - Optional Axios request configuration
 * @returns {Promise<T>} The response data
 *
 * @example
 * ```typescript
 * interface User { id: number; name: string; }
 * interface CreateUserDto { name: string; email: string; }
 * const newUser = await api.post<User, CreateUserDto>('/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function post<T = any, D = any>(
  url: string,
  data?: D,
  config?: RequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * HTTP PUT request
 *
 * @template T - The expected response data type
 * @template D - The request body data type
 * @param {string} url - The endpoint URL (relative to base URL)
 * @param {D} data - The request body data
 * @param {RequestConfig} config - Optional Axios request configuration
 * @returns {Promise<T>} The response data
 *
 * @example
 * ```typescript
 * interface User { id: number; name: string; }
 * interface UpdateUserDto { name?: string; email?: string; }
 * const updatedUser = await api.put<User, UpdateUserDto>('/users/123', {
 *   name: 'Jane Doe'
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function put<T = any, D = any>(
  url: string,
  data?: D,
  config?: RequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * HTTP DELETE request
 *
 * @template T - The expected response data type
 * @param {string} url - The endpoint URL (relative to base URL)
 * @param {RequestConfig} config - Optional Axios request configuration
 * @returns {Promise<T>} The response data (if any)
 *
 * @example
 * ```typescript
 * await api.delete('/users/123');
 * // Or with response data
 * const result = await api.delete<{ success: boolean }>('/users/123');
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function del<T = any>(url: string, config?: RequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

/**
 * Export all HTTP methods as a single API object
 */
export const api = {
  get,
  post,
  put,
  delete: del,
};

/**
 * Export the configured Axios client for advanced use cases
 */
export { apiClient };

/**
 * Export types
 */
export type { ApiResponse, ApiError, RequestConfig, QueryParams } from '@/api/types';
