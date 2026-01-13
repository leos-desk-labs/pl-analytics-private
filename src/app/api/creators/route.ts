import { NextResponse } from 'next/server';
import { creators } from '@/data/creators';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Cache for profile pictures to reduce API calls
const profilePictureCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hour cache

// YouTube channel ID mapping for creators
// These are the actual YouTube channel IDs (not handles)
const youtubeChannelIds: Record<string, string> = {
  // We'll fetch these dynamically, but can hardcode known ones
  'martinborgmeier': 'UCzQxB8W7B8ZkT-RmUQXZZlg',
  'LukeKwonGolf': 'UCQvXDpFUx_mVpxJJgNhTqCQ',
  'cvagolf': 'UCn6P8JT_-UYv5FFsGkQ7VYQ', // DOD King
  'SnappyGilmore': 'UCmvXFKS4Q2lHV3nPpK7qjRw',
  'ClaireHogle': 'UCgNqH6AgaCvKbO-9Vc_uuRQ',
  'TishaAlyn': 'UCYr7urYcr4GhYxzVCOd_kHw',
  'JennaBandy': 'UCfh6sHm6z4ZPGbLn6xWc9Ww',
  'MacBoucherGolf': 'UCXpPXLDEECbFoJhHpqVJOBA',
};

// Fetch YouTube profile picture
async function getYouTubeProfilePicture(handle: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) return null;

  // Check cache first
  const cached = profilePictureCache.get(handle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  try {
    // First try to get channel by handle/username
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (searchData.items && searchData.items.length > 0) {
      const thumbnailUrl = searchData.items[0].snippet?.thumbnails?.high?.url ||
                          searchData.items[0].snippet?.thumbnails?.medium?.url ||
                          searchData.items[0].snippet?.thumbnails?.default?.url;

      if (thumbnailUrl) {
        profilePictureCache.set(handle, { url: thumbnailUrl, timestamp: Date.now() });
        return thumbnailUrl;
      }
    }
  } catch (error) {
    console.error(`Failed to fetch YouTube profile for ${handle}:`, error);
  }

  return null;
}

// Manual follower counts - updated from Media Footprint Warehouse Sept 2025
const followerData: Record<string, {
  instagram?: number;
  youtube?: number;
  tiktok?: number;
  facebook?: number;
  x?: number;
  lastUpdated: string;
  profilePicture?: string; // Manual override for profile pictures
}> = {
  // Team Martin (Total: 1,378,405)
  'martinborgmeier': {
    instagram: 311000, youtube: 192000, tiktok: 215400, facebook: 3000, x: 3044, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/Asqiu3DSGw12aDkpE0hRdC3mGPB-y4H3vzJIfA-AVIeQrE-Ob8dRqXFItP85GiWyXaX6sNymkQ=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'cvagolf': {
    instagram: 230000, youtube: 99400, tiktok: 96000, facebook: 8900, x: 201, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/9QUw6N8Mm0hZnZx6rVSiM0197ARn4CClwNwFgahJJarHdWuP768Bi622IDHDUR3mt6rXoy7G=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'alexamelton': {
    instagram: 129000, youtube: 7060, tiktok: 81600, facebook: 1800, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/sTCVuAO4bUxrsxwmG4cVmnwpZAs-hZIKAHdmDXLRCOZRwGnui59EijGZjZZlG90mKsCbqJVKE6Y=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team Luke (Total: 1,201,607)
  'luke.kwon': {
    instagram: 288000, youtube: 384000, tiktok: 74100, facebook: 1400, x: 5017, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/ytc/AIdro_lDITSQjzij4ADQKdbizlDr6RtSYgxKkDMztyTuNS0gJnc=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'samheungmin.golf': {
    instagram: 181000, youtube: 90300, tiktok: 51700, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/qX3sxFw7_VuvZLyL1ng7hi1HIFy575Skd-omXf_mE3E3MqBYapfIdDKphQjx1--6F81NCKLVEg=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'toomsgolf': {
    instagram: 50000, youtube: 69000, tiktok: 6924, x: 166, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/GRRMJs9hDsePrTPDKyyQM2a0H1P04gS_DlnZV8Pi39nVFxslF8erP8Omf6X09Wyt-G0Jc4od6SM=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team Ja (Total: 9,737,701)
  'jarule': {
    instagram: 2000000, youtube: 5700, x: 254200, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/5b4sTdlf-R4ZHqzad6PiFC0QE122PSAoXgcFhtV0kFexPIArJgqyYFT3qSI1_hJYbgIEIpov=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'clairehogle': {
    instagram: 1000000, youtube: 157000, tiktok: 249000, facebook: 20000, x: 7378, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/-g5oo1rmsioEqqwKpo88Ba1x3vH7LCiNEKQ4wbMsx2Z3oinvDkFhG_Vd8uHTl_ODDXlsScl9=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'troycmullins': {
    instagram: 215000, youtube: 4800, tiktok: 38000, facebook: 109000, x: 14400, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/ytc/AIdro_kLzQDe8Pg9vl_7V9QirB1RpXzNLv9CssTYUvwBeAIBQA=s800-c-k-c0xffffffff-no-rj-mo'
  },
  '_snappygilmore': {
    instagram: 871000, youtube: 61700, tiktok: 3000000, facebook: 19, x: 504, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/BqE0RXLjV8F_uHqohgWLd1uXJc1IKjgcizlK6lVcIIgVYhClGqeWfoRq8l0HgvvpFv_su6MYOg=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team PB (Total: 9,990,080)
  'thepointerbrothers_': {
    instagram: 2200000, youtube: 154000, tiktok: 3500000, facebook: 427000, x: 200, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/ebg7e3rfmCnbY_daO1hWsT82OVmiFMUfpZrFxDZiQAoA4zH7CndvaS03074i2itZt4XN733j-g=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'henrybudrewicz': {
    instagram: 18000, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/ebg7e3rfmCnbY_daO1hWsT82OVmiFMUfpZrFxDZiQAoA4zH7CndvaS03074i2itZt4XN733j-g=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'mikebudrewicz': {
    instagram: 23000, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/ebg7e3rfmCnbY_daO1hWsT82OVmiFMUfpZrFxDZiQAoA4zH7CndvaS03074i2itZt4XN733j-g=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'jennabandy21': {
    instagram: 824000, youtube: 1007000, tiktok: 1400000, facebook: 65000, x: 11100, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/Fy5caZCQ8stEazpbUnjR0lXDcSQHgsrtxcO0LMX2ZN9xmoYsQH6ZLnZppqfxXp9NqkLaV7eEEEo=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'gavinflo': {
    instagram: 137000, youtube: 3480, tiktok: 220010, facebook: 14, x: 276, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/4gm9NIBeWA7tNoh_yp2d3AuWxnuBu1TP4Vo4njlVXCg_Gt25Ki7d0fnqqwoiRSn4huQWhFPMjQ=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team Canada (Total: 1,686,229)
  'macbouchergolf': {
    instagram: 629000, youtube: 31100, tiktok: 138700, facebook: 152, x: 3784, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/Out0DF5ZmY3fDE82PXrqkoG0AZgepTiq-K42qS-21Y8K5TQpaSXdDlHSE2UYZ31HpgTPj44gbOg=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'saramwinter': {
    instagram: 516000, youtube: 10700, tiktok: 194000, facebook: 6900, x: 8935, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/yfmeUbnvFVoqu5XRI4ea2I8uUXN3AZdK9uLgc0LCGQFN9QZblL08tGq_wq9I-CoMc_dAUhoeCg=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'michaelcaan': {
    instagram: 105000, youtube: 4030, tiktok: 33000, facebook: 4900, x: 28, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/Thy7ppyozfJXwrxJO82iDtCbJwEFu8QPXTUPlOtBh9Of3qAIv28Lrm_SFvFIEiIclolBJpm9rck=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team Birdie Fever (Total: 1,038,852)
  'birdiefevergolf': {
    instagram: 10000, youtube: 1410, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/TU8cTrzMZv8rewb4kGg1xm7jGHzgoUmFoS2VISy--fNW7WH2UKKKmh6ufMEknnPQQg_CzYJz=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'malosit': {
    instagram: 308000, youtube: 73100, tiktok: 148700, facebook: 21000, x: 819, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/NWNYRGhd1YjRuF0Xtja-ngUQmb_AMdJ022OucQB-U-Y3vPEmJ9u2zcgzE-XXTSW6fAMUqsAh=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'mazelynt': {
    instagram: 145000, youtube: 21800, tiktok: 3575, facebook: 656, x: 4000, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/E2nEtUCczqL5b3fmSpV841DQ52faPRJoYGnWFhk4cOhLX5E5I6yPjW-y1VA3cJAuqOlCwOEyKA=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'chancetaylorgolf': {
    instagram: 64000, youtube: 13900, tiktok: 222600, facebook: 292, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/bJ7xv_rYvXXKQtje9X-zkQqHH2scEBs-yWF1kDfDJu80oGNRDuJHscZjQvVMOT9S2w6W-obT-Q=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team Cruz (Total: 4,378,158)
  'victorcruz': {
    instagram: 1000000, facebook: 617000, x: 527200, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/ytc/AIdro_nAR-T3Zde9jlmvTBv5GIZaaD2xnK1c5iYNd0gA4GE=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'tishaalyn': {
    instagram: 520000, youtube: 42100, tiktok: 1300000, facebook: 9000, x: 40500, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/WEoeV5R00xk46_0wzEKVEFp9l8hwgFg7Qi5DpoCvcC_DFRvO1td4CsAdaso0m5rNLnTd3iqeZg=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'benhaddengolf': {
    instagram: 99000, youtube: 91500, tiktok: 131000, facebook: 125, x: 733, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/NMwaaY6BB-bL-lcLvmaqErzPvRUfXWTIWNVGQkFUdGKzJjLHOyaPQ5fndfHrWDd5pBk4A-YqadE=s800-c-k-c0xffffffff-no-rj-mo'
  },

  // Team Twisted Golf (Total: 801,850)
  'twistedgolfco': {
    instagram: 0, lastUpdated: '2025-09',
    profilePicture: undefined
  },
  'gabipowelll': {
    instagram: 251600, youtube: 18000, tiktok: 40000, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/RaLV0Wj1Eb7XRywy1sYqQgfl01EAS4e61Lb6L6agWGmkjtyZKSz7pz_E5EIXmq57KzTR2WAjWt0=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'cassmarie_b': {
    instagram: 455000, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/b2qQudSDqrb-PnUBkIUtl6SmEGF1aZsYfhnK27GBRT8hNQy6PNVXffL0ZLzLP1_V5Z_Z47B1=s800-c-k-c0xffffffff-no-rj-mo'
  },
  'bobrayy': {
    instagram: 37250, lastUpdated: '2025-09',
    profilePicture: 'https://yt3.ggpht.com/OACJ-23v3zgRS0WR2fTdN1H80b9ETUJlgFtnlAo2qZEdWWZ_kFIDnTPqmGQ-nyhV6WN22Nok=s800-c-k-c0xffffffff-no-rj-mo'
  },
};

export async function GET() {
  try {
    // Build creator data with profile pictures and follower counts
    const creatorsWithData = await Promise.all(creators.map(async (creator) => {
      const igHandle = creator.handles.instagram;
      const ytHandle = creator.handles.youtube;
      const followers = igHandle ? followerData[igHandle] : null;

      // Calculate total followers for this creator
      let totalFollowers = 0;
      if (followers) {
        totalFollowers = (followers.instagram || 0) +
                        (followers.youtube || 0) +
                        (followers.tiktok || 0) +
                        (followers.facebook || 0) +
                        (followers.x || 0);
      }

      // Get profile picture - prefer manual override, then try YouTube API
      let profilePicture = followers?.profilePicture || null;

      // If no manual picture and has YouTube, try to fetch from YouTube API
      if (!profilePicture && ytHandle && YOUTUBE_API_KEY) {
        profilePicture = await getYouTubeProfilePicture(ytHandle);
      }

      return {
        ...creator,
        profilePicture,
        followers: followers ? {
          instagram: followers.instagram || 0,
          youtube: followers.youtube || 0,
          tiktok: followers.tiktok || 0,
          facebook: followers.facebook || 0,
          x: followers.x || 0,
          total: totalFollowers,
          lastUpdated: followers.lastUpdated,
        } : null,
      };
    }));

    // Calculate network totals
    const networkStats = {
      totalCreators: creators.length,
      totalFollowers: creatorsWithData.reduce((sum, c) => sum + (c.followers?.total || 0), 0),
      byPlatform: {
        instagram: creatorsWithData.reduce((sum, c) => sum + (c.followers?.instagram || 0), 0),
        youtube: creatorsWithData.reduce((sum, c) => sum + (c.followers?.youtube || 0), 0),
        tiktok: creatorsWithData.reduce((sum, c) => sum + (c.followers?.tiktok || 0), 0),
        facebook: creatorsWithData.reduce((sum, c) => sum + (c.followers?.facebook || 0), 0),
        x: creatorsWithData.reduce((sum, c) => sum + (c.followers?.x || 0), 0),
      },
      lastUpdated: '2025-09',
    };

    return NextResponse.json({
      creators: creatorsWithData,
      networkStats,
    });
  } catch (error) {
    console.error('Creators API error:', error);
    return NextResponse.json({ error: 'Failed to fetch creator data' }, { status: 500 });
  }
}
