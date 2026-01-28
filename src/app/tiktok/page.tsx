'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import { Music2, Users, Heart, Video, RefreshCw, UserPlus } from 'lucide-react';

interface TikTokData {
  account: {
    displayName: string;
    username: string;
    avatarUrl: string;
    bio: string;
    verified: boolean;
    followers: number;
    following: number;
    totalLikes: number;
    videoCount: number;
  };
  allTimeStats: {
    totalVideos: number;
    totalLikes: number;
    followers: number;
    following: number;
  };
  _meta: {
    generatedAt: string;
    source: string;
    note: string;
    fromCache: boolean;
    nextRefresh: string;
  };
  error?: string;
  message?: string;
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
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Data</h3>
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
              @{data?.account?.username || 'peoplesleaguegolf'}
              {data?.account?.bio && (
                <span className="ml-2 text-gray-500">— {data.account.bio}</span>
              )}
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
        <MetricCard
          label="Following"
          value={formatNumber(data?.account?.following || 0)}
          change="Accounts followed"
          changeType="neutral"
          icon={<UserPlus size={20} />}
        />
      </div>

      {/* Engagement Summary */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Avg Likes/Video</p>
            <p className="text-2xl font-bold text-white">
              {data?.account?.videoCount
                ? formatNumber(Math.round((data.account.totalLikes || 0) / data.account.videoCount))
                : '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Follower:Following</p>
            <p className="text-2xl font-bold text-white">
              {data?.account?.following
                ? ((data.account.followers || 0) / data.account.following).toFixed(1)
                : '0'}
              :1
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Likes/Follower</p>
            <p className="text-2xl font-bold text-white">
              {data?.account?.followers
                ? ((data.account.totalLikes || 0) / data.account.followers).toFixed(1)
                : '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data Source</p>
            <p className="text-2xl font-bold text-white capitalize">
              {data?._meta?.source === 'public_profile' ? 'Public' : 'API'}
            </p>
          </div>
        </div>
      </div>

      {/* Note about limited data */}
      <div className="metric-card border-yellow-500/30 border">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Limited Analytics</h3>
        <p className="text-gray-400">
          Per-video analytics (views, shares, comments) are unavailable. TikTok&apos;s Developer API does not approve apps for internal analytics use.
          Profile-level stats (followers, total likes, video count) are sourced from the public profile.
        </p>
      </div>

      {/* Meta Info */}
      <div className="text-xs text-gray-500 text-right">
        Last updated: {data?._meta?.generatedAt ? new Date(data._meta.generatedAt).toLocaleString() : 'N/A'}
        {data?._meta?.nextRefresh && ` | Next refresh: ${data._meta.nextRefresh}`}
      </div>
    </div>
  );
}
