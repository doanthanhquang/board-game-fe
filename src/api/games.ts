/**
 * Games API
 * Functions for interacting with game-related endpoints
 */

import { get, post, del, put } from '@/api';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '@/api/types';
import type {
  CaroGameState,
  SnakeGameState,
  Match3GameState,
  MemoryGameState,
} from '@/types/game-state';
import type { TicTacToeGameState } from '@/games/tic-tac-toe/tic-tac-toe-game';

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
  data: PaginatedResponse<Game>;
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
  best_score?: number;
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
 * Saved game metadata returned from backend
 */
export interface GameSaveSummary {
  id: string;
  session_id: string;
  save_name: string;
  created_at: string;
  updated_at: string;
}

export interface GameSaveListResponse {
  success: boolean;
  data: GameSaveSummary[];
}

export interface SaveGameStateRequest {
  gameState:
    | CaroGameState
    | TicTacToeGameState
    | SnakeGameState
    | Match3GameState
    | MemoryGameState;
  saveName?: string;
}

export interface SaveGameStateResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message?: string;
}

export interface LoadGameSaveResponse {
  success: boolean;
  data: {
    id: string;
    session_id: string;
    save_name: string;
    created_at: string;
    updated_at: string;
    game_state: CaroGameState | TicTacToeGameState | SnakeGameState;
  };
}

/**
 * Fetch all enabled games
 * @param params - Optional pagination parameters
 * @returns Promise resolving to paginated games list
 */
export const getGames = async (params?: PaginationParams): Promise<PaginatedResponse<Game>> => {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();

  const response = await get<GamesListResponse>('/games', queryParams);
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
 * @param sort - 'best_moves' (default), 'wins', or 'best_score'
 */
export const getGameRankings = async (
  slug: string,
  scope: 'global' | 'friends' = 'global',
  sort?: 'best_moves' | 'wins' | 'best_score'
): Promise<GameRankingEntry[]> => {
  const params: Record<string, string> = { scope };
  if (sort) {
    params.sort = sort;
  }
  const response = await get<GameRankingResponse>(`/games/${slug}/rankings`, params);
  return response.data;
};

/**
 * Save current game state for the authenticated user
 */
export const saveGameState = async (
  slug: string,
  payload: SaveGameStateRequest
): Promise<SaveGameStateResponse> => {
  return post<SaveGameStateResponse, SaveGameStateRequest>(`/games/${slug}/saves`, payload);
};

/**
 * List saved games for the current user and given game
 */
export const listGameSaves = async (slug: string): Promise<GameSaveSummary[]> => {
  const response = await get<GameSaveListResponse>(`/games/${slug}/saves`);
  return response.data;
};

/**
 * Load a saved game state
 */
export const loadGameSave = async (
  slug: string,
  saveId: string
): Promise<
  CaroGameState | TicTacToeGameState | SnakeGameState | Match3GameState | MemoryGameState
> => {
  const response = await get<LoadGameSaveResponse>(`/games/${slug}/saves/${saveId}`);
  return response.data.game_state;
};

/**
 * Clear all saved games for the current user and given game
 */
export const clearGameSaves = async (slug: string): Promise<void> => {
  await del<void>(`/games/${slug}/saves`);
};

/**
 * Admin Game Management API
 */

/**
 * List all games with pagination (admin only, includes disabled games)
 * @param params - Query parameters (page, pageSize, search)
 * @returns Paginated list of games
 */
export const listAllGames = async (
  params?: PaginationParams & { search?: string }
): Promise<PaginatedResponse<Game>> => {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
  if (params?.search) queryParams.search = params.search;

  const response = await get<GamesListResponse>('/admin/games', queryParams);
  return response.data;
};

/**
 * Get game by ID (admin only)
 * @param id - Game ID
 * @returns Game data
 */
export const getGameById = async (id: string): Promise<Game> => {
  const response = await get<GameResponse>(`/admin/games/${id}`);
  return response.data;
};

/**
 * Update game configuration (admin only)
 * @param id - Game ID
 * @param data - Game configuration update data
 * @returns Updated game data
 */
export interface UpdateGameConfigData {
  default_board_width?: number;
  default_board_height?: number;
  default_time_limit?: number | null;
  is_enabled?: boolean;
}

export const updateGameConfig = async (
  id: string,
  data: UpdateGameConfigData
): Promise<ApiResponse<Game>> => {
  return put<ApiResponse<Game>, UpdateGameConfigData>(`/admin/games/${id}`, data);
};
