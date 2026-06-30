// API-Football Integration (RapidAPI)
// Documentation: https://www.api-football.com/documentation-v3
// Sign up: https://rapidapi.com/api-sports/api/api-football

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

interface ApiFootballGoal {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string; // "Goal", "Penalty"
  detail: string; // "Normal Goal", "Own Goal", "Penalty"
}

interface ApiFootballEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string; // "Goal", "Card", "subst"
  detail: string;
  comments: string | null;
}

interface ApiFootballPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

interface ApiFootballLineup {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  startXI: ApiFootballPlayer[];
  substitutes: ApiFootballPlayer[];
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string; // "Match Finished"
      short: string; // "FT"
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
  events: ApiFootballEvent[];
  lineups: ApiFootballLineup[];
}

interface ApiFootballResponse {
  get: string;
  parameters: any;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: ApiFootballFixture[];
}

/**
 * Fetch match details including goal scorers from API-Football
 * @param fixtureId - The external fixture ID from API-Football
 * @returns Match details with goal scorers
 */
export async function fetchMatchDetails(fixtureId: string): Promise<{
  goalScorers: string[];
  homeGoals: number;
  awayGoals: number;
  status: string;
  players: {
    home: string[];
    away: string[];
  };
}> {
  if (!RAPIDAPI_KEY) {
    throw new Error(
      'API-Football key not configured.\n' +
      'Sign up at: https://rapidapi.com/api-sports/api/api-football\n' +
      'Add RAPIDAPI_KEY to .env.local'
    );
  }

  try {
    const url = `${BASE_URL}/fixtures?id=${fixtureId}`;

    console.log('Fetching match details from API-Football:', url);

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Free tier allows 100 requests/day.');
      }
      if (response.status === 403) {
        throw new Error('Invalid API key. Please check your RAPIDAPI_KEY in .env.local');
      }
      throw new Error(`API Error ${response.status}`);
    }

    const data: ApiFootballResponse = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    if (!data.response || data.response.length === 0) {
      throw new Error('Match not found in API-Football database');
    }

    const match = data.response[0];

    // Extract goal scorers from events
    const goalEvents = match.events?.filter(
      event => event.type === 'Goal' && event.detail !== 'Missed Penalty'
    ) || [];

    // Count goals per player (including multiple goals by same player)
    const goalScorers: string[] = goalEvents.map(event => event.player.name);

    // Extract player names from lineups
    const homePlayers = match.lineups?.[0]?.startXI.map(p => p.player.name) || [];
    const homeSubstitutes = match.lineups?.[0]?.substitutes.map(p => p.player.name) || [];
    const awayPlayers = match.lineups?.[1]?.startXI.map(p => p.player.name) || [];
    const awaySubstitutes = match.lineups?.[1]?.substitutes.map(p => p.player.name) || [];

    console.log(`✅ Fetched match details: ${goalScorers.length} goals scored`);

    return {
      goalScorers,
      homeGoals: match.goals.home ?? 0,
      awayGoals: match.goals.away ?? 0,
      status: match.fixture.status.long,
      players: {
        home: [...homePlayers, ...homeSubstitutes],
        away: [...awayPlayers, ...awaySubstitutes],
      },
    };
  } catch (error) {
    console.error('❌ Failed to fetch match details from API-Football:', error);
    throw error;
  }
}

/**
 * Search for a fixture by team names and date
 * Useful when we don't have the API-Football fixture ID
 */
export async function searchFixture(
  homeTeam: string,
  awayTeam: string,
  date: Date
): Promise<string | null> {
  if (!RAPIDAPI_KEY) {
    throw new Error('API-Football key not configured');
  }

  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const url = `${BASE_URL}/fixtures?date=${dateStr}`;

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}`);
    }

    const data: ApiFootballResponse = await response.json();

    // Find match by team names (fuzzy match)
    const match = data.response.find(fixture => {
      const homeMatch = fixture.teams.home.name.toLowerCase().includes(homeTeam.toLowerCase()) ||
                       homeTeam.toLowerCase().includes(fixture.teams.home.name.toLowerCase());
      const awayMatch = fixture.teams.away.name.toLowerCase().includes(awayTeam.toLowerCase()) ||
                       awayTeam.toLowerCase().includes(fixture.teams.away.name.toLowerCase());
      return homeMatch && awayMatch;
    });

    return match ? match.fixture.id.toString() : null;
  } catch (error) {
    console.error('Failed to search fixture:', error);
    return null;
  }
}

/**
 * Get available players for a fixture (for autocomplete)
 */
export async function getFixturePlayers(fixtureId: string): Promise<string[]> {
  try {
    const details = await fetchMatchDetails(fixtureId);
    return [...details.players.home, ...details.players.away];
  } catch (error) {
    console.error('Failed to get fixture players:', error);
    return [];
  }
}
