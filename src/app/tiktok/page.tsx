'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import { Music2, Users, Eye, Heart, Share2, Video, RefreshCw } from 'lucide-react';

interface TikTokData {
  account: {
    displayName: string;
    avatarUrl: string;
    followers: number;
    following: number;
    totalLikes: number;
    videoCount: number;
  };
  totalViews: {
    videos: number;
    allContent: number;
  };
  allTimeStats: {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgViewsPerVideo: number;
    avgLikesPerVideo: number;
  };
  videoPerformance: {
    totalVideos: number;
    bestPerformers: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      coverImage: string;
      shareUrl: string;
      createdAt: string;
    }>;
    needsImprovement: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      coverImage: string;
      shareUrl: string;
    }>;
  };
  _meta: {
    generatedAt: string;
    fromCache: boolean;
    nextRefresh: string;
    videosAnalyzed: number;
    note: string;
  };
  error?: string;
  message?: string;
  setup_required?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export default function TikTokPage() {
  const [data, setData] = useState<TikTokData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tiktok');
      const result = await response.json();

      if (result.error) {
        setError(result.message || result.error);
        setData(null);
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to fetch TikTok data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Music2 />
              TikTok Analytics
            </h1>
            <p className="text-gray-400 mt-1">@peoplesleaguegolf</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-brand-lime animate-spin" />
          <span className="ml-3 text-gray-400">Loading TikTok data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Music2 />
              TikTok Analytics
            </h1>
            <p className="text-gray-400 mt-1">@peoplesleaguegolf</p>
          </div>
        </div>
        <div className="metric-card border-red-500 border">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-brand-lime text-black rounded-lg hover:bg-brand-lime/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {data?.account?.avatarUrl && (
            <img
              src={data.account.avatarUrl}
              alt={data.account.displayName}
              className="w-16 h-16 rounded-full border-2 border-brand-lime"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Music2 />
              TikTok Analytics
            </h1>
            <p className="text-gray-400 mt-1">
              @{data?.account?.displayName || 'peoplesleaguegolf'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data?._meta?.fromCache && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              Cached
            </span>
          )}
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            Live Data
          </span>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Followers"
          value={formatNumber(data?.account?.followers || 0)}
          change="Account followers"
          changeType="neutral"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Total Video Views"
          value={formatNumber(data?.allTimeStats?.totalViews || 0)}
          change={`${data?.allTimeStats?.totalVideos || 0} videos analyzed`}
          changeType="neutral"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Total Likes"
          value={formatNumber(data?.account?.totalLikes || 0)}
          change="All-time likes"
          changeType="neutral"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Videos Posted"
          value={formatNumber(data?.account?.videoCount || 0)}
          change="Total videos"
          changeType="neutral"
          icon={<Video size={20} />}
        />
      </div>

      {/* Engagement Stats */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Engagement Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Avg Views/Video</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.allTimeStats?.avgViewsPerVideo || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Likes/Video</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.allTimeStats?.avgLikesPerVideo || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Comments</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.allTimeStats?.totalComments || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Shares</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.allTimeStats?.totalShares || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {data?.videoPerformance?.bestPerformers && data.videoPerformance.bestPerformers.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Top Performing Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.videoPerformance.bestPerformers.slice(0, 6).map((video) => (
              <a
                key={video.id}
                href={video.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {video.coverImage && (
                  <img
                    src={video.coverImage}
                    alt={video.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {video.title || 'Untitled'}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Eye size={12} /> {formatNumber(video.views)} views
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Heart size={12} /> {formatNumber(video.likes)} likes
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Share2 size={12} /> {formatNumber(video.shares)} shares
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Note about Sandbox */}
      {data?.allTimeStats?.totalViews === 0 && (
        <div className="metric-card border-yellow-500/50 border">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Sandbox Mode</h3>
          <p className="text-gray-400">
            Video view counts require Production API access. Account-level stats (followers, likes, video count)
            are available in Sandbox mode. Submit for Production review to unlock full video analytics.
          </p>
        </div>
      )}

      {/* Meta Info */}
      <div className="text-xs text-gray-500 text-right">
        Last updated: {data?._meta?.generatedAt ? new Date(data._meta.generatedAt).toLocaleString() : 'N/A'}
        {data?._meta?.nextRefresh && ` | Next refresh: ${data._meta.nextRefresh}`}
      </div>
    </div>
  );
}
