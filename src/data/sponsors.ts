// Peoples League Sponsor Database
// Last updated: January 2026

export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  tier: 'title' | 'premier' | 'partner';
  keywords: string[]; // Keywords to detect in posts (brand names, handles, hashtags, URLs)
  campaigns: Campaign[];
  contacts?: {
    name: string;
    email?: string;
    role?: string;
  }[];
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  type: 'event' | 'content' | 'ambassadorship' | 'product';
  status: 'active' | 'completed' | 'upcoming';
  deliverables?: string[];
  posts?: SponsorPost[];
}

export interface SponsorPost {
  id: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook';
  creator: string;
  url: string;
  date: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'tweet';
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  detectedKeywords: string[];
  verified: boolean; // Manually verified as sponsor content
}

// Sample sponsors with detection keywords
export const sponsors: Sponsor[] = [
  {
    id: 'event-tickets-center',
    name: 'Event Tickets Center',
    tier: 'title',
    keywords: [
      'event tickets center',
      'eventtickitscenter',
      '@eventtickitscenter',
      'eventticketscenter.com',
      '#eventtickitscenter',
      '#ETC',
      'ETC',
    ],
    campaigns: [
      {
        id: 'plc-2025',
        name: 'Peoples League Championship 2025',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        type: 'event',
        status: 'completed',
        deliverables: [
          'Title sponsor branding',
          'Social media mentions',
          'On-course signage',
          'Winner ceremony sponsorship',
        ],
        posts: [],
      },
    ],
  },
  {
    id: 'callaway',
    name: 'Callaway Golf',
    tier: 'premier',
    keywords: [
      'callaway',
      '@callawaygolf',
      '#callaway',
      '#callawaygolf',
      'callaway golf',
      '#TeamCallaway',
    ],
    campaigns: [],
  },
  {
    id: 'taylormade',
    name: 'TaylorMade',
    tier: 'premier',
    keywords: [
      'taylormade',
      '@taylormadegolf',
      '#taylormade',
      '#TeamTaylorMade',
      'taylormade golf',
    ],
    campaigns: [],
  },
  {
    id: 'titleist',
    name: 'Titleist',
    tier: 'premier',
    keywords: [
      'titleist',
      '@titleist',
      '#titleist',
      '#TeamTitleist',
      'pro v1',
      '#prov1',
    ],
    campaigns: [],
  },
  {
    id: 'bad-birdie',
    name: 'Bad Birdie',
    tier: 'partner',
    keywords: [
      'bad birdie',
      'badbirdie',
      '@badbirdiegolf',
      '#badbirdie',
      '#badbirdiegolf',
    ],
    campaigns: [],
  },
  {
    id: 'topgolf',
    name: 'Topgolf',
    tier: 'partner',
    keywords: [
      'topgolf',
      '@topgolf',
      '#topgolf',
    ],
    campaigns: [],
  },
];

// Tier colors and info
export const tierConfig = {
  title: {
    label: 'Title Sponsor',
    color: '#FFD700',
    bgColor: 'from-yellow-500/20 to-yellow-600/10',
  },
  premier: {
    label: 'Premier Partner',
    color: '#C0C0C0',
    bgColor: 'from-gray-400/20 to-gray-500/10',
  },
  partner: {
    label: 'Partner',
    color: '#CD7F32',
    bgColor: 'from-orange-500/20 to-orange-600/10',
  },
};

// Helper functions
export const getSponsorById = (id: string): Sponsor | undefined => {
  return sponsors.find(s => s.id === id);
};

export const getSponsorsByTier = (tier: Sponsor['tier']): Sponsor[] => {
  return sponsors.filter(s => s.tier === tier);
};

// Detection function - checks if text contains sponsor keywords
export const detectSponsorMentions = (text: string): { sponsor: Sponsor; matchedKeywords: string[] }[] => {
  const normalizedText = text.toLowerCase();
  const results: { sponsor: Sponsor; matchedKeywords: string[] }[] = [];

  for (const sponsor of sponsors) {
    const matchedKeywords: string[] = [];

    for (const keyword of sponsor.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      results.push({ sponsor, matchedKeywords });
    }
  }

  return results;
};

// Get all campaigns across sponsors
export const getAllCampaigns = (): (Campaign & { sponsorName: string; sponsorId: string })[] => {
  return sponsors.flatMap(s =>
    s.campaigns.map(c => ({
      ...c,
      sponsorName: s.name,
      sponsorId: s.id,
    }))
  );
};

// Get active campaigns
export const getActiveCampaigns = () => {
  return getAllCampaigns().filter(c => c.status === 'active');
};
