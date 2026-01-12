'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Youtube, Eye, ThumbsUp, MessageSquare, Play } from 'lucide-react';

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
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
          Connected
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Subscribers"
          value={data?.subscriberCount || 0}
          change="Live from API"
          changeType="positive"
          icon={<Youtube size={20} />}
        />
        <MetricCard
          label="Total Views"
          value={data?.viewCount || 0}
          change="Lifetime"
          changeType="neutral"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Videos"
          value={data?.videoCount || 0}
          change="Published"
          changeType="neutral"
          icon={<Play size={20} />}
        />
        <MetricCard
          label="Recent Video Views"
          value={totalVideoViews}
          change="Last 10 videos"
          changeType="neutral"
          icon={<Eye size={20} />}
        />
      </div>

      {/* Views Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Recent Video Performance</h3>
        <SimpleChart data={chartData} color="#FF0000" type="bar" />
      </div>

      {/* Recent Videos */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Recent Videos</h3>
        <div className="space-y-4">
          {data?.recentVideos?.map((video) => (
            <div
              key={video.id}
              className="flex gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-40 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-white line-clamp-2">{video.title}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {video.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} /> {video.likeCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
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
