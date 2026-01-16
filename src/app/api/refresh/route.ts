import { NextResponse } from 'next/server';
import { clearCache, getCacheInfo } from '@/lib/cache';

// Manual refresh endpoint - clears cache to force fresh data on next request
// Usage: POST /api/refresh to clear all cached data

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Get cache info before clearing
    const beforeClear = getCacheInfo();

    // Clear all cached data
    clearCache();

    // Get cache info after clearing
    const afterClear = getCacheInfo();

    return NextResponse.json({
      success: true,
      message: 'Cache cleared. Next API requests will fetch fresh data.',
      clearedAt: new Date().toISOString(),
      before: {
        cachedKeys: beforeClear.cachedKeys,
        cacheSize: beforeClear.cacheSize,
      },
      after: {
        cachedKeys: afterClear.cachedKeys,
        cacheSize: afterClear.cacheSize,
      },
      note: 'Visit /instagram or /creators pages to trigger fresh data fetch.',
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache',
    }, { status: 500 });
  }
}

export async function GET() {
  // GET request returns current cache status
  const cacheInfo = getCacheInfo();

  return NextResponse.json({
    cacheInfo,
    usage: 'Send POST request to /api/refresh to clear cache and force fresh data fetch.',
  });
}
