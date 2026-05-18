'use client';

import { useState, useEffect, useCallback } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import ViewsGrowthChart from '@/components/ViewsGrowthChart';
import GrowthMetrics from '@/components/GrowthMetrics';
import {
  Youtube,
  Instagram,
  Facebook,
  Music2,
  Twitter,
  Eye,
  TrendingUp,
  Target,
  Calendar,
  Play,
} from 'lucide-react';

type ViewMode = 'all' | 'ytd' | 'tour';

const VIEW_CONFIG: Record<ViewMode, { label: string; subtitle: string; from?: string; to?: string }> = {
  all: {
    label: 'All Time',
    subtitle: 'Lifetime performance across all platforms',
  },
  ytd: {
    label: 'YTD 2026',
    subtitle: 'Jan 1 – Dec 31, 2026',
    from: '2026-01-01',
    to: '2026-12-31',
  },
  tour: {
    label: '2026 Tour',
    subtitle: 'Peoples League Tour — Feb 2026+',
    from: '2026-02-01',
  },
};

export default function OverviewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('ytd');
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [instagramData, setInstagramData] = useState<any>(null);
  const [facebookData, setFacebookData] = useState<any>(null);
  const [tiktokPostsData, setTiktokPostsData] = useState<any>(null);
  // allLoaded = true only when every platform has responded (or errored).
  // Individual platform cards render progressively as each resolves.
  const [allLoaded, setAllLoaded] = useState(false);

  const currentYear = new Date().getFullYear();
  const config = VIEW_CONFIG[viewMode];

  const fetchData = useCallback(async (mode: ViewMode) => {
    setAllLoaded(false);
    setYoutubeData(null);
    setInstagramData(null);
    setFacebookData(null);
    setTiktokPostsData(null);

    const cfg = VIEW_CONFIG[mode];
    const params = new URLSearchParams();
    if (cfg.from) params.set('from', cfg.from);
    if (cfg.to) params.set('to', cfg.to);
    const qs = params.toString() ? `?${params.toString()}` : '';

    // Fire all fetches independently — each updates its own state as it arrives.
    // Platform cards render progressively; aggregate totals wait for ALL to finish.
    let resolved = 0;
    const checkDone = () => { resolved++; if (resolved >= 4) setAllLoaded(true); };

    fetch(`/api/youtube${qs}`).then(r => r.json()).then(d => setYoutubeData(d)).catch(() => {}).finally(checkDone);
    fetch(`/api/instagram${qs}`).then(r => r.json()).then(d => setInstagramData(d?.error ? null : d)).catch(() => {}).finally(checkDone);
    fetch(`/api/facebook${qs}`).then(r => r.json()).then(d => setFacebookData(d?.error ? null : d)).catch(() => {}).finally(checkDone);
    fetch(`/api/tiktok-posts${qs}`).then(r => r.json()).then(d => setTiktokPostsData(d?.error ? null : d)).catch(() => {}).finally(checkDone);
  }, []);

  useEffect(() => {
    fetchData(viewMode);
  }, [viewMode, fetchData]);

  // ====================================
  // VIEWS BY MODE
  // ====================================
  const isFiltered = viewMode !== 'all';

  // YTD / filtered views (from the ytd object the API returns)
  const youtubeFilteredViews = youtubeData?.ytd?.totalViews || 0;
  const instagramFilteredViews = instagramData?.ytd?.views || 0;
  const facebookFilteredViews = facebookData?.ytd?.videoViews || 0;
  const tiktokFilteredViews = tiktokPostsData?.totals?.views || 0;

  // Content counts
  const youtubeFilteredVideos = youtubeData?.ytd?.totalVideos || 0;
  const instagramFilteredContent = instagramData?.ytd?.contentCount || instagramData?.ytd?.reelCount || 0;
  const facebookFilteredVideos = facebookData?.ytd?.videoCount || 0;
  const tiktokFilteredPosts = tiktokPostsData?.totals?.postCount || 0;

  // Lifetime views (always full)
  const youtubeLifetimeViews = youtubeData?.viewCount || 0;
  const instagramLifetimeViews = instagramData?.totalViews?.reels || instagramData?.reelsPerformance?.totalViews || 0;
  const facebookLifetimeViews = facebookData?.lifetime?.videoViews || facebookData?.videoViews || 0;

  // Computed totals depending on mode
  const primaryViews = isFiltered
    ? youtubeFilteredViews + instagramFilteredViews + facebookFilteredViews + tiktokFilteredViews
    : youtubeLifetimeViews + instagramLifetimeViews + facebookLifetimeViews + tiktokFilteredViews;

  const totalContent = youtubeFilteredVideos + instagramFilteredContent + facebookFilteredVideos + tiktokFilteredPosts;

  // Audience
  const youtubeSubscribers = youtubeData?.subscriberCount || 0;
  const instagramFollowers = instagramData?.account?.followers || 0;
  const facebookFollowers = facebookData?.followers || 0;
  const totalAudience = youtubeSubscribers + instagramFollowers + facebookFollowers;

  const activePlatforms = [youtubeData, instagramData, facebookData, tiktokPostsData].filter(Boolean).length;

  // Daily average
  const getDaysElapsed = () => {
    const today = new Date();
    const startDate = config.from ? new Date(config.from) : new Date(currentYear, 0, 1);
    return Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };
  const daysElapsed = isFiltered ? getDaysElapsed() : 0;
  const avgViewsPerDay = daysElapsed > 0 ? Math.round(primaryViews / daysElapsed) : 0;

  // Chart data
  const viewsByPlatform = [
    { name: 'YouTube', value: isFiltered ? youtubeFilteredViews : youtubeLifetimeViews, color: '#FF0000' },
    { name: 'Instagram', value: isFiltered ? instagramFilteredViews : instagramLifetimeViews, color: '#E4405F' },
    { name: 'Facebook', value: isFiltered ? facebookFilteredViews : facebookLifetimeViews, color: '#1877F2' },
    { name: 'TikTok', value: tiktokFilteredViews, color: '#00f2ea' },
  ].filter(p => p.value > 0);

  // YouTube sub-stats for filtered view
  const youtubeYtdLongForm = youtubeData?.ytd?.longForm?.views || 0;
  const youtubeYtdShorts = youtubeData?.ytd?.shorts?.views || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-brand-lime">Overview</h1>
        <p className="text-gray-400 mt-1">Peoples League Media Network Performance</p>
      </div>

      {/* ===== VIEW TOGGLE ===== */}
      <div className="flex items-center gap-2 p-1 bg-gray-800/50 rounded-xl w-fit border border-gray-700">
        {(Object.keys(VIEW_CONFIG) as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === mode
                ? 'bg-brand-lime text-black shadow-lg shadow-brand-lime/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {VIEW_CONFIG[mode].label}
          </button>
        ))}
      </div>

      {/* Primary Metric Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-brand-lime/30">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-lime/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">
              {config.label}
            </p>
            <p className="text-gray-500 text-xs mb-3">{config.subtitle}</p>
            <div className="text-6xl md:text-7xl font-bold text-brand-lime tracking-tight">
              {!allLoaded ? '...' : primaryViews.toLocaleString()}
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {!allLoaded
                ? 'Loading all platforms...'
                : `${totalContent} pieces of content across ${activePlatforms} platforms`}
            </p>
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent mx-auto mb-6" />

          <div className="flex items-center justify-center gap-8 md:gap-12 text-center">
            {isFiltered && (
              <>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {!allLoaded ? '...' : avgViewsPerDay.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">avg/day</p>
                </div>
                <div className="w-px h-10 bg-gray-700" />
              </>
            )}
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {!allLoaded ? '...' : totalAudience.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">total audience</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {!allLoaded ? '...' : totalContent.toString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">total content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={`${config.label} Views`}
          value={!allLoaded ? '...' : primaryViews.toLocaleString()}
          change={`${totalContent} pieces of content`}
          changeType="positive"
          icon={<Play size={20} className="text-brand-lime" />}
        />
        <MetricCard
          label="Content Posted"
          value={!allLoaded ? '...' : totalContent.toString()}
          change={config.subtitle}
          changeType="positive"
          icon={<Calendar size={20} />}
        />
        <MetricCard
          label="Total Audience"
          value={!allLoaded ? '...' : totalAudience.toLocaleString()}
          change="subscribers + followers"
          changeType="neutral"
          icon={<Target size={20} />}
        />
        <MetricCard
          label="Platforms Active"
          value={`${activePlatforms} of 5`}
          change="YouTube, Instagram, Facebook, TikTok, X"
          changeType="neutral"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Platform Breakdown */}
      <h2 className="text-xl font-semibold text-white">{config.label} by Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* YouTube */}
        <div className="metric-card border-l-4 border-[#FF0000]">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="text-[#FF0000]" size={24} />
            <span className="font-semibold">YouTube</span>
            {youtubeData && <span className="text-xs text-green-400 ml-auto">Live</span>}
          </div>
          <div className="text-3xl font-bold text-brand-lime">
            {!youtubeData ? '...' : (isFiltered ? youtubeFilteredViews : youtubeLifetimeViews).toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{config.label} Views</p>
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
              <span className="text-gray-500">Videos</span>
              <span className="text-white">{youtubeFilteredVideos}</span>
            </div>
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
          <div className="text-3xl font-bold text-brand-lime">
            {!instagramData ? '...' : (isFiltered ? instagramFilteredViews : instagramLifetimeViews).toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{config.label} Impressions</p>
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Content</span>
              <span className="text-white">{instagramFilteredContent}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg/Post</span>
              <span className="text-white">
                {instagramFilteredContent > 0
                  ? Math.round(instagramFilteredViews / instagramFilteredContent).toLocaleString()
                  : '--'}
              </span>
            </div>
          </div>
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
          <div className="text-3xl font-bold text-brand-lime">
            {!facebookData ? '...' : (isFiltered ? facebookFilteredViews : facebookLifetimeViews).toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{config.label} Video Views</p>
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Videos</span>
              <span className="text-white">{facebookFilteredVideos}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Views/Video</span>
              <span className="text-white">
                {facebookFilteredVideos > 0
                  ? Math.round(facebookFilteredViews / facebookFilteredVideos).toLocaleString()
                  : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* TikTok */}
        <div className="metric-card border-l-4 border-[#00f2ea]">
          <div className="flex items-center gap-2 mb-3">
            <Music2 className="text-[#00f2ea]" size={24} />
            <span className="font-semibold">TikTok</span>
            <span className={`text-xs ml-auto ${tiktokPostsData ? 'text-green-400' : 'text-yellow-400'}`}>
              {tiktokPostsData ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <div className="text-3xl font-bold text-brand-lime">
            {!tiktokPostsData ? '...' : tiktokFilteredViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">{config.label} Video Views</p>
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Videos Tracked</span>
              <span className="text-white">{tiktokFilteredPosts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Views/Video</span>
              <span className="text-white">
                {tiktokFilteredPosts > 0
                  ? Math.round(tiktokFilteredViews / tiktokFilteredPosts).toLocaleString()
                  : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Views Distribution Chart */}
      {viewsByPlatform.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">{config.label} Views by Platform</h3>
          <SimpleChart data={viewsByPlatform} color="#e7ff01" type="bar" />
        </div>
      )}

      {/* Views Growth Chart */}
      {allLoaded && (
        <ViewsGrowthChart
          youtubeTotal={isFiltered ? youtubeFilteredViews : youtubeLifetimeViews}
          instagramTotal={isFiltered ? instagramFilteredViews : instagramLifetimeViews}
          facebookTotal={isFiltered ? facebookFilteredViews : facebookLifetimeViews}
        />
      )}

      {/* Growth Metrics */}
      {allLoaded && (
        <GrowthMetrics
          youtubeViews={isFiltered ? youtubeFilteredViews : youtubeLifetimeViews}
          instagramViews={isFiltered ? instagramFilteredViews : instagramLifetimeViews}
          facebookViews={isFiltered ? facebookFilteredViews : facebookLifetimeViews}
          youtubeSubscribers={youtubeSubscribers}
          instagramFollowers={instagramFollowers}
          facebookFollowers={facebookFollowers}
        />
      )}

      {/* Lifetime Stats (only show when not in All Time mode to avoid duplication) */}
      {isFiltered && (
        <>
          <h2 className="text-xl font-semibold text-white">Lifetime Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-3">
                <Youtube className="text-[#FF0000]" size={24} />
                <span className="font-semibold">YouTube</span>
              </div>
              <div className="text-2xl font-bold">
                {!allLoaded ? '...' : youtubeLifetimeViews.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">Total channel views</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-3">
                <Instagram className="text-[#E4405F]" size={24} />
                <span className="font-semibold">Instagram</span>
              </div>
              <div className="text-2xl font-bold">
                {!allLoaded ? '...' : instagramLifetimeViews.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">Total impressions</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-3">
                <Facebook className="text-[#1877F2]" size={24} />
                <span className="font-semibold">Facebook</span>
              </div>
              <div className="text-2xl font-bold">
                {!allLoaded ? '...' : facebookLifetimeViews.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">Total video views</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-3">
                <Music2 className="text-[#00f2ea]" size={24} />
                <span className="font-semibold">TikTok</span>
              </div>
              <div className="text-2xl font-bold">
                {!allLoaded ? '...' : tiktokFilteredViews.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">Total tracked views</p>
            </div>
          </div>
        </>
      )}

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

      {/* X Coming Soon (only X remains) */}
      <h2 className="text-xl font-semibold text-gray-500">Coming Soon</h2>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-sm">
        <div className="metric-card border-l-4 border-gray-500 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <Twitter size={24} />
            <span className="font-semibold">X</span>
            <span className="text-xs text-yellow-400 ml-auto">Coming Soon</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Video Views</p>
        </div>
      </div>
    </div>
  );
}
