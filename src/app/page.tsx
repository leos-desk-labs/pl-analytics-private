'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import ViewsGrowthChart from '@/components/ViewsGrowthChart';
import GrowthMetrics from '@/components/GrowthMetrics';
import { Youtube, Instagram, Facebook, Music2, Twitter, Linkedin, Eye, TrendingUp, Target, Calendar } from 'lucide-react';

export default function OverviewPage() {
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [instagramData, setInstagramData] = useState<any>(null);
  const [facebookData, setFacebookData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all platform data in parallel
    Promise.all([
      fetch('/api/youtube').then(res => res.json()).catch(() => null),
      fetch('/api/instagram').then(res => res.json()).catch(() => null),
      fetch('/api/facebook').then(res => res.json()).catch(() => null),
    ]).then(([youtube, instagram, facebook]) => {
      setYoutubeData(youtube);
      setInstagramData(instagram?.error ? null : instagram);
      setFacebookData(facebook?.error ? null : facebook);
      setLoading(false);
    });
  }, []);

  // Calculate total views/impressions across ALL content on all platforms
  // YouTube: lifetime views across all videos
  const youtubeLifetimeViews = youtubeData?.viewCount || 0;
  const youtubeRecentViews = youtubeData?.recentVideos?.reduce((sum: number, v: any) => sum + v.viewCount, 0) || 0;

  // Instagram: Use totalViews.reels from the API response (matches instagram/page.tsx structure)
  // The API returns: { totalViews: { reels: number }, reelsPerformance: { totalViews: number }, todayStats: { interactions: number } }
  const instagramReelsViews = instagramData?.totalViews?.reels || instagramData?.reelsPerformance?.totalViews || 0;
  const instagramInteractions = instagramData?.todayStats?.interactions || 0;
  const instagramMetric = instagramReelsViews || instagramInteractions;

  // Facebook: lifetime video views + impressions
  const facebookVideoViews = facebookData?.lifetime?.videoViews || facebookData?.videoViews || 0;
  const facebookImpressions = facebookData?.impressions || 0;
  const facebookMetric = facebookVideoViews + facebookImpressions;

  // Total views = all content views across all platforms
  const totalViews = youtubeLifetimeViews + instagramMetric + facebookMetric;

  // Recent period views (for charts and recent metrics)
  const recentViews = youtubeRecentViews + instagramMetric + facebookVideoViews;

  // Count active platforms
  const activePlatforms = [youtubeData, instagramData, facebookData].filter(Boolean).length;

  // Build views by platform for chart
  const viewsByPlatform = [
    { name: 'YouTube', value: youtubeRecentViews, color: '#FF0000' },
    { name: 'Instagram', value: instagramMetric, color: '#E4405F' },
    { name: 'Facebook', value: facebookMetric, color: '#1877F2' },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-brand-lime">Overview</h1>
        <p className="text-gray-400 mt-1">Peoples League Media Network Performance</p>
      </div>

      {/* Primary Metric: Total Views - Hero Display */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-brand-lime/30">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-lime/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Main number - centered hero */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">Total Views</p>
            <div className="text-6xl md:text-7xl font-bold text-brand-lime tracking-tight">
              {loading ? '...' : totalViews.toLocaleString()}
            </div>
            <p className="text-gray-500 text-sm mt-2">across all platforms</p>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent mx-auto mb-6" />

          {/* 2026 Stats Row */}
          <div className="flex items-center justify-center gap-8 md:gap-12 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '...' : recentViews.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">2026 YTD</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '...' : (() => {
                  const today = new Date();
                  const startOfYear = new Date('2026-01-01');
                  const daysElapsed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return Math.round(recentViews / daysElapsed).toLocaleString();
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-1">per day</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {activePlatforms}
              </div>
              <p className="text-xs text-gray-500 mt-1">platforms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Views Growth Chart */}
      {!loading && (
        <ViewsGrowthChart
          youtubeTotal={youtubeRecentViews}
          instagramTotal={instagramMetric}
          facebookTotal={facebookMetric}
        />
      )}

      {/* Growth Metrics - MoM, Velocity, Milestones */}
      {!loading && (
        <GrowthMetrics
          youtubeViews={youtubeRecentViews}
          instagramViews={instagramMetric}
          facebookViews={facebookMetric}
          youtubeSubscribers={youtubeData?.subscriberCount || 0}
          instagramFollowers={instagramData?.account?.followers || instagramData?.followers || 0}
          facebookFollowers={facebookData?.followers || 0}
        />
      )}

      {/* Views Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Recent Views"
          value={loading ? '...' : recentViews.toLocaleString()}
          change="Last 30 days combined"
          changeType="neutral"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="YouTube Lifetime"
          value={loading ? '...' : youtubeLifetimeViews.toLocaleString()}
          change={youtubeData ? "Live from API" : "Loading..."}
          changeType="positive"
          icon={<Youtube size={20} className="text-[#FF0000]" />}
        />
        <MetricCard
          label="Platforms Tracked"
          value={`${activePlatforms} of 6`}
          change="YouTube, Instagram, Facebook"
          changeType="neutral"
          icon={<Target size={20} />}
        />
      </div>

      {/* Platform Views Cards */}
      <h2 className="text-xl font-semibold text-white">Views by Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* YouTube */}
        <div className="metric-card border-l-4 border-[#FF0000]">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="text-[#FF0000]" size={24} />
            <span className="font-semibold">YouTube</span>
            {youtubeData && <span className="text-xs text-green-400 ml-auto">Live</span>}
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : youtubeLifetimeViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">Lifetime Views</p>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-500">Recent 10 videos: </span>
            <span className="text-sm text-white">{youtubeRecentViews.toLocaleString()}</span>
          </div>
        </div>

        {/* Instagram */}
        <div className="metric-card border-l-4 border-[#E4405F]">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="text-[#E4405F]" size={24} />
            <span className="font-semibold">Instagram</span>
            <span className={`text-xs ml-auto ${instagramData ? 'text-green-400' : 'text-yellow-400'}`}>
              {instagramData ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {instagramMetric ? instagramMetric.toLocaleString() : '--'}
          </div>
          <p className="text-sm text-gray-400">
            {instagramReelsViews ? 'Reels Views' : 'Interactions'}
          </p>
          {instagramData && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-sm text-gray-500">Followers: </span>
              <span className="text-sm text-white">{(instagramData.account?.followers || instagramData.followers)?.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Facebook */}
        <div className="metric-card border-l-4 border-[#1877F2]">
          <div className="flex items-center gap-2 mb-3">
            <Facebook className="text-[#1877F2]" size={24} />
            <span className="font-semibold">Facebook</span>
            <span className={`text-xs ml-auto ${facebookData ? 'text-green-400' : 'text-yellow-400'}`}>
              {facebookData ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {facebookMetric ? facebookMetric.toLocaleString() : '--'}
          </div>
          <p className="text-sm text-gray-400">
            {facebookImpressions && facebookVideoViews ? 'Impressions + Video Views' :
             facebookImpressions ? 'Impressions' : 'Video Views (28 days)'}
          </p>
          {facebookData && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-sm text-gray-500">Followers: </span>
              <span className="text-sm text-white">{facebookData.followers?.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* TikTok */}
        <div className="metric-card border-l-4 border-gray-500 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <Music2 size={24} />
            <span className="font-semibold">TikTok</span>
            <span className="text-xs text-yellow-400 ml-auto">Coming Soon</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Video Views</p>
        </div>

        {/* X */}
        <div className="metric-card border-l-4 border-gray-500 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <Twitter size={24} />
            <span className="font-semibold">X</span>
            <span className="text-xs text-yellow-400 ml-auto">Coming Soon</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Video Views</p>
        </div>

        {/* LinkedIn */}
        <div className="metric-card border-l-4 border-gray-500 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <Linkedin size={24} />
            <span className="font-semibold">LinkedIn</span>
            <span className="text-xs text-yellow-400 ml-auto">Coming Soon</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Video Views</p>
        </div>
      </div>

      {/* Views Distribution Chart */}
      {viewsByPlatform.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Views Distribution by Platform</h3>
          <SimpleChart
            data={viewsByPlatform}
            color="#e7ff01"
            type="bar"
          />
        </div>
      )}

      {/* Secondary: Audience Size */}
      <div className="metric-card bg-gray-800/30">
        <h3 className="text-lg font-semibold mb-4 text-gray-400">Secondary Metric: Audience Size</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Youtube className="text-[#FF0000] mx-auto mb-2" size={20} />
            <div className="text-xl font-bold">{youtubeData?.subscriberCount?.toLocaleString() || '--'}</div>
            <p className="text-xs text-gray-500">Subscribers</p>
          </div>
          <div>
            <Instagram className="text-[#E4405F] mx-auto mb-2" size={20} />
            <div className="text-xl font-bold">{(instagramData?.account?.followers || instagramData?.followers)?.toLocaleString() || '--'}</div>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div>
            <Facebook className="text-[#1877F2] mx-auto mb-2" size={20} />
            <div className="text-xl font-bold">{facebookData?.followers?.toLocaleString() || '--'}</div>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
