/**
 * Achievements API
 * Functions for achievement-related API calls
 */

import { get, post } from '@/api';

/**
 * Achievement information
 */
export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria: Record<string, unknown> | null;
  game_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_unlocked?: boolean;
  progress?: number;
  unlocked_at?: string | null;
}

/**
 * User achievement with details
 */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  created_at: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria: Record<string, unknown> | null;
  game_id: string | null;
}

/**
 * Get achievements response
 */
export interface GetAchievementsResponse {
  success: boolean;
  data: Achievement[];
}

/**
 * Get achievement response
 */
export interface GetAchievementResponse {
  success: boolean;
  data: Achievement;
}

/**
 * Get user achievements response
 */
export interface GetUserAchievementsResponse {
  success: boolean;
  data: UserAchievement[];
}

/**
 * Check achievements payload
 */
export interface CheckAchievementsPayload {
  gameId?: string;
  score?: number;
  action?: string;
}

/**
 * Check achievements response
 */
export interface CheckAchievementsResponse {
  success: boolean;
  message: string;
  data: {
    unlocked: number;
    achievements: Achievement[];
  };
}

/**
 * Get all achievements with user unlock status
 * @returns Promise resolving to array of achievements
 * @throws Error if fetch fails
 */
export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await get<GetAchievementsResponse>('/achievements');
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch achievements. Please try again.');
  }
};

/**
 * Get achievement by ID
 * @param id - Achievement ID
 * @returns Promise resolving to achievement details
 * @throws Error if fetch fails
 */
export const getAchievementById = async (id: string): Promise<Achievement> => {
  try {
    const response = await get<GetAchievementResponse>(`/achievements/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch achievement. Please try again.');
  }
};

/**
 * Get user's unlocked achievements
 * @returns Promise resolving to array of unlocked achievements
 * @throws Error if fetch fails
 */
export const getUserAchievements = async (): Promise<UserAchievement[]> => {
  try {
    const response = await get<GetUserAchievementsResponse>('/achievements/user');
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch user achievements. Please try again.');
  }
};

/**
 * Check and unlock achievements (internal/automatic)
 * @param payload - Check achievements payload
 * @returns Promise resolving to check results
 * @throws Error if check fails
 */
export const checkAchievements = async (
  payload: CheckAchievementsPayload
): Promise<CheckAchievementsResponse['data']> => {
  try {
    const response = await post<CheckAchievementsResponse, CheckAchievementsPayload>(
      '/achievements/check',
      payload
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to check achievements. Please try again.');
  }
};
