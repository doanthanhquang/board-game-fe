/**
 * Admin API
 * Functions for interacting with admin dashboard statistics endpoints
 */

import { get } from '@/api';
import type { ApiResponse } from '@/api/types';

/**
 * Game statistics (game hot)
 */
export interface GameStat {
  game_id: string;
  game_name: string;
  game_slug: string;
  play_count: number;
  rank: number;
}

/**
 * New account (recent user registration)
 */
export interface NewAccount {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  role: 'client' | 'admin';
}

/**
 * Top winner statistics
 */
export interface TopWinner {
  user_id: string;
  username: string;
  total_wins: number;
  rank: number;
}

/**
 * Top points statistics
 */
export interface TopPoints {
  user_id: string;
  username: string;
  total_points: number;
  rank: number;
}

/**
 * Get most played games statistics (game hot)
 * @param limit - Maximum number of games to return (default: 10)
 * @returns Promise resolving to game statistics array
 */
export const getGameStats = async (limit: number = 10): Promise<GameStat[]> => {
  try {
    const response = await get<ApiResponse<GameStat[]>>('/admin/dashboard/game-stats', {
      limit: limit.toString(),
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch game statistics. Please try again.');
  }
};

/**
 * Get recent user registrations
 * @param limit - Maximum number of users to return (default: 20)
 * @returns Promise resolving to new accounts array
 */
export const getNewAccounts = async (limit: number = 20): Promise<NewAccount[]> => {
  try {
    const response = await get<ApiResponse<NewAccount[]>>('/admin/dashboard/new-accounts', {
      limit: limit.toString(),
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch new accounts. Please try again.');
  }
};

/**
 * Get top winners (users with most wins)
 * @param limit - Maximum number of users to return (default: 20)
 * @returns Promise resolving to top winners array
 */
export const getTopWinners = async (limit: number = 20): Promise<TopWinner[]> => {
  try {
    const response = await get<ApiResponse<TopWinner[]>>('/admin/dashboard/top-winners', {
      limit: limit.toString(),
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch top winners. Please try again.');
  }
};

/**
 * Get top points (users with highest total points)
 * @param limit - Maximum number of users to return (default: 20)
 * @returns Promise resolving to top points array
 */
export const getTopPoints = async (limit: number = 20): Promise<TopPoints[]> => {
  try {
    const response = await get<ApiResponse<TopPoints[]>>('/admin/dashboard/top-points', {
      limit: limit.toString(),
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch top points. Please try again.');
  }
};
