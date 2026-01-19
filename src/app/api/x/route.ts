import { NextResponse } from 'next/server';
import { getCached, setCache, getCacheInfo, getTimeUntilRefresh } from '@/lib/cache';

// X (Twitter) API - Fetch account data and tweet stats for PL account
// Automatically refreshes access token when expired

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const X_REFRESH_TOKEN = process.env.X_REFRESH_TOKEN;
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;

const CACHE_KEY = 'x_pl_data';

interface XUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  description: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
    like_count: number;
  };
  verified: boolean;
  created_at: string;
}

interface XTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
  attachments?: {
    media_keys?: string[];
  };
}

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// In-memory token storage
let cachedToken: TokenData | null = null;

async function getValidAccessToken(): Promise<string | null> {
  // Check if we have a cached token that's still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expires_at > Date.now() + 5 * 60 * 1000) {
    return cachedToken.access_token;
  }

  // If we have a static access token (for basic tier), use it
  if (X_ACCESS_TOKEN && !X_REFRESH_TOKEN) {
    return X_ACCESS_TOKEN;
  }

  // Need to refresh the token
  if (!X_CLIENT_ID || !X_CLIENT_SECRET || !X_REFRESH_TOKEN) {
    console.error('Missing X credentials for token refresh');
    return null;
  }

  try {
    console.log('Refreshing X access token...');

    const refreshToken = cachedToken?.refresh_token || X_REFRESH_TOKEN;
    const credentials = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('X token refresh error:', tokenData);
      return null;
    }

    // Cache the new tokens
    cachedToken = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || refreshToken,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
    };

    console.log('X token refreshed successfully, expires in', tokenData.expires_in, 'seconds');

    // Log the new refresh token if it changed
    if (tokenData.refresh_token && tokenData.refresh_token !== X_REFRESH_TOKEN) {
      console.log('New refresh token issued - update X_REFRESH_TOKEN env var:', tokenData.refresh_token);
    }

    return cachedToken.access_token;
  } catch (error) {
    console.error('Failed to refresh X token:', error);
    return null;
  }
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

  // Get a valid access token (auto-refreshes if needed)
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({
      error: 'X authentication failed',
      setup_required: !X_REFRESH_TOKEN && !X_ACCESS_TOKEN,
      message: X_REFRESH_TOKEN || X_ACCESS_TOKEN
        ? 'Token refresh failed. The token may have expired. Re-authorize at /api/x/auth'
        : 'Missing X credentials. Visit /api/x/auth to connect your X account, or add X_ACCESS_TOKEN for bearer token auth',
    }, { status: 401 });
  }

  try {
    // 1. Get authenticated user info
    const userResponse = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,description,public_metrics,verified,created_at',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (userData.errors) {
      console.error('X user info error:', userData.errors);

      if (userData.errors[0]?.type === 'https://api.twitter.com/2/problems/not-authorized-for-resource') {
        return NextResponse.json({
          error: 'X API access denied',
          message: 'Your X API access level may not include this endpoint. Check your developer portal access level.',
        }, { status: 403 });
      }

      return NextResponse.json({
        error: 'Failed to fetch X user info',
        details: userData.errors,
      }, { status: 500 });
    }

    const userInfo: XUser = userData.data;

    // 2. Get recent tweets with metrics
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userInfo.id}/tweets?max_results=100&tweet.fields=id,text,created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=type,url,preview_image_url`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const tweetsData = await tweetsResponse.json();
    const tweets: XTweet[] = tweetsData.data || [];
    const media = tweetsData.includes?.media || [];

    // Calculate totals from recent tweets
    const totalImpressions = tweets.reduce((sum, t) => sum + (t.public_metrics?.impression_count || 0), 0);
    const totalLikes = tweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0);
    const totalRetweets = tweets.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0);
    const totalReplies = tweets.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0);
    const totalQuotes = tweets.reduce((sum, t) => sum + (t.public_metrics?.quote_count || 0), 0);
    const totalBookmarks = tweets.reduce((sum, t) => sum + (t.public_metrics?.bookmark_count || 0), 0);

    // Sort tweets by impressions for top/bottom performers
    const sortedByImpressions = [...tweets].sort(
      (a, b) => (b.public_metrics?.impression_count || 0) - (a.public_metrics?.impression_count || 0)
    );
    const topPerformers = sortedByImpressions.slice(0, 5);
    const bottomPerformers = sortedByImpressions.slice(-5).reverse();

    const responseData = {
      // Account Overview
      account: {
        id: userInfo.id,
        name: userInfo.name,
        username: userInfo.username,
        avatarUrl: userInfo.profile_image_url?.replace('_normal', '_400x400'),
        description: userInfo.description,
        verified: userInfo.verified,
        followers: userInfo.public_metrics?.followers_count || 0,
        following: userInfo.public_metrics?.following_count || 0,
        tweetCount: userInfo.public_metrics?.tweet_count || 0,
        listedCount: userInfo.public_metrics?.listed_count || 0,
        createdAt: userInfo.created_at,
      },

      // Recent Tweets Stats (last 100)
      recentStats: {
        tweetsAnalyzed: tweets.length,
        totalImpressions,
        totalLikes,
        totalRetweets,
        totalReplies,
        totalQuotes,
        totalBookmarks,
        totalEngagement: totalLikes + totalRetweets + totalReplies + totalQuotes,
        avgImpressionsPerTweet: tweets.length > 0 ? Math.round(totalImpressions / tweets.length) : 0,
        avgEngagementPerTweet: tweets.length > 0 ? Math.round((totalLikes + totalRetweets + totalReplies) / tweets.length) : 0,
        engagementRate: totalImpressions > 0
          ? ((totalLikes + totalRetweets + totalReplies) / totalImpressions * 100).toFixed(2) + '%'
          : '0%',
      },

      // Tweet Performance
      tweetPerformance: {
        totalTweets: tweets.length,
        bestPerformers: topPerformers.map(t => ({
          id: t.id,
          text: t.text?.substring(0, 100) + (t.text?.length > 100 ? '...' : ''),
          impressions: t.public_metrics?.impression_count || 0,
          likes: t.public_metrics?.like_count || 0,
          retweets: t.public_metrics?.retweet_count || 0,
          replies: t.public_metrics?.reply_count || 0,
          quotes: t.public_metrics?.quote_count || 0,
          url: `https://twitter.com/${userInfo.username}/status/${t.id}`,
          createdAt: t.created_at,
        })),
        needsImprovement: bottomPerformers.map(t => ({
          id: t.id,
          text: t.text?.substring(0, 100) + (t.text?.length > 100 ? '...' : ''),
          impressions: t.public_metrics?.impression_count || 0,
          likes: t.public_metrics?.like_count || 0,
          url: `https://twitter.com/${userInfo.username}/status/${t.id}`,
        })),
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v2',
        tweetsAnalyzed: tweets.length,
        note: 'Stats are based on the most recent 100 tweets. Impression data requires Basic API access or higher.',
        fromCache: false,
        cacheInfo: getCacheInfo(),
        nextRefresh: getTimeUntilRefresh(),
      },
    };

    // Store in cache for next requests until 5am ET
    setCache(CACHE_KEY, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('X API error:', error);
    return NextResponse.json({ error: 'Failed to fetch X data' }, { status: 500 });
  }
}
