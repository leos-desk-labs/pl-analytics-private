'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Facebook, Eye, Heart, Users, Play, Share2, MessageCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface TopVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  createdTime: string;
}

interface TopPost {
  id: string;
  message: string;
  createdTime: string;
  reactions: number;
  comments: number;
  shares: number;
  totalEngagement: number;
}

interface FacebookData {
  pageId: string;
  pageName: string;
  followers: number;
  lifetime: {
    videoViews: number;
    videoCount: number;
    postCount: number;
    reactions: number;
    comments: number;
    shares: number;
    totalEngagements: number;
    avgViewsPerVideo: number;
    avgEngagementPerPost: number;
  };
  rolling28Day: {
    engagements: number;
    pageViews: number;
  };
  topVideos: TopVideo[];
  topPosts: TopPost[];
  recentPosts: Array<{
    id: string;
    message: string;
    createdTime: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  _meta: {
    videosAnalyzed: number;
    postsAnalyzed: number;
    dataType: string;
    generatedAt: string;
  };
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
      .catch(() => {
        setError('Failed to fetch Facebook data');
        setLoading(false);
      });
  }, []);

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
        </div>
      </div>
    );
  }

  const lifetime = data?.lifetime;
  const engagementRate = data && data.followers > 0 && lifetime
    ? ((lifetime.totalEngagements / data.followers) * 100).toFixed(1)
    : '0';

  // Chart data for top videos
  const videoChartData = data?.topVideos?.slice(0, 5).map((v, i) => ({
    name: `#${i + 1}`,
    value: v.views,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Facebook className="text-[#1877F2]" />
            Facebook Analytics
          </h1>
          <p className="text-gray-400 mt-1">{data?.pageName}</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
            Lifetime Data
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {data?._meta?.videosAnalyzed} videos, {data?._meta?.postsAnalyzed} posts analyzed
          </p>
        </div>
      </div>

      {/* Primary Metric: Lifetime Video Views */}
      <div className="metric-card bg-gradient-to-r from-[#1877F2]/20 to-gray-800 border-2 border-[#1877F2]">
        <div className="flex items-center gap-3 mb-2">
          <Play className="text-[#1877F2]" size={28} />
          <h2 className="text-lg text-gray-300">Lifetime Video Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {lifetime?.videoViews?.toLocaleString() || '0'}
        </div>
        <p className="text-gray-400 mt-2">
          Across {lifetime?.videoCount || 0} videos ({lifetime?.avgViewsPerVideo?.toLocaleString() || 0} avg per video)
        </p>
      </div>

      {/* Key Lifetime Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Video Views"
          value={lifetime?.videoViews?.toLocaleString() || '0'}
          change="Lifetime"
          changeType="positive"
          icon={<Play size={20} className="text-[#1877F2]" />}
        />
        <MetricCard
          label="Total Engagements"
          value={lifetime?.totalEngagements?.toLocaleString() || '0'}
          change="Lifetime"
          changeType="positive"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Engagement Rate"
          value={`${engagementRate}%`}
          change="Per follower"
          changeType="positive"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="Followers"
          value={data?.followers?.toLocaleString() || '0'}
          change="Current"
          changeType="neutral"
          icon={<Users size={20} />}
        />
      </div>

      {/* Lifetime Engagement Breakdown */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-[#1877F2]" />
          Lifetime Engagement Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Heart className="mx-auto mb-2 text-red-400" size={28} />
            <div className="text-3xl font-bold text-white">{lifetime?.reactions?.toLocaleString() || '0'}</div>
            <p className="text-sm text-gray-400 mt-1">Reactions</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <MessageCircle className="mx-auto mb-2 text-blue-400" size={28} />
            <div className="text-3xl font-bold text-white">{lifetime?.comments?.toLocaleString() || '0'}</div>
            <p className="text-sm text-gray-400 mt-1">Comments</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Share2 className="mx-auto mb-2 text-green-400" size={28} />
            <div className="text-3xl font-bold text-white">{lifetime?.shares?.toLocaleString() || '0'}</div>
            <p className="text-sm text-gray-400 mt-1">Shares</p>
          </div>
        </div>
      </div>

      {/* 28-Day Rolling vs Lifetime Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card bg-gradient-to-r from-[#1877F2]/10 to-gray-800">
          <h3 className="text-lg font-semibold mb-4">28-Day Performance</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-1">Rolling Engagements</p>
              <div className="text-3xl font-bold text-brand-lime">
                {data?.rolling28Day?.engagements?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Page Views</p>
              <div className="text-2xl font-bold text-white">
                {data?.rolling28Day?.pageViews?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Content Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Videos</span>
              <span className="text-xl font-bold">{lifetime?.videoCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Posts</span>
              <span className="text-xl font-bold">{lifetime?.postCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Views/Video</span>
              <span className="text-xl font-bold text-brand-lime">{lifetime?.avgViewsPerVideo?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Engagement/Post</span>
              <span className="text-xl font-bold text-brand-lime">{lifetime?.avgEngagementPerPost?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Videos Chart */}
      {videoChartData.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Top 5 Videos by Views</h3>
          <SimpleChart data={videoChartData} color="#1877F2" type="bar" />
        </div>
      )}

      {/* Top Performing Videos List */}
      {data?.topVideos && data.topVideos.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Top Performing Videos</h3>
          <div className="space-y-3">
            {data.topVideos.slice(0, 5).map((video, index) => (
              <div key={video.id} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-center w-8 h-8 bg-[#1877F2] rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 line-clamp-1">{video.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(video.createdTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-lime">{video.views.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Posts */}
      {data?.topPosts && data.topPosts.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Top Performing Posts (by Engagement)</h3>
          <div className="space-y-3">
            {data.topPosts.map((post, index) => (
              <div key={post.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-full text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-2">
                      {post.message || '(No text)'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart size={12} className="text-red-400" /> {post.reactions}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} className="text-blue-400" /> {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 size={12} className="text-green-400" /> {post.shares}
                      </span>
                      <span className="ml-auto font-semibold text-brand-lime">
                        {post.totalEngagement} total
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
