import { NextResponse } from 'next/server';
import { creators } from '@/data/creators';

// Force dynamic rendering for live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_INSTAGRAM_ID = process.env.META_INSTAGRAM_ID;

// ============================================================================
// YOUTUBE CHANNEL IDS - Required for accurate API lookups
// These are the actual channel IDs (UC...) not handles
// ============================================================================
const youtubeChannelIds: Record<string, string> = {
  // Team Martin
  'martinborgmeier': 'UCzQxB8W7B8ZkT-RmUQXZZlg',
  'cvagolf': 'UCn6P8JT_-UYv5FFsGkQ7VYQ',
  'alexamelton': 'UC8nLWrUtyLLrJACYgyXDt6g',

  // Team Luke
  'LukeKwonGolf': 'UCQvXDpFUx_mVpxJJgNhTqCQ',
  'SamHeungMinGolf': 'UCqX0W3QV-3l_rJqQ8_tA7Vg',
  'ToomsGolf': 'UCGRhXWU4qZpKQa8v_qYrPXQ',

  // Team Ja
  'JaRule': 'UCQkPdJ5KTjVqelOIrJ1TqPw',
  'ClaireHogle': 'UCgNqH6AgaCvKbO-9Vc_uuRQ',
  'TroyCMullins': 'UCKlGN5Mf0tFN3fhbCYKwhJQ',
  'SnappyGilmore': 'UCmvXFKS4Q2lHV3nPpK7qjRw',

  // Team PB
  'ThePointerBrothers': 'UC1n8TGxDUNxPJ9L3L1QeDnQ',
  'JennaBandy': 'UCfh6sHm6z4ZPGbLn6xWc9Ww',
  'GavinFlo': 'UCrXHeLK8z_8nV8X8XTJW2dQ',

  // Team Canada
  'MacBoucherGolf': 'UCXpPXLDEECbFoJhHpqVJOBA',
  'SaraWinter': 'UCXlKPLt8l1Kf9HqAR7TXWJA',
  'MichaelCaan': 'UCIxRJsWD5yk_qV1w3FJPqrg',

  // Team Birdie Fever
  'BirdieFever': 'UC0e8VrGRXXBvs8Yt8N3G3dQ',
  'Malosigolf': 'UCQKPhXXvVJEHmNeBJz_Sw3A',

  // Team Cruz
  'TishaAlyn': 'UCYr7urYcr4GhYxzVCOd_kHw',
  'BenHaddenGolf': 'UCrXSJ9eDqGKXBe6VqVJJWnA',

  // Team Twisted Golf
  'GabiPowel': 'UC5g_LcK9tG3tYvRxfPGkEtQ',
  'CassandraMarieGolf': 'UCxRQW1LPLxvJYiDHxRJ9NJg',
};

// ============================================================================
// CACHING - Reduce API calls and improve performance
// ============================================================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const youtubeDataCache = new Map<string, CacheEntry<YouTubeChannelData>>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache for live data

interface YouTubeChannelData {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  thumbnailUrl: string;
  title: string;
}

interface InstagramData {
  followersCount: number;
  mediaCount: number;
  username: string;
}

const instagramDataCache = new Map<string, CacheEntry<InstagramData>>();

// ============================================================================
// YOUTUBE API - Fetch LIVE subscriber counts and channel data
// ============================================================================
async function getYouTubeChannelData(handle: string): Promise<YouTubeChannelData | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }

  // Check cache first
  const cached = youtubeDataCache.get(handle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const channelId = youtubeChannelIds[handle];

  try {
    let targetChannelId: string | null = channelId;

    // If we don't have the channel ID, or if the ID didn't return results, try by handle
    if (!targetChannelId) {
      // Try the newer handle-based lookup first
      const handleResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`
      );
      const handleData = await handleResponse.json();

      if (handleData.items && handleData.items.length > 0) {
        targetChannelId = handleData.items[0].id;
      } else {
        // Fallback to search
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
          targetChannelId = searchData.items[0].id.channelId;
        }
      }
    } else {
      // Verify the channel ID returns results, otherwise search by handle
      const verifyResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&id=${targetChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const verifyData = await verifyResponse.json();

      if (!verifyData.items || verifyData.items.length === 0) {
        // Stored channel ID is invalid, try search instead
        console.log(`Channel ID ${targetChannelId} invalid for ${handle}, searching...`);
        targetChannelId = null;

        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
          targetChannelId = searchData.items[0].id.channelId;
        }
      }
    }

    if (!targetChannelId) {
      console.warn(`Could not find YouTube channel for: ${handle}`);
      return null;
    }

    // Now get the full channel statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${targetChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsResponse.json();

    if (statsData.items && statsData.items.length > 0) {
      const channel = statsData.items[0];
      const data: YouTubeChannelData = {
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        viewCount: parseInt(channel.statistics.viewCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
        thumbnailUrl: channel.snippet.thumbnails?.high?.url ||
                      channel.snippet.thumbnails?.medium?.url ||
                      channel.snippet.thumbnails?.default?.url || '',
        title: channel.snippet.title,
      };

      // Cache the result
      youtubeDataCache.set(handle, { data, timestamp: Date.now() });

      return data;
    }
  } catch (error) {
    console.error(`Failed to fetch YouTube data for ${handle}:`, error);
  }

  return null;
}

// ============================================================================
// INSTAGRAM BUSINESS DISCOVERY API - Fetch LIVE follower counts
// Uses Meta's Business Discovery API to get public Instagram data
// ============================================================================
async function getInstagramData(handle: string): Promise<InstagramData | null> {
  if (!META_ACCESS_TOKEN || !META_INSTAGRAM_ID) {
    console.warn('Meta API credentials not configured');
    return null;
  }

  // Check cache first
  const cached = instagramDataCache.get(handle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Business Discovery API - works for any public business/creator account
    const url = `https://graph.facebook.com/v18.0/${META_INSTAGRAM_ID}?fields=business_discovery.username(${encodeURIComponent(handle)})%7Bfollowers_count,media_count,username%7D&access_token=${META_ACCESS_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      // Handle case where account doesn't exist or isn't a business account
      console.warn(`Instagram API error for ${handle}:`, data.error.message);
      return null;
    }

    if (data.business_discovery) {
      const instagramData: InstagramData = {
        followersCount: data.business_discovery.followers_count || 0,
        mediaCount: data.business_discovery.media_count || 0,
        username: data.business_discovery.username || handle,
      };

      // Cache the result
      instagramDataCache.set(handle, { data: instagramData, timestamp: Date.now() });

      return instagramData;
    }
  } catch (error) {
    console.error(`Failed to fetch Instagram data for ${handle}:`, error);
  }

  return null;
}

// ============================================================================
// FALLBACK DATA - Used when APIs are unavailable
// Only used as fallback, not as primary source
// ============================================================================
const fallbackProfilePictures: Record<string, string> = {
  'martinborgmeier': 'https://yt3.ggpht.com/Asqiu3DSGw12aDkpE0hRdC3mGPB-y4H3vzJIfA-AVIeQrE-Ob8dRqXFItP85GiWyXaX6sNymkQ=s800-c-k-c0xffffffff-no-rj-mo',
  'cvagolf': 'https://yt3.ggpht.com/9QUw6N8Mm0hZnZx6rVSiM0197ARn4CClwNwFgahJJarHdWuP768Bi622IDHDUR3mt6rXoy7G=s800-c-k-c0xffffffff-no-rj-mo',
  'alexamelton': 'https://yt3.ggpht.com/sTCVuAO4bUxrsxwmG4cVmnwpZAs-hZIKAHdmDXLRCOZRwGnui59EijGZjZZlG90mKsCbqJVKE6Y=s800-c-k-c0xffffffff-no-rj-mo',
  'luke.kwon': 'https://yt3.ggpht.com/ytc/AIdro_lDITSQjzij4ADQKdbizlDr6RtSYgxKkDMztyTuNS0gJnc=s800-c-k-c0xffffffff-no-rj-mo',
  'samheungmin.golf': 'https://yt3.ggpht.com/qX3sxFw7_VuvZLyL1ng7hi1HIFy575Skd-omXf_mE3E3MqBYapfIdDKphQjx1--6F81NCKLVEg=s800-c-k-c0xffffffff-no-rj-mo',
  'toomsgolf': 'https://yt3.ggpht.com/GRRMJs9hDsePrTPDKyyQM2a0H1P04gS_DlnZV8Pi39nVFxslF8erP8Omf6X09Wyt-G0Jc4od6SM=s800-c-k-c0xffffffff-no-rj-mo',
  'jarule': 'https://yt3.ggpht.com/5b4sTdlf-R4ZHqzad6PiFC0QE122PSAoXgcFhtV0kFexPIArJgqyYFT3qSI1_hJYbgIEIpov=s800-c-k-c0xffffffff-no-rj-mo',
  'clairehogle': 'https://yt3.ggpht.com/-g5oo1rmsioEqqwKpo88Ba1x3vH7LCiNEKQ4wbMsx2Z3oinvDkFhG_Vd8uHTl_ODDXlsScl9=s800-c-k-c0xffffffff-no-rj-mo',
  'troycmullins': 'https://yt3.ggpht.com/ytc/AIdro_kLzQDe8Pg9vl_7V9QirB1RpXzNLv9CssTYUvwBeAIBQA=s800-c-k-c0xffffffff-no-rj-mo',
  '_snappygilmore': 'https://yt3.ggpht.com/BqE0RXLjV8F_uHqohgWLd1uXJc1IKjgcizlK6lVcIIgVYhClGqeWfoRq8l0HgvvpFv_su6MYOg=s800-c-k-c0xffffffff-no-rj-mo',
  'thepointerbrothers_': 'https://yt3.ggpht.com/ebg7e3rfmCnbY_daO1hWsT82OVmiFMUfpZrFxDZiQAoA4zH7CndvaS03074i2itZt4XN733j-g=s800-c-k-c0xffffffff-no-rj-mo',
  'henrybudrewicz': 'https://yt3.ggpht.com/ebg7e3rfmCnbY_daO1hWsT82OVmiFMUfpZrFxDZiQAoA4zH7CndvaS03074i2itZt4XN733j-g=s800-c-k-c0xffffffff-no-rj-mo',
  'mikebudrewicz': 'https://yt3.ggpht.com/ebg7e3rfmCnbY_daO1hWsT82OVmiFMUfpZrFxDZiQAoA4zH7CndvaS03074i2itZt4XN733j-g=s800-c-k-c0xffffffff-no-rj-mo',
  'jennabandy21': 'https://yt3.ggpht.com/Fy5caZCQ8stEazpbUnjR0lXDcSQHgsrtxcO0LMX2ZN9xmoYsQH6ZLnZppqfxXp9NqkLaV7eEEEo=s800-c-k-c0xffffffff-no-rj-mo',
  'gavinflo': 'https://yt3.ggpht.com/4gm9NIBeWA7tNoh_yp2d3AuWxnuBu1TP4Vo4njlVXCg_Gt25Ki7d0fnqqwoiRSn4huQWhFPMjQ=s800-c-k-c0xffffffff-no-rj-mo',
  'macbouchergolf': 'https://yt3.ggpht.com/Out0DF5ZmY3fDE82PXrqkoG0AZgepTiq-K42qS-21Y8K5TQpaSXdDlHSE2UYZ31HpgTPj44gbOg=s800-c-k-c0xffffffff-no-rj-mo',
  'saramwinter': 'https://yt3.ggpht.com/yfmeUbnvFVoqu5XRI4ea2I8uUXN3AZdK9uLgc0LCGQFN9QZblL08tGq_wq9I-CoMc_dAUhoeCg=s800-c-k-c0xffffffff-no-rj-mo',
  'michaelcaan': 'https://yt3.ggpht.com/Thy7ppyozfJXwrxJO82iDtCbJwEFu8QPXTUPlOtBh9Of3qAIv28Lrm_SFvFIEiIclolBJpm9rck=s800-c-k-c0xffffffff-no-rj-mo',
  'birdiefevergolf': 'https://yt3.ggpht.com/TU8cTrzMZv8rewb4kGg1xm7jGHzgoUmFoS2VISy--fNW7WH2UKKKmh6ufMEknnPQQg_CzYJz=s800-c-k-c0xffffffff-no-rj-mo',
  'malosit': 'https://yt3.ggpht.com/NWNYRGhd1YjRuF0Xtja-ngUQmb_AMdJ022OucQB-U-Y3vPEmJ9u2zcgzE-XXTSW6fAMUqsAh=s800-c-k-c0xffffffff-no-rj-mo',
  'mazelynt': 'https://yt3.ggpht.com/E2nEtUCczqL5b3fmSpV841DQ52faPRJoYGnWFhk4cOhLX5E5I6yPjW-y1VA3cJAuqOlCwOEyKA=s800-c-k-c0xffffffff-no-rj-mo',
  'chancetaylorgolf': 'https://yt3.ggpht.com/bJ7xv_rYvXXKQtje9X-zkQqHH2scEBs-yWF1kDfDJu80oGNRDuJHscZjQvVMOT9S2w6W-obT-Q=s800-c-k-c0xffffffff-no-rj-mo',
  'victorcruz': 'https://pbs.twimg.com/profile_images/1586007442252963841/PO7dK7o7_400x400.jpg',
  'tishaalyn': 'https://yt3.ggpht.com/WEoeV5R00xk46_0wzEKVEFp9l8hwgFg7Qi5DpoCvcC_DFRvO1td4CsAdaso0m5rNLnTd3iqeZg=s800-c-k-c0xffffffff-no-rj-mo',
  'benhaddengolf': 'https://yt3.ggpht.com/NMwaaY6BB-bL-lcLvmaqErzPvRUfXWTIWNVGQkFUdGKzJjLHOyaPQ5fndfHrWDd5pBk4A-YqadE=s800-c-k-c0xffffffff-no-rj-mo',
  'gabipowelll': 'https://yt3.ggpht.com/RaLV0Wj1Eb7XRywy1sYqQgfl01EAS4e61Lb6L6agWGmkjtyZKSz7pz_E5EIXmq57KzTR2WAjWt0=s800-c-k-c0xffffffff-no-rj-mo',
  'cassmarie_b': 'https://yt3.ggpht.com/b2qQudSDqrb-PnUBkIUtl6SmEGF1aZsYfhnK27GBRT8hNQy6PNVXffL0ZLzLP1_V5Z_Z47B1=s800-c-k-c0xffffffff-no-rj-mo',
  'bobrayy': 'https://yt3.ggpht.com/OACJ-23v3zgRS0WR2fTdN1H80b9ETUJlgFtnlAo2qZEdWWZ_kFIDnTPqmGQ-nyhV6WN22Nok=s800-c-k-c0xffffffff-no-rj-mo',
};

// ============================================================================
// MAIN API ENDPOINT
// ============================================================================
export async function GET() {
  try {
    const now = new Date().toISOString();

    // Fetch data for all creators in parallel
    const creatorsWithData = await Promise.all(creators.map(async (creator) => {
      const igHandle = creator.handles.instagram;
      const ytHandle = creator.handles.youtube;

      // Fetch live YouTube data if available
      let youtubeData: YouTubeChannelData | null = null;
      if (ytHandle) {
        youtubeData = await getYouTubeChannelData(ytHandle);
      }

      // Fetch live Instagram data if available
      let instagramData: InstagramData | null = null;
      if (igHandle) {
        instagramData = await getInstagramData(igHandle);
      }

      // Calculate total from live data sources
      const youtubeFollowers = youtubeData?.subscriberCount || 0;
      const instagramFollowers = instagramData?.followersCount || 0;

      // Build followers object with live data
      const followers = {
        youtube: youtubeFollowers,
        instagram: instagramFollowers,
        tiktok: 0,    // TODO: Connect TikTok API
        facebook: 0,  // TODO: Connect Meta API for Facebook
        x: 0,         // TODO: Connect X API
        total: youtubeFollowers + instagramFollowers,
        lastUpdated: now,
        dataSource: {
          youtube: youtubeData ? 'live' : 'unavailable',
          instagram: instagramData ? 'live' : (igHandle ? 'unavailable' : 'no_handle'),
          tiktok: 'pending',
          facebook: 'pending',
          x: 'pending',
        } as Record<string, string>,
      };

      // Get profile picture - prefer live YouTube, then fallback
      const profilePicture = youtubeData?.thumbnailUrl ||
                            (igHandle ? fallbackProfilePictures[igHandle] : null) ||
                            null;

      return {
        ...creator,
        profilePicture,
        followers,
        youtubeStats: youtubeData ? {
          viewCount: youtubeData.viewCount,
          videoCount: youtubeData.videoCount,
          channelTitle: youtubeData.title,
        } : null,
        instagramStats: instagramData ? {
          mediaCount: instagramData.mediaCount,
          username: instagramData.username,
        } : null,
      };
    }));

    // Calculate network totals
    const networkStats = {
      totalCreators: creators.length,
      totalFollowers: creatorsWithData.reduce((sum, c) => sum + c.followers.total, 0),
      byPlatform: {
        youtube: creatorsWithData.reduce((sum, c) => sum + c.followers.youtube, 0),
        instagram: creatorsWithData.reduce((sum, c) => sum + c.followers.instagram, 0),
        tiktok: creatorsWithData.reduce((sum, c) => sum + c.followers.tiktok, 0),
        facebook: creatorsWithData.reduce((sum, c) => sum + c.followers.facebook, 0),
        x: creatorsWithData.reduce((sum, c) => sum + c.followers.x, 0),
      },
      lastUpdated: now,
      dataSources: {
        youtube: 'live',
        instagram: 'live',
        tiktok: 'pending - TikTok Business API credentials needed',
        facebook: 'pending - separate Facebook integration needed',
        x: 'pending - X API subscription needed',
      },
    };

    return NextResponse.json({
      creators: creatorsWithData,
      networkStats,
      _meta: {
        generatedAt: now,
        cacheExpiry: new Date(Date.now() + CACHE_TTL).toISOString(),
        apiStatus: {
          youtube: YOUTUBE_API_KEY ? 'connected' : 'not configured',
          instagram: META_ACCESS_TOKEN ? 'connected' : 'not configured',
          tiktok: 'pending configuration',
          x: 'pending configuration',
        },
      },
    });
  } catch (error) {
    console.error('Creators API error:', error);
    return NextResponse.json({ error: 'Failed to fetch creator data' }, { status: 500 });
  }
}
