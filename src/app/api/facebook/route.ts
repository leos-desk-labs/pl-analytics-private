import { NextResponse } from 'next/server';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_PAGE_ID = process.env.META_PAGE_ID;

interface VideoData {
  id: string;
  title?: string;
  description?: string;
  created_time: string;
  length?: number;
  views: number;
  likes: number;
  comments: number;
}

interface PostData {
  id: string;
  message?: string;
  created_time: string;
  reactions: number;
  comments: number;
  shares: number;
}

export async function GET() {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  try {
    let pageId: string;
    let pageAccessToken: string;

    // Try to get page access token from User token first
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token,followers_count,fan_count&access_token=${META_ACCESS_TOKEN}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesData.error && pagesData.data?.length > 0) {
      // User token flow - get page token from /me/accounts
      const pages = pagesData.data || [];
      const plPage = pages.find((p: any) => p.name?.toLowerCase().includes('peoples league')) || pages[0];

      if (!plPage) {
        return NextResponse.json({ error: 'No Facebook Pages found.' }, { status: 400 });
      }

      pageId = plPage.id;
      pageAccessToken = plPage.access_token;
    } else if (META_PAGE_ID) {
      // Fallback: Token is already a Page Access Token, use META_PAGE_ID directly
      pageId = META_PAGE_ID;
      pageAccessToken = META_ACCESS_TOKEN;
    } else {
      return NextResponse.json({
        error: 'Could not authenticate. Token may be expired or META_PAGE_ID not configured.',
        details: pagesData.error?.message
      }, { status: 400 });
    }

    // Get page info
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v24.0/${pageId}?fields=id,name,followers_count,fan_count,link,picture&access_token=${pageAccessToken}`
    );
    const pageInfo = await pageInfoResponse.json();

    if (pageInfo.error) {
      return NextResponse.json({ error: pageInfo.error.message }, { status: 400 });
    }

    // ============================================
    // COMPREHENSIVE DATA COLLECTION - ALL CONTENT
    // ============================================

    // 1. Fetch ALL videos with pagination (lifetime views per video)
    // Simplified fields to avoid "reduce data" error
    const allVideos: VideoData[] = [];
    let videoNextUrl: string | null = `https://graph.facebook.com/v24.0/${pageId}/videos?fields=id,title,description,created_time,views&limit=50&access_token=${pageAccessToken}`;
    let videoPageCount = 0;

    let videoFetchError: string | null = null;
    while (videoNextUrl && videoPageCount < 20) {
      videoPageCount++;
      try {
        const videoResponse: Response = await fetch(videoNextUrl);
        const videoData: any = await videoResponse.json();

        if (videoData.error) {
          videoFetchError = videoData.error.message || 'Unknown video error';
          console.error('Video fetch error:', videoData.error);
          break;
        }

        if (videoData.data && Array.isArray(videoData.data)) {
          for (const video of videoData.data) {
            allVideos.push({
              id: video.id,
              title: video.title,
              description: video.description || '',
              created_time: video.created_time,
              length: video.length || 0,
              views: video.views || 0,
              likes: 0, // Skip to reduce payload
              comments: 0, // Skip to reduce payload
            });
          }
        }

        videoNextUrl = videoData.paging?.next || null;
      } catch (err) {
        videoFetchError = String(err);
        console.error('Video pagination error:', err);
        break;
      }
    }

    // 2. Fetch ALL posts with pagination (lifetime engagement per post)
    const allPosts: PostData[] = [];
    let postNextUrl: string | null = `https://graph.facebook.com/v24.0/${pageId}/posts?fields=id,message,created_time,shares,reactions.summary(total_count),comments.summary(total_count)&limit=100&access_token=${pageAccessToken}`;

    while (postNextUrl) {
      const postResponse: Response = await fetch(postNextUrl);
      const postData: any = await postResponse.json();

      if (postData.data) {
        postData.data.forEach((post: any) => {
          allPosts.push({
            id: post.id,
            message: post.message,
            created_time: post.created_time,
            reactions: post.reactions?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
          });
        });
      }

      postNextUrl = postData.paging?.next || null;
    }

    // 3. Get 28-day rolling engagement from Page Insights (for trend comparison)
    let engagements28Day = 0;
    let pageViews = 0;

    try {
      const [engResponse, viewsResponse] = await Promise.all([
        fetch(`https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_post_engagements&period=days_28&access_token=${pageAccessToken}`),
        fetch(`https://graph.facebook.com/v24.0/${pageId}/insights?metric=page_views_total&period=day&access_token=${pageAccessToken}`),
      ]);

      const engData = await engResponse.json();
      const viewsData = await viewsResponse.json();

      if (engData.data) {
        const engMetric = engData.data.find((m: any) => m.name === 'page_post_engagements');
        engagements28Day = engMetric?.values?.[engMetric.values.length - 1]?.value || 0;
      }

      if (viewsData.data) {
        const pageViewsMetric = viewsData.data.find((m: any) => m.name === 'page_views_total');
        pageViews = pageViewsMetric?.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0;
      }
    } catch (e) {
      console.log('Insights fetch error:', e);
    }

    // ============================================
    // CALCULATE LIFETIME AND YTD TOTALS
    // ============================================

    // YTD date range (Jan 1 of current year)
    const now = new Date();
    const ytdStart = new Date(now.getFullYear(), 0, 1); // Jan 1st

    // Filter videos for YTD
    const ytdVideos = allVideos.filter(v => new Date(v.created_time) >= ytdStart);
    const ytdVideoViews = ytdVideos.reduce((sum, v) => sum + v.views, 0);

    // Lifetime video metrics
    const lifetimeVideoViews = allVideos.reduce((sum, v) => sum + v.views, 0);
    const lifetimeVideoLikes = allVideos.reduce((sum, v) => sum + v.likes, 0);
    const lifetimeVideoComments = allVideos.reduce((sum, v) => sum + v.comments, 0);

    // Lifetime post metrics (all content)
    // Note: Individual post reactions often return 0 for Reels/cross-posts
    // Using 28-day Page Insights as engagement baseline since it's more accurate
    const lifetimeReactions = allPosts.reduce((sum, p) => sum + p.reactions, 0);
    const lifetimeComments = allPosts.reduce((sum, p) => sum + p.comments, 0);
    const lifetimeShares = allPosts.reduce((sum, p) => sum + p.shares, 0);
    const lifetimeEngagements = lifetimeReactions + lifetimeComments + lifetimeShares;

    // Top performing videos (sorted by views)
    const topVideos = [...allVideos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        title: v.title || v.description?.substring(0, 80) || '(Reel)',
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        createdTime: v.created_time,
      }));

    // Top performing posts (sorted by engagement)
    const topPosts = [...allPosts]
      .sort((a, b) => (b.reactions + b.comments + b.shares) - (a.reactions + a.comments + a.shares))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        message: p.message?.substring(0, 100) || '',
        createdTime: p.created_time,
        reactions: p.reactions,
        comments: p.comments,
        shares: p.shares,
        totalEngagement: p.reactions + p.comments + p.shares,
      }));

    // Recent posts for display
    const recentPosts = [...allPosts]
      .sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        message: p.message?.substring(0, 100) || '',
        createdTime: p.created_time,
        likes: p.reactions,
        comments: p.comments,
        shares: p.shares,
      }));

    // Calculate averages
    const avgViewsPerVideo = allVideos.length > 0 ? Math.round(lifetimeVideoViews / allVideos.length) : 0;
    const avgEngagementPerPost = allPosts.length > 0 ? Math.round(lifetimeEngagements / allPosts.length) : 0;

    return NextResponse.json({
      // Page Info
      pageId,
      pageName: pageInfo.name,
      followers: pageInfo.followers_count || pageInfo.fan_count || 0,
      pageLink: pageInfo.link,
      picture: pageInfo.picture?.data?.url,

      // LIFETIME TOTALS (comprehensive)
      lifetime: {
        videoViews: lifetimeVideoViews,
        videoCount: allVideos.length,
        postCount: allPosts.length,
        reactions: lifetimeReactions,
        comments: lifetimeComments,
        shares: lifetimeShares,
        // Use 28-day engagement as minimum since individual post data is incomplete
        totalEngagements: Math.max(lifetimeEngagements, engagements28Day),
        avgViewsPerVideo,
        avgEngagementPerPost,
      },

      // YTD Metrics (Year-to-Date)
      ytd: {
        videoViews: ytdVideoViews,
        videoCount: ytdVideos.length,
        engagements: engagements28Day, // Best available approximation
        year: now.getFullYear(),
      },

      // 28-Day Rolling (kept for reference)
      rolling28Day: {
        engagements: engagements28Day,
        pageViews,
      },

      // Top Performers
      topVideos,
      topPosts,
      recentPosts,

      // Legacy fields for backwards compatibility
      videoViews: lifetimeVideoViews,
      pageViews,
      engagements: lifetimeEngagements, // Now lifetime, not 28-day
      totalLikes: lifetimeReactions,
      totalComments: lifetimeComments,
      totalShares: lifetimeShares,

      // Metadata
      _meta: {
        videosAnalyzed: allVideos.length,
        postsAnalyzed: allPosts.length,
        videoPages: videoPageCount,
        videoError: videoFetchError,
        dataType: 'lifetime',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Facebook API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Facebook data' }, { status: 500 });
  }
}
