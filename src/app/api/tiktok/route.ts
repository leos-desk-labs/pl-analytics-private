import { NextResponse } from 'next/server';
import { getCached, setCache, getCacheInfo, getTimeUntilRefresh } from '@/lib/cache';

// TikTok API - Fetch profile stats from public profile page
// No API key required - uses server-side rendering data from TikTok profile
// Video-level analytics not available (TikTok rejected API app for internal use)

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || 'peoplesleaguegolf';
const CACHE_KEY = 'tiktok_pl_data';

interface TikTokProfileStats {
  followerCount: number;
  followingCount: number;
  heartCount: number;
  heart: number;
  videoCount: number;
  diggCount: number;
  friendCount: number;
}

interface TikTokUserInfo {
  uniqueId: string;
  nickname: string;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  signature: string;
  verified: boolean;
}

async function fetchTikTokProfileData(username: string) {
  // Fetch the public profile page - TikTok includes stats in SSR HTML
  const response = await fetch(`https://www.tiktok.com/@${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`TikTok profile fetch failed: ${response.status}`);
  }

  const html = await response.text();

  // Extract the __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON from the page
  const scriptMatch = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
  );

  if (!scriptMatch) {
    throw new Error('Could not find TikTok profile data in page HTML');
  }

  const pageData = JSON.parse(scriptMatch[1]);
  const defaultScope = pageData['__DEFAULT_SCOPE__'] || {};
  const userDetail = defaultScope['webapp.user-detail'] || {};

  if (userDetail.statusCode && userDetail.statusCode !== 0) {
    throw new Error(`TikTok profile error: ${userDetail.statusMsg || 'Unknown error'}`);
  }

  const userInfo: TikTokUserInfo = userDetail.userInfo?.user || {};
  const stats: TikTokProfileStats = userDetail.userInfo?.stats || {};
  const statsV2 = userDetail.userInfo?.statsV2 || {};

  // Use statsV2 if available (newer format), fallback to stats
  const followerCount = Number(statsV2.followerCount) || stats.followerCount || 0;
  const followingCount = Number(statsV2.followingCount) || stats.followingCount || 0;
  const heartCount = Number(statsV2.heartCount) || Number(statsV2.heart) || stats.heartCount || stats.heart || 0;
  const videoCount = Number(statsV2.videoCount) || stats.videoCount || 0;

  return {
    user: userInfo,
    stats: {
      followerCount,
      followingCount,
      heartCount,
      videoCount,
    },
  };
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

  try {
    const profileData = await fetchTikTokProfileData(TIKTOK_USERNAME);

    const responseData = {
      // Account Overview
      account: {
        displayName: profileData.user.nickname || TIKTOK_USERNAME,
        username: profileData.user.uniqueId || TIKTOK_USERNAME,
        avatarUrl: profileData.user.avatarLarger || profileData.user.avatarMedium || '',
        bio: profileData.user.signature || '',
        verified: profileData.user.verified || false,
        followers: profileData.stats.followerCount,
        following: profileData.stats.followingCount,
        totalLikes: profileData.stats.heartCount,
        videoCount: profileData.stats.videoCount,
      },

      // Aggregate Stats (profile-level only since API isn't available)
      allTimeStats: {
        totalVideos: profileData.stats.videoCount,
        totalLikes: profileData.stats.heartCount,
        followers: profileData.stats.followerCount,
        following: profileData.stats.followingCount,
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        source: 'public_profile',
        note: 'Profile-level stats from public TikTok page. Per-video analytics unavailable (TikTok API not approved for internal use).',
        fromCache: false,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    };

    // Store in cache
    setCache(CACHE_KEY, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('TikTok profile fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch TikTok data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
