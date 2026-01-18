'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import ViewsGrowthChart from '@/components/ViewsGrowthChart';
import GrowthMetrics from '@/components/GrowthMetrics';
import { Youtube, Instagram, Facebook, Music2, Twitter, Linkedin, Eye, TrendingUp, Target, Calendar, Play } from 'lucide-react';

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

  const currentYear = new Date().getFullYear();

  // ====================================
  // LIFETIME TOTALS (All-time stats)
  // ====================================
  const youtubeLifetimeViews = youtubeData?.viewCount || 0;
  const instagramLifetimeViews = instagramData?.totalViews?.reels || instagramData?.reelsPerformance?.totalViews || 0;
  const facebookLifetimeViews = facebookData?.lifetime?.videoViews || facebookData?.videoViews || 0;
  const totalLifetimeViews = youtubeLifetimeViews + instagramLifetimeViews + facebookLifetimeViews;

  // ====================================
  // YTD (Year-to-Date) STATS
  // ====================================
  // YouTube YTD
  const youtubeYtdViews = youtubeData?.ytd?.totalViews || 0;
  const youtubeYtdVideos = youtubeData?.ytd?.totalVideos || 0;
  const youtubeYtdLongForm = youtubeData?.ytd?.longForm?.views || 0;
  const youtubeYtdShorts = youtubeData?.ytd?.shorts?.views || 0;

  // Instagram YTD
  const instagramYtdViews = instagramData?.ytd?.views || 0;
  const instagramYtdReels = instagramData?.ytd?.reelCount || 0;

  // Facebook YTD
  const facebookYtdViews = facebookData?.ytd?.videoViews || 0;
  const facebookYtdVideos = facebookData?.ytd?.videoCount || 0;

  // Total YTD
  const totalYtdViews = youtubeYtdViews + instagramYtdViews + facebookYtdViews;
  const totalYtdContent = youtubeYtdVideos + instagramYtdReels + facebookYtdVideos;

  // ====================================
  // AUDIENCE SIZE
  // ====================================
  const youtubeSubscribers = youtubeData?.subscriberCount || 0;
  const instagramFollowers = instagramData?.account?.followers || 0;
  const facebookFollowers = facebookData?.followers || 0;
  const totalAudience = youtubeSubscribers + instagramFollowers + facebookFollowers;

  // Count active platforms
  const activePlatforms = [youtubeData, instagramData, facebookData].filter(Boolean).length;

  // Calculate daily average for YTD
  const getDaysElapsed = () => {
    const today = new Date();
    const startOfYear = new Date(currentYear, 0, 1);
    return Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };
  const daysElapsed = getDaysElapsed();
  const avgViewsPerDay = daysElapsed > 0 ? Math.round(totalYtdViews / daysElapsed) : 0;

  // Build views by platform for chart - using YTD data
  const ytdViewsByPlatform = [
    { name: 'YouTube', value: youtubeYtdViews, color: '#FF0000' },
    { name: 'Instagram', value: instagramYtdViews, color: '#E4405F' },
    { name: 'Facebook', value: facebookYtdViews, color: '#1877F2' },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-brand-lime">Overview</h1>
        <p className="text-gray-400 mt-1">Peoples League Media Network Performance</p>
      </div>

      {/* Primary Metric: Total Lifetime Views - Hero Display */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-brand-lime/30">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-lime/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Main number - centered hero */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">Lifetime Views</p>
            <div className="text-6xl md:text-7xl font-bold text-brand-lime tracking-tight">
              {loading ? '...' : totalLifetimeViews.toLocaleString()}
            </div>
            <p className="text-gray-500 text-sm mt-2">across all platforms</p>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent mx-auto mb-6" />

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 md:gap-12 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '...' : totalYtdViews.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">{currentYear} YTD</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '...' : avgViewsPerDay.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">avg/day</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '...' : totalAudience.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">total audience</p>
            </div>
          </div>
        </div>
      </div>

      {/* YTD Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={`${currentYear} YTD Views`}
          value={loading ? '...' : totalYtdViews.toLocaleString()}
          change={`${totalYtdContent} pieces of content`}
          changeType="positive"
          icon={<Play size={20} className="text-brand-lime" />}
        />
        <MetricCard
          label="Content Posted"
          value={loading ? '...' : totalYtdContent.toString()}
          change={`in ${currentYear}`}
          changeType="positive"
          icon={<Calendar size={20} />}
        />
        <MetricCard
          label="Total Audience"
          value={loading ? '...' : totalAudience.toLocaleString()}
          change="subscribers + followers"
          changeType="neutral"
          icon={<Target size={20} />}
        />
        <MetricCard
          label="Platforms Active"
          value={`${activePlatforms} of 6`}
          change="YouTube, Instagram, Facebook"
          changeType="neutral"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* YTD by Platform */}
      <h2 className="text-xl font-semibold text-white">{currentYear} YTD by Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* YouTube YTD */}
        <div className="metric-card border-l-4 border-[#FF0000]">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="text-[#FF0000]" size={24} />
            <span className="font-semibold">YouTube</span>
            {youtubeData && <span className="text-xs text-green-400 ml-auto">Live</span>}
          </div>
          <div className="text-3xl font-bold text-brand-lime">
            {loading ? '...' : youtubeYtdViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{currentYear} YTD Views</p>
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Long-Form</span>
              <span className="text-white">{youtubeYtdLongForm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shorts</span>
              <span className="text-white">{youtubeYtdShorts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Videos Posted</span>
              <span className="text-white">{youtubeYtdVideos}</span>
            </div>
          </div>
        </div>

        {/* Instagram YTD */}
        <div className="metric-card border-l-4 border-[#E4405F]">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="text-[#E4405F]" size={24} />
            <span className="font-semibold">Instagram</span>
            <span className={`text-xs ml-auto ${instagramData ? 'text-green-400' : 'text-yellow-400'}`}>
              {instagramData ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <div className="text-3xl font-bold text-brand-lime">
            {loading ? '...' : instagramYtdViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{currentYear} YTD Reel Views</p>
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reels Posted</span>
              <span className="text-white">{instagramYtdReels}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Views/Reel</span>
              <span className="text-white">{instagramYtdReels > 0 ? Math.round(instagramYtdViews / instagramYtdReels).toLocaleString() : '--'}</span>
            </div>
          </div>
        </div>

        {/* Facebook YTD */}
        <div className="metric-card border-l-4 border-[#1877F2]">
          <div className="flex items-center gap-2 mb-3">
            <Facebook className="text-[#1877F2]" size={24} />
            <span className="font-semibold">Facebook</span>
            <span className={`text-xs ml-auto ${facebookData ? 'text-green-400' : 'text-yellow-400'}`}>
              {facebookData ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <div className="text-3xl font-bold text-brand-lime">
            {loading ? '...' : facebookYtdViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{currentYear} YTD Video Views</p>
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Videos Posted</span>
              <span className="text-white">{facebookYtdVideos}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Views/Video</span>
              <span className="text-white">{facebookYtdVideos > 0 ? Math.round(facebookYtdViews / facebookYtdVideos).toLocaleString() : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* YTD Views Distribution Chart */}
      {ytdViewsByPlatform.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">{currentYear} YTD Views by Platform</h3>
          <SimpleChart
            data={ytdViewsByPlatform}
            color="#e7ff01"
            type="bar"
          />
        </div>
      )}

      {/* Views Growth Chart */}
      {!loading && (
        <ViewsGrowthChart
          youtubeTotal={youtubeYtdViews}
          instagramTotal={instagramYtdViews}
          facebookTotal={facebookYtdViews}
        />
      )}

      {/* Growth Metrics - MoM, Velocity, Milestones */}
      {!loading && (
        <GrowthMetrics
          youtubeViews={youtubeYtdViews}
          instagramViews={instagramYtdViews}
          facebookViews={facebookYtdViews}
          youtubeSubscribers={youtubeSubscribers}
          instagramFollowers={instagramFollowers}
          facebookFollowers={facebookFollowers}
        />
      )}

      {/* Lifetime Stats Section */}
      <h2 className="text-xl font-semibold text-white">Lifetime Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* YouTube Lifetime */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="text-[#FF0000]" size={24} />
            <span className="font-semibold">YouTube Lifetime</span>
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : youtubeLifetimeViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">Total channel views</p>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-500">Videos: </span>
            <span className="text-sm text-white">{youtubeData?.videoCount?.toLocaleString() || '--'}</span>
          </div>
        </div>

        {/* Instagram Lifetime */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="text-[#E4405F]" size={24} />
            <span className="font-semibold">Instagram Lifetime</span>
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : instagramLifetimeViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">Total reel views</p>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-500">Reels: </span>
            <span className="text-sm text-white">{instagramData?.reelsPerformance?.totalReels?.toLocaleString() || '--'}</span>
          </div>
        </div>

        {/* Facebook Lifetime */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <Facebook className="text-[#1877F2]" size={24} />
            <span className="font-semibold">Facebook Lifetime</span>
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : facebookLifetimeViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">Total video views</p>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-500">Videos: </span>
            <span className="text-sm text-white">{facebookData?.lifetime?.videoCount?.toLocaleString() || '--'}</span>
          </div>
        </div>
      </div>

      {/* Audience Size */}
      <div className="metric-card bg-gray-800/30">
        <h3 className="text-lg font-semibold mb-4 text-gray-400">Audience Size</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Youtube className="text-[#FF0000] mx-auto mb-2" size={20} />
            <div className="text-xl font-bold">{youtubeSubscribers?.toLocaleString() || '--'}</div>
            <p className="text-xs text-gray-500">Subscribers</p>
          </div>
          <div>
            <Instagram className="text-[#E4405F] mx-auto mb-2" size={20} />
            <div className="text-xl font-bold">{instagramFollowers?.toLocaleString() || '--'}</div>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div>
            <Facebook className="text-[#1877F2] mx-auto mb-2" size={20} />
            <div className="text-xl font-bold">{facebookFollowers?.toLocaleString() || '--'}</div>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Platforms */}
      <h2 className="text-xl font-semibold text-gray-500">Coming Soon</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
}
