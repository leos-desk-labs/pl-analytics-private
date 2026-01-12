'use client';

import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Music2, Users, Eye, Heart, Share2 } from 'lucide-react';

const generateDemoData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 10000) + 2000
  }));
};

export default function TikTokPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Music2 />
            TikTok Analytics
          </h1>
          <p className="text-gray-400 mt-1">@peoplesleaguegolf</p>
        </div>
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
          Demo Mode
        </span>
      </div>

      {/* Coming Soon Notice */}
      <div className="metric-card border-brand-lime border">
        <h3 className="text-lg font-semibold text-brand-lime mb-2">API Integration Coming Soon</h3>
        <p className="text-gray-400">
          TikTok API integration is in development. Once connected, you'll see real-time
          analytics including followers, video views, and engagement metrics.
        </p>
      </div>

      {/* Demo Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Followers"
          value="--"
          change="Coming soon"
          changeType="neutral"
          icon={<Users size={20} />}
        />
        <MetricCard
          label="Video Views"
          value="--"
          change="Coming soon"
          changeType="neutral"
          icon={<Eye size={20} />}
        />
        <MetricCard
          label="Likes"
          value="--"
          change="Coming soon"
          changeType="neutral"
          icon={<Heart size={20} />}
        />
        <MetricCard
          label="Shares"
          value="--"
          change="Coming soon"
          changeType="neutral"
          icon={<Share2 size={20} />}
        />
      </div>

      {/* Demo Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Views <span className="text-yellow-400 text-sm">(Demo Data)</span>
        </h3>
        <SimpleChart data={generateDemoData()} color="#00f2ea" />
      </div>
    </div>
  );
}
