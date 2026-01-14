/**
 * Games API
 * Functions for interacting with game-related endpoints
 */

import { get, post } from '@/api';

/**
 * Game interface matching backend response
 */
export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  game_type: string;
  is_enabled: boolean;
  default_board_width: number;
  default_board_height: number;
  default_time_limit: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * API response for games list
 */
export interface GamesListResponse {
  success: boolean;
  data: Game[];
}

/**
 * API response for single game
 */
export interface GameResponse {
  success: boolean;
  data: Game;
}

/**
 * Ranking entry returned from backend
 */
export interface GameRankingEntry {
  rank: number;
  user_id: string;
  username: string;
  best_moves: number;
  wins: number;
  last_win_at: string;
}

export interface GameRankingResponse {
  success: boolean;
  data: GameRankingEntry[];
}

export interface RecordGameScoreRequest {
  movesCount: number;
  result: 'player-won' | 'computer-won' | 'draw' | 'win' | 'loss';
}

export interface RecordGameScoreResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message?: string;
}

/**
 * Fetch all enabled games
 * @returns Promise resolving to array of games
 */
export const getGames = async (): Promise<Game[]> => {
  const response = await get<GamesListResponse>('/games');
  return response.data;
};

/**
 * Fetch game by slug
 * @param slug - Game slug identifier
 * @returns Promise resolving to game object
 */
export const getGameBySlug = async (slug: string): Promise<Game> => {
  const response = await get<GameResponse>(`/games/${slug}`);
  return response.data;
};

/**
 * Record a game score for a completed game (winner only on backend)
 * @param slug - Game slug identifier
 * @param payload - Score payload including movesCount and result
 */
export const recordGameScore = async (
  slug: string,
  payload: RecordGameScoreRequest
): Promise<RecordGameScoreResponse> => {
  return post<RecordGameScoreResponse, RecordGameScoreRequest>(`/games/${slug}/scores`, payload);
};

/**
 * Fetch rankings for a game
 * @param slug - Game slug identifier
 * @param scope - 'global' or 'friends'
 */
export const getGameRankings = async (
  slug: string,
  scope: 'global' | 'friends' = 'global'
): Promise<GameRankingEntry[]> => {
  const response = await get<GameRankingResponse>(`/games/${slug}/rankings`, { scope });
  return response.data;
};
