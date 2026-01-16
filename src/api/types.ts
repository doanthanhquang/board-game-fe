/**
 * Shared API types
 */

import type { AxiosRequestConfig } from 'axios';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Query parameters for API requests
 */
export type QueryParams = Record<string, string>;

/**
 * Request configuration (extends Axios request config)
 */
export type RequestConfig = AxiosRequestConfig;

/**
 * Generic API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
