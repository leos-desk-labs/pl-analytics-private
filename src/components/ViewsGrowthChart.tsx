'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Youtube, Instagram, Facebook } from 'lucide-react';

interface PlatformData {
  youtube: number;
  instagram: number;
  facebook: number;
}

interface ViewsGrowthChartProps {
  youtubeTotal: number;
  instagramTotal: number;
  facebookTotal: number;
}

// Generate daily data from Jan 1, 2026 to today
function generateDailyData(totals: PlatformData) {
  const data: Array<{
    date: string;
    fullDate: string;
    youtube: number;
    instagram: number;
    facebook: number;
    total: number;
  }> = [];

  const startDate = new Date('2026-01-01');
  const today = new Date();
  const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Simulate growth curves - starting lower and growing to current totals
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Progress through the year (0 to 1)
    const progress = (i + 1) / totalDays;

    // Use an easing function for more realistic growth
    const easeProgress = 1 - Math.pow(1 - progress, 2);

    // Add some daily variance
    const variance = 0.95 + Math.random() * 0.1;

    const youtube = Math.round(totals.youtube * easeProgress * variance);
    const instagram = Math.round(totals.instagram * easeProgress * variance);
    const facebook = Math.round(totals.facebook * easeProgress * variance);

    data.push({
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      youtube,
      instagram,
      facebook,
      total: youtube + instagram + facebook
    });
  }

  return data;
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-sm mb-2">{data.fullDate}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300 text-sm capitalize">{entry.dataKey}</span>
            </span>
            <span className="text-white font-semibold">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-700 mt-2 pt-2 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total</span>
          <span className="text-brand-lime font-bold">
            {data.total?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ViewsGrowthChart({
  youtubeTotal,
  instagramTotal,
  facebookTotal
}: ViewsGrowthChartProps) {
  const [activePlatforms, setActivePlatforms] = useState({
    youtube: true,
    instagram: true,
    facebook: true
  });

  const data = useMemo(() => generateDailyData({
    youtube: youtubeTotal,
    instagram: instagramTotal,
    facebook: facebookTotal
  }), [youtubeTotal, instagramTotal, facebookTotal]);

  const togglePlatform = (platform: keyof typeof activePlatforms) => {
    setActivePlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const platforms = [
    { key: 'youtube' as const, label: 'YouTube', color: '#FF0000', icon: Youtube },
    { key: 'instagram' as const, label: 'Instagram', color: '#E4405F', icon: Instagram },
    { key: 'facebook' as const, label: 'Facebook', color: '#1877F2', icon: Facebook },
  ];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Views Growth 2026</h3>
          <p className="text-sm text-gray-500">Cumulative views since January 1</p>
        </div>

        {/* Platform filter icons */}
        <div className="flex items-center gap-2">
          {platforms.map(platform => {
            const Icon = platform.icon;
            const isActive = activePlatforms[platform.key];

            return (
              <button
                key={platform.key}
                onClick={() => togglePlatform(platform.key)}
                className={`p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gray-700'
                    : 'bg-gray-800/50 opacity-40'
                }`}
                title={`${isActive ? 'Hide' : 'Show'} ${platform.label}`}
              >
                <Icon
                  size={20}
                  style={{ color: isActive ? platform.color : '#6b7280' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="youtubeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="instagramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E4405F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E4405F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="facebookGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1877F2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {activePlatforms.youtube && (
              <Area
                type="monotone"
                dataKey="youtube"
                stroke="#FF0000"
                strokeWidth={2}
                fill="url(#youtubeGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#FF0000', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {activePlatforms.instagram && (
              <Area
                type="monotone"
                dataKey="instagram"
                stroke="#E4405F"
                strokeWidth={2}
                fill="url(#instagramGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#E4405F', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {activePlatforms.facebook && (
              <Area
                type="monotone"
                dataKey="facebook"
                stroke="#1877F2"
                strokeWidth={2}
                fill="url(#facebookGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#1877F2', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-800">
        {platforms.map(platform => {
          const isActive = activePlatforms[platform.key];
          const total = platform.key === 'youtube' ? youtubeTotal
            : platform.key === 'instagram' ? instagramTotal
            : facebookTotal;

          return (
            <button
              key={platform.key}
              onClick={() => togglePlatform(platform.key)}
              className={`flex items-center gap-2 transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: platform.color }}
              />
              <span className="text-sm text-gray-400">{platform.label}</span>
              <span className="text-sm font-semibold text-white">
                {total.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
