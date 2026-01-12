'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import { Facebook, Users, Eye, Heart, MousePointer, Play } from 'lucide-react';

const ACCOUNT_STATS = {
  followers: 695,
  pageName: 'Peoples League'
};

const facebookFields = [
  { key: 'followers', label: 'Page Followers', help: 'Current follower count' },
  { key: 'reach', label: 'Page Reach (Last 28 days)', help: 'From Meta Business Suite' },
  { key: 'videoViews', label: 'Video Views (Last 28 days)', help: 'Total video views' },
  { key: 'impressions', label: 'Impressions (Last 28 days)', help: 'Total content impressions' },
  { key: 'engagement', label: 'Post Engagements', help: 'Reactions + comments + shares' },
  { key: 'linkClicks', label: 'Link Clicks', help: 'Link clicks from posts' },
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
          {hasRealData ? 'Live Data' : 'Demo Mode'}
        </span>
      </div>

      {/* Quick Stats Panel */}
      <QuickStatsPanel
        platform="facebook"
        fields={facebookFields}
        defaultFollowers={ACCOUNT_STATS.followers}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Page Followers"
          value={followers}
          change={hasRealData ? "Live from Meta" : "From Meta Business Suite"}
          changeType="positive"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Total Reach"
          value={reach || '--'}
          change={hasRealData ? "Last 28 days" : "Enter in panel above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Engagement Rate"
          value={hasRealData ? `${engagementRate}%` : '--'}
          change="Reactions, comments, shares"
          changeType="neutral"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Video Views"
          value={videoViews || '--'}
          change={hasRealData ? "Last 28 days" : "Enter in panel above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Play size={20} />}
        />
      </div>

      {/* Reach Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Reach {!hasRealData && <span className="text-yellow-400 text-sm">(Demo)</span>}
        </h3>
        <SimpleChart data={generateDemoData()} color="#1877F2" />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Impressions</h3>
          <div className="text-4xl font-bold text-white">
            {impressions ? impressions.toLocaleString() : '--'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasRealData ? 'Last 28 days' : 'Enter in Quick Stats panel'}
          </p>
        </div>
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Link Clicks</h3>
          <div className="text-4xl font-bold text-white">
            {linkClicks ? linkClicks.toLocaleString() : '--'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasRealData ? 'Last 28 days' : 'Enter in Quick Stats panel'}
          </p>
        </div>
      </div>
    </div>
  );
}
