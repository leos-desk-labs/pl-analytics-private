'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import { Twitter, Users, Eye, Heart, Repeat2, MessageCircle, RefreshCw, Bookmark, BarChart3 } from 'lucide-react';

interface XData {
  account: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    description: string;
    verified: boolean;
    followers: number;
    following: number;
    tweetCount: number;
    listedCount: number;
    createdAt: string;
  };
  recentStats: {
    tweetsAnalyzed: number;
    totalImpressions: number;
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    totalQuotes: number;
    totalBookmarks: number;
    totalEngagement: number;
    avgImpressionsPerTweet: number;
    avgEngagementPerTweet: number;
    engagementRate: string;
  };
  tweetPerformance: {
    totalTweets: number;
    bestPerformers: Array<{
      id: string;
      text: string;
      impressions: number;
      likes: number;
      retweets: number;
      replies: number;
      quotes: number;
      url: string;
      createdAt: string;
    }>;
    needsImprovement: Array<{
      id: string;
      text: string;
      impressions: number;
      likes: number;
      url: string;
    }>;
  };
  _meta: {
    generatedAt: string;
    fromCache: boolean;
    nextRefresh: string;
    tweetsAnalyzed: number;
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function XPage() {
  const [data, setData] = useState<XData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/x');
      const result = await response.json();

      if (result.error) {
        setError(result.message || result.error);
        setData(null);
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to fetch X data');
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
              <Twitter />
              X Analytics
            </h1>
            <p className="text-gray-400 mt-1">@PeoplesLeagueX</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-brand-lime animate-spin" />
          <span className="ml-3 text-gray-400">Loading X data...</span>
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
              <Twitter />
              X Analytics
            </h1>
            <p className="text-gray-400 mt-1">@PeoplesLeagueX</p>
          </div>
        </div>
        <div className="metric-card border-red-500 border">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-brand-lime text-black rounded-lg hover:bg-brand-lime/80 transition-colors"
            >
              Retry
            </button>
            <a
              href="/api/x/auth"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Connect X Account
            </a>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>Go to the <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-brand-lime hover:underline">X Developer Portal</a></li>
            <li>Create a new project and app (or use existing)</li>
            <li>Enable OAuth 2.0 with read permissions</li>
            <li>Add callback URL: <code className="bg-gray-800 px-2 py-1 rounded">https://pl-analytics-private.vercel.app/api/x/callback</code></li>
            <li>Add these environment variables to Vercel:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li><code className="bg-gray-800 px-1 rounded">X_CLIENT_ID</code> - OAuth 2.0 Client ID</li>
                <li><code className="bg-gray-800 px-1 rounded">X_CLIENT_SECRET</code> - OAuth 2.0 Client Secret</li>
              </ul>
            </li>
            <li>Click &quot;Connect X Account&quot; above to authorize</li>
            <li>After authorization, add the refresh token to Vercel as <code className="bg-gray-800 px-1 rounded">X_REFRESH_TOKEN</code></li>
          </ol>
          <p className="mt-4 text-sm text-yellow-400">
            Note: X API Basic tier ($100/mo) is required for full analytics including impressions.
            Free tier provides limited access.
          </p>
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
              alt={data.account.name}
              className="w-16 h-16 rounded-full border-2 border-white"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Twitter />
              X Analytics
              {data?.account?.verified && (
                <span className="text-blue-400 text-sm">Verified</span>
              )}
            </h1>
            <p className="text-gray-400 mt-1">
              @{data?.account?.username || 'PeoplesLeagueX'}
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
          label="Impressions (Recent)"
          value={formatNumber(data?.recentStats?.totalImpressions || 0)}
          change={`${data?.recentStats?.tweetsAnalyzed || 0} tweets analyzed`}
          changeType="neutral"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Engagement (Recent)"
          value={formatNumber(data?.recentStats?.totalEngagement || 0)}
          change={data?.recentStats?.engagementRate || '0%'}
          changeType="neutral"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Total Tweets"
          value={formatNumber(data?.account?.tweetCount || 0)}
          change="All-time posts"
          changeType="neutral"
          icon={<MessageCircle size={20} />}
        />
      </div>

      {/* Engagement Breakdown */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Engagement Breakdown (Last 100 Tweets)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Heart size={14} /> Likes
            </p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.totalLikes || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Repeat2 size={14} /> Retweets
            </p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.totalRetweets || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <MessageCircle size={14} /> Replies
            </p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.totalReplies || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <BarChart3 size={14} /> Quotes
            </p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.totalQuotes || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Bookmark size={14} /> Bookmarks
            </p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.totalBookmarks || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Averages */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Average Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Avg Impressions/Tweet</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.avgImpressionsPerTweet || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Engagement/Tweet</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(data?.recentStats?.avgEngagementPerTweet || 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Engagement Rate</p>
            <p className="text-2xl font-bold text-brand-lime">
              {data?.recentStats?.engagementRate || '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {data?.tweetPerformance?.bestPerformers && data.tweetPerformance.bestPerformers.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Top Performing Tweets</h3>
          <div className="space-y-4">
            {data.tweetPerformance.bestPerformers.map((tweet) => (
              <a
                key={tweet.id}
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <p className="text-white text-sm mb-2">{tweet.text}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {formatNumber(tweet.impressions)} impressions
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {formatNumber(tweet.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 size={12} /> {formatNumber(tweet.retweets)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {formatNumber(tweet.replies)}
                  </span>
                  <span className="text-gray-500">
                    {formatDate(tweet.createdAt)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Note about API access */}
      {data?.recentStats?.totalImpressions === 0 && (
        <div className="metric-card border-yellow-500/50 border">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Limited API Access</h3>
          <p className="text-gray-400">
            Impression data requires X API Basic tier ($100/mo) or higher.
            Currently showing engagement metrics only. Upgrade your API access to unlock full analytics.
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
