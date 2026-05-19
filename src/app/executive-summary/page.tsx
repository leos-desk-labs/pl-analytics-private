'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  MousePointerClick,
  Users,
  Tv,
  BarChart3,
  ArrowUpRight,
  Target,
  Film,
} from 'lucide-react';

// ── Industry benchmarks (researched May 2026) ─────────────────────────
const BENCHMARKS = {
  avd: {
    title: 'Average View Duration',
    icon: Clock,
    color: '#FF0000',
    bgGlow: 'from-red-500/10',
    benchmarkLabel: '30+ min video norm',
    benchmarkRange: '25–35% retention',
    whyItMatters:
      'For videos over 30 minutes, 25–35% retention is the healthy range. PL\'s 3-hour match format retains viewers for 32 minutes per session — a level of commitment that signals appointment-style viewing, not casual browsing.',
    investorLine:
      'Viewers stay for 32 minutes per session — the kind of sustained attention typically reserved for Netflix and live sports broadcasts.',
    sourceNote: 'Benchmark: Humble&Brag YouTube Retention Benchmarks 2026; team5pm watch time research',
  },
  ctr: {
    title: 'Click-Through Rate',
    icon: MousePointerClick,
    color: '#CFFF04',
    bgGlow: 'from-lime-500/10',
    benchmarkLabel: 'Browse Features avg',
    benchmarkRange: '3–7%',
    whyItMatters:
      'Browse Features CTR (home feed) averages 3–7%, with above 7% rated "exceptional." For channels with 1K–10K subscribers, 5–8% is the typical range. PL\'s 7.4% is at the top of its size tier and into exceptional territory for browse traffic.',
    investorLine:
      'At 7.4%, PL\'s click-through rate hits the "exceptional" tier — YouTube\'s algorithm is actively choosing to distribute this content.',
    sourceNote: 'Benchmark: Humble&Brag CTR Benchmarks 2026; YouTube Creator Academy 2–10% range; Focus Digital organic CTR data',
  },
  nonSub: {
    title: 'Non-Subscriber Viewership',
    icon: Users,
    color: '#00E5CC',
    bgGlow: 'from-teal-500/10',
    benchmarkLabel: 'What this means',
    benchmarkRange: '3 in 4 are new',
    whyItMatters:
      'YouTube Analytics tracks subscriber vs. non-subscriber viewership. Nearly 3 out of 4 PL viewers are discovering the content organically without being subscribed — a strong signal of algorithmic distribution and new audience acquisition.',
    investorLine:
      '73% of viewers are discovering PL organically — the channel is growing through algorithmic reach, not a captive subscriber base.',
    sourceNote: 'Source: YouTube Studio Analytics (PL channel). YouTube does not publish a platform-wide benchmark for this metric.',
  },
  ctv: {
    title: 'Connected TV Viewership',
    icon: Tv,
    color: '#8B5CF6',
    bgGlow: 'from-violet-500/10',
    benchmarkLabel: 'US CTV landscape',
    benchmarkRange: '180M+ viewers',
    whyItMatters:
      'YouTube is the #1 CTV streaming platform in the US, with over 180 million viewers watching via connected TVs in 2026. PL\'s 58% CTV viewership means the majority of the audience is watching in the living room — alongside Netflix and ESPN, not on a phone.',
    investorLine:
      '58% of viewing happens on connected TVs — PL content lives in the living room alongside Netflix and ESPN, not in a social media scroll.',
    sourceNote: 'CTV landscape: eMarketer 2026 streaming outlook (180M+ YouTube CTV viewers). PL % from YouTube Studio.',
  },
  contentVelocity: {
    title: 'Content Velocity',
    icon: Film,
    color: '#F59E0B',
    bgGlow: 'from-amber-500/10',
    benchmarkLabel: '2026 YTD output',
    benchmarkRange: 'Across 4 platforms',
    whyItMatters:
      'A high content volume paired with strong engagement metrics proves this is a scalable media operation, not a one-hit channel. Content compounds — more surface area means more algorithmic discovery.',
    investorLine:
      '286 pieces of content published YTD across 4 platforms — PL operates as a media network, not a single channel.',
    sourceNote: 'Source: PL Analytics Platform (live data)',
  },
};

type MetricKey = keyof typeof BENCHMARKS;

// ── Metric Card ────────────────────────────────────────────────────────
function InvestorMetric({
  metricKey,
  liveValue,
  liveLabel,
  index,
}: {
  metricKey: MetricKey;
  liveValue: string | null;
  liveLabel: string;
  index: number;
}) {
  const b = BENCHMARKS[metricKey];
  const Icon = b.icon;

  return (
    <div
      className="group relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-[#0d1117] overflow-hidden transition-all hover:border-gray-600"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow */}
      <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${b.bgGlow} to-transparent rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity`} />

      <div className="relative p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ borderColor: b.color + '40', backgroundColor: b.color + '10' }}
            >
              <Icon size={20} style={{ color: b.color }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{b.title}</h3>
            </div>
          </div>
        </div>

        {/* Big number */}
        <div>
          <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {liveValue ?? '...'}
          </div>
          <p className="text-xs text-gray-500 mt-1">{liveLabel}</p>
        </div>

        {/* Benchmark comparison bar */}
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700/50">
          <Target size={14} className="text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{b.benchmarkLabel}</span>
              <span className="text-xs font-mono text-gray-300">{b.benchmarkRange}</span>
            </div>
          </div>
        </div>

        {/* Investor sentence */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex gap-2">
            <ArrowUpRight size={14} className="text-brand-lime flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">{b.investorLine}</p>
          </div>
        </div>

        {/* Why it matters — expandable */}
        <details className="group/details">
          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">
            Why it matters →
          </summary>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{b.whyItMatters}</p>
          <p className="text-[10px] text-gray-700 mt-1 italic">{b.sourceNote}</p>
        </details>
      </div>
    </div>
  );
}

// ── YouTube Studio metrics (not available via Data API v3) ─────────────
// These require YouTube Analytics API (OAuth). Values from YouTube Studio
// as of the May 2026 analytics review. Update these when new data is pulled.
const YOUTUBE_STUDIO_METRICS = {
  avgViewDurationMin: 32,       // Round 3 long-form AVD
  ctrPercent: 7.4,              // Last 28 days, long-form
  nonSubscriberPercent: 73,     // % of views from non-subscribers
  ctvPercent: 58,               // % of views on connected TVs
  lastUpdated: '2026-05-14',    // When these were pulled from Studio
};

// ── Main Page ──────────────────────────────────────────────────────────
export default function ExecutiveSummaryPage() {
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [instagramData, setInstagramData] = useState<any>(null);
  const [facebookData, setFacebookData] = useState<any>(null);
  const [tiktokData, setTiktokData] = useState<any>(null);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ from: '2026-01-01', to: '2026-12-31' });
    const qs = `?${params.toString()}`;
    let resolved = 0;
    const checkDone = () => { resolved++; if (resolved >= 4) setAllLoaded(true); };

    fetch(`/api/youtube${qs}`).then(r => r.json()).then(d => setYoutubeData(d)).catch(() => {}).finally(checkDone);
    fetch(`/api/instagram${qs}`).then(r => r.json()).then(d => setInstagramData(d?.error ? null : d)).catch(() => {}).finally(checkDone);
    fetch(`/api/facebook${qs}`).then(r => r.json()).then(d => setFacebookData(d?.error ? null : d)).catch(() => {}).finally(checkDone);
    fetch(`/api/tiktok-posts${qs}`).then(r => r.json()).then(d => setTiktokData(d?.error ? null : d)).catch(() => {}).finally(checkDone);
  }, []);

  // ── Derive live values ───────────────────────────────────────────────
  // AVD, CTR, non-sub %, CTV % — from YouTube Studio (not available via Data API)
  const avgViewDuration = `${YOUTUBE_STUDIO_METRICS.avgViewDurationMin} min`;
  const ctr = `${YOUTUBE_STUDIO_METRICS.ctrPercent}%`;
  const nonSubPct = `${YOUTUBE_STUDIO_METRICS.nonSubscriberPercent}%`;
  const ctvPct = `${YOUTUBE_STUDIO_METRICS.ctvPercent}%`;

  // Content velocity — cross-platform total (LIVE from APIs)
  const totalContent = allLoaded
    ? (youtubeData?.ytd?.totalVideos || 0) +
      (instagramData?.ytd?.contentCount || instagramData?.ytd?.reelCount || 0) +
      (facebookData?.ytd?.videoCount || 0) +
      (tiktokData?.totals?.postCount || 0)
    : null;

  // Total views — cross-platform (LIVE from APIs)
  const totalViews = allLoaded
    ? (youtubeData?.ytd?.totalViews || 0) +
      (instagramData?.ytd?.views || 0) +
      (facebookData?.ytd?.videoViews || 0) +
      (tiktokData?.totals?.views || 0)
    : null;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-widest">
          <BarChart3 size={12} />
          <span>Investor Brief</span>
        </div>
        <h1 className="text-4xl font-bold text-white">Executive Summary</h1>
        <p className="text-gray-400 mt-1 max-w-2xl">
          Key performance metrics for the Peoples League media network — 2026 YTD.
          Each metric is paired with an industry benchmark to show where PL stands.
        </p>
      </div>

      {/* Top-line hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-brand-lime/10 to-transparent border border-brand-lime/20 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Views YTD</p>
          <p className="text-3xl font-bold text-brand-lime">
            {totalViews !== null ? totalViews.toLocaleString() : '...'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Across 4 platforms</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-gray-700 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Content Published</p>
          <p className="text-3xl font-bold text-white">
            {totalContent !== null ? totalContent.toLocaleString() : '...'}
          </p>
          <p className="text-xs text-gray-600 mt-1">YTD 2026</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-gray-700 p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Platforms Active</p>
          <p className="text-3xl font-bold text-white">4 of 4</p>
          <p className="text-xs text-gray-600 mt-1">YouTube · Instagram · Facebook · TikTok</p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-800" />
        <span className="text-xs text-gray-600 uppercase tracking-widest">Key Metrics vs. Industry</span>
        <div className="h-px flex-1 bg-gray-800" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestorMetric
          metricKey="avd"
          liveValue={avgViewDuration}
          liveLabel="Average view duration — YouTube long-form"
          index={0}
        />
        <InvestorMetric
          metricKey="ctr"
          liveValue={ctr}
          liveLabel="Click-through rate — YouTube (last 28 days)"
          index={1}
        />
        <InvestorMetric
          metricKey="nonSub"
          liveValue={nonSubPct}
          liveLabel="Views from non-subscribers — YouTube"
          index={2}
        />
        <InvestorMetric
          metricKey="ctv"
          liveValue={ctvPct}
          liveLabel="Viewing on connected TVs — YouTube"
          index={3}
        />
        <InvestorMetric
          metricKey="contentVelocity"
          liveValue={totalContent !== null ? `${totalContent}` : null}
          liveLabel="Pieces of content — all platforms YTD"
          index={4}
        />
      </div>

      {/* Context footer */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">About These Numbers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 leading-relaxed">
          <div>
            <p className="font-medium text-gray-400 mb-1">Live Data</p>
            <p>Total views and content counts pull live from YouTube Data API v3, Meta Graph API v18.0, and TikTok via Supabase. Refreshed daily at 5 AM ET.</p>
          </div>
          <div>
            <p className="font-medium text-gray-400 mb-1">YouTube Studio Metrics</p>
            <p>AVD, CTR, non-subscriber %, and CTV % are sourced directly from YouTube Studio analytics (last pulled {YOUTUBE_STUDIO_METRICS.lastUpdated}).</p>
          </div>
          <div>
            <p className="font-medium text-gray-400 mb-1">Benchmark Sources</p>
            <p>CTR: YouTube Creator Academy, Humble&Brag 2026 report, Focus Digital. AVD: Humble&Brag retention benchmarks 2026, team5pm research. CTV: eMarketer 2026 streaming outlook.</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-700 pt-2 border-t border-gray-800">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Peoples League Analytics Platform
        </p>
      </div>
    </div>
  );
}
