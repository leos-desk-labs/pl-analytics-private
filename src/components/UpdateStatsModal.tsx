'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface StatsField {
  key: string;
  label: string;
  help?: string;
}

interface UpdateStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'instagram' | 'facebook';
  fields: StatsField[];
  defaultFollowers: number;
}

export default function UpdateStatsModal({
  isOpen,
  onClose,
  platform,
  fields,
  defaultFollowers
}: UpdateStatsModalProps) {
  const storageKey = `${platform}_manual_stats`;
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setStats(JSON.parse(saved).stats);
      } else {
        setStats({ followers: defaultFollowers });
      }
    }
  }, [isOpen, storageKey, defaultFollowers]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const data = { stats, updated: now };
    localStorage.setItem(storageKey, JSON.stringify(data));
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Update {platform === 'instagram' ? 'Instagram' : 'Facebook'} Stats
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Enter your latest stats from Meta Business Suite
        </p>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type="number"
                value={stats[field.key] || ''}
                onChange={(e) => setStats({ ...stats, [field.key]: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-lime"
                placeholder="0"
              />
              {field.help && (
                <p className="text-xs text-gray-500 mt-1">{field.help}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-lime text-brand-teal font-semibold rounded-lg hover:bg-brand-lime/90 transition-colors"
          >
            <Save size={18} />
            Save Stats
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
