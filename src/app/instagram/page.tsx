'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import { Instagram, Eye, Heart, TrendingUp, Users, MessageCircle, Share2, Bookmark, ExternalLink, Clock, Play } from 'lucide-react';

interface ReelData {
  id: string;
  caption: string;
  timestamp: string;
  permalink: string;
  likes: number;
  comments: number;
  views: number;
  reach: number;
  shares: number;
  saved: number;
  avgWatchTimeSec: number;
  engagementRate: string;
}

interface InstagramData {
  account: {
    id: string;
    username: string;
    name: string;
    profilePicture: string;
    followers: number;
    following: number;
    biography: string;
  };
  todayStats: {
    reach: number;
    accountsEngaged: number;
    interactions: number;
  };
  contentBreakdown: {
    total: number;
    reels: number;
    images: number;
    carousels: number;
  };
  totalViews: {
    reels: number;
    allContent: number;
  };
  ytd: {
    year: number;
    reelCount: number;
    views: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    avgViewsPerReel: number;
  };
  allTimeStats: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalSaves: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
  };
  reelsPerformance: {
    totalReels: number;
    totalViews: number;
    totalReach: number;
    totalShares: number;
    totalSaves: number;
    totalWatchTimeHours: number;
    avgWatchTimeSec: number;
    avgViewsPerReel: number;
    avgEngagementRate: string;
    bestPerformers: ReelData[];
    needsImprovement: ReelData[];
  };
  _meta?: {
    generatedAt: string;
    fromCache?: boolean;
  };
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
      .catch(() => {
        setError('Failed to fetch Instagram data');
        setLoading(false);
      });
  }, []);

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
        <p className="text-gray-400">Loading insights for all Reels... This may take a moment.</p>
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

  if (!data) return null;

  const currentYear = data.ytd?.year || new Date().getFullYear();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Instagram className="text-[#E4405F]" />
            Instagram Analytics
          </h1>
          <p className="text-gray-400 mt-1">@{data.account.username}</p>
        </div>
        {data._meta?.generatedAt && (
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

      {/* PRIMARY METRIC: 2026 YTD Views */}
      <div className="metric-card bg-gradient-to-r from-[#E4405F]/20 to-gray-800 border-2 border-[#E4405F]">
        <div className="flex items-center gap-3 mb-2">
          <Play className="text-[#E4405F]" size={28} />
          <h2 className="text-lg text-gray-300">{currentYear} YTD Reel Views</h2>
        </div>
        <div className="text-5xl font-bold text-brand-lime">
          {(data.ytd?.views || 0).toLocaleString()}
        </div>
        <p className="text-gray-400 mt-2">{data.ytd?.reelCount || 0} reels posted in {currentYear}</p>

        {/* YTD Breakdown */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">YTD Reach</p>
              <p className="text-lg font-bold text-white">{(data.ytd?.reach || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">unique accounts</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">YTD Engagement</p>
              <p className="text-lg font-bold text-white">{((data.ytd?.likes || 0) + (data.ytd?.comments || 0) + (data.ytd?.shares || 0)).toLocaleString()}</p>
              <p className="text-xs text-gray-500">likes + comments + shares</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Followers</p>
              <p className="text-lg font-bold text-white">{data.account.followers.toLocaleString()}</p>
              <p className="text-xs text-gray-500">current</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Lifetime Views</p>
              <p className="text-lg font-bold text-gray-400">{data.totalViews.reels.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{data.reelsPerformance.totalReels} total reels</p>
            </div>
          </div>
        </div>
      </div>

      {/* YTD Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={`${currentYear} YTD Views`}
          value={(data.ytd?.views || 0).toLocaleString()}
          change={`${data.ytd?.reelCount || 0} reels posted`}
          changeType="positive"
          icon={<Play size={20} className="text-[#E4405F]" />}
        />
        <MetricCard
          label={`${currentYear} YTD Reach`}
          value={(data.ytd?.reach || 0).toLocaleString()}
          change="Unique accounts"
          changeType="positive"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Followers"
          value={data.account.followers.toLocaleString()}
          change="Current"
          changeType="neutral"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Lifetime Views"
          value={data.totalViews.reels.toLocaleString()}
          change={`${data.reelsPerformance.totalReels} total reels`}
          changeType="neutral"
          icon={<Eye size={20} className="text-gray-400" />}
        />
      </div>

      {/* YTD vs Lifetime Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YTD Stats */}
        <div className="metric-card border-l-4 border-[#E4405F]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play size={20} className="text-[#E4405F]" />
              {currentYear} YTD Performance
            </h3>
            <span className="text-sm text-gray-500">{data.ytd?.reelCount || 0} reels</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{(data.ytd?.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Views/Reel</span>
              <span className="font-bold text-brand-lime">{(data.ytd?.avgViewsPerReel || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Likes</span>
              <span className="font-bold">{(data.ytd?.likes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Comments</span>
              <span className="font-bold">{(data.ytd?.comments || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Shares</span>
              <span className="font-bold">{(data.ytd?.shares || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Saves</span>
              <span className="font-bold">{(data.ytd?.saves || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="metric-card border-l-4 border-gray-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-400" />
              Lifetime Performance
            </h3>
            <span className="text-sm text-gray-500">{data.reelsPerformance.totalReels} reels</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Views</span>
              <span className="font-bold text-white">{data.reelsPerformance.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Views/Reel</span>
              <span className="font-bold text-brand-lime">{data.reelsPerformance.avgViewsPerReel.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Likes</span>
              <span className="font-bold">{data.allTimeStats.totalLikes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Comments</span>
              <span className="font-bold">{data.allTimeStats.totalComments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Shares</span>
              <span className="font-bold">{data.allTimeStats.totalShares.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Saves</span>
              <span className="font-bold">{data.allTimeStats.totalSaves.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Today&apos;s Performance</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-gray-400 mb-1">Reach</p>
            <div className="text-3xl font-bold text-white">{data.todayStats.reach.toLocaleString()}</div>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Accounts Engaged</p>
            <div className="text-3xl font-bold text-white">{data.todayStats.accountsEngaged.toLocaleString()}</div>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Interactions</p>
            <div className="text-3xl font-bold text-white">{data.todayStats.interactions.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Watch Time & Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            Watch Time
          </h3>
          <div className="text-4xl font-bold text-white">{data.reelsPerformance.totalWatchTimeHours.toLocaleString()}h</div>
          <p className="text-gray-400 mt-2">Total watch time across all Reels</p>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Watch Time/View</span>
              <span className="font-bold text-brand-lime">{data.reelsPerformance.avgWatchTimeSec}s</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold">Content Library</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-lime">{data.contentBreakdown.reels}</div>
              <p className="text-xs text-gray-500">Reels</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.contentBreakdown.images}</div>
              <p className="text-xs text-gray-500">Images</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.contentBreakdown.carousels}</div>
              <p className="text-xs text-gray-500">Carousels</p>
            </div>
          </div>
          <p className="text-gray-400 mt-4 text-center">{data.contentBreakdown.total} total posts</p>
        </div>
      </div>

      {/* All-Time Engagement */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Lifetime Engagement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <Heart className="mx-auto mb-2 text-red-400" size={24} />
            <div className="text-2xl font-bold">{data.allTimeStats.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total Likes</p>
          </div>
          <div>
            <MessageCircle className="mx-auto mb-2 text-blue-400" size={24} />
            <div className="text-2xl font-bold">{data.allTimeStats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total Comments</p>
          </div>
          <div>
            <Share2 className="mx-auto mb-2 text-green-400" size={24} />
            <div className="text-2xl font-bold">{data.allTimeStats.totalShares.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total Shares</p>
          </div>
          <div>
            <Bookmark className="mx-auto mb-2 text-yellow-400" size={24} />
            <div className="text-2xl font-bold">{data.allTimeStats.totalSaves.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total Saves</p>
          </div>
        </div>
      </div>

      {/* Best Performers */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4 text-green-400">Top Performing Reels (by Views)</h3>
        <div className="space-y-3">
          {data.reelsPerformance.bestPerformers.slice(0, 5).map((reel, index) => (
            <div key={reel.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-[#E4405F] rounded-full text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 truncate max-w-md">
                    {reel.caption || 'No caption'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reel.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Play size={14} className="text-purple-400" />
                  <span className="font-semibold text-purple-400">{reel.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={14} className="text-red-400" />
                  <span>{reel.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} className="text-blue-400" />
                  <span>{reel.reach.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 size={14} className="text-green-400" />
                  <span>{reel.shares}</span>
                </div>
                <span className="text-brand-lime font-medium">{reel.engagementRate}</span>
                <a href={reel.permalink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Needs Improvement */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4 text-yellow-400">Needs Improvement (Lowest Views)</h3>
        <div className="space-y-3">
          {data.reelsPerformance.needsImprovement.map((reel, index) => (
            <div key={reel.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-300 truncate max-w-md">
                  {reel.caption || 'No caption'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(reel.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Play size={14} className="text-purple-400" />
                  <span>{reel.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={14} className="text-red-400" />
                  <span>{reel.likes.toLocaleString()}</span>
                </div>
                <span className="text-yellow-400 font-medium">{reel.engagementRate}</span>
                <a href={reel.permalink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
