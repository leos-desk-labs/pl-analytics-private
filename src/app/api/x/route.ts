import { NextResponse } from 'next/server';
import { getCached, setCache, getCacheInfo, getTimeUntilRefresh } from '@/lib/cache';

// X (Twitter) API - Fetch account data and tweet stats for PL account
// Uses Bearer Token (App-only auth) - no OAuth required

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const X_USERNAME = process.env.X_USERNAME || 'PeoplesLeagueX';

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

  if (!X_BEARER_TOKEN) {
    return NextResponse.json({
      error: 'X_BEARER_TOKEN not configured',
      message: 'Add X_BEARER_TOKEN environment variable from the X Developer Portal (Keys & Tokens > Bearer Token)',
      setup_required: true,
    }, { status: 401 });
  }

  try {
    // 1. Get user info by username (app-only auth)
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${X_USERNAME}?user.fields=id,name,username,profile_image_url,description,public_metrics,verified,created_at`,
      {
        headers: {
          'Authorization': `Bearer ${X_BEARER_TOKEN}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (userData.errors) {
      console.error('X user info error:', userData.errors);
      return NextResponse.json({
        error: 'Failed to fetch X user info',
        details: userData.errors,
      }, { status: 500 });
    }

    if (!userData.data) {
      return NextResponse.json({
        error: 'User not found',
        username: X_USERNAME,
      }, { status: 404 });
    }

    const userInfo: XUser = userData.data;

    // 2. Get recent tweets with metrics
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userInfo.id}/tweets?max_results=100&tweet.fields=id,text,created_at,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${X_BEARER_TOKEN}`,
        },
      }
    );

    const tweetsData = await tweetsResponse.json();
    const tweets: XTweet[] = tweetsData.data || [];

    // Calculate totals from recent tweets
    // Note: impression_count requires user auth, so it may be 0 with app-only auth
    const totalImpressions = tweets.reduce((sum, t) => sum + (t.public_metrics?.impression_count || 0), 0);
    const totalLikes = tweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0);
    const totalRetweets = tweets.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0);
    const totalReplies = tweets.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0);
    const totalQuotes = tweets.reduce((sum, t) => sum + (t.public_metrics?.quote_count || 0), 0);
    const totalBookmarks = tweets.reduce((sum, t) => sum + (t.public_metrics?.bookmark_count || 0), 0);

    // Sort tweets by likes (since impressions may not be available)
    const sortedByLikes = [...tweets].sort(
      (a, b) => (b.public_metrics?.like_count || 0) - (a.public_metrics?.like_count || 0)
    );
    const topPerformers = sortedByLikes.slice(0, 5);

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
        avgLikesPerTweet: tweets.length > 0 ? Math.round(totalLikes / tweets.length) : 0,
        avgEngagementPerTweet: tweets.length > 0 ? Math.round((totalLikes + totalRetweets + totalReplies) / tweets.length) : 0,
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
          url: `https://x.com/${userInfo.username}/status/${t.id}`,
          createdAt: t.created_at,
        })),
      },

      // Metadata
      _meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v2',
        authType: 'app-only',
        tweetsAnalyzed: tweets.length,
        note: 'Using app-only auth. Impressions require user auth (OAuth 2.0 with user context).',
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
