import { NextResponse } from 'next/server';
import { getCached, setCache, getCacheInfo, getTimeUntilRefresh } from '@/lib/cache';

// Force dynamic rendering for live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_INSTAGRAM_ID = process.env.META_INSTAGRAM_ID;

const CACHE_KEY = 'instagram_pl_data';

interface MediaItem {
  id: string;
  media_type: string;
  like_count: number;
  comments_count: number;
  caption?: string;
  timestamp: string;
  permalink: string;
}

interface ReelInsights {
  views: number;
  reach: number;
  shares: number;
  saved: number;
  totalWatchTimeMs: number;
  avgWatchTimeMs: number;
}

interface MediaWithInsights extends MediaItem {
  insights: ReelInsights;
  engagementRate: number;
}

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  if (!META_INSTAGRAM_ID) {
    return NextResponse.json({ error: 'META_INSTAGRAM_ID not configured' }, { status: 500 });
  }

  // Check for cached data (refreshes daily at 5am ET)
  const cachedData = getCached<Record<string, unknown>>(CACHE_KEY);
  if (cachedData) {
    return NextResponse.json({
      ...cachedData,
      _meta: {
        ...(cachedData._meta as Record<string, unknown>),
        fromCache: true,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    });
  }

  try {
    // 1. Get Instagram account info
    const igInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography&access_token=${META_ACCESS_TOKEN}`
    );
    const igInfo = await igInfoResponse.json();

    if (igInfo.error) {
      // Check if it's a token expiration error
      const errorMessage = igInfo.error.message || 'Unknown error';
      const isExpired = errorMessage.toLowerCase().includes('expired') ||
                        errorMessage.toLowerCase().includes('session') ||
                        igInfo.error.code === 190;

      if (isExpired) {
        // Parse expiration time from error message if available
        const expirationMatch = errorMessage.match(/expired on ([^.]+)/i);
        const expirationTime = expirationMatch ? expirationMatch[1] : 'unknown time';
        const now = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

        return NextResponse.json({
          error: `Error validating access token: Session has expired on ${expirationTime}. The current time is ${now}.`,
          tokenExpired: true,
          needsReauthorization: true
        }, { status: 401 });
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 2. Get account-level insights
    const [reachData, engagementData] = await Promise.all([
      fetch(`https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/insights?metric=reach,follower_count&period=day&access_token=${META_ACCESS_TOKEN}`).then(r => r.json()),
      fetch(`https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/insights?metric=accounts_engaged,total_interactions&metric_type=total_value&period=day&access_token=${META_ACCESS_TOKEN}`).then(r => r.json()),
    ]);

    const todayReach = reachData.data?.find((m: { name: string }) => m.name === 'reach')?.values?.[0]?.value || 0;
    const accountsEngaged = engagementData.data?.find((m: { name: string }) => m.name === 'accounts_engaged')?.total_value?.value || 0;
    const totalInteractions = engagementData.data?.find((m: { name: string }) => m.name === 'total_interactions')?.total_value?.value || 0;

    // 3. Get ALL media with pagination (basic fields only - fast)
    const allMedia: MediaItem[] = [];
    let nextUrl: string | null = `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/media?fields=id,media_type,like_count,comments_count,caption,timestamp,permalink&limit=100&access_token=${META_ACCESS_TOKEN}`;

    while (nextUrl !== null && allMedia.length < 500) {
      const mediaResponse: Response = await fetch(nextUrl);
      const mediaData = await mediaResponse.json();
      if (mediaData.data) {
        allMedia.push(...mediaData.data);
      }
      nextUrl = mediaData.paging?.next ?? null;
    }

    // 4. Calculate content breakdown
    const reels = allMedia.filter(m => m.media_type === 'VIDEO');
    const images = allMedia.filter(m => m.media_type === 'IMAGE');
    const carousels = allMedia.filter(m => m.media_type === 'CAROUSEL_ALBUM');

    // 5. Calculate totals from basic fields
    const totalLikes = allMedia.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = allMedia.reduce((sum, m) => sum + (m.comments_count || 0), 0);

    // 6. Fetch insights for ALL reels (views, reach, shares, saves, watch time)
    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    const allReelInsights: MediaWithInsights[] = [];

    for (let i = 0; i < reels.length; i += batchSize) {
      const batch = reels.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (media): Promise<MediaWithInsights> => {
          try {
            const insightsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${media.id}/insights?metric=views,reach,shares,saved,ig_reels_video_view_total_time,ig_reels_avg_watch_time&access_token=${META_ACCESS_TOKEN}`
            );
            const insights = await insightsResponse.json();

            const getMetricValue = (name: string) =>
              insights.data?.find((i: { name: string }) => i.name === name)?.values?.[0]?.value || 0;

            const reelInsights: ReelInsights = {
              views: getMetricValue('views'),
              reach: getMetricValue('reach'),
              shares: getMetricValue('shares'),
              saved: getMetricValue('saved'),
              totalWatchTimeMs: getMetricValue('ig_reels_video_view_total_time'),
              avgWatchTimeMs: getMetricValue('ig_reels_avg_watch_time'),
            };

            return {
              ...media,
              insights: reelInsights,
              engagementRate: reelInsights.reach > 0
                ? ((media.like_count + media.comments_count + reelInsights.shares + reelInsights.saved) / reelInsights.reach * 100)
                : 0,
            };
          } catch {
            return {
              ...media,
              insights: { views: 0, reach: 0, shares: 0, saved: 0, totalWatchTimeMs: 0, avgWatchTimeMs: 0 },
              engagementRate: 0,
            };
          }
        })
      );
      allReelInsights.push(...batchResults);
    }

    // 7. Calculate aggregate stats from ALL reels
    const totalReelViews = allReelInsights.reduce((sum, r) => sum + r.insights.views, 0);
    const totalReelReach = allReelInsights.reduce((sum, r) => sum + r.insights.reach, 0);
    const totalShares = allReelInsights.reduce((sum, r) => sum + r.insights.shares, 0);
    const totalSaves = allReelInsights.reduce((sum, r) => sum + r.insights.saved, 0);
    const totalWatchTimeMs = allReelInsights.reduce((sum, r) => sum + r.insights.totalWatchTimeMs, 0);
    const avgWatchTimeMs = allReelInsights.length > 0
      ? allReelInsights.reduce((sum, r) => sum + r.insights.avgWatchTimeMs, 0) / allReelInsights.length
      : 0;

    // 7.5 Calculate YTD stats (Year-to-Date)
    const now = new Date();
    const ytdStart = new Date(now.getFullYear(), 0, 1); // Jan 1st
    const ytdReels = allReelInsights.filter(r => new Date(r.timestamp) >= ytdStart);
    const ytdViews = ytdReels.reduce((sum, r) => sum + r.insights.views, 0);
    const ytdReach = ytdReels.reduce((sum, r) => sum + r.insights.reach, 0);
    const ytdShares = ytdReels.reduce((sum, r) => sum + r.insights.shares, 0);
    const ytdSaves = ytdReels.reduce((sum, r) => sum + r.insights.saved, 0);
    const ytdLikes = ytdReels.reduce((sum, r) => sum + r.like_count, 0);
    const ytdComments = ytdReels.reduce((sum, r) => sum + r.comments_count, 0);

    // 8. Sort and get top/bottom performers
    const sortedByViews = [...allReelInsights].sort((a, b) => b.insights.views - a.insights.views);
    const topPerformers = sortedByViews.slice(0, 10);
    const bottomPerformers = sortedByViews.slice(-5).reverse();

    // 9. Format response
    const formatReel = (r: MediaWithInsights) => ({
      id: r.id,
      caption: r.caption?.slice(0, 100) || '',
      timestamp: r.timestamp,
      permalink: r.permalink,
      likes: r.like_count,
      comments: r.comments_count,
      views: r.insights.views,
      reach: r.insights.reach,
      shares: r.insights.shares,
      saved: r.insights.saved,
      avgWatchTimeSec: Math.round(r.insights.avgWatchTimeMs / 1000),
      engagementRate: r.engagementRate.toFixed(2) + '%',
    });

    // Convert watch time to readable format
    const totalWatchTimeHours = Math.round(totalWatchTimeMs / 1000 / 60 / 60);
    const avgWatchTimeSec = Math.round(avgWatchTimeMs / 1000);

    const responseData = {
      // Account Overview
      account: {
        id: META_INSTAGRAM_ID,
        username: igInfo.username,
        name: igInfo.name || igInfo.username,
        profilePicture: igInfo.profile_picture_url,
        followers: igInfo.followers_count,
        following: igInfo.follows_count,
        biography: igInfo.biography,
      },

      // Today's Performance
      todayStats: {
        reach: todayReach,
        accountsEngaged: accountsEngaged,
        interactions: totalInteractions,
      },

      // Content Library
      contentBreakdown: {
        total: igInfo.media_count,
        reels: reels.length,
        images: images.length,
        carousels: carousels.length,
      },

      // *** KEY METRICS FOR TOTAL VIEWS ***
      totalViews: {
        reels: totalReelViews,
        // Images and carousels don't have views in the same way
        allContent: totalReelViews, // For now, total views = reel views
      },

      // YTD Stats (Year-to-Date)
      ytd: {
        year: now.getFullYear(),
        reelCount: ytdReels.length,
        views: ytdViews,
        reach: ytdReach,
        likes: ytdLikes,
        comments: ytdComments,
        shares: ytdShares,
        saves: ytdSaves,
        avgViewsPerReel: ytdReels.length > 0 ? Math.round(ytdViews / ytdReels.length) : 0,
      },

      // Aggregate Stats (All Content)
      allTimeStats: {
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalShares: totalShares,
        totalSaves: totalSaves,
        avgLikesPerPost: Math.round(totalLikes / allMedia.length),
        avgCommentsPerPost: Math.round(totalComments / allMedia.length),
      },

      // Reels Performance
      reelsPerformance: {
        totalReels: reels.length,
        totalViews: totalReelViews,
        totalReach: totalReelReach,
        totalShares: totalShares,
        totalSaves: totalSaves,
        totalWatchTimeHours: totalWatchTimeHours,
        avgWatchTimeSec: avgWatchTimeSec,
        avgViewsPerReel: Math.round(totalReelViews / reels.length),
        avgEngagementRate: allReelInsights.length > 0
          ? (allReelInsights.reduce((sum, r) => sum + r.engagementRate, 0) / allReelInsights.length).toFixed(2) + '%'
          : '0%',
        bestPerformers: topPerformers.map(formatReel),
        needsImprovement: bottomPerformers.map(formatReel),
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v18.0',
        reelsAnalyzed: allReelInsights.length,
        note: 'totalViews represents actual view count across all Reels',
        fromCache: false,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    };

    // Store in cache for next requests until 5am ET
    setCache(CACHE_KEY, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
