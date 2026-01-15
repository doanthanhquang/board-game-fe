/**
 * Profile API
 * Functions for profile management-related API calls
 */

import { get, put } from '@/api';

/**
 * User information in profile
 */
export interface ProfileUser {
  id: string;
  username: string;
  email: string;
  role: 'client' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

/**
 * Profile information
 */
export interface ProfileInfo {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, unknown> | null;
  updated_at: string | null;
}

/**
 * Game statistics for a single game
 */
export interface GameStatistic {
  game_id: string;
  game_name: string;
  game_slug: string;
  best_moves: number | null;
  best_score: number | null;
  wins: number;
  has_played: boolean;
}

/**
 * Overall statistics
 */
export interface UserStatistics {
  games: GameStatistic[];
  total_games_played: number;
  total_wins: number;
  win_rate: number;
}

/**
 * Complete profile data
 */
export interface ProfileData {
  user: ProfileUser;
  profile: ProfileInfo;
  statistics: UserStatistics;
}

/**
 * Profile response
 */
export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

/**
 * Update profile payload
 */
export interface UpdateProfilePayload {
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  preferences?: Record<string, unknown> | null;
}

/**
 * Get current user's profile with game statistics
 * @returns Promise resolving to profile data
 * @throws Error if fetch fails
 */
export const getProfile = async (): Promise<ProfileData> => {
  try {
    const response = await get<ProfileResponse>('/profile');
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch profile. Please try again.');
  }
};

/**
 * Update current user's profile
 * @param payload - Profile data to update
 * @returns Promise resolving to updated profile data
 * @throws Error if update fails
 */
export const updateProfile = async (payload: UpdateProfilePayload): Promise<ProfileData> => {
  try {
    const response = await put<ProfileResponse, UpdateProfilePayload>('/profile', payload);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to update profile. Please try again.');
  }
};
