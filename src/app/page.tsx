'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Youtube, Instagram, Facebook, Music2, Twitter, Linkedin } from 'lucide-react';

// Platform stats
const platformStats = {
  youtube: { followers: 0, label: 'Subscribers', icon: Youtube, color: '#FF0000' },
  instagram: { followers: 9900, label: 'Followers', icon: Instagram, color: '#E4405F' },
  facebook: { followers: 695, label: 'Followers', icon: Facebook, color: '#1877F2' },
  tiktok: { followers: 0, label: 'Followers', icon: Music2, color: '#000000' },
  x: { followers: 0, label: 'Followers', icon: Twitter, color: '#000000' },
  linkedin: { followers: 0, label: 'Followers', icon: Linkedin, color: '#0A66C2' },
};

// Demo data for charts
const generateDemoData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 5000) + 1000
  }));
};

export default function OverviewPage() {
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/youtube')
      .then(res => res.json())
      .then(data => {
        setYoutubeData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalFollowers =
    (youtubeData?.subscriberCount || 0) +
    platformStats.instagram.followers +
    platformStats.facebook.followers +
    platformStats.tiktok.followers +
    platformStats.x.followers +
    platformStats.linkedin.followers;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 mt-1">Cross-platform performance snapshot</p>
      </div>

      {/* Total Audience */}
      <div className="metric-card bg-gradient-to-r from-brand-teal to-gray-800">
        <h2 className="text-lg text-gray-300 mb-2">Total Audience</h2>
        <div className="text-5xl font-bold text-brand-lime">
          {totalFollowers.toLocaleString()}
        </div>
        <p className="text-gray-400 mt-2">Combined followers across all platforms</p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* YouTube */}
        <div className="metric-card border-l-4 border-[#FF0000]">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="text-[#FF0000]" size={24} />
            <span className="font-semibold">YouTube</span>
            {youtubeData && <span className="text-xs text-green-400 ml-auto">Live</span>}
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : (youtubeData?.subscriberCount?.toLocaleString() || '0')}
          </div>
          <p className="text-sm text-gray-400">Subscribers</p>
        </div>

        {/* Instagram */}
        <div className="metric-card border-l-4 border-[#E4405F]">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="text-[#E4405F]" size={24} />
            <span className="font-semibold">Instagram</span>
            <span className="text-xs text-green-400 ml-auto">Live</span>
          </div>
          <div className="text-2xl font-bold">
            {platformStats.instagram.followers.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">Followers</p>
        </div>

        {/* Facebook */}
        <div className="metric-card border-l-4 border-[#1877F2]">
          <div className="flex items-center gap-2 mb-3">
            <Facebook className="text-[#1877F2]" size={24} />
            <span className="font-semibold">Facebook</span>
            <span className="text-xs text-green-400 ml-auto">Live</span>
          </div>
          <div className="text-2xl font-bold">
            {platformStats.facebook.followers.toLocaleString()}
          </div>
          <p className="text-sm text-gray-400">Followers</p>
        </div>

        {/* TikTok */}
        <div className="metric-card border-l-4 border-gray-500">
          <div className="flex items-center gap-2 mb-3">
            <Music2 size={24} />
            <span className="font-semibold">TikTok</span>
            <span className="text-xs text-yellow-400 ml-auto">Demo</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Coming soon</p>
        </div>

        {/* X */}
        <div className="metric-card border-l-4 border-gray-500">
          <div className="flex items-center gap-2 mb-3">
            <Twitter size={24} />
            <span className="font-semibold">X</span>
            <span className="text-xs text-yellow-400 ml-auto">Demo</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Coming soon</p>
        </div>

        {/* LinkedIn */}
        <div className="metric-card border-l-4 border-[#0A66C2]">
          <div className="flex items-center gap-2 mb-3">
            <Linkedin className="text-[#0A66C2]" size={24} />
            <span className="font-semibold">LinkedIn</span>
            <span className="text-xs text-yellow-400 ml-auto">Demo</span>
          </div>
          <div className="text-2xl font-bold">--</div>
          <p className="text-sm text-gray-400">Coming soon</p>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Weekly Engagement (Demo)</h3>
        <SimpleChart data={generateDemoData()} color="#e7ff01" />
      </div>
    </div>
  );
}
