/**
 * Messages API
 * Functions for messaging-related API calls
 */

import { get, post, put } from '@/api';

/**
 * Message information
 */
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    username: string;
    email: string;
  } | null;
}

/**
 * Conversation information
 */
export interface Conversation {
  friend: {
    id: string;
    username: string;
    email: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

/**
 * Send message payload
 */
export interface SendMessagePayload {
  recipient_id: string;
  body: string;
}

/**
 * Send message response
 */
export interface SendMessageResponse {
  success: boolean;
  data: Message;
}

/**
 * Get conversation response
 */
export interface GetConversationResponse {
  success: boolean;
  data: Message[];
}

/**
 * Get conversations response
 */
export interface GetConversationsResponse {
  success: boolean;
  data: Conversation[];
}

/**
 * Mark conversation read response
 */
export interface MarkConversationReadResponse {
  success: boolean;
  message: string;
  data: {
    updatedCount: number;
  };
}

/**
 * Send a message to a friend
 * @param recipientId - ID of the friend to send message to
 * @param body - Message body text
 * @returns Promise resolving to sent message
 * @throws Error if send fails
 */
export const sendMessage = async (recipientId: string, body: string): Promise<Message> => {
  try {
    const response = await post<SendMessageResponse, SendMessagePayload>('/messages', {
      recipient_id: recipientId,
      body,
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to send message. Please try again.');
  }
};

/**
 * Get conversation messages with a specific friend
 * @param userId - ID of the friend
 * @returns Promise resolving to array of messages
 * @throws Error if fetch fails
 */
export const getConversation = async (userId: string): Promise<Message[]> => {
  try {
    const response = await get<GetConversationResponse>(`/messages/conversations/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch conversation. Please try again.');
  }
};

/**
 * Get all conversations with unread status
 * @returns Promise resolving to array of conversations
 * @throws Error if fetch fails
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await get<GetConversationsResponse>('/messages/conversations');
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to fetch conversations. Please try again.');
  }
};

/**
 * Mark conversation as read
 * @param userId - ID of the friend
 * @returns Promise resolving to success response
 * @throws Error if update fails
 */
export const markConversationRead = async (userId: string): Promise<void> => {
  try {
    await put<MarkConversationReadResponse>(`/messages/conversations/${userId}/read`);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String(error.message));
    }
    throw new Error('Failed to mark conversation as read. Please try again.');
  }
};
