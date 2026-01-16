/**
 * Daily Cache System
 *
 * Refreshes data once per day at 5am ET to minimize API calls.
 * All data is cached until the next 5am ET refresh window.
 */

// Cache storage
const cache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Get the next 5am ET timestamp
 */
function getNext5amET(): number {
  const now = new Date();

  // Convert to ET (UTC-5 or UTC-4 depending on DST)
  const etOffset = isDST(now) ? -4 : -5;
  const etNow = new Date(now.getTime() + (etOffset * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));

  // Create 5am ET today
  const today5am = new Date(etNow);
  today5am.setHours(5, 0, 0, 0);

  // If it's past 5am ET, use tomorrow's 5am
  if (etNow.getHours() >= 5) {
    today5am.setDate(today5am.getDate() + 1);
  }

  // Convert back to UTC timestamp
  return today5am.getTime() - (etOffset * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000);
}

/**
 * Get the most recent 5am ET timestamp (cache start time)
 */
function getLast5amET(): number {
  const now = new Date();

  // Convert to ET
  const etOffset = isDST(now) ? -4 : -5;
  const etNow = new Date(now.getTime() + (etOffset * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));

  // Create 5am ET today
  const today5am = new Date(etNow);
  today5am.setHours(5, 0, 0, 0);

  // If it's before 5am ET, use yesterday's 5am
  if (etNow.getHours() < 5) {
    today5am.setDate(today5am.getDate() - 1);
  }

  // Convert back to UTC timestamp
  return today5am.getTime() - (etOffset * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000);
}

/**
 * Check if a date is in Daylight Saving Time (US)
 */
function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  return date.getTimezoneOffset() < stdOffset;
}

/**
 * Check if cached data is still valid (from today's 5am window)
 */
export function isCacheValid(key: string): boolean {
  const cached = cache.get(key);
  if (!cached) return false;

  const last5am = getLast5amET();
  return cached.timestamp >= last5am;
}

/**
 * Get cached data if valid
 */
export function getCached<T>(key: string): T | null {
  if (!isCacheValid(key)) {
    return null;
  }
  return cache.get(key)?.data as T;
}

/**
 * Set cache data with current timestamp
 */
export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cache (for manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache metadata for debugging
 */
export function getCacheInfo(): {
  lastRefresh: string;
  nextRefresh: string;
  cachedKeys: string[];
  cacheSize: number;
} {
  const last5am = getLast5amET();
  const next5am = getNext5amET();

  return {
    lastRefresh: new Date(last5am).toISOString(),
    nextRefresh: new Date(next5am).toISOString(),
    cachedKeys: Array.from(cache.keys()),
    cacheSize: cache.size,
  };
}

/**
 * Time until next refresh in human-readable format
 */
export function getTimeUntilRefresh(): string {
  const next5am = getNext5amET();
  const now = Date.now();
  const diffMs = next5am - now;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
