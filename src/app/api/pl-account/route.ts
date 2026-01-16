import { NextResponse } from 'next/server';

// Force dynamic rendering for live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_INSTAGRAM_ID = process.env.META_INSTAGRAM_ID; // 17841466383183078
const META_PAGE_ID = process.env.META_PAGE_ID; // 719290654611865

// Cache for API responses (5 minute TTL for owned account data)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes for owned account

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// INSTAGRAM ACCOUNT DATA
// ============================================================================
async function getInstagramAccount() {
  const cached = getCached<InstagramAccountData>('ig_account');
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}?fields=username,followers_count,media_count,biography,profile_picture_url&access_token=${META_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.error) {
      console.error('Instagram account error:', data.error);
      return null;
    }

    const result: InstagramAccountData = {
      username: data.username,
      followersCount: data.followers_count,
      mediaCount: data.media_count,
      biography: data.biography,
      profilePictureUrl: data.profile_picture_url,
    };

    setCache('ig_account', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch Instagram account:', error);
    return null;
  }
}

interface InstagramAccountData {
  username: string;
  followersCount: number;
  mediaCount: number;
  biography: string;
  profilePictureUrl?: string;
}

// ============================================================================
// INSTAGRAM INSIGHTS (Account Level)
// ============================================================================
async function getInstagramInsights() {
  const cached = getCached<InstagramInsights>('ig_insights');
  if (cached) return cached;

  try {
    // Get daily reach and follower count
    const dailyResponse = await fetch(
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/insights?metric=reach,follower_count&period=day&access_token=${META_ACCESS_TOKEN}`
    );
    const dailyData = await dailyResponse.json();

    // Get engagement metrics
    const engagementResponse = await fetch(
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/insights?metric=accounts_engaged,total_interactions&metric_type=total_value&period=day&access_token=${META_ACCESS_TOKEN}`
    );
    const engagementData = await engagementResponse.json();

    const result: InstagramInsights = {
      reach: extractMetricValue(dailyData, 'reach'),
      followerChange: extractMetricValue(dailyData, 'follower_count'),
      accountsEngaged: extractTotalValue(engagementData, 'accounts_engaged'),
      totalInteractions: extractTotalValue(engagementData, 'total_interactions'),
      lastUpdated: new Date().toISOString(),
    };

    setCache('ig_insights', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch Instagram insights:', error);
    return null;
  }
}

interface InstagramInsights {
  reach: number;
  followerChange: number;
  accountsEngaged: number;
  totalInteractions: number;
  lastUpdated: string;
}

function extractMetricValue(data: { data?: Array<{ name: string; values?: Array<{ value: number }> }> }, metricName: string): number {
  const metric = data.data?.find(m => m.name === metricName);
  return metric?.values?.[0]?.value || 0;
}

function extractTotalValue(data: { data?: Array<{ name: string; total_value?: { value: number } }> }, metricName: string): number {
  const metric = data.data?.find(m => m.name === metricName);
  return metric?.total_value?.value || 0;
}

// ============================================================================
// INSTAGRAM MEDIA (Recent Posts & Reels)
// ============================================================================
async function getInstagramMedia(limit = 25) {
  const cached = getCached<InstagramMedia[]>('ig_media');
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}/media?fields=id,media_type,caption,timestamp,like_count,comments_count,permalink,thumbnail_url,media_url&limit=${limit}&access_token=${META_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.error) {
      console.error('Instagram media error:', data.error);
      return [];
    }

    // Fetch insights for each media item
    const mediaWithInsights = await Promise.all(
      (data.data || []).map(async (item: RawMediaItem) => {
        const insights = await getMediaInsights(item.id, item.media_type);
        return {
          id: item.id,
          mediaType: item.media_type,
          caption: item.caption,
          timestamp: item.timestamp,
          likes: item.like_count || 0,
          comments: item.comments_count || 0,
          permalink: item.permalink,
          thumbnailUrl: item.thumbnail_url,
          mediaUrl: item.media_url,
          insights,
        };
      })
    );

    setCache('ig_media', mediaWithInsights);
    return mediaWithInsights;
  } catch (error) {
    console.error('Failed to fetch Instagram media:', error);
    return [];
  }
}

interface RawMediaItem {
  id: string;
  media_type: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
}

interface MediaInsights {
  reach: number;
  saved: number;
  shares: number;
  totalInteractions: number;
  likes: number;
  comments: number;
}

interface InstagramMedia {
  id: string;
  mediaType: string;
  caption?: string;
  timestamp: string;
  likes: number;
  comments: number;
  permalink: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  insights: MediaInsights | null;
}

async function getMediaInsights(mediaId: string, mediaType: string): Promise<MediaInsights | null> {
  try {
    // Different metrics available for different media types
    const metrics = mediaType === 'VIDEO' || mediaType === 'REELS'
      ? 'reach,saved,shares,total_interactions,likes,comments'
      : 'reach,saved,total_interactions,likes,comments';

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}/insights?metric=${metrics}&access_token=${META_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.error) {
      return null;
    }

    return {
      reach: extractInsightValue(data, 'reach'),
      saved: extractInsightValue(data, 'saved'),
      shares: extractInsightValue(data, 'shares'),
      totalInteractions: extractInsightValue(data, 'total_interactions'),
      likes: extractInsightValue(data, 'likes'),
      comments: extractInsightValue(data, 'comments'),
    };
  } catch {
    return null;
  }
}

function extractInsightValue(data: { data?: Array<{ name: string; values?: Array<{ value: number }> }> }, name: string): number {
  const insight = data.data?.find(d => d.name === name);
  return insight?.values?.[0]?.value || 0;
}

// ============================================================================
// MAIN API ENDPOINT
// ============================================================================
export async function GET() {
  if (!META_ACCESS_TOKEN || !META_INSTAGRAM_ID) {
    return NextResponse.json(
      { error: 'Meta API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const [account, insights, media] = await Promise.all([
      getInstagramAccount(),
      getInstagramInsights(),
      getInstagramMedia(25),
    ]);

    // Calculate Reels-specific stats
    const reels = media.filter(m => m.mediaType === 'VIDEO' || m.mediaType === 'REELS');
    const reelsStats = {
      count: reels.length,
      totalReach: reels.reduce((sum, r) => sum + (r.insights?.reach || 0), 0),
      totalLikes: reels.reduce((sum, r) => sum + r.likes, 0),
      totalComments: reels.reduce((sum, r) => sum + r.comments, 0),
      totalShares: reels.reduce((sum, r) => sum + (r.insights?.shares || 0), 0),
      totalSaves: reels.reduce((sum, r) => sum + (r.insights?.saved || 0), 0),
      avgEngagementRate: reels.length > 0
        ? (reels.reduce((sum, r) => sum + (r.insights?.totalInteractions || 0), 0) / reels.length / (account?.followersCount || 1) * 100).toFixed(2)
        : '0',
    };

    return NextResponse.json({
      platform: 'instagram',
      account: {
        handle: '@peoplesleaguegolf',
        ...account,
      },
      insights,
      recentMedia: media,
      reelsStats,
      _meta: {
        generatedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + CACHE_TTL).toISOString(),
      },
    });
  } catch (error) {
    console.error('PL Account API error:', error);
    return NextResponse.json({ error: 'Failed to fetch account data' }, { status: 500 });
  }
}
