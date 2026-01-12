'use client';

import MetricCard from '@/components/MetricCard';
import SimpleChart from '@/components/SimpleChart';
import { Twitter, Users, Eye, Heart, Repeat2 } from 'lucide-react';

const generateDemoData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 2000) + 300
  }));
};

export default function XPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Twitter />
            X (Twitter) Analytics
          </h1>
          <p className="text-gray-400 mt-1">@PeoplesLeague</p>
        </div>
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
          Demo Mode
        </span>
      </div>

      {/* Coming Soon Notice */}
      <div className="metric-card border-brand-lime border">
        <h3 className="text-lg font-semibold text-brand-lime mb-2">API Integration Coming Soon</h3>
        <p className="text-gray-400">
          X API integration is in development. Once connected, you'll see real-time
          analytics including followers, impressions, and engagement metrics.
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
          label="Impressions"
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
          label="Reposts"
          value="--"
          change="Coming soon"
          changeType="neutral"
          icon={<Repeat2 size={20} />}
        />
      </div>

      {/* Demo Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Impressions <span className="text-yellow-400 text-sm">(Demo Data)</span>
        </h3>
        <SimpleChart data={generateDemoData()} color="#1DA1F2" />
      </div>
    </div>
  );
}
