// Peoples League Creator Database
// Last updated: February 2026 (synced with Zach's doc)

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
  displayName?: string;
  color: string;
  bgGradient: string;
  owner?: string;
  members: Creator[];
}

export const creators: Creator[] = [
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
    followers: {
      instagram: 992000,
      total: 992000,
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
    followers: {
      instagram: 105000,
      tiktok: 133000,
      youtube: 93500,
      total: 331500,
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
    followers: {
      instagram: 523000,
      tiktok: 1300000,
      youtube: 64200,
      total: 1887200,
    },
  },

  // Team Top Dawgs
  {
    name: 'Ja Rule',
    team: 'Team Top Dawgs',
    teamColor: '#FFE66D',
    role: 'owner',
    handles: {
      instagram: 'jarule',
      youtube: 'JaRule',
      x: 'jarule',
    },
    followers: {
      instagram: 2000000,
      youtube: 1150000,
      total: 3150000,
    },
  },
  {
    name: 'Claire Hogle',
    team: 'Team Top Dawgs',
    teamColor: '#FFE66D',
    handles: {
      instagram: 'clairehogle',
      youtube: 'ClaireHogle',
      tiktok: 'therealclairehogle',
    },
    followers: {
      instagram: 1000000,
      tiktok: 84500,
      youtube: 157000,
      total: 1241500,
    },
  },
  {
    name: 'Snappy Gilmore',
    team: 'Team Top Dawgs',
    teamColor: '#FFE66D',
    handles: {
      instagram: '_snappygilmore',
      youtube: 'SnappyGilmore',
      tiktok: '_snappygilmore',
    },
    followers: {
      instagram: 851000,
      tiktok: 3000000,
      youtube: 64300,
      total: 3915300,
    },
  },
  {
    name: 'Troy Mullins',
    team: 'Team Top Dawgs',
    teamColor: '#FFE66D',
    handles: {
      instagram: 'troycmullins',
      youtube: 'TroyCMullins',
      tiktok: 'troycmullins',
      x: 'TroyCMullins',
    },
    followers: {
      instagram: 215000,
      tiktok: 39000,
      youtube: 1800,
      total: 255800,
    },
  },

  // Team Luke
  {
    name: 'Luke Toomey',
    team: 'Team Luke',
    teamColor: '#4ECDC4',
    handles: {
      instagram: 'toomsgolf',
      youtube: 'ToomsGolf',
      tiktok: 'toomsgolf',
    },
    followers: {
      instagram: 65100,
      tiktok: 8283,
      youtube: 42100,
      total: 115483,
    },
  },
  {
    name: 'Luke Kwon',
    team: 'Team Luke',
    teamColor: '#4ECDC4',
    handles: {
      instagram: 'luke.kwon',
      youtube: 'LukeKwonGolf',
      tiktok: 'lukekwongolf',
    },
    followers: {
      instagram: 310000,
      tiktok: 84700,
      youtube: 412000,
      total: 806700,
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
    followers: {
      instagram: 225000,
      tiktok: 58200,
      youtube: 123000,
      total: 406200,
    },
  },

  // Team Twisted Fox
  {
    name: 'Cass Meyer',
    team: 'Team Twisted Fox',
    teamColor: '#A8D8EA',
    handles: {
      instagram: 'cassmarie_b',
      youtube: 'CassandraMarieGolf',
      tiktok: 'cassmarie_b',
      x: 'cassmarie_b',
    },
    followers: {
      instagram: 455000,
      tiktok: 70800,
      youtube: 2500,
      total: 528300,
    },
  },
  {
    name: 'Gabi Powel',
    team: 'Team Twisted Fox',
    teamColor: '#A8D8EA',
    handles: {
      instagram: 'gabipowelll',
      youtube: 'GabiPowel',
      tiktok: 'gabipowel',
    },
    followers: {
      instagram: 250000,
      tiktok: 41100,
      youtube: 24800,
      total: 315900,
    },
  },
  {
    name: 'Bobby Ray',
    team: 'Team Twisted Fox',
    teamColor: '#A8D8EA',
    handles: {
      instagram: 'bobrayy',
      youtube: 'bobrayy',
      tiktok: 'bobrayy',
      x: 'officialbobrayy',
    },
    followers: {
      instagram: 43000,
      tiktok: 5500,
      youtube: 1200,
      total: 49700,
    },
  },

  // Team King & Queens
  {
    name: 'DOD King',
    team: 'Team King & Queens',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'cvagolf',
      youtube: 'cvagolf',
      tiktok: 'cvagolf',
    },
    followers: {
      instagram: 253200,
      tiktok: 104400,
      youtube: 114000,
      total: 471600,
    },
  },
  {
    name: 'Alexa Melton',
    team: 'Team King & Queens',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'alexamelton',
      youtube: 'alexamelton',
      tiktok: 'alexamelton',
    },
    followers: {
      instagram: 137000,
      tiktok: 84600,
      youtube: 4500,
      total: 226100,
    },
  },
  {
    name: 'Martin Borgmeier',
    team: 'Team King & Queens',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'martinborgmeier',
      youtube: 'martinborgmeier',
      tiktok: 'martinborgmeier',
      x: 'martinborgmeier',
    },
    followers: {
      instagram: 328000,
      tiktok: 225400,
      youtube: 202000,
      total: 755400,
    },
  },

  // Team PB&J
  {
    name: 'Gavin Parker',
    team: 'Team PB&J',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'gavinflo',
      youtube: 'GavinFlo',
      tiktok: 'gavinflo',
    },
    followers: {
      instagram: 136000,
      tiktok: 217600,
      youtube: 3400,
      total: 357000,
    },
  },
  {
    name: 'Pointer Brothers',
    team: 'Team PB&J',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'thepointerbrothers_',
      youtube: 'ThePointerBrothers',
      tiktok: 'thepointerbrothers_',
    },
    followers: {
      instagram: 2000000,
      tiktok: 3600000,
      youtube: 195000,
      total: 5795000,
    },
  },
  {
    name: 'Jenna Bandy',
    team: 'Team PB&J',
    teamColor: '#95E1D3',
    handles: {
      instagram: 'jennabandy21',
      youtube: 'JennaBandy',
      tiktok: 'jennabandy21',
    },
    followers: {
      instagram: 842000,
      tiktok: 1400000,
      youtube: 1120000,
      total: 3362000,
    },
  },

  // Team Canada
  {
    name: 'Michael Caan',
    team: 'Team Canada',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'michaelcaan',
      youtube: 'MichaelCaan',
      tiktok: 'michaelcaangolf',
    },
    followers: {
      instagram: 113000,
      tiktok: 33700,
      youtube: 1500,
      total: 148200,
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
    followers: {
      instagram: 542000,
      tiktok: 201300,
      youtube: 12900,
      total: 756200,
    },
  },
  {
    name: 'Mac Boucher',
    team: 'Team Canada',
    teamColor: '#FF6B6B',
    handles: {
      instagram: 'macbouchergolf',
      youtube: 'MacBoucherGolf',
      tiktok: 'macbouchergolf',
    },
    followers: {
      instagram: 681500,
      tiktok: 141200,
      youtube: 4800,
      total: 827500,
    },
  },

  // Team Birdie Fever
  {
    name: 'Chance Taylor',
    team: 'Team Birdie Fever',
    teamColor: '#F38181',
    handles: {
      instagram: 'chancetaylorgolf',
      youtube: 'chancetaylorgolf',
      tiktok: 'chancetaylorgolf',
    },
    followers: {
      instagram: 67900,
      tiktok: 233000,
      youtube: 1100,
      total: 302000,
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
    followers: {
      instagram: 352000,
      tiktok: 166500,
      youtube: 77000,
      total: 595500,
    },
  },
  {
    name: 'Mazelyn',
    team: 'Team Birdie Fever',
    teamColor: '#F38181',
    handles: {
      instagram: 'mazelynt',
      youtube: 'mazelynt',
      tiktok: 'mazelynt',
    },
    followers: {
      instagram: 144000,
      tiktok: 4182,
      youtube: 25800,
      total: 173982,
    },
  },
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
    followers: {
      instagram: 10000,
      tiktok: 1921,
      youtube: 2100,
      total: 14021,
    },
  },
];

export const teams: Team[] = [
  {
    name: 'Team Cruz',
    color: '#AA96DA',
    bgGradient: 'from-purple-500/20 to-purple-600/10',
    owner: 'Victor Cruz',
    members: creators.filter(c => c.team === 'Team Cruz'),
  },
  {
    name: 'Team Top Dawgs',
    color: '#FFE66D',
    bgGradient: 'from-yellow-500/20 to-yellow-600/10',
    owner: 'Ja Rule',
    members: creators.filter(c => c.team === 'Team Top Dawgs'),
  },
  {
    name: 'Team Luke',
    color: '#4ECDC4',
    bgGradient: 'from-teal-500/20 to-teal-600/10',
    members: creators.filter(c => c.team === 'Team Luke'),
  },
  {
    name: 'Team Twisted Fox',
    color: '#A8D8EA',
    bgGradient: 'from-sky-500/20 to-sky-600/10',
    members: creators.filter(c => c.team === 'Team Twisted Fox'),
  },
  {
    name: 'Team King & Queens',
    color: '#FF6B6B',
    bgGradient: 'from-red-500/20 to-red-600/10',
    members: creators.filter(c => c.team === 'Team King & Queens'),
  },
  {
    name: 'Team PB&J',
    color: '#95E1D3',
    bgGradient: 'from-emerald-500/20 to-emerald-600/10',
    members: creators.filter(c => c.team === 'Team PB&J'),
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
