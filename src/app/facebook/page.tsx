'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import { Facebook, Users, Eye, Heart, MousePointer, Play, TrendingUp } from 'lucide-react';

const ACCOUNT_STATS = {
  followers: 695,
  pageName: 'Peoples League'
};

const facebookFields = [
  { key: 'videoViews', label: 'Video Views (Last 28 days)', help: 'Total video views - PRIMARY METRIC' },
  { key: 'reach', label: 'Page Reach (Last 28 days)', help: 'From Meta Business Suite' },
  { key: 'impressions', label: 'Impressions (Last 28 days)', help: 'Total content impressions' },
  { key: 'engagement', label: 'Post Engagements', help: 'Reactions + comments + shares' },
  { key: 'linkClicks', label: 'Link Clicks', help: 'Link clicks from posts' },
  { key: 'followers', label: 'Page Followers', help: 'Current follower count' },
];

// Demo data
const generateDemoData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 1000) + 200
  }));
};

export default function FacebookPage() {
  const [savedStats, setSavedStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('facebook_manual_stats');
    if (saved) {
      setSavedStats(JSON.parse(saved).stats);
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('facebook_manual_stats');
      if (saved) {
        setSavedStats(JSON.parse(saved).stats);
      } else {
        setSavedStats(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const followers = savedStats?.followers || ACCOUNT_STATS.followers;
  const reach = savedStats?.reach || 0;
  const videoViews = savedStats?.videoViews || 0;
  const impressions = savedStats?.impressions || 0;
  const engagement = savedStats?.engagement || 0;
  const linkClicks = savedStats?.linkClicks || 0;

  const hasRealData = savedStats !== null;
  const engagementRate = reach > 0 ? ((engagement / reach) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Facebook className="text-[#1877F2]" />
            Facebook Analytics
          </h1>
          <p className="text-gray-400 mt-1">{ACCOUNT_STATS.pageName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          hasRealData
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {hasRealData ? 'Live Data' : 'Enter Stats Below'}
        </span>
      </div>

      {/* Primary Metric: Video Views */}
      <div className="metric-card bg-gradient-to-r from-[#1877F2]/20 to-gray-800 border-2 border-[#1877F2]">
        <div className="flex items-center gap-3 mb-2">
          <Play className="text-[#1877F2]" size={28} />
          <h2 className="text-lg text-gray-300">Video Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {videoViews ? videoViews.toLocaleString() : '--'}
        </div>
        <p className="text-gray-400 mt-2">
          {hasRealData ? 'Last 28 days from Meta Business Suite' : 'Enter your Video Views below'}
        </p>
      </div>

      {/* Quick Stats Panel */}
      <QuickStatsPanel
        platform="facebook"
        fields={facebookFields}
        defaultFollowers={ACCOUNT_STATS.followers}
      />

      {/* Views & Reach Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Video Views"
          value={videoViews || '--'}
          change={hasRealData ? "Last 28 days" : "Primary metric"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Play size={20} className="text-[#1877F2]" />}
        />
        <MetricCard
          label="Page Reach"
          value={reach || '--'}
          change={hasRealData ? "Last 28 days" : "Enter above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="Impressions"
          value={impressions || '--'}
          change={hasRealData ? "Last 28 days" : "Enter above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Engagements"
          value={engagement || '--'}
          change={hasRealData ? "Last 28 days" : "Enter above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Heart size={20} />}
        />
      </div>

      {/* Reach Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Reach {!hasRealData && <span className="text-yellow-400 text-sm">(Demo)</span>}
        </h3>
        <SimpleChart data={generateDemoData()} color="#1877F2" />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Link Clicks</h3>
          <div className="text-4xl font-bold text-white">
            {linkClicks ? linkClicks.toLocaleString() : '--'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasRealData ? 'Last 28 days' : 'Enter in Quick Stats panel'}
          </p>
        </div>
        <div className="metric-card bg-gray-800/30">
          <h3 className="text-lg font-semibold mb-4 text-gray-400">Secondary: Followers</h3>
          <div className="text-4xl font-bold text-white">
            {followers.toLocaleString()}
          </div>
          <p className="text-gray-400 mt-2">Current follower count</p>
        </div>
      </div>

      {/* Views Performance */}
      {hasRealData && videoViews > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Views Performance</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 mb-1">Views per Follower</p>
              <div className="text-3xl font-bold text-brand-lime">
                {(videoViews / followers).toFixed(1)}x
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Your content reaches {(videoViews / followers).toFixed(1)}x your follower count
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Engagement Rate</p>
              <div className="text-3xl font-bold text-brand-lime">
                {engagementRate}%
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Engagements per account reached
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
