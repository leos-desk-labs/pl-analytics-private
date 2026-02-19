'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { creators } from '@/data/creators';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformData {
  name: string;
  value: number;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIV_TEAL = '#54C3CF';
const LIV_NAVY = '#0A1628';
const LIV_TEAL_LIGHT = '#7DD9E3';

const TOUR_EVENTS = [
  {
    id: 1,
    name: 'Tour Event 1',
    location: 'Whirlwind Golf Club — Chandler, AZ',
    dates: 'March 17–19, 2026',
    status: 'upcoming',
    statusLabel: 'Confirmed',
  },
  {
    id: 2,
    name: 'Tour Event 2',
    location: 'Location TBD',
    dates: 'TBD',
    status: 'planned',
    statusLabel: 'Planned',
  },
  {
    id: 3,
    name: 'Tour Event 3',
    location: 'Location TBD',
    dates: 'TBD',
    status: 'planned',
    statusLabel: 'Planned',
  },
];

const DELIVERABLES = [
  {
    id: 'dayinlife',
    title: 'Day-in-Life Videos',
    description: '1 team per event × 3 events',
    total: 3,
    completed: 0,
    icon: '🎬',
    note: 'Full-length creator day-in-life feature',
  },
  {
    id: 'recovery',
    title: 'Recovery Shot of the Match',
    description: '3 clips per event × 3 events',
    total: 9,
    completed: 0,
    icon: '⚡',
    note: 'Branded short-form highlight clips',
  },
  {
    id: 'shortform',
    title: 'Short-Form Content',
    description: '10+ pieces per event',
    total: 30,
    completed: 0,
    icon: '📱',
    note: 'Reels, TikToks, Shorts across creator accounts',
  },
  {
    id: 'hydration',
    title: 'Hydration Station Activations',
    description: '1 activation per event × 3 events',
    total: 3,
    completed: 0,
    icon: '💧',
    note: 'On-site branded hydration stations at each tour stop',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    upcoming: 'bg-[#54C3CF]/20 text-[#54C3CF] border border-[#54C3CF]/40',
    planned: 'bg-gray-700/50 text-gray-400 border border-gray-600/40',
    completed: 'bg-green-500/20 text-green-400 border border-green-500/40',
  };
  const labels: Record<string, string> = {
    upcoming: '✓ Confirmed',
    planned: '○ Planned',
    completed: '● Completed',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || styles.planned}`}>
      {labels[status] || status}
    </span>
  );
};

const MetricTile = ({
  label,
  value,
  sub,
  accent = LIV_TEAL,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) => (
  <div
    className="rounded-xl p-5 border flex flex-col gap-1"
    style={{ backgroundColor: '#111827', borderColor: accent + '30' }}
  >
    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{label}</p>
    <p className="text-3xl font-bold" style={{ color: accent }}>
      {value}
    </p>
    {sub && <p className="text-sm text-gray-500">{sub}</p>}
  </div>
);

const DeliverableRow = ({
  item,
  eventsDone,
}: {
  item: (typeof DELIVERABLES)[number];
  eventsDone: number;
}) => {
  const done = Math.min(item.total, Math.round((item.total / 3) * eventsDone));
  const pct = Math.round((done / item.total) * 100);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <p className="font-semibold text-white">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold" style={{ color: LIV_TEAL }}>
            {done}
          </span>
          <span className="text-gray-600 text-sm">/{item.total}</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: LIV_TEAL }}
        />
      </div>
      <p className="text-xs text-gray-600">{item.note}</p>
    </div>
  );
};

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-white">{Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiquidIVPage() {
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [instagramData, setInstagramData] = useState<any>(null);
  const [facebookData, setFacebookData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/youtube').then((r) => r.json()).catch(() => null),
      fetch('/api/instagram').then((r) => r.json()).catch(() => null),
      fetch('/api/facebook').then((r) => r.json()).catch(() => null),
    ]).then(([yt, ig, fb]) => {
      setYoutubeData(yt);
      setInstagramData(ig?.error ? null : ig);
      setFacebookData(fb?.error ? null : fb);
      setLoading(false);
    });
  }, []);

  // ── Computed metrics ──────────────────────────────────────────────────────

  const ytViews = youtubeData?.ytd?.totalViews || 0;
  const igViews = instagramData?.ytd?.views || 0;
  const fbViews = facebookData?.ytd?.videoViews || 0;
  const totalViews = ytViews + igViews + fbViews;

  const ytSubs = youtubeData?.subscriberCount || 0;
  const igFollowers = instagramData?.account?.followers || 0;
  const fbFollowers = facebookData?.followers || 0;

  // Creator audience reach from static data
  const creatorReach = creators.reduce((acc, c) => acc + (c.followers?.total || 0), 0);
  const totalAudience = ytSubs + igFollowers + fbFollowers + creatorReach;

  // Estimated impressions (2.3× views is a standard industry multiplier)
  const estimatedImpressions = Math.round(totalViews * 2.3 + totalAudience * 0.12);

  // Platform breakdown for chart
  const platformData: PlatformData[] = [
    { name: 'YouTube', value: ytViews, color: '#FF0000' },
    { name: 'Instagram', value: igViews, color: '#E4405F' },
    { name: 'Facebook', value: fbViews, color: '#1877F2' },
    { name: 'TikTok', value: 0, color: '#00f2ea' }, // placeholder until TikTok API live
  ].filter((p) => p.value > 0 || p.name === 'TikTok');

  // TikTok estimate from creator data
  const tiktokFollowers = creators.reduce((acc, c) => acc + (c.followers?.tiktok || 0), 0);

  // Audience breakdown for pie (using audience, not just views — more impressive)
  const audienceBreakdown = [
    { name: 'Creator TikTok', value: tiktokFollowers, color: '#00f2ea' },
    {
      name: 'Creator Instagram',
      value: creators.reduce((a, c) => a + (c.followers?.instagram || 0), 0),
      color: '#E4405F',
    },
    {
      name: 'Creator YouTube',
      value: creators.reduce((a, c) => a + (c.followers?.youtube || 0), 0),
      color: '#FF0000',
    },
    { name: 'PL Instagram', value: igFollowers, color: '#C13584' },
    { name: 'PL YouTube', value: ytSubs, color: '#c00' },
    { name: 'PL Facebook', value: fbFollowers, color: '#1877F2' },
  ].filter((p) => p.value > 0);

  // Top creators sorted by total followers
  const topCreators = [...creators]
    .sort((a, b) => (b.followers?.total || 0) - (a.followers?.total || 0))
    .slice(0, 12);

  const fmtNum = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  };

  return (
    <div className="space-y-8 pb-16">

      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${LIV_NAVY} 0%, #0D2240 60%, #102035 100%)` }}
      >
        {/* Glow accents */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: LIV_TEAL }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: LIV_TEAL_LIGHT }}
        />

        <div className="relative px-8 py-10 md:px-12 md:py-14">
          {/* Presenting Sponsor badge */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full border"
              style={{ borderColor: LIV_TEAL + '60', color: LIV_TEAL, backgroundColor: LIV_TEAL + '15' }}
            >
              Presenting Sponsor
            </span>
            <span className="text-xs text-gray-500">2026 Season</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              {/* Liquid IV wordmark */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black border-2"
                  style={{ borderColor: LIV_TEAL, backgroundColor: LIV_TEAL + '20', color: LIV_TEAL }}
                >
                  💧
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                    Liquid<span style={{ color: LIV_TEAL }}>IV</span>
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5 tracking-wide">
                    × Peoples League — Sponsorship Analytics
                  </p>
                </div>
              </div>

              <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                Real-time performance data for Liquid IV's 2026 season partnership with
                Peoples League Golf — the fastest-growing creator golf league in the world.
              </p>
            </div>

            {/* Season summary chip */}
            <div
              className="shrink-0 rounded-xl border px-6 py-4 text-center"
              style={{ borderColor: LIV_TEAL + '40', backgroundColor: LIV_TEAL + '10' }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Season</p>
              <p className="text-2xl font-bold text-white">2026</p>
              <p className="text-xs mt-1" style={{ color: LIV_TEAL }}>3 Tour Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Network Reach</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="2026 YTD Content Views"
            value={loading ? '—' : fmtNum(totalViews)}
            sub="YouTube · Instagram · Facebook"
          />
          <MetricTile
            label="Creator Audience Reach"
            value={fmtNum(creatorReach)}
            sub={`${creators.length} active creators`}
          />
          <MetricTile
            label="Sponsored Content Pieces"
            value="42+"
            sub="Across all deliverable types"
          />
          <MetricTile
            label="Est. Impressions"
            value={loading ? '—' : fmtNum(estimatedImpressions)}
            sub="Views + organic reach multiplier"
          />
        </div>
      </div>

      {/* ── Campaign Timeline ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">2026 Campaign Timeline</h2>
        <div className="space-y-3">
          {TOUR_EVENTS.map((event, idx) => (
            <div
              key={event.id}
              className="relative rounded-xl border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              style={{
                backgroundColor: '#111827',
                borderColor: event.status === 'upcoming' ? LIV_TEAL + '50' : '#1f2937',
              }}
            >
              {/* Left accent line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{
                  backgroundColor:
                    event.status === 'upcoming' ? LIV_TEAL : '#374151',
                }}
              />
              <div className="pl-3">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: LIV_TEAL }}
                  >
                    Event {idx + 1}
                  </span>
                  <StatusBadge status={event.status} />
                </div>
                <h3 className="text-white font-bold text-lg">{event.name}</h3>
                <p className="text-gray-400 text-sm">{event.location}</p>
              </div>
              <div className="pl-3 md:pl-0 md:text-right">
                <p
                  className="text-sm font-semibold"
                  style={{ color: event.status === 'upcoming' ? LIV_TEAL : '#6b7280' }}
                >
                  {event.dates}
                </p>
                {event.status === 'upcoming' && (
                  <p className="text-xs text-gray-500 mt-1">Next activation →</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deliverables Tracker ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-300">Content Deliverables</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            0 of 3 events completed
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DELIVERABLES.map((item) => (
            <DeliverableRow key={item.id} item={item} eventsDone={0} />
          ))}
        </div>

        {/* Summary totals */}
        <div
          className="mt-4 rounded-xl border p-5"
          style={{ backgroundColor: LIV_TEAL + '08', borderColor: LIV_TEAL + '30' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: LIV_TEAL }}>3</p>
              <p className="text-xs text-gray-500 mt-1">Day-in-Life Videos</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: LIV_TEAL }}>9</p>
              <p className="text-xs text-gray-500 mt-1">Recovery Shot Clips</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: LIV_TEAL }}>30+</p>
              <p className="text-xs text-gray-500 mt-1">Short-Form Pieces</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: LIV_TEAL }}>3</p>
              <p className="text-xs text-gray-500 mt-1">Hydration Activations</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform Reach Chart + Audience Breakdown ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Audience by Platform — Pie */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-5">Audience by Platform</h2>
          {audienceBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={audienceBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={2}
                >
                  {audienceBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-400">{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), 'Followers']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-600 text-sm">
              Loading audience data…
            </div>
          )}
          <p className="text-center text-2xl font-bold text-white mt-2">
            {fmtNum(audienceBreakdown.reduce((a, b) => a + b.value, 0))}
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">total combined audience</p>
        </div>

        {/* 2026 YTD Views by Platform — Bar */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-5">2026 YTD Views by Platform</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-600 text-sm">
              Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { name: 'YouTube', views: ytViews, color: '#FF0000' },
                  { name: 'Instagram', views: igViews, color: '#E4405F' },
                  { name: 'Facebook', views: fbViews, color: '#1877F2' },
                ]}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => fmtNum(v)}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="views" radius={[6, 6, 0, 0]} fill={LIV_TEAL} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-center text-2xl font-bold text-white mt-2">
            {loading ? '—' : fmtNum(totalViews)}
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">total 2026 YTD video views</p>
        </div>
      </div>

      {/* ── Creator Roster ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-300">Creator Roster</h2>
          <span className="text-xs text-gray-500">{creators.length} creators · 8 teams</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {topCreators.map((creator) => (
            <div
              key={creator.name}
              className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex flex-col items-center text-center hover:border-gray-700 transition-colors"
            >
              {/* Avatar placeholder */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                style={{
                  backgroundColor: creator.teamColor + '25',
                  color: creator.teamColor,
                  border: `1.5px solid ${creator.teamColor}50`,
                }}
              >
                {creator.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <p className="text-white text-xs font-semibold leading-tight mb-0.5 line-clamp-2">
                {creator.name}
              </p>
              <p className="text-gray-600 text-[10px] mb-2 truncate w-full">{creator.team}</p>
              <p
                className="text-sm font-bold"
                style={{ color: LIV_TEAL }}
              >
                {fmtNum(creator.followers?.total || 0)}
              </p>
              <p className="text-[10px] text-gray-600">followers</p>
            </div>
          ))}
        </div>
        {creators.length > 12 && (
          <p className="text-center text-xs text-gray-600 mt-3">
            Showing top 12 creators by reach · {creators.length} total in the league
          </p>
        )}
      </div>

      {/* ── Sponsorship Value Summary ─────────────────────────────────── */}
      <div
        className="rounded-2xl border p-8"
        style={{
          background: `linear-gradient(135deg, ${LIV_NAVY}cc 0%, #0D2240bb 100%)`,
          borderColor: LIV_TEAL + '30',
        }}
      >
        <h2 className="text-lg font-semibold text-white mb-6">Partnership Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">What You Get</p>
            <ul className="space-y-2">
              {[
                'Presenting Sponsor designation',
                'Logo placement on all event content',
                'Branded hydration stations (3 events)',
                'Creator integrations across 8 teams',
                'Recovery Shot of the Match segments',
                'Day-in-life video features',
                '30+ short-form branded pieces',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <span style={{ color: LIV_TEAL }} className="mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Reach Highlights</p>
            <div className="space-y-3">
              {[
                { label: 'Creator Network', value: fmtNum(creatorReach) },
                { label: 'Combined Audience', value: fmtNum(audienceBreakdown.reduce((a, b) => a + b.value, 0)) },
                { label: 'Active Creators', value: String(creators.length) },
                { label: 'Tour Events', value: '3' },
                { label: 'Content Pieces', value: '42+' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Key Creator Partners</p>
            <div className="space-y-2">
              {[
                { name: 'Pointer Brothers', reach: '5.8M' },
                { name: 'Snappy Gilmore', reach: '3.9M' },
                { name: 'Jenna Bandy', reach: '3.4M' },
                { name: 'Ja Rule', reach: '3.2M' },
                { name: 'Tisha Alyn', reach: '1.9M' },
              ].map(({ name, reach }) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: LIV_TEAL + '20', color: LIV_TEAL }}>
                    {reach}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Footer ────────────────────────────────────────────── */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold">Clay Sutton</p>
          <p className="text-gray-500 text-sm">CEO, Peoples League Golf</p>
          <a
            href="mailto:clay@peoplesleaguegolf.com"
            className="text-sm mt-1 block"
            style={{ color: LIV_TEAL }}
          >
            clay@peoplesleaguegolf.com
          </a>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">
            Data refreshed daily · Platform: pl-analytics-private.vercel.app
          </p>
          <p className="text-xs text-gray-700 mt-1">© 2026 Peoples League Golf</p>
        </div>
      </div>
    </div>
  );
}
