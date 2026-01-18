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

  // Generate chart data from recent videos
  const chartData = data?.recentVideos?.slice(0, 7).reverse().map((video, i) => ({
    name: `Vid ${i + 1}`,
    value: video.viewCount
  })) || [];

  const totalVideoViews = data?.recentVideos?.reduce((sum, v) => sum + v.viewCount, 0) || 0;
  const totalLikes = data?.recentVideos?.reduce((sum, v) => sum + v.likeCount, 0) || 0;
  const totalComments = data?.recentVideos?.reduce((sum, v) => sum + v.commentCount, 0) || 0;
  const avgViewsPerVideo = data?.recentVideos?.length ? Math.round(totalVideoViews / data.recentVideos.length) : 0;

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

      {/* Views Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Recent Video Views"
          value={totalVideoViews}
          change="Last 10 videos"
          changeType="positive"
          icon={<Eye size={20} className="text-[#FF0000]" />}
        />
        <MetricCard
          label="Avg Views/Video"
          value={avgViewsPerVideo}
          change="Recent average"
          changeType="neutral"
          icon={<TrendingUp size={20} />}
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
          change="Secondary metric"
          changeType="neutral"
          icon={<Users size={20} />}
        />
      </div>

      {/* Views Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Views by Recent Video</h3>
        <SimpleChart data={chartData} color="#FF0000" type="bar" />
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Engagement (Last 10 Videos)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <ThumbsUp size={16} />
                <span>Total Likes</span>
              </div>
              <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MessageSquare size={16} />
                <span>Total Comments</span>
              </div>
              <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">View-to-Engagement Ratio</h3>
          <div className="text-3xl font-bold text-brand-lime">
            {totalVideoViews > 0 ? ((totalLikes / totalVideoViews) * 100).toFixed(2) : 0}%
          </div>
          <p className="text-gray-400 mt-2">Likes per 100 views</p>
        </div>
      </div>

      {/* Recent Videos - Sorted by Views */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Recent Videos (by Views)</h3>
        <div className="space-y-4">
          {data?.recentVideos?.sort((a, b) => b.viewCount - a.viewCount).map((video, index) => (
            <div
              key={video.id}
              className="flex gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full text-sm font-bold">
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
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-brand-lime font-semibold">
                    <Eye size={14} /> {video.viewCount.toLocaleString()} views
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
    </div>
  );
}
