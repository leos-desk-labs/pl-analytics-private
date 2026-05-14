'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import { Music2, Users, Heart, Video, RefreshCw, UserPlus, Eye, MessageCircle, Share2 } from 'lucide-react';

interface TikTokProfileData {
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

interface TikTokPost {
  url: string;
  title: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  posted_at: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  qualified: boolean | null;
  event_id: string | null;
}

interface TikTokPostsData {
  posts: TikTokPost[];
  totals: {
    postCount: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  _meta?: {
    generatedAt: string;
    source: string;
    filters: { from: string | null; to: string | null };
    fromCache: boolean;
    cacheInfo: any;
    nextRefresh: string;
  };
  error?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TikTokPage() {
  const [profileData, setProfileData] = useState<TikTokProfileData | null>(null);
  const [postsData, setPostsData] = useState<TikTokPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, postsRes] = await Promise.all([
        fetch('/api/tiktok').then(res => res.json()).catch(() => null),
        fetch('/api/tiktok-posts').then(res => res.json()).catch(() => null),
      ]);

      if (profileRes?.error) {
        setError(profileRes.message || profileRes.error);
      } else {
        setProfileData(profileRes);
      }

      setPostsData(postsRes);
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
              <Music2 /> TikTok Analytics
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {profileData?.account?.avatarUrl && (
            <img
              src={profileData.account.avatarUrl}
              alt={profileData.account.displayName}
              className="w-16 h-16 rounded-full border-2 border-brand-lime"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Music2 /> TikTok Analytics
            </h1>
            <p className="text-gray-400 mt-1">
              @{profileData?.account?.username || 'peoplesleaguegolf'}
              {profileData?.account?.bio && (
                <span className="ml-2 text-gray-500">&mdash; {profileData.account.bio}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profileData?._meta?.fromCache && (
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

      {/* Error banner if profile failed but posts work */}
      {error && (
        <div className="metric-card border-red-500/30 border">
          <p className="text-red-400 text-sm">Profile data error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-3 py-1 bg-brand-lime text-black rounded text-sm hover:bg-brand-lime/80 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Followers"
          value={formatNumber(profileData?.account?.followers || 0)}
          change="Account followers"
          changeType="neutral"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Total Video Views"
          value={formatNumber(postsData?.totals?.views || 0)}
          change={`${postsData?.totals?.postCount || 0} tracked videos`}
          changeType="positive"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Total Likes"
          value={formatNumber(profileData?.account?.totalLikes || 0)}
          change="All-time likes"
          changeType="neutral"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Videos Posted"
          value={formatNumber(profileData?.account?.videoCount || 0)}
          change="Total videos"
          changeType="neutral"
          icon={<Video size={20} />}
        />
      </div>

      {/* Video Views Summary */}
      {postsData && postsData.totals.postCount > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Video Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-brand-lime">
                {formatNumber(postsData.totals.views)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(postsData.totals.likes)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Comments</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(postsData.totals.comments)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Shares</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(postsData.totals.shares)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Views/Video</p>
              <p className="text-2xl font-bold text-white">
                {postsData.totals.postCount > 0
                  ? formatNumber(Math.round(postsData.totals.views / postsData.totals.postCount))
                  : '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Posts Table */}
      {postsData && postsData.posts.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">
            Individual Videos ({postsData.posts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Video</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Posted</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Views</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Likes</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Comments</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Shares</th>
                </tr>
              </thead>
              <tbody>
                {postsData.posts.map((post, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        {post.thumbnail_url && (
                          <img
                            src={post.thumbnail_url}
                            alt=""
                            className="w-10 h-14 object-cover rounded"
                          />
                        )}
                        <div className="min-w-0">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-brand-lime transition-colors truncate block max-w-[300px]"
                          >
                            {post.title || post.caption?.slice(0, 60) || 'Untitled'}
                          </a>
                          {post.event_id && (
                            <span className="text-xs text-brand-lime/70">Event: {post.event_id}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-400 whitespace-nowrap">
                      {formatDate(post.posted_at)}
                    </td>
                    <td className="text-right py-3 px-2 text-white font-medium">
                      {formatNumber(post.views || 0)}
                    </td>
                    <td className="text-right py-3 px-2 text-gray-300">
                      {formatNumber(post.likes || 0)}
                    </td>
                    <td className="text-right py-3 px-2 text-gray-300">
                      {formatNumber(post.comments || 0)}
                    </td>
                    <td className="text-right py-3 px-2 text-gray-300">
                      {formatNumber(post.shares || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No posts message */}
      {postsData && postsData.posts.length === 0 && (
        <div className="metric-card border-yellow-500/30 border">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">No Video Data Yet</h3>
          <p className="text-gray-400">
            Per-video metrics are collected by an automated scraper. Data will appear here once videos have been synced.
          </p>
        </div>
      )}

      {/* Engagement Summary */}
      {profileData && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Avg Likes/Video</p>
              <p className="text-2xl font-bold text-white">
                {profileData.account?.videoCount
                  ? formatNumber(Math.round((profileData.account.totalLikes || 0) / profileData.account.videoCount))
                  : '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Follower:Following</p>
              <p className="text-2xl font-bold text-white">
                {profileData.account?.following
                  ? ((profileData.account.followers || 0) / profileData.account.following).toFixed(1)
                  : '0'}
                :1
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Likes/Follower</p>
              <p className="text-2xl font-bold text-white">
                {profileData.account?.followers
                  ? ((profileData.account.totalLikes || 0) / profileData.account.followers).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Data Source</p>
              <p className="text-2xl font-bold text-white capitalize">
                {profileData._meta?.source === 'public_profile' ? 'Public' : 'API'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="text-xs text-gray-500 text-right">
        Profile: {profileData?._meta?.generatedAt ? new Date(profileData._meta.generatedAt).toLocaleString() : 'N/A'}
        {postsData?._meta?.generatedAt && ` | Posts: ${new Date(postsData._meta.generatedAt).toLocaleString()}`}
        {profileData?._meta?.nextRefresh && ` | Next refresh: ${profileData._meta.nextRefresh}`}
      </div>
    </div>
  );
}
