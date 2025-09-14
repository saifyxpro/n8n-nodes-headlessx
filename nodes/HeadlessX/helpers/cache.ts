/**
 * Intelligent response caching system for HeadlessX operations
 * Optimizes API calls and reduces redundant requests with configurable TTL
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  tags: string[];
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  defaultTTL: number; // Default TTL in milliseconds
  maxEntries: number; // Maximum number of cached entries
  cleanupInterval: number; // Cleanup interval in milliseconds
  compressionThreshold: number; // Compress entries larger than this size
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
}

export class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
    hitRate: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB default
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxEntries: 1000,
      cleanupInterval: 60 * 1000, // 1 minute
      compressionThreshold: 10 * 1024, // 10KB
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Generates cache key from operation parameters
   */
  private generateCacheKey(operation: string, params: Record<string, any>): string {
    // Create a stable key by sorting parameters
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        // Skip cache-busting parameters
        if (!['timestamp', 'requestId', 'sessionId'].includes(key)) {
          result[key] = params[key];
        }
        return result;
      }, {} as Record<string, any>);

    const keyString = `${operation}:${JSON.stringify(sortedParams)}`;
    // Simple hash implementation for cache keys
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `cache_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Calculates the approximate size of data in bytes
   */
  private calculateSize(data: any): number {
    if (data === null || data === undefined) return 0;
    if (typeof data === 'string') return data.length * 2; // Approximate UTF-16 size
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data).length * 2;
      } catch {
        return 1000; // Fallback estimate
      }
    }
    return 100; // Fallback for primitives
  }

  /**
   * Checks if an entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Removes expired entries from cache
   */
  public cleanup(): void {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
        this.stats.totalSize -= entry.size;
        this.stats.evictions++;
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    this.stats.entryCount = this.cache.size;
    this.updateHitRate();
  }

  /**
   * Evicts least recently used entries to make space
   */
  private evictLRU(targetSize: number): void {
    const entries = Array.from(this.cache.entries());

    // Sort by last access time (hits count as a proxy for LRU)
    entries.sort((a, b) => a[1].hits - b[1].hits);

    let freedSize = 0;
    for (const [key, entry] of entries) {
      if (freedSize >= targetSize) break;

      this.cache.delete(key);
      this.stats.totalSize -= entry.size;
      this.stats.evictions++;
      freedSize += entry.size;
    }

    this.stats.entryCount = this.cache.size;
  }

  /**
   * Updates hit rate statistics
   */
  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
  }

  /**
   * Starts the cleanup timer (disabled in n8n environment)
   */
  private startCleanupTimer(): void {
    // Cleanup timer disabled in n8n environment
    // Cleanup will be done manually via periodic cleanup() calls
  }

  /**
   * Stops the cleanup timer
   */
  public stopCleanup(): void {
    // No timer to stop in n8n environment
  }

  /**
   * Gets cached response if available and not expired
   */
  public get<T = any>(operation: string, params: Record<string, any>): T | null {
    const key = this.generateCacheKey(operation, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.totalSize -= entry.size;
      this.stats.evictions++;
      this.stats.entryCount = this.cache.size;
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update hit count and statistics
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    return entry.data as T;
  }

  /**
   * Stores response in cache with optional TTL and tags
   */
  public set<T = any>(
    operation: string,
    params: Record<string, any>,
    data: T,
    options: { ttl?: number; tags?: string[] } = {}
  ): void {
    const key = this.generateCacheKey(operation, params);
    const size = this.calculateSize(data);
    const ttl = options.ttl || this.config.defaultTTL;

    // Check if entry would exceed max size
    if (size > this.config.maxSize * 0.1) { // Don't cache entries larger than 10% of max size
      return;
    }

    // Make space if needed
    const requiredSpace = size;
    const availableSpace = this.config.maxSize - this.stats.totalSize;

    if (availableSpace < requiredSpace || this.cache.size >= this.config.maxEntries) {
      this.evictLRU(requiredSpace);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size,
      tags: options.tags || []
    };

    // Remove existing entry if it exists
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.stats.totalSize -= existingEntry.size;
    } else {
      this.stats.entryCount++;
    }

    this.cache.set(key, entry);
    this.stats.totalSize += size;
  }

  /**
   * Invalidates cache entries by tags
   */
  public invalidateByTags(tags: string[]): number {
    let invalidatedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
        this.stats.totalSize -= entry.size;
        invalidatedCount++;
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.entryCount = this.cache.size;
    this.stats.evictions += invalidatedCount;

    return invalidatedCount;
  }

  /**
   * Invalidates cache entries by operation
   */
  public invalidateByOperation(operation: string): number {
    let invalidatedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(`${operation}:`)) {
        keysToDelete.push(key);
        this.stats.totalSize -= entry.size;
        invalidatedCount++;
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.entryCount = this.cache.size;
    this.stats.evictions += invalidatedCount;

    return invalidatedCount;
  }

  /**
   * Clears all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.stats.totalSize = 0;
    this.stats.entryCount = 0;
    this.stats.evictions += this.cache.size;
  }

  /**
   * Gets current cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Gets cache configuration
   */
  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Updates cache configuration
   */
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval !== undefined) {
      this.stopCleanup();
      this.startCleanupTimer();
    }

    // Enforce new size limits
    if (newConfig.maxSize && this.stats.totalSize > newConfig.maxSize) {
      this.evictLRU(this.stats.totalSize - newConfig.maxSize);
    }
  }

  /**
   * Checks if caching is beneficial for an operation
   */
  public shouldCache(operation: string, params: Record<string, any>): boolean {
    // Don't cache if explicitly disabled
    if (params.disableCache === true) {
      return false;
    }

    // Don't cache operations with dynamic content that changes frequently
    const noCacheOperations = ['batch']; // Batch operations are usually unique
    if (noCacheOperations.includes(operation)) {
      return false;
    }

    // Don't cache if URL contains dynamic parameters that indicate real-time data
    if (params.url) {
      const url = params.url.toLowerCase();
      const dynamicIndicators = ['timestamp', 'time', 'now', 'random', 'nonce', 'cache-bust'];
      if (dynamicIndicators.some(indicator => url.includes(indicator))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets cache key for debugging purposes
   */
  public getCacheKey(operation: string, params: Record<string, any>): string {
    return this.generateCacheKey(operation, params);
  }

  /**
   * Export cache data for backup/restore
   */
  public exportCache(): { entries: Array<[string, CacheEntry]>; stats: CacheStats; config: CacheConfig } {
    return {
      entries: Array.from(this.cache.entries()),
      stats: this.getStats(),
      config: this.getConfig()
    };
  }

  /**
   * Import cache data from backup
   */
  public importCache(data: { entries: Array<[string, CacheEntry]>; stats?: CacheStats }): void {
    this.clear();

    for (const [key, entry] of data.entries) {
      if (!this.isExpired(entry)) {
        this.cache.set(key, entry);
        this.stats.totalSize += entry.size;
        this.stats.entryCount++;
      }
    }

    if (data.stats) {
      this.stats = { ...this.stats, ...data.stats };
      this.updateHitRate();
    }
  }
}

// Global cache instance
export const globalCache = new ResponseCache();

/**
 * Decorator for automatic caching of method results
 */
export function withCache(
  operation: string,
  options: { ttl?: number; tags?: string[] } = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const params = args[1] || {}; // Assuming second argument contains parameters

      if (!globalCache.shouldCache(operation, params)) {
        return method.apply(this, args);
      }

      // Try to get from cache first
      const cached = globalCache.get(operation, params);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      globalCache.set(operation, params, result, options);

      return result;
    };

    return descriptor;
  };
}
