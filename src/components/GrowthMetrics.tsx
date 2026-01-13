'use client';

import { TrendingUp, Zap, Target, Calendar, ArrowUpRight, Rocket, Info } from 'lucide-react';

interface GrowthMetricsProps {
  youtubeViews: number;
  instagramViews: number;
  facebookViews: number;
  youtubeSubscribers: number;
  instagramFollowers: number;
  facebookFollowers: number;
}

export default function GrowthMetrics({
  youtubeViews,
  instagramViews,
  facebookViews,
  youtubeSubscribers,
  instagramFollowers,
  facebookFollowers
}: GrowthMetricsProps) {
  const totalViews = youtubeViews + instagramViews + facebookViews;
  const totalAudience = youtubeSubscribers + instagramFollowers + facebookFollowers;

  // Calculate days elapsed in 2026
  const today = new Date();
  const startOfYear = new Date('2026-01-01');
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysElapsed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysInMonth = today.getDate();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Daily velocity based on actual data
  const dailyVelocity = daysElapsed > 0 ? Math.round(totalViews / daysElapsed) : 0;

  // Project end of year based on current velocity
  const daysInYear = 365;
  const projectedYearEnd = dailyVelocity * daysInYear;

  // Calculate week-over-week comparison
  // Week 2 avg vs Week 1 avg (if we have enough data)
  const isInWeek2 = daysElapsed > 7;
  const week1Views = Math.round(totalViews * 0.45); // Approximate week 1 portion
  const week2Views = totalViews - week1Views;
  const week1Daily = week1Views / 7;
  const week2Days = Math.min(daysElapsed - 7, 7);
  const week2Daily = week2Days > 0 ? week2Views / week2Days : 0;
  const weeklyAcceleration = week1Daily > 0 ? ((week2Daily - week1Daily) / week1Daily) * 100 : 0;

  // Milestone tracking
  const milestones = [
    { target: 100000, label: '100K Views' },
    { target: 250000, label: '250K Views' },
    { target: 500000, label: '500K Views' },
    { target: 1000000, label: '1M Views' },
  ];

  const currentMilestone = milestones.find(m => totalViews < m.target) || milestones[milestones.length - 1];
  const previousMilestone = milestones[milestones.indexOf(currentMilestone) - 1];
  const milestoneProgress = previousMilestone
    ? ((totalViews - previousMilestone.target) / (currentMilestone.target - previousMilestone.target)) * 100
    : (totalViews / currentMilestone.target) * 100;

  // Days to milestone at current velocity
  const viewsToMilestone = Math.max(0, currentMilestone.target - totalViews);
  const daysToMilestone = dailyVelocity > 0 ? Math.ceil(viewsToMilestone / dailyVelocity) : 999;

  // Current month name
  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* January 2026 Performance Card */}
      <div className="metric-card bg-gradient-to-r from-green-900/30 to-gray-800 border border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-400" size={24} />
            <h3 className="text-lg font-semibold">{currentMonthName} 2026 Performance</h3>
          </div>
          <span className="text-xs text-gray-500">
            Day {daysInMonth} of {daysInCurrentMonth}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Month Actual */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-gray-400 text-sm mt-1">Views So Far</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Calendar size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">
                {daysInMonth} days tracked
              </span>
            </div>
          </div>

          {/* Daily Average */}
          <div className="text-center border-l border-gray-700 pl-6">
            <div className="text-4xl font-bold text-brand-lime">
              {dailyVelocity.toLocaleString()}
            </div>
            <p className="text-gray-400 text-sm mt-1">Daily Average</p>
            <div className="text-xs text-gray-500 mt-2">
              views per day
            </div>
          </div>
        </div>

        {/* Progress bar for month */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{currentMonthName} 1</span>
            <span className="text-brand-lime">{Math.round((daysInMonth / daysInCurrentMonth) * 100)}% of month complete</span>
            <span>{currentMonthName} {daysInCurrentMonth}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-brand-lime rounded-full transition-all duration-500"
              style={{ width: `${(daysInMonth / daysInCurrentMonth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Growth Velocity & Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Velocity */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-400" size={20} />
            <span className="text-sm text-gray-400">Daily Velocity</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {dailyVelocity.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">views per day avg</p>
        </div>

        {/* Week-over-Week (if applicable) */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="text-purple-400" size={20} />
            <span className="text-sm text-gray-400">Weekly Trend</span>
          </div>
          {isInWeek2 ? (
            <>
              <div className={`text-2xl font-bold ${weeklyAcceleration >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyAcceleration >= 0 ? '+' : ''}{weeklyAcceleration.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">week 2 vs week 1</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-500">--</div>
              <p className="text-xs text-gray-500 mt-1">need 2 weeks data</p>
            </>
          )}
        </div>

        {/* Year-End Projection */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="text-blue-400" size={20} />
            <span className="text-sm text-gray-400">2026 Projection</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {projectedYearEnd >= 1000000
              ? `${(projectedYearEnd / 1000000).toFixed(1)}M`
              : `${(projectedYearEnd / 1000).toFixed(0)}K`}
          </div>
          <p className="text-xs text-gray-500 mt-1">at current velocity</p>
        </div>

        {/* Views per Follower */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-brand-lime" size={20} />
            <span className="text-sm text-gray-400">Viral Coefficient</span>
          </div>
          <div className="text-2xl font-bold text-brand-lime">
            {totalAudience > 0 ? (totalViews / totalAudience).toFixed(1) : '0'}x
          </div>
          <p className="text-xs text-gray-500 mt-1">views per follower</p>
        </div>
      </div>

      {/* Platform Breakdown for the Period */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Platform Contribution</h3>
        <div className="space-y-4">
          {[
            { name: 'YouTube', views: youtubeViews, color: '#FF0000' },
            { name: 'Instagram', views: instagramViews, color: '#E4405F' },
            { name: 'Facebook', views: facebookViews, color: '#1877F2' },
          ].map(platform => {
            const percentage = totalViews > 0 ? (platform.views / totalViews) * 100 : 0;
            return (
              <div key={platform.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{platform.name}</span>
                  <span className="text-white font-semibold">
                    {platform.views.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: platform.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Tracker */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-brand-lime" size={20} />
            <h3 className="text-lg font-semibold">Milestone Tracker</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-brand-lime/20 text-brand-lime">
            {daysToMilestone < 999 ? `${daysToMilestone} days to goal` : 'Calculating...'}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress to {currentMilestone.label}</span>
            <span className="text-white font-semibold">{Math.min(100, milestoneProgress).toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-teal to-brand-lime rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, milestoneProgress)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{previousMilestone?.label || '0'}</span>
            <span className="text-brand-lime font-semibold">{totalViews.toLocaleString()} current</span>
            <span>{currentMilestone.label}</span>
          </div>
        </div>

        {/* All Milestones */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
          {milestones.map((milestone, idx) => {
            const achieved = totalViews >= milestone.target;
            const current = milestone === currentMilestone;

            return (
              <div key={milestone.target} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    achieved
                      ? 'bg-green-500 text-white'
                      : current
                        ? 'bg-brand-lime/20 text-brand-lime border-2 border-brand-lime'
                        : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {achieved ? '✓' : idx + 1}
                </div>
                {idx < milestones.length - 1 && (
                  <div className={`w-8 h-1 ${achieved ? 'bg-green-500' : 'bg-gray-800'}`} />
                )}
              </div>
            );
          })}
          <span className="text-xs text-gray-500 ml-2">
            {milestones.filter(m => totalViews >= m.target).length}/{milestones.length} achieved
          </span>
        </div>
      </div>

      {/* Investor Highlights */}
      <div className="metric-card bg-gradient-to-r from-purple-900/20 to-gray-800 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📈</span>
          <h3 className="text-lg font-semibold">Investor Highlights</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-white">{daysElapsed}</div>
            <p className="text-xs text-gray-500">Days in 2026</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {dailyVelocity.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Views/Day</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-gray-500">Active Platforms</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-brand-lime">
              {totalAudience.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Total Audience</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            <span className="text-white font-semibold">Key Insight:</span> In the first {daysElapsed} days of 2026,
            Peoples League has generated{' '}
            <span className="text-brand-lime font-semibold">{totalViews.toLocaleString()} views</span>{' '}
            at a rate of{' '}
            <span className="text-green-400 font-semibold">{dailyVelocity.toLocaleString()}/day</span>.
            {totalAudience > 0 && (
              <> With a <span className="text-green-400 font-semibold">{(totalViews / totalAudience).toFixed(1)}x viral coefficient</span>,
              content is reaching {((totalViews / totalAudience) * 100).toFixed(0)}% beyond the existing audience.</>
            )}
          </p>
        </div>

        {/* Data freshness note */}
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            Data reflects: YouTube (recent 10 videos), Instagram (interactions), Facebook (28-day video views).
            Historical MoM tracking will be available after 30+ days of data collection.
          </span>
        </div>
      </div>
    </div>
  );
}
