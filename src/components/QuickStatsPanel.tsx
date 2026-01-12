'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface StatsField {
  key: string;
  label: string;
  help?: string;
}

interface QuickStatsPanelProps {
  platform: 'instagram' | 'facebook';
  fields: StatsField[];
  defaultFollowers: number;
}

export default function QuickStatsPanel({ platform, fields, defaultFollowers }: QuickStatsPanelProps) {
  const storageKey = `${platform}_manual_stats`;
  const [stats, setStats] = useState<Record<string, number>>({});
  const [savedStats, setSavedStats] = useState<Record<string, number> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load saved stats on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedStats(parsed.stats);
      setStats(parsed.stats);
      setLastUpdated(parsed.updated);
      setIsExpanded(false);
    } else {
      // Initialize with default followers
      setStats({ followers: defaultFollowers });
    }
  }, [storageKey, defaultFollowers]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const data = { stats, updated: now };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setSavedStats(stats);
    setLastUpdated(now);
    setIsExpanded(false);
  };

  const handleClear = () => {
    localStorage.removeItem(storageKey);
    setSavedStats(null);
    setLastUpdated(null);
    setStats({ followers: defaultFollowers });
    setIsExpanded(true);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="metric-card mb-6">
      {savedStats && (
        <div className="flex items-center gap-2 mb-3 text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Using real data (Last updated: {lastUpdated ? formatDate(lastUpdated) : 'Unknown'})
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-left w-full"
      >
        <span className="text-lg font-semibold">Quick Stats Update</span>
        <span className="text-gray-400 text-sm ml-auto">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4">
          <p className="text-gray-400 text-sm mb-4">
            Enter your latest stats from Meta Business Suite (takes 30 seconds)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-gray-400 mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  value={stats[field.key] || ''}
                  onChange={(e) => setStats({ ...stats, [field.key]: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-lime"
                  placeholder="0"
                />
                {field.help && (
                  <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-brand-lime text-brand-teal font-semibold rounded-lg hover:bg-brand-lime/90 transition-colors"
            >
              <Save size={18} />
              Save Stats
            </button>
            {savedStats && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Trash2 size={18} />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
