import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE = '@PeoplesLeagueGolf';

async function getChannelId(handle: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) return null;

  const cleanHandle = handle.replace('@', '');
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${cleanHandle}&key=${YOUTUBE_API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.items?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function getChannelStats(channelId: string) {
  if (!YOUTUBE_API_KEY) return null;

  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    const channel = data.items?.[0];

    if (!channel) return null;

    return {
      channelId,
      title: channel.snippet?.title,
      description: channel.snippet?.description,
      thumbnail: channel.snippet?.thumbnails?.default?.url,
      subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
      viewCount: parseInt(channel.statistics?.viewCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
    };
  } catch {
    return null;
  }
}

// Parse ISO 8601 duration (PT1H2M3S) to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

async function getRecentVideos(channelId: string) {
  if (!YOUTUBE_API_KEY) return [];

  // Fetch more videos (50) to ensure we capture all recent content including the championship videos
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=50&key=${YOUTUBE_API_KEY}`;

  try {
    const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
    const searchData = await searchRes.json();

    const videoIds = searchData.items?.map((item: any) => item.id?.videoId).filter(Boolean).join(',');
    if (!videoIds) return [];

    // Include contentDetails to get duration for Shorts vs Long-form classification
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const videosRes = await fetch(videosUrl, { next: { revalidate: 3600 } });
    const videosData = await videosRes.json();

    return videosData.items?.map((video: any) => {
      const durationSeconds = parseDuration(video.contentDetails?.duration || 'PT0S');
      const isShort = durationSeconds <= 60;

      return {
        id: video.id,
        title: video.snippet?.title,
        thumbnail: video.snippet?.thumbnails?.medium?.url,
        publishedAt: video.snippet?.publishedAt,
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        likeCount: parseInt(video.statistics?.likeCount || '0'),
        commentCount: parseInt(video.statistics?.commentCount || '0'),
        duration: video.contentDetails?.duration,
        durationSeconds,
        isShort,
        videoType: isShort ? 'short' : 'long',
      };
    }) || [];
  } catch {
    return [];
  }
}

export async function GET() {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const channelId = await getChannelId(CHANNEL_HANDLE);
  if (!channelId) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  const [stats, videos] = await Promise.all([
    getChannelStats(channelId),
    getRecentVideos(channelId)
  ]);

  return NextResponse.json({
    ...stats,
    recentVideos: videos,
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'YouTube Data API v3'
    }
  });
}
