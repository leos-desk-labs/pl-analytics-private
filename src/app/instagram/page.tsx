'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import { Instagram, Users, Eye, Heart, UserPlus } from 'lucide-react';

const ACCOUNT_STATS = {
  followers: 9900,
  accountName: '@peoplesleaguegolf'
};

const instagramFields = [
  { key: 'followers', label: 'Followers', help: 'Current follower count' },
  { key: 'reach', label: 'Accounts Reached (Last 30 days)', help: 'From Meta Business Suite' },
  { key: 'reelsViews', label: 'Reels Views (Last 30 days)', help: 'Total reels plays' },
  { key: 'impressions', label: 'Impressions (Last 30 days)', help: 'Total content impressions' },
  { key: 'interactions', label: 'Content Interactions', help: 'Likes + comments + shares' },
  { key: 'profileVisits', label: 'Profile Visits', help: 'Profile page views' },
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
    // Also check periodically for same-tab updates
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
          {hasRealData ? 'Live Data' : 'Demo Mode'}
        </span>
      </div>

      {/* Quick Stats Panel */}
      <QuickStatsPanel
        platform="instagram"
        fields={instagramFields}
        defaultFollowers={ACCOUNT_STATS.followers}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Followers"
          value={followers}
          change={hasRealData ? "Live from Meta" : "From Meta Business Suite"}
          changeType="positive"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Accounts Reached"
          value={reach || '--'}
          change={hasRealData ? "Last 30 days" : "Enter in panel above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Reels Views"
          value={reelsViews || '--'}
          change={hasRealData ? "Last 30 days" : "Enter in panel above"}
          changeType={hasRealData ? "positive" : "neutral"}
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Interactions"
          value={interactions || '--'}
          change={hasRealData ? "Last 30 days" : "Enter in panel above"}
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

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Impressions</h3>
          <div className="text-4xl font-bold text-white">
            {impressions ? impressions.toLocaleString() : '--'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasRealData ? 'Last 30 days' : 'Enter in Quick Stats panel'}
          </p>
        </div>
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Profile Visits</h3>
          <div className="text-4xl font-bold text-white">
            {profileVisits ? profileVisits.toLocaleString() : '--'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasRealData ? 'Last 30 days' : 'Enter in Quick Stats panel'}
          </p>
        </div>
      </div>
    </div>
  );
}
