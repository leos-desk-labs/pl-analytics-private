'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import { Instagram, Users, Eye, Heart, TrendingUp } from 'lucide-react';

const ACCOUNT_STATS = {
  followers: 9900,
  accountName: '@peoplesleaguegolf'
};

const instagramFields = [
  { key: 'reelsViews', label: 'Reels Views (Last 30 days)', help: 'Total reels plays - PRIMARY METRIC' },
  { key: 'reach', label: 'Accounts Reached (Last 30 days)', help: 'From Meta Business Suite' },
  { key: 'impressions', label: 'Impressions (Last 30 days)', help: 'Total content impressions' },
  { key: 'interactions', label: 'Content Interactions', help: 'Likes + comments + shares' },
  { key: 'profileVisits', label: 'Profile Visits', help: 'Profile page views' },
  { key: 'followers', label: 'Followers', help: 'Current follower count' },
];

// Demo data
const generateDemoData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 3000) + 500
  }));
};

export default function InstagramPage() {
  const [savedStats, setSavedStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('instagram_manual_stats');
    if (saved) {
      setSavedStats(JSON.parse(saved).stats);
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('instagram_manual_stats');
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
  const reelsViews = savedStats?.reelsViews || 0;
  const impressions = savedStats?.impressions || 0;
  const interactions = savedStats?.interactions || 0;
  const profileVisits = savedStats?.profileVisits || 0;

  const hasRealData = savedStats !== null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Instagram className="text-[#E4405F]" />
            Instagram Analytics
          </h1>
          <p className="text-gray-400 mt-1">{ACCOUNT_STATS.accountName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          hasRealData
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {hasRealData ? 'Live Data' : 'Enter Stats Below'}
        </span>
      </div>

      {/* Primary Metric: Reels Views */}
      <div className="metric-card bg-gradient-to-r from-[#E4405F]/20 to-gray-800 border-2 border-[#E4405F]">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="text-[#E4405F]" size={28} />
          <h2 className="text-lg text-gray-300">Reels Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {reelsViews ? reelsViews.toLocaleString() : '--'}
        </div>
        <p className="text-gray-400 mt-2">
          {hasRealData ? 'Last 30 days from Meta Business Suite' : 'Enter your Reels Views below'}
        </p>
      </div>

      {/* Quick Stats Panel */}
      <QuickStatsPanel
        platform="instagram"
        fields={instagramFields}
        defaultFollowers={ACCOUNT_STATS.followers}
      />

      {/* Views & Reach Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Reels Views"
          value={reelsViews || '--'}
          change={hasRealData ? "Last 30 days" : "Primary metric"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Eye size={20} className="text-[#E4405F]" />}
        />
        <MetricCard
          label="Accounts Reached"
          value={reach || '--'}
          change={hasRealData ? "Last 30 days" : "Enter above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          label="Impressions"
          value={impressions || '--'}
          change={hasRealData ? "Last 30 days" : "Enter above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Interactions"
          value={interactions || '--'}
          change={hasRealData ? "Last 30 days" : "Enter above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Heart size={20} />}
        />
      </div>

      {/* Engagement Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Reach {!hasRealData && <span className="text-yellow-400 text-sm">(Demo)</span>}
        </h3>
        <SimpleChart data={generateDemoData()} color="#E4405F" />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Profile Visits</h3>
          <div className="text-4xl font-bold text-white">
            {profileVisits ? profileVisits.toLocaleString() : '--'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasRealData ? 'Last 30 days' : 'Enter in Quick Stats panel'}
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

      {/* Views-to-Follower Ratio */}
      {hasRealData && reelsViews > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Views Performance</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 mb-1">Views per Follower</p>
              <div className="text-3xl font-bold text-brand-lime">
                {(reelsViews / followers).toFixed(1)}x
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Your content reaches {(reelsViews / followers).toFixed(1)}x your follower count
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Engagement Rate</p>
              <div className="text-3xl font-bold text-brand-lime">
                {reach > 0 ? ((interactions / reach) * 100).toFixed(2) : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Interactions per account reached
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
