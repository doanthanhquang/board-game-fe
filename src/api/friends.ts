/**
 * Friends API
 * Functions for friend management-related API calls
 */

import { get, post, put, del } from '@/api';
import type { PaginationParams, PaginatedResponse } from '@/api/types';

/**
 * User information for friend search results
 */
export interface FriendUser {
  id: string;
  username: string;
  email: string;
  role: 'client' | 'admin';
  is_active: boolean;
  created_at: string;
}

/**
 * Friend request information
 */
export interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  requested_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  isRequester: boolean;
  otherUser: FriendUser | null;
}

/**
 * Accepted friendship information
 */
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'accepted';
  requested_at: string;
  accepted_at: string;
  created_at: string;
  updated_at: string;
  friend: FriendUser;
}

/**
 * Search users response
 */
export interface SearchUsersResponse {
  success: boolean;
  data: FriendUser[];
}

/**
 * Friend request response
 */
export interface FriendRequestResponse {
  success: boolean;
  data: FriendRequest;
}

/**
 * Friends list response
 */
export interface FriendsResponse {
  success: boolean;
  data: PaginatedResponse<Friendship>;
}

/**
 * Paginated friend requests list response
 */
export interface PaginatedFriendRequestsResponse {
  success: boolean;
  data: PaginatedResponse<FriendRequest>;
}

/**
 * Send friend request payload
 */
export interface SendFriendRequestPayload {
  addressee_id: string;
}

/**
 * Search users by name or email
 * @param query - Search query string
 * @returns Promise resolving to search results
 * @throws Error if search fails
 */
export const searchUsers = async (query: string): Promise<FriendUser[]> => {
  try {
    const response = await get<SearchUsersResponse>('/friends/search', { q: query });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to search users. Please try again.');
  }
};

/**
 * Send a friend request
 * @param addresseeId - ID of the user to send friend request to
 * @returns Promise resolving to friend request response
 * @throws Error if request fails
 */
export const sendFriendRequest = async (addresseeId: string): Promise<FriendRequest> => {
  try {
    const response = await post<FriendRequestResponse, SendFriendRequestPayload>(
      '/friends/requests',
      { addressee_id: addresseeId }
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to send friend request. Please try again.');
  }
};

/**
 * Get pending friend requests (sent and received)
 * @param params - Optional pagination parameters
 * @returns Promise resolving to paginated friend requests list
 * @throws Error if fetch fails
 */
export const getFriendRequests = async (
  params?: PaginationParams
): Promise<PaginatedResponse<FriendRequest>> => {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();

    const response = await get<PaginatedFriendRequestsResponse>('/friends/requests', queryParams);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch friend requests. Please try again.');
  }
};

/**
 * Accept a friend request
 * @param requestId - ID of the friend request to accept
 * @returns Promise resolving to accepted friendship
 * @throws Error if acceptance fails
 */
export const acceptFriendRequest = async (requestId: string): Promise<FriendRequest> => {
  try {
    const response = await put<FriendRequestResponse>(`/friends/requests/${requestId}/accept`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to accept friend request. Please try again.');
  }
};

/**
 * Reject or cancel a friend request
 * @param requestId - ID of the friend request to reject/cancel
 * @returns Promise resolving to success response
 * @throws Error if rejection fails
 */
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    await del(`/friends/requests/${requestId}`);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to reject friend request. Please try again.');
  }
};

/**
 * Get list of accepted friends
 * @param params - Optional pagination parameters
 * @returns Promise resolving to paginated friends list
 * @throws Error if fetch fails
 */
export const getFriends = async (
  params?: PaginationParams
): Promise<PaginatedResponse<Friendship>> => {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();

    const response = await get<FriendsResponse>('/friends', queryParams);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch friends. Please try again.');
  }
};
