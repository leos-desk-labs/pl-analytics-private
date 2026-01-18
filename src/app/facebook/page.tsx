'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Facebook, Eye, Heart, TrendingUp, Users, Play, Share2, MessageCircle } from 'lucide-react';

interface FacebookData {
  pageId: string;
  pageName: string;
  followers: number;
  videoViews: number;
  pageViews: number;
  engagements: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  recentPosts: Array<{
    id: string;
    message: string;
    createdTime: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  error?: string;
}

export default function FacebookPage() {
  const [data, setData] = useState<FacebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/facebook')
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
        setError('Failed to fetch Facebook data');
        setLoading(false);
      });
  }, []);

  // Generate chart data from real metrics
  const generateChartData = () => {
    if (!data) return [];
    return [
      { name: 'Video Views', value: data.videoViews },
      { name: 'Engagements', value: data.engagements },
      { name: 'Page Views', value: data.pageViews },
    ].filter(d => d.value > 0);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Facebook className="text-[#1877F2]" size={32} />
          <h1 className="text-3xl font-bold text-white">Facebook Analytics</h1>
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
          <Facebook className="text-[#1877F2]" size={32} />
          <h1 className="text-3xl font-bold text-white">Facebook Analytics</h1>
        </div>
        <div className="metric-card border-red-500/50">
          <p className="text-red-400">Error: {error}</p>
          <p className="text-gray-500 text-sm mt-2">
            Make sure you have admin access to the Peoples League Facebook Page.
          </p>
        </div>
      </div>
    );
  }

  // Calculate engagement rate based on followers since reach metric is deprecated
  const engagementRate = data && data.followers > 0
    ? ((data.engagements / data.followers) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Facebook className="text-[#1877F2]" />
            Facebook Analytics
          </h1>
          <p className="text-gray-400 mt-1">{data?.pageName}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
          Live Data
        </span>
      </div>

      {/* Primary Metric: Video Views */}
      <div className="metric-card bg-gradient-to-r from-[#1877F2]/20 to-gray-800 border-2 border-[#1877F2]">
        <div className="flex items-center gap-3 mb-2">
          <Play className="text-[#1877F2]" size={28} />
          <h2 className="text-lg text-gray-300">Video Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {data?.videoViews?.toLocaleString() || '0'}
        </div>
        <p className="text-gray-400 mt-2">Last 28 days</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Video Views"
          value={data?.videoViews?.toLocaleString() || '0'}
          change="Primary metric"
          changeType="positive"
          icon={<Play size={20} className="text-[#1877F2]" />}
        />
        <MetricCard
          label="Engagements"
          value={data?.engagements?.toLocaleString() || '0'}
          change="Last 28 days"
          changeType="positive"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Page Views"
          value={data?.pageViews?.toLocaleString() || '0'}
          change="Last 28 days"
          changeType="positive"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Followers"
          value={data?.followers?.toLocaleString() || '0'}
          change="Total followers"
          changeType="neutral"
          icon={<Users size={20} />}
        />
      </div>

      {/* Performance Chart */}
      {generateChartData().length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <SimpleChart data={generateChartData()} color="#1877F2" type="bar" />
        </div>
      )}

      {/* 28-Day Engagements Highlight */}
      <div className="metric-card bg-gradient-to-r from-[#1877F2]/10 to-gray-800">
        <h3 className="text-lg font-semibold mb-4">28-Day Performance</h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-400 mb-1">Total Engagements</p>
            <div className="text-4xl font-bold text-brand-lime">{data?.engagements?.toLocaleString() || '0'}</div>
            <p className="text-sm text-gray-500 mt-1">Likes, comments, shares, clicks</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Engagement Rate</p>
            <div className="text-4xl font-bold text-brand-lime">{engagementRate}%</div>
            <p className="text-sm text-gray-500 mt-1">Engagements per follower</p>
          </div>
        </div>
      </div>

      {/* Content Engagement */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Content Engagement</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Heart className="mx-auto mb-2 text-red-400" size={24} />
            <div className="text-2xl font-bold">{data?.totalLikes?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Reactions</p>
          </div>
          <div>
            <MessageCircle className="mx-auto mb-2 text-blue-400" size={24} />
            <div className="text-2xl font-bold">{data?.totalComments?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Comments</p>
          </div>
          <div>
            <Share2 className="mx-auto mb-2 text-green-400" size={24} />
            <div className="text-2xl font-bold">{data?.totalShares?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500">Shares</p>
          </div>
        </div>
      </div>

      {/* Views Performance */}
      {data && data.videoViews > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Video Performance</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 mb-1">Views per Follower</p>
              <div className="text-3xl font-bold text-brand-lime">
                {(data.videoViews / (data.followers || 1)).toFixed(1)}x
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Video content reaches {(data.videoViews / (data.followers || 1)).toFixed(1)}x your follower count
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Page Views</p>
              <div className="text-3xl font-bold text-white">{data?.pageViews?.toLocaleString() || '0'}</div>
              <p className="text-sm text-gray-500 mt-1">Profile visits (recent)</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {data?.recentPosts && data.recentPosts.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
          <div className="space-y-3">
            {data.recentPosts.map((post) => (
              <div key={post.id} className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-300 mb-2">
                  {post.message || '(No text)'}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 size={12} /> {post.shares}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
