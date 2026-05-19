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

interface MediaInsights {
  // Reels: "views" = 3-sec plays. Images/Carousels: "impressions" = times displayed.
  // These are NOT equivalent metrics — we track both separately.
  views: number;        // Reel plays (3-sec threshold). 0 for images/carousels.
  impressions: number;  // Times content displayed. For reels, this equals views.
  reach: number;
  shares: number;
  saved: number;
  totalWatchTimeMs: number;
  avgWatchTimeMs: number;
}

interface MediaWithInsights extends MediaItem {
  insights: MediaInsights;
  engagementRate: number;
}

/**
 * Fetch insights for a single media item.
 * Reels: views, reach, shares, saved, watch time
 * Images/Carousels: impressions, reach, saved
 */
async function fetchMediaInsights(media: MediaItem): Promise<MediaWithInsights> {
  try {
    const isReel = media.media_type === 'VIDEO';
    const metrics = isReel
      ? 'views,reach,shares,saved,ig_reels_video_view_total_time,ig_reels_avg_watch_time'
      : 'impressions,reach,saved';

    const insightsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${media.id}/insights?metric=${metrics}&access_token=${META_ACCESS_TOKEN}`
    );
    const insights = await insightsResponse.json();

    if (insights.error) {
      // Some older content may not support insights — fall back gracefully
      return {
        ...media,
        insights: { views: 0, impressions: 0, reach: 0, shares: 0, saved: 0, totalWatchTimeMs: 0, avgWatchTimeMs: 0 },
        engagementRate: 0,
      };
    }

    const getMetricValue = (name: string) =>
      insights.data?.find((i: { name: string }) => i.name === name)?.values?.[0]?.value || 0;

    // Reels: "views" = 3-sec plays (comparable to YouTube views)
    // Images/Carousels: only "impressions" available (times displayed, NOT plays)
    const reelViews = isReel ? getMetricValue('views') : 0;
    const imgImpressions = !isReel ? getMetricValue('impressions') : 0;
    const reach = getMetricValue('reach');
    const shares = isReel ? getMetricValue('shares') : 0;
    const saved = getMetricValue('saved');
    const totalWatchTimeMs = isReel ? getMetricValue('ig_reels_video_view_total_time') : 0;
    const avgWatchTimeMs = isReel ? getMetricValue('ig_reels_avg_watch_time') : 0;

    const mediaInsights: MediaInsights = {
      views: reelViews,
      impressions: isReel ? reelViews : imgImpressions, // For backwards compat, impressions = views for reels
      reach,
      shares,
      saved,
      totalWatchTimeMs,
      avgWatchTimeMs,
    };

    return {
      ...media,
      insights: mediaInsights,
      engagementRate: reach > 0
        ? ((media.like_count + media.comments_count + shares + saved) / reach * 100)
        : 0,
    };
  } catch {
    return {
      ...media,
      insights: { views: 0, impressions: 0, reach: 0, shares: 0, saved: 0, totalWatchTimeMs: 0, avgWatchTimeMs: 0 },
      engagementRate: 0,
    };
  }
}

export async function GET(request: Request) {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }
  if (!META_INSTAGRAM_ID) {
    return NextResponse.json({ error: 'META_INSTAGRAM_ID not configured' }, { status: 500 });
  }

  // Parse date filters from query params
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  // Build cache key with date params for filtered requests
  const cacheKey = fromDate || toDate
    ? `${CACHE_KEY}_${fromDate || 'all'}_${toDate || 'all'}`
    : CACHE_KEY;

  // Check for cached data (refreshes daily at 5am ET)
  const cachedData = getCached<Record<string, unknown>>(cacheKey);
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
      const errorMessage = igInfo.error.message || 'Unknown error';
      const isExpired = errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('session') ||
        igInfo.error.code === 190;

      if (isExpired) {
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
    let nextUrl: string | null =
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/media?fields=id,media_type,like_count,comments_count,caption,timestamp,permalink&limit=100&access_token=${META_ACCESS_TOKEN}`;

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

    // 5. Calculate totals from basic fields (all content)
    const totalLikes = allMedia.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = allMedia.reduce((sum, m) => sum + (m.comments_count || 0), 0);

    // 6. Determine which content to fetch detailed insights for
    // Use date filter if provided, otherwise use YTD
    const now = new Date();
    const filterStart = fromDate ? new Date(fromDate) : new Date(now.getFullYear(), 0, 1);
    const filterEnd = toDate ? new Date(toDate) : now;

    // Filter media by date range for detailed insights
    const filteredMedia = allMedia.filter(m => {
      const ts = new Date(m.timestamp);
      return ts >= filterStart && ts <= filterEnd;
    });

    const filteredReels = filteredMedia.filter(m => m.media_type === 'VIDEO');
    const filteredImages = filteredMedia.filter(m => m.media_type === 'IMAGE');
    const filteredCarousels = filteredMedia.filter(m => m.media_type === 'CAROUSEL_ALBUM');

    // 7. Fetch insights for ALL filtered content (reels + images + carousels)
    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    const allFilteredInsights: MediaWithInsights[] = [];

    for (let i = 0; i < filteredMedia.length; i += batchSize) {
      const batch = filteredMedia.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(fetchMediaInsights));
      allFilteredInsights.push(...batchResults);
    }

    // Separate insights by type for breakdown stats
    const reelInsights = allFilteredInsights.filter(m => m.media_type === 'VIDEO');
    const imageInsights = allFilteredInsights.filter(m => m.media_type === 'IMAGE');
    const carouselInsights = allFilteredInsights.filter(m => m.media_type === 'CAROUSEL_ALBUM');

    // 8. Calculate aggregate stats — ALL CONTENT
    // Views = reel plays only (3-sec threshold, comparable to YouTube views)
    const totalFilteredViews = allFilteredInsights.reduce((sum, r) => sum + r.insights.views, 0);
    // Impressions = all content displayed (reels use views as proxy, images/carousels use impressions)
    const totalFilteredImpressions = allFilteredInsights.reduce((sum, r) => sum + r.insights.impressions, 0);
    const totalFilteredReach = allFilteredInsights.reduce((sum, r) => sum + r.insights.reach, 0);
    const totalFilteredShares = allFilteredInsights.reduce((sum, r) => sum + r.insights.shares, 0);
    const totalFilteredSaves = allFilteredInsights.reduce((sum, r) => sum + r.insights.saved, 0);
    const totalFilteredLikes = allFilteredInsights.reduce((sum, r) => sum + (r.like_count || 0), 0);
    const totalFilteredComments = allFilteredInsights.reduce((sum, r) => sum + (r.comments_count || 0), 0);

    // Reel-specific stats
    const reelViews = reelInsights.reduce((sum, r) => sum + r.insights.views, 0);
    const reelImpressions = reelInsights.reduce((sum, r) => sum + r.insights.impressions, 0);
    const reelReach = reelInsights.reduce((sum, r) => sum + r.insights.reach, 0);
    const reelShares = reelInsights.reduce((sum, r) => sum + r.insights.shares, 0);
    const reelSaves = reelInsights.reduce((sum, r) => sum + r.insights.saved, 0);
    const totalWatchTimeMs = reelInsights.reduce((sum, r) => sum + r.insights.totalWatchTimeMs, 0);
    const avgWatchTimeMs = reelInsights.length > 0
      ? reelInsights.reduce((sum, r) => sum + r.insights.avgWatchTimeMs, 0) / reelInsights.length
      : 0;

    // Image-specific stats
    const imageImpressions = imageInsights.reduce((sum, r) => sum + r.insights.impressions, 0);
    const imageReach = imageInsights.reduce((sum, r) => sum + r.insights.reach, 0);
    const imageSaves = imageInsights.reduce((sum, r) => sum + r.insights.saved, 0);
    const imageLikes = imageInsights.reduce((sum, r) => sum + (r.like_count || 0), 0);
    const imageComments = imageInsights.reduce((sum, r) => sum + (r.comments_count || 0), 0);

    // Carousel-specific stats
    const carouselImpressions = carouselInsights.reduce((sum, r) => sum + r.insights.impressions, 0);
    const carouselReach = carouselInsights.reduce((sum, r) => sum + r.insights.reach, 0);
    const carouselSaves = carouselInsights.reduce((sum, r) => sum + r.insights.saved, 0);
    const carouselLikes = carouselInsights.reduce((sum, r) => sum + (r.like_count || 0), 0);
    const carouselComments = carouselInsights.reduce((sum, r) => sum + (r.comments_count || 0), 0);

    // Reel engagement from basic fields
    const reelLikes = reelInsights.reduce((sum, r) => sum + (r.like_count || 0), 0);
    const reelComments = reelInsights.reduce((sum, r) => sum + (r.comments_count || 0), 0);

    // 9. Also fetch insights for ALL reels (lifetime) for lifetime totals
    // Only fetch reels not already in the filtered set
    const filteredReelIds = new Set(reelInsights.map(r => r.id));
    const remainingReels = reels.filter(r => !filteredReelIds.has(r.id));

    const remainingReelInsights: MediaWithInsights[] = [];
    for (let i = 0; i < remainingReels.length; i += batchSize) {
      const batch = remainingReels.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(fetchMediaInsights));
      remainingReelInsights.push(...batchResults);
    }

    const allReelInsights = [...reelInsights, ...remainingReelInsights];
    const lifetimeReelViews = allReelInsights.reduce((sum, r) => sum + r.insights.views, 0);
    const lifetimeReelReach = allReelInsights.reduce((sum, r) => sum + r.insights.reach, 0);
    const lifetimeReelShares = allReelInsights.reduce((sum, r) => sum + r.insights.shares, 0);
    const lifetimeReelSaves = allReelInsights.reduce((sum, r) => sum + r.insights.saved, 0);
    const lifetimeWatchTimeMs = allReelInsights.reduce((sum, r) => sum + r.insights.totalWatchTimeMs, 0);
    const lifetimeAvgWatchTimeMs = allReelInsights.length > 0
      ? allReelInsights.reduce((sum, r) => sum + r.insights.avgWatchTimeMs, 0) / allReelInsights.length
      : 0;

    // 10. Sort and get top/bottom performers (from filtered set, all content types)
    const sortedByImpressions = [...allFilteredInsights].sort((a, b) => b.insights.impressions - a.insights.impressions);
    const topPerformers = sortedByImpressions.slice(0, 10);
    const bottomPerformers = sortedByImpressions.filter(m => m.insights.impressions > 0).slice(-5).reverse();

    // 11. Format content for response
    const formatContent = (r: MediaWithInsights) => ({
      id: r.id,
      caption: r.caption?.slice(0, 100) || '',
      timestamp: r.timestamp,
      permalink: r.permalink,
      mediaType: r.media_type,
      likes: r.like_count,
      comments: r.comments_count,
      views: r.insights.views,         // Reel plays (3-sec). 0 for images/carousels.
      impressions: r.insights.impressions, // Times displayed (all content types)
      reach: r.insights.reach,
      shares: r.insights.shares,
      saved: r.insights.saved,
      avgWatchTimeSec: Math.round(r.insights.avgWatchTimeMs / 1000),
      engagementRate: r.engagementRate.toFixed(2) + '%',
    });

    // Convert watch time to readable format
    const totalWatchTimeHours = Math.round(totalWatchTimeMs / 1000 / 60 / 60);
    const avgWatchTimeSec = Math.round(avgWatchTimeMs / 1000);
    const lifetimeWatchTimeHours = Math.round(lifetimeWatchTimeMs / 1000 / 60 / 60);
    const lifetimeAvgWatchTimeSec = Math.round(lifetimeAvgWatchTimeMs / 1000);

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

      // Content Library (all time counts)
      contentBreakdown: {
        total: igInfo.media_count,
        reels: reels.length,
        images: images.length,
        carousels: carousels.length,
      },

      // *** TOTAL VIEWS / IMPRESSIONS — ALL CONTENT ***
      totalViews: {
        reels: lifetimeReelViews,
        allContent: lifetimeReelViews, // lifetime: only reels have full insights fetched
      },

      // YTD / Filtered Stats — NOW INCLUDES ALL CONTENT TYPES
      ytd: {
        year: now.getFullYear(),
        // Date range
        from: filterStart.toISOString().split('T')[0],
        to: filterEnd.toISOString().split('T')[0],
        // Total content
        contentCount: filteredMedia.length,
        reelCount: filteredReels.length,
        imageCount: filteredImages.length,
        carouselCount: filteredCarousels.length,
        // Separated metrics — DO NOT mix these in aggregate totals
        views: totalFilteredViews,          // Reel plays only (3-sec threshold) — comparable to YouTube views
        impressions: totalFilteredImpressions, // All content: reel views + image/carousel impressions
        reach: totalFilteredReach,
        likes: totalFilteredLikes,
        comments: totalFilteredComments,
        shares: totalFilteredShares,
        saves: totalFilteredSaves,
        avgViewsPerReel: filteredReels.length > 0 ? Math.round(reelViews / filteredReels.length) : 0,
        avgImpressionsPerContent: filteredMedia.length > 0 ? Math.round(totalFilteredImpressions / filteredMedia.length) : 0,
        // Breakdown by type
        byType: {
          reels: {
            count: filteredReels.length,
            views: reelViews,
            impressions: reelImpressions,
            reach: reelReach,
            shares: reelShares,
            saves: reelSaves,
            likes: reelLikes,
            comments: reelComments,
            watchTimeHours: totalWatchTimeHours,
            avgWatchTimeSec: avgWatchTimeSec,
          },
          images: {
            count: filteredImages.length,
            impressions: imageImpressions,
            reach: imageReach,
            saves: imageSaves,
            likes: imageLikes,
            comments: imageComments,
          },
          carousels: {
            count: filteredCarousels.length,
            impressions: carouselImpressions,
            reach: carouselReach,
            saves: carouselSaves,
            likes: carouselLikes,
            comments: carouselComments,
          },
        },
      },

      // Aggregate Stats (All Content, basic fields)
      allTimeStats: {
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalShares: lifetimeReelShares,
        totalSaves: lifetimeReelSaves,
        avgLikesPerPost: allMedia.length > 0 ? Math.round(totalLikes / allMedia.length) : 0,
        avgCommentsPerPost: allMedia.length > 0 ? Math.round(totalComments / allMedia.length) : 0,
      },

      // Reels Performance (lifetime — backwards compatible)
      reelsPerformance: {
        totalReels: reels.length,
        totalViews: lifetimeReelViews,
        totalReach: lifetimeReelReach,
        totalShares: lifetimeReelShares,
        totalSaves: lifetimeReelSaves,
        totalWatchTimeHours: lifetimeWatchTimeHours,
        avgWatchTimeSec: lifetimeAvgWatchTimeSec,
        avgViewsPerReel: reels.length > 0 ? Math.round(lifetimeReelViews / reels.length) : 0,
        avgEngagementRate: allReelInsights.length > 0
          ? (allReelInsights.reduce((sum, r) => sum + r.engagementRate, 0) / allReelInsights.length).toFixed(2) + '%'
          : '0%',
        bestPerformers: topPerformers.map(formatContent),
        needsImprovement: bottomPerformers.map(formatContent),
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v18.0',
        totalMediaFetched: allMedia.length,
        insightsAnalyzed: allFilteredInsights.length,
        reelsAnalyzed: allReelInsights.length,
        metricDefinitions: {
          views: 'Reel plays only (3-sec threshold). Comparable to YouTube views. Does NOT include images/carousels.',
          impressions: 'All content displayed. For reels = views; for images/carousels = times shown. NOT comparable to YouTube views.',
        },
        fromCache: false,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    };

    // Store in cache
    setCache(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
