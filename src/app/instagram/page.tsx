'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import UpdateStatsModal from '@/components/UpdateStatsModal';
import { Instagram, Eye, Heart, TrendingUp, Users, Settings } from 'lucide-react';

const ACCOUNT_STATS = {
  followers: 9900,
  accountName: '@peoplesleaguegolf'
};

const instagramFields = [
  { key: 'reelsViews', label: 'Reels Views (Last 30 days)', help: 'Primary metric - total reels plays' },
  { key: 'reach', label: 'Accounts Reached', help: 'Last 30 days' },
  { key: 'impressions', label: 'Impressions', help: 'Last 30 days' },
  { key: 'interactions', label: 'Content Interactions', help: 'Likes + comments + shares' },
  { key: 'profileVisits', label: 'Profile Visits' },
  { key: 'followers', label: 'Followers' },
];

const generateDemoData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 3000) + 500
  }));
};

export default function InstagramPage() {
  const [savedStats, setSavedStats] = useState<Record<string, number> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('instagram_manual_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedStats(parsed.stats);
      setLastUpdated(parsed.updated);
    }
  }, []);

  const followers = savedStats?.followers || ACCOUNT_STATS.followers;
  const reach = savedStats?.reach || 0;
  const reelsViews = savedStats?.reelsViews || 0;
  const impressions = savedStats?.impressions || 0;
  const interactions = savedStats?.interactions || 0;
  const profileVisits = savedStats?.profileVisits || 0;

  const hasRealData = savedStats !== null;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Instagram className="text-[#E4405F]" />
            Instagram Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            {ACCOUNT_STATS.accountName}
            {hasRealData && lastUpdated && (
              <span className="ml-2 text-gray-500">Updated {formatDate(lastUpdated)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
          >
            <Settings size={16} />
            Update Stats
          </button>
          <span className={`px-3 py-1 rounded-full text-sm ${hasRealData ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {hasRealData ? 'Live Data' : 'No Data'}
          </span>
        </div>
      </div>

      <div className="metric-card bg-gradient-to-r from-[#E4405F]/20 to-gray-800 border-2 border-[#E4405F]">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="text-[#E4405F]" size={28} />
          <h2 className="text-lg text-gray-300">Reels Views</h2>
        </div>
        <div className="text-5xl font-bold text-white">
          {reelsViews ? reelsViews.toLocaleString() : '--'}
        </div>
        <p className="text-gray-400 mt-2">
          {hasRealData ? 'Last 30 days' : 'Click Update Stats to add data'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Reels Views" value={reelsViews ? reelsViews.toLocaleString() : '--'} change="Primary metric" changeType={hasRealData ? "positive" : "neutral"} icon={<Eye size={20} className="text-[#E4405F]" />} />
        <MetricCard label="Accounts Reached" value={reach ? reach.toLocaleString() : '--'} change="Last 30 days" changeType={hasRealData ? "positive" : "neutral"} icon={<TrendingUp size={20} />} />
        <MetricCard label="Impressions" value={impressions ? impressions.toLocaleString() : '--'} change="Last 30 days" changeType={hasRealData ? "positive" : "neutral"} icon={<Eye size={20} />} />
        <MetricCard label="Interactions" value={interactions ? interactions.toLocaleString() : '--'} change="Last 30 days" changeType={hasRealData ? "positive" : "neutral"} icon={<Heart size={20} />} />
      </div>

      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Weekly Reach {!hasRealData && <span className="text-yellow-400 text-sm">(Demo)</span>}</h3>
        <SimpleChart data={generateDemoData()} color="#E4405F" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Profile Visits</h3>
          <div className="text-4xl font-bold text-white">{profileVisits ? profileVisits.toLocaleString() : '--'}</div>
          <p className="text-gray-400 mt-2">Last 30 days</p>
        </div>
        <div className="metric-card bg-gray-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-400">Followers</h3>
          </div>
          <div className="text-4xl font-bold text-white">{followers.toLocaleString()}</div>
          <p className="text-gray-400 mt-2">Secondary metric</p>
        </div>
      </div>

      {hasRealData && reelsViews > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Views Performance</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-400 mb-1">Views per Follower</p>
              <div className="text-3xl font-bold text-brand-lime">{(reelsViews / followers).toFixed(1)}x</div>
              <p className="text-sm text-gray-500 mt-1">Content reaches {(reelsViews / followers).toFixed(1)}x your follower count</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Engagement Rate</p>
              <div className="text-3xl font-bold text-brand-lime">{reach > 0 ? ((interactions / reach) * 100).toFixed(2) : 0}%</div>
              <p className="text-sm text-gray-500 mt-1">Interactions per account reached</p>
            </div>
          </div>
        </div>
      )}

      <UpdateStatsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} platform="instagram" fields={instagramFields} defaultFollowers={ACCOUNT_STATS.followers} />
    </div>
  );
}
