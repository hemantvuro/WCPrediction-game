// Football-Data.org API Integration
// Documentation: https://www.football-data.org/documentation/quickstart
// Free API: https://www.football-data.org/client/register

const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';
const BASE_URL = 'https://api.football-data.org/v4';

// Competition IDs from Football-Data.org
export const COMPETITIONS = {
  WORLD_CUP_2022: 2000,   // FIFA World Cup 2022 (Qatar)
  EUROS_2024: 2018,       // UEFA European Championship 2024
  CHAMPIONS_LEAGUE: 2001, // UEFA Champions League
  PREMIER_LEAGUE: 2021,   // English Premier League
  LA_LIGA: 2014,          // Spanish La Liga
  BUNDESLIGA: 2002,       // German Bundesliga
};

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    winner: string | null;
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FootballDataResponse {
  filters: any;
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  matches: FootballDataMatch[];
}

// Country code to emoji flag mapping
const FLAG_MAP: Record<string, string> = {
  ARG: '🇦🇷', BRA: '🇧🇷', FRA: '🇫🇷', GER: '🇩🇪', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ESP: '🇪🇸', ITA: '🇮🇹', NED: '🇳🇱', POR: '🇵🇹', BEL: '🇧🇪',
  URU: '🇺🇾', CRO: '🇭🇷', MEX: '🇲🇽', USA: '🇺🇸', CAN: '🇨🇦',
  SEN: '🇸🇳', MAR: '🇲🇦', TUN: '🇹🇳', CMR: '🇨🇲', GHA: '🇬🇭',
  JPN: '🇯🇵', KOR: '🇰🇷', IRN: '🇮🇷', AUS: '🇦🇺', SAU: '🇸🇦',
  QAT: '🇶🇦', ECU: '🇪🇨', POL: '🇵🇱', DEN: '🇩🇰', SUI: '🇨🇭',
  WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', SRB: '🇷🇸', CRC: '🇨🇷', SWE: '🇸🇪', NOR: '🇳🇴',
  AUT: '🇦🇹', CZE: '🇨🇿', TUR: '🇹🇷', UKR: '🇺🇦', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  IRL: '🇮🇪', HUN: '🇭🇺', ROU: '🇷🇴', SVK: '🇸🇰', ALB: '🇦🇱',
  ISL: '🇮🇸', FIN: '🇫🇮', GRE: '🇬🇷', BIH: '🇧🇦', MKD: '🇲🇰',
  SVN: '🇸🇮', BUL: '🇧🇬', GEO: '🇬🇪', ARM: '🇦🇲', ISR: '🇮🇱',
  NGA: '🇳🇬', CIV: '🇨🇮', ZAF: '🇿🇦', EGY: '🇪🇬', ALG: '🇩🇿',
  CHI: '🇨🇱', PAR: '🇵🇾', PER: '🇵🇪', COL: '🇨🇴', VEN: '🇻🇪',
  CHN: '🇨🇳', IND: '🇮🇳', THA: '🇹🇭', VIE: '🇻🇳', IRQ: '🇮🇶',
};

function getFlag(tla: string): string {
  return FLAG_MAP[tla] || '⚽';
}

function mapStage(apiStage: string): 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final' {
  const stageMap: Record<string, 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final'> = {
    'GROUP_STAGE': 'group',
    'ROUND_OF_16': 'round16',
    'QUARTER_FINALS': 'quarter',
    'SEMI_FINALS': 'semi',
    'THIRD_PLACE': 'third_place',
    'FINAL': 'final',
    'ROUND_OF_32': 'round32',
    'LAST_16': 'round16',
    'LAST_8': 'quarter',
    'LAST_4': 'semi',
  };
  return stageMap[apiStage] || 'group';
}

export async function fetchMatches(competitionId: number = COMPETITIONS.WORLD_CUP_2022) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error(
      'Football-Data.org API key not configured.\n' +
      'Get your free API key from: https://www.football-data.org/client/register\n' +
      'Then add FOOTBALL_DATA_API_KEY=your_key to .env.local'
    );
  }

  try {
    const url = `${BASE_URL}/competitions/${competitionId}/matches`;

    console.log('Fetching matches from Football-Data.org:', url);

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid API key. Please check your FOOTBALL_DATA_API_KEY in .env.local');
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Free tier allows 10 requests/minute.');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${JSON.stringify(error)}`);
    }

    const data: FootballDataResponse = await response.json();
    console.log(`✅ Fetched ${data.matches.length} matches from ${data.competition.name}`);

    return data.matches.map((match) => ({
      teamA: match.homeTeam.shortName || match.homeTeam.name,
      teamB: match.awayTeam.shortName || match.awayTeam.name,
      teamAFlag: getFlag(match.homeTeam.tla),
      teamBFlag: getFlag(match.awayTeam.tla),
      stage: mapStage(match.stage),
      group: match.group || undefined,
      matchDate: new Date(match.utcDate),
      status: match.status === 'FINISHED' ? 'completed' as const : 'locked' as const,
      result: match.score.winner === 'HOME_TEAM' ? 'teamA' as const
             : match.score.winner === 'AWAY_TEAM' ? 'teamB' as const
             : match.score.winner === 'DRAW' ? 'draw' as const
             : undefined,
      scoreA: match.score.fullTime.home ?? undefined,
      scoreB: match.score.fullTime.away ?? undefined,
      externalId: match.id.toString(),
      enableMatchOutcome: true,
      enableScorePrediction: true,
      enableScorerPrediction: ['SEMI_FINALS', 'THIRD_PLACE', 'FINAL'].includes(match.stage),
    }));
  } catch (error) {
    console.error('❌ Failed to fetch matches from Football-Data.org:', error);
    throw error;
  }
}

export async function syncFixtures(competitionId: number) {
  console.log('🔄 Syncing fixtures from Football-Data.org...');
  const matches = await fetchMatches(competitionId);
  console.log(`✅ Sync complete: ${matches.length} fixtures`);
  return matches;
}
