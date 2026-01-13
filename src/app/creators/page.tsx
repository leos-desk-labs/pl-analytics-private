'use client';

import { useState, useMemo, useEffect } from 'react';
import { teams, getPlatformUrl, platformColors, Creator } from '@/data/creators';

// Platform icons as SVG components for better rendering
const PlatformIcon = ({ platform, size = 16 }: { platform: string; size?: number }) => {
  switch (platform) {
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return null;
  }
};

// Format number with K/M suffix
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
};

// Extended Creator type with API data
interface CreatorWithData {
  name: string;
  team: string;
  teamColor: string;
  role?: 'owner' | 'member';
  handles: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    x?: string;
    facebook?: string;
  };
  profilePicture?: string | null;
  followers?: {
    instagram: number;
    youtube: number;
    tiktok: number;
    x: number;
    total: number;
    lastUpdated: string;
  } | null;
}

interface NetworkStats {
  totalCreators: number;
  totalFollowers: number;
  byPlatform: {
    instagram: number;
    youtube: number;
    tiktok: number;
    x: number;
  };
  lastUpdated: string;
}

// Creator Card Component
const CreatorCard = ({ creator }: { creator: CreatorWithData }) => {
  const platforms = Object.entries(creator.handles).filter(([_, handle]) => handle);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200 border border-gray-700/50 hover:border-gray-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          {creator.profilePicture && !imgError ? (
            <img
              src={creator.profilePicture}
              alt={creator.name}
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: creator.teamColor }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: creator.teamColor + '40', color: creator.teamColor }}
            >
              {creator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {creator.name}
              {creator.role === 'owner' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  Owner
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400">{creator.team}</p>
          </div>
        </div>
        {/* Total Followers Badge */}
        {creator.followers && creator.followers.total > 0 && (
          <div className="text-right">
            <p className="text-lg font-bold text-brand-lime">{formatNumber(creator.followers.total)}</p>
            <p className="text-xs text-gray-500">followers</p>
          </div>
        )}
      </div>

      {/* Follower Breakdown */}
      {creator.followers && creator.followers.total > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {creator.followers.instagram > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-400">
              IG: {formatNumber(creator.followers.instagram)}
            </span>
          )}
          {creator.followers.youtube > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
              YT: {formatNumber(creator.followers.youtube)}
            </span>
          )}
          {creator.followers.tiktok > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
              TT: {formatNumber(creator.followers.tiktok)}
            </span>
          )}
          {creator.followers.x > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">
              X: {formatNumber(creator.followers.x)}
            </span>
          )}
        </div>
      )}

      {/* Platform Links */}
      <div className="flex flex-wrap gap-2">
        {platforms.map(([platform, handle]) => (
          <a
            key={platform}
            href={getPlatformUrl(platform, handle as string)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all hover:scale-105"
            style={{
              backgroundColor: platformColors[platform] + '20',
              color: platformColors[platform],
            }}
          >
            <PlatformIcon platform={platform} size={14} />
            <span>@{handle}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

// Team type for filtered teams
interface FilteredTeam {
  name: string;
  color: string;
  bgGradient: string;
  owner?: string;
  members: CreatorWithData[];
}

// Team Section Component
const TeamSection = ({ team, creatorsData }: { team: FilteredTeam; creatorsData: CreatorWithData[] }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get team members with their data
  const teamMembers = creatorsData.filter(c => c.team === team.name);
  const teamFollowers = teamMembers.reduce((sum, c) => sum + (c.followers?.total || 0), 0);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${team.bgGradient} border border-gray-700/50 hover:border-gray-600 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: team.color }}
          />
          <h2 className="text-xl font-bold text-white">{team.name}</h2>
          <span className="text-sm text-gray-400">
            {teamMembers.length} creator{teamMembers.length !== 1 ? 's' : ''}
          </span>
          {teamFollowers > 0 && (
            <span className="text-sm text-brand-lime font-semibold">
              {formatNumber(teamFollowers)} reach
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {teamMembers.map((creator) => (
            <CreatorCard key={creator.name} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CreatorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [creatorsData, setCreatorsData] = useState<CreatorWithData[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch creator data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/creators');
        const data = await response.json();
        setCreatorsData(data.creators);
        setNetworkStats(data.networkStats);
      } catch (error) {
        console.error('Failed to fetch creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter creators based on search and team
  const filteredTeams = useMemo(() => {
    return teams.map(team => ({
      ...team,
      members: creatorsData.filter(creator => {
        const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          Object.values(creator.handles).some(h => h?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTeam = selectedTeam === 'all' || creator.team === selectedTeam;
        return matchesSearch && matchesTeam && creator.team === team.name;
      })
    })).filter(team => team.members.length > 0);
  }, [searchTerm, selectedTeam, creatorsData]);

  // Calculate totals
  const totalCreators = networkStats?.totalCreators || creatorsData.length;
  const totalPlatformLinks = creatorsData.reduce((acc, c) =>
    acc + Object.values(c.handles).filter(Boolean).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Hub</h1>
          <p className="text-gray-400 mt-1">
            Peoples League creator network - {totalCreators} creators across {teams.length} teams
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Creators</p>
          <p className="text-3xl font-bold text-white">{totalCreators}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Teams</p>
          <p className="text-3xl font-bold text-white">{teams.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Platform Links</p>
          <p className="text-3xl font-bold text-white">{totalPlatformLinks}</p>
        </div>
        <div className="bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 rounded-lg p-4 border border-brand-lime/30">
          <p className="text-gray-400 text-sm">Network Reach</p>
          <p className="text-3xl font-bold text-brand-lime">
            {loading ? '...' : formatNumber(networkStats?.totalFollowers || 0)}
          </p>
          {networkStats && (
            <p className="text-xs text-gray-500 mt-1">
              Updated {networkStats.lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Platform Breakdown */}
      {networkStats && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-sm text-gray-400 mb-3">Network Reach by Platform</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <PlatformIcon platform="instagram" size={20} />
              </div>
              <div>
                <p className="text-white font-semibold">{formatNumber(networkStats.byPlatform.instagram)}</p>
                <p className="text-xs text-gray-500">Instagram</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                <PlatformIcon platform="youtube" size={20} />
              </div>
              <div>
                <p className="text-white font-semibold">{formatNumber(networkStats.byPlatform.youtube)}</p>
                <p className="text-xs text-gray-500">YouTube</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <PlatformIcon platform="tiktok" size={20} />
              </div>
              <div>
                <p className="text-white font-semibold">{formatNumber(networkStats.byPlatform.tiktok)}</p>
                <p className="text-xs text-gray-500">TikTok</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center text-white">
                <PlatformIcon platform="x" size={20} />
              </div>
              <div>
                <p className="text-white font-semibold">{formatNumber(networkStats.byPlatform.x)}</p>
                <p className="text-xs text-gray-500">X</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search creators or handles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime/50"
            />
          </div>
        </div>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-lime/50"
        >
          <option value="all">All Teams</option>
          {teams.map(team => (
            <option key={team.name} value={team.name}>{team.name}</option>
          ))}
        </select>
      </div>

      {/* Team Sections */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading creators...</p>
          </div>
        ) : filteredTeams.length > 0 ? (
          filteredTeams.map(team => (
            <TeamSection key={team.name} team={team} creatorsData={creatorsData} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No creators found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
