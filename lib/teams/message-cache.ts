/**
 * In-Memory Message Cache with TTL (Time-To-Live)
 * Stores recent channel messages for quick retrieval and parsing
 * 
 * Format: channelId:userId -> {text, timestamp}
 * TTL: 10-15 minutes (default: 600000ms)
 */

interface CachedMessage {
  text: string;
  timestamp: number;
  messageId?: string;
}

interface CacheEntry {
  [key: string]: CachedMessage;
}

class MessageCache {
  private cache: CacheEntry = {};
  private ttl: number = 10 * 60 * 1000; // 10 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlMinutes: number = 10) {
    this.ttl = ttlMinutes * 60 * 1000;
    this.startCleanupInterval();
  }

  /**
   * Generate cache key from channel and user
   */
  private getCacheKey(channelId: string, userId: string): string {
    return `${channelId}:${userId}`;
  }

  /**
   * Store a message in cache
   */
  public cacheMessage(
    channelId: string,
    userId: string,
    text: string,
    messageId?: string
  ): void {
    const key = this.getCacheKey(channelId, userId);
    this.cache[key] = {
      text,
      timestamp: Date.now(),
      messageId,
    };
    
    console.log(`✓ Cached message for ${channelId}/${userId}`);
  }

  /**
   * Get the most recent cached message for a user in a channel
   */
  public getLastMessage(channelId: string, userId: string): CachedMessage | null {
    const key = this.getCacheKey(channelId, userId);
    const message = this.cache[key];

    if (!message) {
      return null;
    }

    // Check if message has expired
    if (Date.now() - message.timestamp > this.ttl) {
      delete this.cache[key];
      return null;
    }

    return message;
  }

  /**
   * Clear cache for a specific user/channel pair
   */
  public clearMessage(channelId: string, userId: string): void {
    const key = this.getCacheKey(channelId, userId);
    delete this.cache[key];
    console.log(`✓ Cleared cache for ${channelId}/${userId}`);
  }

  /**
   * Clear all expired messages
   */
  private cleanupExpiredMessages(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const key in this.cache) {
      const message = this.cache[key];
      if (now - message.timestamp > this.ttl) {
        delete this.cache[key];
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cached messages`);
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredMessages();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop the cleanup interval (call on app shutdown)
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  public getStats(): { size: number; ttlMinutes: number } {
    return {
      size: Object.keys(this.cache).length,
      ttlMinutes: this.ttl / (60 * 1000),
    };
  }
}

// Export singleton instance
export const messageCache = new MessageCache(10); // 10 minutes TTL

