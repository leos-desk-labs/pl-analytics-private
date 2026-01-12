'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Instagram, Eye, Heart, TrendingUp, Users, MessageCircle } from 'lucide-react';

interface InstagramData {
  username: string;
  name: string;
  followers: number;
  following: number;
  mediaCount: number;
  reach: number;
  impressions: number;
  profileViews: number;
  reelsViews: number;
  interactions: number;
  likes: number;
  comments: number;
  error?: string;
}

export default function InstagramPage() {
  const [data, setData] = useState<InstagramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/instagram')
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Instagram data');
        setLoading(false);
      });
  }, []);

  // Generate chart data from real metrics
  const generateChartData = () => {
    if (!data) return [];
    return [
      { name: 'Reach', value: data.reach },
      { name: 'Impressions', value: data.impressions },
      { name: 'Views', value: data.reelsViews },
      { name: 'Interactions', value: data.interactions },
    ].filter(d => d.value > 0);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Instagram className="text-[#E4405F]" size={32} />
          <h1 className="text-3xl font-bold text-white">Instagram Analytics</h1>
        </div>
        <div className="metric-card animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Instagram className="text-[#E4405F]" size={32} />
          <h1 className="text-3xl font-bold text-white">Instagram Analytics</h1>
        </div>
        <div className="metric-card border-red-500/50">
          <p className="text-red-400">Error: {error}</p>
          <p className="text-gray-500 text-sm mt-2">
            Make sure your Instagram account is a Professional/Business account connected to your Facebook Page.
          </p>
        </div>
      </div>
    );
  }

  const engagementRate = data && data.reach > 0
    ? ((data.interactions / data.reach) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Instagram className="text-[#E4405F]" />
            Instagram Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            @{data?.username}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
          Live Data
        </span>
      </div>

      {/* Primary Metric: Reels Views */}
      <div className="metric-card bg-gradient-to-r from-[#E4405F]/20 to-gray-800 border-2 border-[#E4405F]">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="text-[#E4405F]" size={28} />
          <h2 className="text-lg text-gray-300">Reels Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {data?.reelsViews?.toLocaleString() || '0'}
        </div>
        <p className="text-gray-400 mt-2">From recent content</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Reels Views"
          value={data?.reelsViews?.toLocaleString() || '0'}
          change="Primary metric"
          changeType="positive"
          icon={<Eye size={20} className="text-[#E4405F]" />}
        />
        <MetricCard
          label="Accounts Reached"
          value={data?.reach?.toLocaleString() || '0'}
          change="Last 30 days"
          changeType="positive"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="Impressions"
          value={data?.impressions?.toLocaleString() || '0'}
          change="Last 30 days"
          changeType="positive"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Interactions"
          value={data?.interactions?.toLocaleString() || '0'}
          change="Likes + Comments"
          changeType="positive"
          icon={<Heart size={20} />}
        />
      </div>

      {/* Performance Chart */}
      {generateChartData().length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <SimpleChart data={generateChartData()} color="#E4405F" type="bar" />
        </div>
      )}

      {/* Engagement Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Profile Visits</h3>
          <div className="text-4xl font-bold text-white">{data?.profileViews?.toLocaleString() || '0'}</div>
          <p className="text-gray-400 mt-2">Last 30 days</p>
        </div>
        <div className="metric-card bg-gray-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-400">Followers</h3>
          </div>
          <div className="text-4xl font-bold text-white">{data?.followers?.toLocaleString() || '0'}</div>
          <p className="text-gray-400 mt-2">Secondary metric</p>
        </div>
      </div>

      {/* Content Engagement */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Content Engagement</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Heart className="mx-auto mb-2 text-red-400" size={24} />
            <div className="text-2xl font-bold">{data?.likes?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Likes</p>
          </div>
          <div>
            <MessageCircle className="mx-auto mb-2 text-blue-400" size={24} />
            <div className="text-2xl font-bold">{data?.comments?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Comments</p>
          </div>
          <div>
            <Eye className="mx-auto mb-2 text-purple-400" size={24} />
            <div className="text-2xl font-bold">{data?.mediaCount || '0'}</div>
            <p className="text-xs text-gray-500">Total Posts</p>
          </div>
        </div>
      </div>

      {/* Views Performance */}
      {data && data.reelsViews > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Views Performance</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 mb-1">Views per Follower</p>
              <div className="text-3xl font-bold text-brand-lime">
                {(data.reelsViews / (data.followers || 1)).toFixed(1)}x
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Content reaches {(data.reelsViews / (data.followers || 1)).toFixed(1)}x your follower count
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Engagement Rate</p>
              <div className="text-3xl font-bold text-brand-lime">{engagementRate}%</div>
              <p className="text-sm text-gray-500 mt-1">Interactions per account reached</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
