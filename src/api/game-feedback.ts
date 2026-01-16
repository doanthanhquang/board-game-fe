import { get, post } from '@/api';

export interface GameRatingItem {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface GameRatingsList {
  items: GameRatingItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface GameRatingsListResponse {
  success: boolean;
  data: GameRatingsList;
}

export interface CreateGameRatingRequest {
  rating: number;
  comment?: string;
}

export interface CreateGameRatingResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message?: string;
}

export const getGameRatings = async (
  slug: string,
  page = 1,
  pageSize = 5
): Promise<GameRatingsList> => {
  const response = await get<GameRatingsListResponse>(`/games/${slug}/ratings`, {
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  return response.data;
};

export const createGameRating = async (
  slug: string,
  payload: CreateGameRatingRequest
): Promise<CreateGameRatingResponse> => {
  return post<CreateGameRatingResponse, CreateGameRatingRequest>(`/games/${slug}/ratings`, payload);
};
