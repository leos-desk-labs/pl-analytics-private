'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Youtube, Instagram, Facebook, Music2, Twitter, Linkedin, Eye, TrendingUp, Target } from 'lucide-react';

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

  // Calculate total views across platforms
  const youtubeViews = youtubeData?.viewCount || 0;
  const youtubeRecentViews = youtubeData?.recentVideos?.reduce((sum: number, v: any) => sum + v.viewCount, 0) || 0;
  const instagramReelsViews = instagramData?.reelsViews || 0;
  const facebookVideoViews = facebookData?.videoViews || 0;

  const totalViews = youtubeViews + instagramReelsViews + facebookVideoViews;
  const recentViews = youtubeRecentViews + instagramReelsViews + facebookVideoViews;

  // Count active platforms
  const activePlatforms = [youtubeData, instagramData, facebookData].filter(Boolean).length;

  // Build views by platform for chart
  const viewsByPlatform = [
    { name: 'YouTube', value: youtubeRecentViews, color: '#FF0000' },
    { name: 'Instagram', value: instagramReelsViews, color: '#E4405F' },
    { name: 'Facebook', value: facebookVideoViews, color: '#1877F2' },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-brand-lime">Executive Overview</h1>
        <p className="text-gray-400 mt-1">Peoples League Media Network Performance</p>
      </div>

      {/* Primary Metric: Total Views */}
      <div className="metric-card bg-gradient-to-r from-brand-teal to-gray-800 border-2 border-brand-lime">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="text-brand-lime" size={28} />
          <h2 className="text-lg text-gray-300">Total Video Views</h2>
        </div>
        <div className="text-5xl font-bold text-brand-lime">
          {loading ? '...' : totalViews.toLocaleString()}
        </div>
        <p className="text-gray-400 mt-2">Lifetime views across all platforms</p>
      </div>

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
          value={loading ? '...' : youtubeViews.toLocaleString()}
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
            {loading ? '...' : youtubeViews.toLocaleString()}
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
            {instagramReelsViews ? instagramReelsViews.toLocaleString() : '--'}
          </div>
          <p className="text-sm text-gray-400">Reels Views</p>
          {instagramData && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-sm text-gray-500">Followers: </span>
              <span className="text-sm text-white">{instagramData.followers?.toLocaleString()}</span>
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
            {facebookVideoViews ? facebookVideoViews.toLocaleString() : '--'}
          </div>
          <p className="text-sm text-gray-400">Video Views (28 days)</p>
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
            <div className="text-xl font-bold">{instagramData?.followers?.toLocaleString() || '--'}</div>
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
