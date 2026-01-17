import { NextResponse } from 'next/server';
import { getCached, setCache, getCacheInfo, getTimeUntilRefresh } from '@/lib/cache';

// TikTok API - Fetch video data and stats for PL account
// Requires OAuth access token from authorized TikTok account

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const CACHE_KEY = 'tiktok_pl_data';

interface TikTokVideo {
  id: string;
  title: string;
  cover_image_url: string;
  share_url: string;
  create_time: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
}

interface TikTokUserInfo {
  open_id: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

export async function GET() {
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

  if (!TIKTOK_ACCESS_TOKEN) {
    return NextResponse.json({
      error: 'TikTok not connected',
      setup_required: true,
      setup_url: '/api/tiktok/auth',
      message: 'Visit /api/tiktok/auth to connect your TikTok account',
    }, { status: 401 });
  }

  try {
    // 1. Get user info (follower count, likes, etc.)
    const userInfoResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count',
      {
        headers: {
          'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
        },
      }
    );

    const userInfoData = await userInfoResponse.json();

    if (userInfoData.error?.code) {
      console.error('TikTok user info error:', userInfoData.error);
      return NextResponse.json({
        error: 'Failed to fetch TikTok user info',
        details: userInfoData.error,
        token_expired: userInfoData.error.code === 'access_token_invalid',
      }, { status: 401 });
    }

    const userInfo: TikTokUserInfo = userInfoData.data?.user || {};

    // 2. Get video list with view counts
    const videosResponse = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time,view_count,like_count,comment_count,share_count',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_count: 100, // Get up to 100 videos
        }),
      }
    );

    const videosData = await videosResponse.json();
    const videos: TikTokVideo[] = videosData.data?.videos || [];

    // Calculate totals
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.comment_count || 0), 0);
    const totalShares = videos.reduce((sum, v) => sum + (v.share_count || 0), 0);

    // Sort videos by views for top/bottom performers
    const sortedByViews = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    const topPerformers = sortedByViews.slice(0, 5);
    const bottomPerformers = sortedByViews.slice(-5).reverse();

    const responseData = {
      // Account Overview
      account: {
        displayName: userInfo.display_name,
        avatarUrl: userInfo.avatar_url,
        followers: userInfo.follower_count || 0,
        following: userInfo.following_count || 0,
        totalLikes: userInfo.likes_count || 0,
        videoCount: userInfo.video_count || 0,
      },

      // *** KEY METRICS FOR TOTAL VIEWS ***
      totalViews: {
        videos: totalViews,
        allContent: totalViews,
      },

      // Aggregate Stats
      allTimeStats: {
        totalVideos: videos.length,
        totalViews: totalViews,
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalShares: totalShares,
        avgViewsPerVideo: videos.length > 0 ? Math.round(totalViews / videos.length) : 0,
        avgLikesPerVideo: videos.length > 0 ? Math.round(totalLikes / videos.length) : 0,
      },

      // Video Performance
      videoPerformance: {
        totalVideos: videos.length,
        bestPerformers: topPerformers.map(v => ({
          id: v.id,
          title: v.title || 'Untitled',
          views: v.view_count || 0,
          likes: v.like_count || 0,
          comments: v.comment_count || 0,
          shares: v.share_count || 0,
          coverImage: v.cover_image_url,
          shareUrl: v.share_url,
          createdAt: new Date(v.create_time * 1000).toISOString(),
        })),
        needsImprovement: bottomPerformers.map(v => ({
          id: v.id,
          title: v.title || 'Untitled',
          views: v.view_count || 0,
          likes: v.like_count || 0,
          coverImage: v.cover_image_url,
          shareUrl: v.share_url,
        })),
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v2',
        videosAnalyzed: videos.length,
        note: 'totalViews represents actual view count across all TikTok videos',
        fromCache: false,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    };

    // Store in cache for next requests until 5am ET
    setCache(CACHE_KEY, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('TikTok API error:', error);
    return NextResponse.json({ error: 'Failed to fetch TikTok data' }, { status: 500 });
  }
}
