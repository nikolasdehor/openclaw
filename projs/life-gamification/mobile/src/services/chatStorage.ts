import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types/ai-coach';

const CHAT_HISTORY_KEY = '@life_gamification_chat_history_';

/**
 * Generate a storage key for a specific user
 */
export function getChatStorageKey(user_phone: string): string {
  return `${CHAT_HISTORY_KEY}${user_phone}`;
}

/**
 * ChatStorage Service
 * Manages local storage of chat history with AsyncStorage
 * and handles syncing with backend.
 */
export const ChatStorage = {
  /**
   * Save a single message to local storage
   */
  async saveMessage(user_phone: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const key = getChatStorageKey(user_phone);
    const fullMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    try {
      const existing = await this.getHistory(user_phone);
      existing.push(fullMessage);
      await AsyncStorage.setItem(key, JSON.stringify(existing));
      return fullMessage;
    } catch (error) {
      console.error('Failed to save chat message:', error);
      throw error;
    }
  },

  /**
   * Get full chat history for a user
   */
  async getHistory(user_phone: string, limit?: number): Promise<ChatMessage[]> {
    try {
      const key = getChatStorageKey(user_phone);
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];

      const history: ChatMessage[] = JSON.parse(data);
      if (limit) {
        return history.slice(-limit); // Return last N messages
      }
      return history;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  },

  /**
   * Clear chat history for a user
   */
  async clearHistory(user_phone: string): Promise<void> {
    try {
      const key = getChatStorageKey(user_phone);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw error;
    }
  },

  /**
   * Sync local chat history to backend
   * Called periodically or on app foreground
   */
  async syncToBackend(user_phone: string): Promise<{ success: boolean; saved_count: number }> {
    try {
      const history = await this.getHistory(user_phone);
      if (history.length === 0) {
        return { success: true, saved_count: 0 };
      }

      // Import dynamically to avoid circular deps
      const { saveChatHistory } = await import('../services/api');

      const result = await saveChatHistory({
        user_phone,
        messages: history,
      });

      if (result.success) {
        console.log(`Synced ${result.saved_count} chat messages to backend`);
      }

      return result;
    } catch (error) {
      console.error('Failed to sync chat history:', error);
      return { success: false, saved_count: 0 };
    }
  },

  /**
   * Search through chat history
   */
  async searchHistory(user_phone: string, query: string): Promise<ChatMessage[]> {
    const history = await this.getHistory(user_phone);
    const lowerQuery = query.toLowerCase();

    return history.filter(
      (msg) =>
        msg.content.toLowerCase().includes(lowerQuery) ||
        msg.metadata?.command?.toLowerCase().includes(lowerQuery)
    );
  },
};

export default ChatStorage;
