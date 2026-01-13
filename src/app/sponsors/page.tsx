'use client';

import { useState } from 'react';
import { sponsors, tierConfig, detectSponsorMentions, getAllCampaigns, Sponsor } from '@/data/sponsors';

// Sponsor Card Component
const SponsorCard = ({ sponsor, onClick }: { sponsor: Sponsor; onClick: () => void }) => {
  const tier = tierConfig[sponsor.tier];
  const activeCampaigns = sponsor.campaigns.filter(c => c.status === 'active').length;
  const totalPosts = sponsor.campaigns.reduce((acc, c) => acc + (c.posts?.length || 0), 0);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gradient-to-br ${tier.bgColor} rounded-lg p-5 border border-gray-700/50 hover:border-gray-600 transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: tier.color + '30', color: tier.color }}
          >
            {tier.label}
          </span>
          <h3 className="text-xl font-bold text-white mt-2">{sponsor.name}</h3>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: tier.color + '20', color: tier.color }}
        >
          {sponsor.name[0]}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{sponsor.campaigns.length}</p>
          <p className="text-xs text-gray-400">Campaigns</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{activeCampaigns}</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{totalPosts}</p>
          <p className="text-xs text-gray-400">Posts</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Detection Keywords:</p>
        <div className="flex flex-wrap gap-1">
          {sponsor.keywords.slice(0, 4).map((kw) => (
            <span key={kw} className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
              {kw}
            </span>
          ))}
          {sponsor.keywords.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
              +{sponsor.keywords.length - 4} more
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Sponsor Detail Modal
const SponsorDetail = ({ sponsor, onClose }: { sponsor: Sponsor; onClose: () => void }) => {
  const tier = tierConfig[sponsor.tier];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-br ${tier.bgColor} border-b border-gray-700`}>
          <div className="flex items-start justify-between">
            <div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: tier.color + '30', color: tier.color }}
              >
                {tier.label}
              </span>
              <h2 className="text-2xl font-bold text-white mt-2">{sponsor.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Detection Keywords */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Detection Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {sponsor.keywords.map((kw) => (
                <span key={kw} className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300">
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Posts containing these keywords will be automatically detected and attributed to this sponsor.
            </p>
          </div>

          {/* Campaigns */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Campaigns
            </h3>
            {sponsor.campaigns.length > 0 ? (
              <div className="space-y-3">
                {sponsor.campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{campaign.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        campaign.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {campaign.startDate} {campaign.endDate ? `- ${campaign.endDate}` : ''}
                    </p>
                    {campaign.deliverables && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Deliverables:</p>
                        <ul className="text-sm text-gray-400 list-disc list-inside">
                          {campaign.deliverables.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-400">
                        <span className="text-white font-semibold">{campaign.posts?.length || 0}</span> tracked posts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No campaigns yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Analyzer Component
const ContentAnalyzer = () => {
  const [text, setText] = useState('');
  const [results, setResults] = useState<ReturnType<typeof detectSponsorMentions>>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    const detected = detectSponsorMentions(text);
    setResults(detected);
    setAnalyzed(true);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-white mb-4">Content Analyzer</h3>
      <p className="text-sm text-gray-400 mb-4">
        Paste post caption, video description, or any content to automatically detect sponsor mentions.
      </p>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setAnalyzed(false); }}
        placeholder="Paste content here to analyze for sponsor mentions...

Example: 'Had an amazing time at the Peoples League Championship presented by Event Tickets Center! Huge thanks to @callawaygolf for the amazing driver. #golf #sponsored'"
        className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime/50 resize-none"
      />

      <button
        onClick={handleAnalyze}
        disabled={!text.trim()}
        className="mt-4 px-6 py-2.5 bg-brand-lime text-black font-semibold rounded-lg hover:bg-brand-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze Content
      </button>

      {analyzed && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {results.length > 0 ? (
            <div>
              <p className="text-sm text-green-400 mb-3">
                Found {results.length} sponsor mention{results.length !== 1 ? 's' : ''}:
              </p>
              <div className="space-y-2">
                {results.map(({ sponsor, matchedKeywords }) => (
                  <div key={sponsor.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: tierConfig[sponsor.tier].color + '20',
                          color: tierConfig[sponsor.tier].color
                        }}
                      >
                        {sponsor.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{sponsor.name}</p>
                        <p className="text-xs text-gray-400">
                          Matched: {matchedKeywords.join(', ')}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: tierConfig[sponsor.tier].color + '30',
                        color: tierConfig[sponsor.tier].color
                      }}
                    >
                      {tierConfig[sponsor.tier].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No sponsor mentions detected. Make sure to include brand names, handles, or hashtags.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default function SponsorsPage() {
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredSponsors = selectedTier === 'all'
    ? sponsors
    : sponsors.filter(s => s.tier === selectedTier);

  const allCampaigns = getAllCampaigns();
  const activeCampaigns = allCampaigns.filter(c => c.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Sponsor Hub</h1>
        <p className="text-gray-400 mt-1">
          Track sponsor campaigns, detect mentions, and report on deliverables
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Sponsors</p>
          <p className="text-3xl font-bold text-white">{sponsors.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Active Campaigns</p>
          <p className="text-3xl font-bold text-green-400">{activeCampaigns.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Campaigns</p>
          <p className="text-3xl font-bold text-white">{allCampaigns.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Keywords Tracking</p>
          <p className="text-3xl font-bold text-brand-lime">
            {sponsors.reduce((acc, s) => acc + s.keywords.length, 0)}
          </p>
        </div>
      </div>

      {/* Content Analyzer */}
      <ContentAnalyzer />

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">Filter by tier:</span>
        <div className="flex gap-2">
          {['all', 'title', 'premier', 'partner'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedTier === tier
                  ? 'bg-brand-lime text-black font-semibold'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tier === 'all' ? 'All' : tierConfig[tier as keyof typeof tierConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSponsors.map((sponsor) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            onClick={() => setSelectedSponsor(sponsor)}
          />
        ))}
      </div>

      {/* Add Sponsor CTA */}
      <div className="bg-gray-800/30 border border-dashed border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-2">Need to add a new sponsor?</p>
        <p className="text-sm text-gray-500">
          Contact your administrator to add new sponsors and configure detection keywords.
        </p>
      </div>

      {/* Sponsor Detail Modal */}
      {selectedSponsor && (
        <SponsorDetail
          sponsor={selectedSponsor}
          onClose={() => setSelectedSponsor(null)}
        />
      )}
    </div>
  );
}
