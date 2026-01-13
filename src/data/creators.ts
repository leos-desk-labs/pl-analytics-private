// Peoples League Creator Database
// Last updated: January 2026

export interface Creator {
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
  // Follower counts will be populated via API or manual updates
  followers?: {
    instagram?: number;
    youtube?: number;
    tiktok?: number;
    x?: number;
    facebook?: number;
    total?: number;
  };
  avatar?: string;
}

export interface Team {
  name: string;
  color: string;
  bgGradient: string;
  owner?: string;
  members: Creator[];
}

export const creators: Creator[] = [
  // Team Martin
  {
    name: 'Martin Borgmeier',
    team: 'Team Martin',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'martinborgmeier',
      youtube: 'martinborgmeier',
      tiktok: 'martinborgmeier',
      x: 'martinborgmeier',
    },
  },
  {
    name: 'DOD King',
    team: 'Team Martin',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'cvagolf',
      youtube: 'cvagolf',
      tiktok: 'cvagolf',
    },
  },
  {
    name: 'Alexa Melton',
    team: 'Team Martin',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'alexamelton',
      youtube: 'alexamelton',
      tiktok: 'alexamelton',
    },
  },

  // Team Luke
  {
    name: 'Luke Kwon',
    team: 'Team Luke',
    teamColor: '#4ECDC4',
    handles: {
      instagram: 'luke.kwon',
      youtube: 'LukeKwonGolf',
      tiktok: 'lukekwongolf',
    },
  },
  {
    name: 'Sam Heung Min',
    team: 'Team Luke',
    teamColor: '#4ECDC4',
    handles: {
      instagram: 'samheungmin.golf',
      youtube: 'SamHeungMinGolf',
      tiktok: 'samheungmingolf',
    },
  },
  {
    name: 'Tooms Golf',
    team: 'Team Luke',
    teamColor: '#4ECDC4',
    handles: {
      instagram: 'toomsgolf',
      youtube: 'ToomsGolf',
      tiktok: 'toomsgolf',
    },
  },

  // Team Ja
  {
    name: 'Ja Rule',
    team: 'Team Ja',
    teamColor: '#FFE66D',
    role: 'owner',
    handles: {
      instagram: 'jarule',
      youtube: 'JaRule',
      x: 'jarule',
    },
  },
  {
    name: 'Claire Hogle',
    team: 'Team Ja',
    teamColor: '#FFE66D',
    handles: {
      instagram: 'clairehogle',
      youtube: 'ClaireHogle',
      tiktok: 'therealclairehogle',
    },
  },
  {
    name: 'Troy Mullins',
    team: 'Team Ja',
    teamColor: '#FFE66D',
    handles: {
      instagram: 'troycmullins',
      youtube: 'TroyCMullins',
      tiktok: 'troycmullins',
      x: 'TroyCMullins',
    },
  },
  {
    name: 'Snappy Gilmore',
    team: 'Team Ja',
    teamColor: '#FFE66D',
    handles: {
      instagram: '_snappygilmore',
      youtube: 'SnappyGilmore',
      tiktok: '_snappygilmore',
    },
  },

  // Team PB (Pointer Brothers)
  {
    name: 'The Pointer Brothers',
    team: 'Team PB',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'thepointerbrothers_',
      youtube: 'ThePointerBrothers',
      tiktok: 'thepointerbrothers_',
    },
  },
  {
    name: 'Henry Budrewicz',
    team: 'Team PB',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'henrybudrewicz',
    },
  },
  {
    name: 'Mike Budrewicz',
    team: 'Team PB',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'mikebudrewicz',
    },
  },
  {
    name: 'Jenna Bandy',
    team: 'Team PB',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'jennabandy21',
      youtube: 'JennaBandy',
      tiktok: 'jennabandy21',
    },
  },
  {
    name: 'Gavin Parker',
    team: 'Team PB',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'gavinflo',
      youtube: 'GavinFlo',
      tiktok: 'gavinflo',
    },
  },

  // Team Canada
  {
    name: 'Mac Boucher',
    team: 'Team Canada',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'macbouchergolf',
      youtube: 'MacBoucherGolf',
      tiktok: 'macbouchergolf',
    },
  },
  {
    name: 'Sara Winter',
    team: 'Team Canada',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'saramwinter',
      youtube: 'SaraWinter',
      tiktok: 'sarawinter_',
      x: 'saraawinterr',
    },
  },
  {
    name: 'Michael Caan',
    team: 'Team Canada',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'michaelcaan',
      youtube: 'MichaelCaan',
      tiktok: 'michaelcaangolf',
    },
  },

  // Team Birdie Fever
  {
    name: 'Birdie Fever',
    team: 'Team Birdie Fever',
    teamColor: '#F38181',
    role: 'owner',
    handles: {
      instagram: 'birdiefevergolf',
      youtube: 'BirdieFever',
      tiktok: 'birdiefevergolf',
    },
  },
  {
    name: 'Malosi',
    team: 'Team Birdie Fever',
    teamColor: '#F38181',
    handles: {
      instagram: 'malosit',
      youtube: 'Malosigolf',
      tiktok: 'malosigolf',
    },
  },
  {
    name: 'Mazelyn',
    team: 'Team Birdie Fever',
    teamColor: '#F38181',
    handles: {
      instagram: 'mazelynt',
      tiktok: 'mazelynt',
    },
  },
  {
    name: 'Chance Taylor',
    team: 'Team Birdie Fever',
    teamColor: '#F38181',
    handles: {
      instagram: 'chancetaylorgolf',
      tiktok: 'chancetaylorgolf',
    },
  },

  // Team Cruz
  {
    name: 'Victor Cruz',
    team: 'Team Cruz',
    teamColor: '#AA96DA',
    role: 'owner',
    handles: {
      instagram: 'victorcruz',
      x: 'TeamVic',
    },
  },
  {
    name: 'Tisha Alyn',
    team: 'Team Cruz',
    teamColor: '#AA96DA',
    handles: {
      instagram: 'tishaalyn',
      youtube: 'TishaAlyn',
      tiktok: 'tisha_alyn',
      x: 'tishaalyn',
    },
  },
  {
    name: 'Ben Hadden',
    team: 'Team Cruz',
    teamColor: '#AA96DA',
    handles: {
      instagram: 'benhaddengolf',
      youtube: 'BenHaddenGolf',
      tiktok: 'benhaddengolf',
    },
  },

  // Team Twisted Golf
  {
    name: 'Twisted Golf Co.',
    team: 'Team Twisted Golf',
    teamColor: '#A8D8EA',
    role: 'owner',
    handles: {
      instagram: 'twistedgolfco',
    },
  },
  {
    name: 'Gabi Powel',
    team: 'Team Twisted Golf',
    teamColor: '#A8D8EA',
    handles: {
      instagram: 'gabipowelll',
      youtube: 'GabiPowel',
      tiktok: 'gabipowel',
    },
  },
  {
    name: 'Cassandra Marie',
    team: 'Team Twisted Golf',
    teamColor: '#A8D8EA',
    handles: {
      instagram: 'cassmarie_b',
      youtube: 'CassandraMarieGolf',
      tiktok: 'cassmarie_b',
      x: 'cassmarie_b',
    },
  },
  {
    name: 'Bobby Ray',
    team: 'Team Twisted Golf',
    teamColor: '#A8D8EA',
    handles: {
      instagram: 'bobrayy',
      tiktok: 'bobrayy',
      x: 'officialbobrayy',
    },
  },
];

export const teams: Team[] = [
  {
    name: 'Team Martin',
    color: '#FF6B6B',
    bgGradient: 'from-red-500/20 to-red-600/10',
    members: creators.filter(c => c.team === 'Team Martin'),
  },
  {
    name: 'Team Luke',
    color: '#4ECDC4',
    bgGradient: 'from-teal-500/20 to-teal-600/10',
    members: creators.filter(c => c.team === 'Team Luke'),
  },
  {
    name: 'Team Ja',
    color: '#FFE66D',
    bgGradient: 'from-yellow-500/20 to-yellow-600/10',
    owner: 'Ja Rule',
    members: creators.filter(c => c.team === 'Team Ja'),
  },
  {
    name: 'Team PB',
    color: '#95E1D3',
    bgGradient: 'from-emerald-500/20 to-emerald-600/10',
    members: creators.filter(c => c.team === 'Team PB'),
  },
  {
    name: 'Team Canada',
    color: '#FF6B6B',
    bgGradient: 'from-red-500/20 to-red-600/10',
    members: creators.filter(c => c.team === 'Team Canada'),
  },
  {
    name: 'Team Birdie Fever',
    color: '#F38181',
    bgGradient: 'from-rose-500/20 to-rose-600/10',
    owner: 'Birdie Fever',
    members: creators.filter(c => c.team === 'Team Birdie Fever'),
  },
  {
    name: 'Team Cruz',
    color: '#AA96DA',
    bgGradient: 'from-purple-500/20 to-purple-600/10',
    owner: 'Victor Cruz',
    members: creators.filter(c => c.team === 'Team Cruz'),
  },
  {
    name: 'Team Twisted Golf',
    color: '#A8D8EA',
    bgGradient: 'from-sky-500/20 to-sky-600/10',
    owner: 'Twisted Golf Co.',
    members: creators.filter(c => c.team === 'Team Twisted Golf'),
  },
];

// Helper functions
export const getCreatorByName = (name: string): Creator | undefined => {
  return creators.find(c => c.name.toLowerCase() === name.toLowerCase());
};

export const getTeamByName = (name: string): Team | undefined => {
  return teams.find(t => t.name.toLowerCase() === name.toLowerCase());
};

export const getTotalCreators = (): number => creators.length;

export const getTeamCount = (): number => teams.length;

// Platform icon mapping
export const platformIcons: Record<string, string> = {
  instagram: '📸',
  youtube: '▶️',
  tiktok: '🎵',
  x: '𝕏',
  facebook: 'f',
};

// Platform colors
export const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#00f2ea',
  x: '#ffffff',
  facebook: '#1877F2',
};

// Platform URL generators
export const getPlatformUrl = (platform: string, handle: string): string => {
  const urls: Record<string, string> = {
    instagram: `https://instagram.com/${handle}`,
    youtube: `https://youtube.com/@${handle}`,
    tiktok: `https://tiktok.com/@${handle}`,
    x: `https://x.com/${handle}`,
    facebook: `https://facebook.com/${handle}`,
  };
  return urls[platform] || '#';
};
