import { NextResponse } from 'next/server';

// Vercel Cron Job - runs daily at 5am ET (10:00 UTC)
// This endpoint triggers a fresh data fetch for all platforms

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Record<string, unknown> = {};

  try {
    // Get base URL from request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Trigger refresh for Instagram (this will fetch fresh data and cache it)
    const instagramResponse = await fetch(`${baseUrl}/api/instagram`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    const instagramData = await instagramResponse.json();
    results.instagram = {
      success: !instagramData.error,
      totalViews: instagramData.totalViews?.reels || 0,
      reelsAnalyzed: instagramData._meta?.reelsAnalyzed || 0,
    };

    // Trigger refresh for Creators
    const creatorsResponse = await fetch(`${baseUrl}/api/creators`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    const creatorsData = await creatorsResponse.json();
    results.creators = {
      success: !creatorsData.error,
      totalCreators: creatorsData.networkStats?.totalCreators || 0,
      totalFollowers: creatorsData.networkStats?.totalFollowers || 0,
    };

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Daily refresh completed',
      refreshedAt: new Date().toISOString(),
      durationMs: duration,
      results,
    });
  } catch (error) {
    console.error('Cron refresh error:', error);
    return NextResponse.json({
      success: false,
      error: 'Refresh failed',
      refreshedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
