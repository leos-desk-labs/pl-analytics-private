'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Youtube, Eye, ThumbsUp, MessageSquare, Play, Users, TrendingUp, Clock } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration?: string;
  durationSeconds?: number;
  isShort?: boolean;
  videoType?: 'short' | 'long';
}

interface YouTubeData {
  channelId: string;
  title: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  recentVideos: Video[];
  _meta?: {
    generatedAt: string;
    source: string;
  };
}

// Helper to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}:${secs.toString().padStart(2, '0')}`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function YouTubePage() {
  const [data, setData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/youtube')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading YouTube data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Youtube className="text-[#FF0000]" />
            YouTube Analytics
          </h1>
          <p className="text-gray-400 mt-1">@PeoplesLeagueGolf</p>
        </div>
        <div className="metric-card border-yellow-500 border">
          <p className="text-yellow-400">API not configured. Add YOUTUBE_API_KEY to environment variables.</p>
        </div>
      </div>
    );
  }

  // Separate Long-form videos and Shorts
  const longFormVideos = data?.recentVideos?.filter(v => !v.isShort) || [];
  const shortsVideos = data?.recentVideos?.filter(v => v.isShort) || [];

  // Long-form stats
  const longFormViews = longFormVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const longFormLikes = longFormVideos.reduce((sum, v) => sum + v.likeCount, 0);
  const longFormComments = longFormVideos.reduce((sum, v) => sum + v.commentCount, 0);
  const avgLongFormViews = longFormVideos.length ? Math.round(longFormViews / longFormVideos.length) : 0;

  // Shorts stats
  const shortsViews = shortsVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const shortsLikes = shortsVideos.reduce((sum, v) => sum + v.likeCount, 0);
  const shortsComments = shortsVideos.reduce((sum, v) => sum + v.commentCount, 0);
  const avgShortsViews = shortsVideos.length ? Math.round(shortsViews / shortsVideos.length) : 0;

  // Total stats (all videos)
  const totalVideoViews = data?.recentVideos?.reduce((sum, v) => sum + v.viewCount, 0) || 0;
  const totalLikes = data?.recentVideos?.reduce((sum, v) => sum + v.likeCount, 0) || 0;
  const totalComments = data?.recentVideos?.reduce((sum, v) => sum + v.commentCount, 0) || 0;

  // Chart data for long-form videos
  const longFormChartData = longFormVideos.slice(0, 10).map((video, i) => ({
    name: `#${i + 1}`,
    value: video.viewCount
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Youtube className="text-[#FF0000]" />
            YouTube Analytics
          </h1>
          <p className="text-gray-400 mt-1">@PeoplesLeagueGolf | Live Data</p>
        </div>
        {data?._meta?.generatedAt && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 border border-gray-700 rounded-full text-sm">
            <Clock size={14} className="text-brand-lime" />
            <span className="text-gray-400">Updated</span>
            <span className="text-white font-medium">
              {new Date(data._meta.generatedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        )}
      </div>

      {/* Primary Metric: Total Views */}
      <div className="metric-card bg-gradient-to-r from-[#FF0000]/20 to-gray-800 border-2 border-[#FF0000]">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="text-[#FF0000]" size={28} />
          <h2 className="text-lg text-gray-300">Total YouTube Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {(data?.viewCount || 0).toLocaleString()}
        </div>
        <p className="text-gray-400 mt-2">Lifetime channel views</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Recent Views"
          value={totalVideoViews}
          change={`${data?.recentVideos?.length || 0} videos analyzed`}
          changeType="positive"
          icon={<Eye size={20} className="text-[#FF0000]" />}
        />
        <MetricCard
          label="Videos Published"
          value={data?.videoCount || 0}
          change="Total uploads"
          changeType="neutral"
          icon={<Play size={20} />}
        />
        <MetricCard
          label="Subscribers"
          value={data?.subscriberCount || 0}
          change="Current"
          changeType="neutral"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Engagement Rate"
          value={`${totalVideoViews > 0 ? ((totalLikes / totalVideoViews) * 100).toFixed(1) : 0}%`}
          change="Likes per 100 views"
          changeType="neutral"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Long-Form vs Shorts Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Long-form Stats */}
        <div className="metric-card border-l-4 border-[#FF0000]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play size={20} className="text-[#FF0000]" />
              Long-Form Videos
            </h3>
            <span className="text-sm text-gray-500">{longFormVideos.length} videos</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{longFormViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Views/Video</span>
              <span className="font-bold text-brand-lime">{avgLongFormViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Likes</span>
              <span className="font-bold">{longFormLikes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Comments</span>
              <span className="font-bold">{longFormComments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Engagement Rate</span>
              <span className="font-bold text-brand-lime">
                {longFormViews > 0 ? ((longFormLikes / longFormViews) * 100).toFixed(2) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Shorts Stats */}
        <div className="metric-card border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play size={20} className="text-purple-500" />
              YouTube Shorts
            </h3>
            <span className="text-sm text-gray-500">{shortsVideos.length} shorts</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{shortsViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Views/Short</span>
              <span className="font-bold text-purple-400">{avgShortsViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Likes</span>
              <span className="font-bold">{shortsLikes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Comments</span>
              <span className="font-bold">{shortsComments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Engagement Rate</span>
              <span className="font-bold text-purple-400">
                {shortsViews > 0 ? ((shortsLikes / shortsViews) * 100).toFixed(2) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Long-Form Videos Chart */}
      {longFormChartData.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Long-Form Video Performance</h3>
          <SimpleChart data={longFormChartData} color="#FF0000" type="bar" />
        </div>
      )}

      {/* Long-Form Videos List */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Play size={20} className="text-[#FF0000]" />
          Long-Form Videos (by Views)
        </h3>
        <div className="space-y-4">
          {longFormVideos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 15).map((video, index) => (
            <div
              key={video.id}
              className="flex gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-[#FF0000] rounded-full text-sm font-bold">
                {index + 1}
              </div>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-white line-clamp-2">{video.title}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(video.publishedAt).toLocaleDateString()} • {video.durationSeconds ? formatDuration(video.durationSeconds) : ''}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-brand-lime font-semibold">
                    <Eye size={14} /> {video.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <ThumbsUp size={14} /> {video.likeCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <MessageSquare size={14} /> {video.commentCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shorts List */}
      {shortsVideos.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play size={20} className="text-purple-500" />
            YouTube Shorts (by Views)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortsVideos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 12).map((video, index) => (
              <div
                key={video.id}
                className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-purple-500 rounded-full text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-purple-400 font-semibold">
                        {video.viewCount.toLocaleString()} views
                      </span>
                      <span className="text-gray-500">
                        {video.likeCount.toLocaleString()} likes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
