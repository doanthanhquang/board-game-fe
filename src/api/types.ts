import type { AxiosRequestConfig } from 'axios';

/**
 * Generic API response wrapper
 * @template T - The type of data returned by the API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Extended request configuration options
 */
export type RequestConfig = AxiosRequestConfig;

/**
 * Query parameters type for GET requests
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;
