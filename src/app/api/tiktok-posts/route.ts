import { NextResponse } from 'next/server';
import { getCached, setCache, getCacheInfo, getTimeUntilRefresh } from '@/lib/cache';

// TikTok Posts API — fetches per-video metrics from Supabase
// Data is populated by a separate scheduled scraper task

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://bvvjlxpmzzhoexghqqdn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmpseHBtenpob2V4Z2hxcWRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3Mjk3MCwiZXhwIjoyMDkxODQ4OTcwfQ.Hy1HpuBmR5blulgI-u1JGO_ejLXBIh99cgsEtc1IxoE';

const CACHE_KEY = 'tiktok_posts';

interface TikTokPost {
  url: string;
  platform: string;
  title: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  posted_at: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  qualified: boolean | null;
  event_id: string | null;
  last_synced_at: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Build a cache key that includes date filters so different views cache separately
  const cacheKey = from || to ? `${CACHE_KEY}_${from || ''}_${to || ''}` : CACHE_KEY;

  // Check cache
  const cachedData = getCached<any>(cacheKey);
  if (cachedData) {
    return NextResponse.json({
      ...cachedData,
      _meta: {
        ...cachedData._meta,
        fromCache: true,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    });
  }

  try {
    // Build Supabase query
    let queryUrl = `${SUPABASE_URL}/rest/v1/posts?platform=eq.tiktok&select=*&order=posted_at.desc`;

    if (from) {
      queryUrl += `&posted_at=gte.${from}`;
    }
    if (to) {
      queryUrl += `&posted_at=lte.${to}`;
    }

    const response = await fetch(queryUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase fetch failed: ${response.status} ${response.statusText}`);
    }

    const posts: TikTokPost[] = await response.json();

    // Calculate aggregates
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0);

    const responseData = {
      posts,
      totals: {
        postCount: posts.length,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
      },
      _meta: {
        generatedAt: new Date().toISOString(),
        source: 'supabase',
        filters: { from, to },
        fromCache: false,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    };

    // Cache the response
    setCache(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('TikTok posts fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch TikTok posts',
        message: error instanceof Error ? error.message : 'Unknown error',
        posts: [],
        totals: { postCount: 0, views: 0, likes: 0, comments: 0, shares: 0 },
      },
      { status: 500 }
    );
  }
}
