import { NextResponse } from 'next/server';

// Force dynamic rendering for live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_INSTAGRAM_ID = process.env.META_INSTAGRAM_ID;

interface MediaItem {
  id: string;
  media_type: string;
  like_count: number;
  comments_count: number;
  caption?: string;
  timestamp: string;
  permalink: string;
}

interface MediaWithInsights extends MediaItem {
  reach: number;
  shares: number;
  saved: number;
  engagementRate: number;
}

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  if (!META_INSTAGRAM_ID) {
    return NextResponse.json({ error: 'META_INSTAGRAM_ID not configured' }, { status: 500 });
  }

  try {
    // 1. Get Instagram account info
    const igInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography&access_token=${META_ACCESS_TOKEN}`
    );
    const igInfo = await igInfoResponse.json();

    if (igInfo.error) {
      return NextResponse.json({ error: igInfo.error.message }, { status: 400 });
    }

    // 2. Get account-level insights
    const [reachData, engagementData] = await Promise.all([
      fetch(`https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/insights?metric=reach,follower_count&period=day&access_token=${META_ACCESS_TOKEN}`).then(r => r.json()),
      fetch(`https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/insights?metric=accounts_engaged,total_interactions&metric_type=total_value&period=day&access_token=${META_ACCESS_TOKEN}`).then(r => r.json()),
    ]);

    const todayReach = reachData.data?.find((m: { name: string }) => m.name === 'reach')?.values?.[0]?.value || 0;
    const accountsEngaged = engagementData.data?.find((m: { name: string }) => m.name === 'accounts_engaged')?.total_value?.value || 0;
    const totalInteractions = engagementData.data?.find((m: { name: string }) => m.name === 'total_interactions')?.total_value?.value || 0;

    // 3. Get ALL media (basic fields only - fast pagination)
    const allMedia: MediaItem[] = [];
    let nextUrl: string | null = `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/media?fields=id,media_type,like_count,comments_count,caption,timestamp,permalink&limit=100&access_token=${META_ACCESS_TOKEN}`;

    while (nextUrl && allMedia.length < 500) {
      const mediaResponse = await fetch(nextUrl);
      const mediaData = await mediaResponse.json();
      if (mediaData.data) {
        allMedia.push(...mediaData.data);
      }
      nextUrl = mediaData.paging?.next || null;
    }

    // 4. Calculate content breakdown
    const reels = allMedia.filter(m => m.media_type === 'VIDEO');
    const images = allMedia.filter(m => m.media_type === 'IMAGE');
    const carousels = allMedia.filter(m => m.media_type === 'CAROUSEL_ALBUM');

    // 5. Calculate totals
    const totalLikes = allMedia.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = allMedia.reduce((sum, m) => sum + (m.comments_count || 0), 0);

    // 6. Get detailed insights for top 10 and bottom 5 performing reels
    // Sort by engagement (likes + comments)
    const sortedReels = [...reels].sort((a, b) =>
      (b.like_count + b.comments_count) - (a.like_count + a.comments_count)
    );

    const topReels = sortedReels.slice(0, 10);
    const bottomReels = sortedReels.slice(-5).reverse();

    // Fetch insights for these reels in parallel
    async function getReelInsights(media: MediaItem): Promise<MediaWithInsights> {
      try {
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${media.id}/insights?metric=reach,shares,saved&access_token=${META_ACCESS_TOKEN}`
        );
        const insights = await insightsResponse.json();

        const reach = insights.data?.find((i: { name: string }) => i.name === 'reach')?.values?.[0]?.value || 0;
        const shares = insights.data?.find((i: { name: string }) => i.name === 'shares')?.values?.[0]?.value || 0;
        const saved = insights.data?.find((i: { name: string }) => i.name === 'saved')?.values?.[0]?.value || 0;

        return {
          ...media,
          reach,
          shares,
          saved,
          engagementRate: reach > 0 ? ((media.like_count + media.comments_count + shares + saved) / reach * 100) : 0,
        };
      } catch {
        return {
          ...media,
          reach: 0,
          shares: 0,
          saved: 0,
          engagementRate: 0,
        };
      }
    }

    const [topReelsWithInsights, bottomReelsWithInsights] = await Promise.all([
      Promise.all(topReels.map(getReelInsights)),
      Promise.all(bottomReels.map(getReelInsights)),
    ]);

    // 7. Calculate aggregate reel stats from top performers
    const topReelsTotalReach = topReelsWithInsights.reduce((sum, r) => sum + r.reach, 0);
    const avgEngagementRate = topReelsWithInsights.length > 0
      ? topReelsWithInsights.reduce((sum, r) => sum + r.engagementRate, 0) / topReelsWithInsights.length
      : 0;

    // 8. Format for response
    const formatReel = (r: MediaWithInsights) => ({
      id: r.id,
      caption: r.caption?.slice(0, 100) || '',
      timestamp: r.timestamp,
      permalink: r.permalink,
      likes: r.like_count,
      comments: r.comments_count,
      reach: r.reach,
      shares: r.shares,
      saved: r.saved,
      engagementRate: r.engagementRate.toFixed(2) + '%',
    });

    return NextResponse.json({
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

      // Aggregate Stats (All Content)
      allTimeStats: {
        totalLikes: totalLikes,
        totalComments: totalComments,
        avgLikesPerPost: Math.round(totalLikes / allMedia.length),
        avgCommentsPerPost: Math.round(totalComments / allMedia.length),
      },

      // Reels Performance
      reelsPerformance: {
        totalReels: reels.length,
        topReelsReach: topReelsTotalReach,
        avgEngagementRate: avgEngagementRate.toFixed(2) + '%',
        bestPerformers: topReelsWithInsights.map(formatReel),
        needsImprovement: bottomReelsWithInsights.map(formatReel),
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v18.0',
        mediaAnalyzed: allMedia.length,
      },
    });
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
