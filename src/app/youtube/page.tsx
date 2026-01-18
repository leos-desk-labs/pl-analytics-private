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

interface VideoStats {
  videoCount: number;
  views: number;
  likes: number;
  comments: number;
  avgViews?: number;
}

interface YouTubeData {
  channelId: string;
  title: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  ytd: {
    year: number;
    longForm: VideoStats;
    shorts: VideoStats;
    totalViews: number;
    totalVideos: number;
  };
  lifetime: {
    longForm: VideoStats;
    shorts: VideoStats;
    totalAnalyzedVideos: number;
  };
  topPerformers: {
    longForm: Video[];
    shorts: Video[];
  };
  recentVideos: Video[];
  _meta?: {
    generatedAt: string;
    source: string;
    videosAnalyzed: number;
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

  const ytd = data?.ytd;
  const lifetime = data?.lifetime;
  const currentYear = ytd?.year || new Date().getFullYear();

  // Chart data for top long-form videos with actual titles
  const topVideosChartData = data?.topPerformers?.longForm?.slice(0, 5).map((video) => ({
    name: video.title.length > 25 ? video.title.substring(0, 25) + '...' : video.title,
    value: video.viewCount
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Youtube className="text-[#FF0000]" />
            YouTube Analytics
          </h1>
          <p className="text-gray-400 mt-1">@PeoplesLeagueGolf</p>
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

      {/* PRIMARY METRIC: Lifetime Channel Views */}
      <div className="metric-card bg-gradient-to-r from-[#FF0000]/20 to-gray-800 border-2 border-[#FF0000]">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="text-[#FF0000]" size={28} />
          <h2 className="text-lg text-gray-300">Lifetime Channel Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {(data?.viewCount || 0).toLocaleString()}
        </div>
        <p className="text-gray-400 mt-2">Total views across {data?.videoCount || 0} videos</p>
      </div>

      {/* YTD Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={`${currentYear} YTD Views`}
          value={(ytd?.totalViews || 0).toLocaleString()}
          change={`${ytd?.totalVideos || 0} videos posted`}
          changeType="positive"
          icon={<Eye size={20} className="text-[#FF0000]" />}
        />
        <MetricCard
          label="Subscribers"
          value={(data?.subscriberCount || 0).toLocaleString()}
          change="Current"
          changeType="neutral"
          icon={<Users size={20} />}
        />
        <MetricCard
          label={`${currentYear} Long-Form Views`}
          value={(ytd?.longForm?.views || 0).toLocaleString()}
          change={`${ytd?.longForm?.videoCount || 0} videos`}
          changeType="positive"
          icon={<Play size={20} />}
        />
        <MetricCard
          label={`${currentYear} Shorts Views`}
          value={(ytd?.shorts?.views || 0).toLocaleString()}
          change={`${ytd?.shorts?.videoCount || 0} shorts`}
          changeType="positive"
          icon={<Play size={20} className="text-purple-500" />}
        />
      </div>

      {/* YTD Performance - Long-Form vs Shorts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YTD Long-form Stats */}
        <div className="metric-card border-l-4 border-[#FF0000]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play size={20} className="text-[#FF0000]" />
              {currentYear} YTD Long-Form
            </h3>
            <span className="text-sm text-gray-500">{ytd?.longForm?.videoCount || 0} videos</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{(ytd?.longForm?.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Likes</span>
              <span className="font-bold">{(ytd?.longForm?.likes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Comments</span>
              <span className="font-bold">{(ytd?.longForm?.comments || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Engagement Rate</span>
              <span className="font-bold text-brand-lime">
                {ytd?.longForm?.views ? ((ytd.longForm.likes / ytd.longForm.views) * 100).toFixed(2) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* YTD Shorts Stats */}
        <div className="metric-card border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play size={20} className="text-purple-500" />
              {currentYear} YTD Shorts
            </h3>
            <span className="text-sm text-gray-500">{ytd?.shorts?.videoCount || 0} shorts</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{(ytd?.shorts?.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Likes</span>
              <span className="font-bold">{(ytd?.shorts?.likes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Comments</span>
              <span className="font-bold">{(ytd?.shorts?.comments || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Engagement Rate</span>
              <span className="font-bold text-purple-400">
                {ytd?.shorts?.views ? ((ytd.shorts.likes / ytd.shorts.views) * 100).toFixed(2) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime Stats (from analyzed videos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-400" />
            Recent Long-Form Performance
          </h3>
          <p className="text-xs text-gray-500 mb-4">Based on {lifetime?.longForm?.videoCount || 0} most recent long-form videos</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{(lifetime?.longForm?.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Views/Video</span>
              <span className="font-bold text-brand-lime">{(lifetime?.longForm?.avgViews || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Engagement</span>
              <span className="font-bold">{((lifetime?.longForm?.likes || 0) + (lifetime?.longForm?.comments || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" />
            Recent Shorts Performance
          </h3>
          <p className="text-xs text-gray-500 mb-4">Based on {lifetime?.shorts?.videoCount || 0} most recent shorts</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{(lifetime?.shorts?.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Views/Short</span>
              <span className="font-bold text-purple-400">{(lifetime?.shorts?.avgViews || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Engagement</span>
              <span className="font-bold">{((lifetime?.shorts?.likes || 0) + (lifetime?.shorts?.comments || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Long-Form Videos Chart */}
      {topVideosChartData.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Top 5 Long-Form Videos by Views</h3>
          <SimpleChart data={topVideosChartData} color="#FF0000" type="bar" />
        </div>
      )}

      {/* Top Performing Long-Form Videos List */}
      {data?.topPerformers?.longForm && data.topPerformers.longForm.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play size={20} className="text-[#FF0000]" />
            Top Performing Long-Form Videos
          </h3>
          <div className="space-y-4">
            {data.topPerformers.longForm.slice(0, 10).map((video, index) => (
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
      )}

      {/* Top Performing Shorts List */}
      {data?.topPerformers?.shorts && data.topPerformers.shorts.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play size={20} className="text-purple-500" />
            Top Performing Shorts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topPerformers.shorts.slice(0, 9).map((video, index) => (
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
