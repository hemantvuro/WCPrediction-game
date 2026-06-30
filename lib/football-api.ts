// Football API Integration
// This module provides a template for integrating with football APIs
// Currently using mock data - uncomment and configure when ready to use real API

interface APIFixture {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFlag: string;
  awayTeamFlag: string;
  status: 'TBD' | 'NS' | 'LIVE' | 'FT';
  score?: {
    home: number;
    away: number;
  };
  stage: string;
}

// API-Football.com Integration (Recommended)
export class FootballAPI {
  private apiKey: string;
  private baseURL = 'https://v3.football.api-sports.io';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FOOTBALL_API_KEY || '';
  }

  // Fetch World Cup 2026 fixtures
  async getWorldCupFixtures(season: number = 2026): Promise<APIFixture[]> {
    if (!this.apiKey) {
      console.warn('No API key configured. Using mock data.');
      return [];
    }

    try {
      // World Cup league ID is typically 1 (FIFA World Cup)
      const response = await fetch(
        `${this.baseURL}/fixtures?league=1&season=${season}`,
        {
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformAPIResponse(data.response);
    } catch (error) {
      console.error('Failed to fetch fixtures:', error);
      return [];
    }
  }

  // Get specific fixture by ID
  async getFixture(fixtureId: number): Promise<APIFixture | null> {
    if (!this.apiKey) return null;

    try {
      const response = await fetch(
        `${this.baseURL}/fixtures?id=${fixtureId}`,
        {
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io',
          },
        }
      );

      const data = await response.json();
      const fixtures = this.transformAPIResponse(data.response);
      return fixtures[0] || null;
    } catch (error) {
      console.error('Failed to fetch fixture:', error);
      return null;
    }
  }

  private transformAPIResponse(apiData: any[]): APIFixture[] {
    return apiData.map((fixture) => ({
      id: fixture.fixture.id,
      date: fixture.fixture.date,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      homeTeamFlag: this.getCountryFlag(fixture.teams.home.name),
      awayTeamFlag: this.getCountryFlag(fixture.teams.away.name),
      status: this.mapStatus(fixture.fixture.status.short),
      score: fixture.goals.home !== null ? {
        home: fixture.goals.home,
        away: fixture.goals.away,
      } : undefined,
      stage: fixture.league.round || 'Group Stage',
    }));
  }

  private mapStatus(apiStatus: string): 'TBD' | 'NS' | 'LIVE' | 'FT' {
    const statusMap: Record<string, 'TBD' | 'NS' | 'LIVE' | 'FT'> = {
      'TBD': 'TBD',
      'NS': 'NS',
      '1H': 'LIVE',
      'HT': 'LIVE',
      '2H': 'LIVE',
      'ET': 'LIVE',
      'P': 'LIVE',
      'FT': 'FT',
      'AET': 'FT',
      'PEN': 'FT',
    };
    return statusMap[apiStatus] || 'NS';
  }

  private getCountryFlag(countryName: string): string {
    const flagMap: Record<string, string> = {
      'Argentina': '🇦🇷',
      'Brazil': '🇧🇷',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Portugal': '🇵🇹',
      'Netherlands': '🇳🇱',
      'Italy': '🇮🇹',
      'Belgium': '🇧🇪',
      'Croatia': '🇭🇷',
      'Uruguay': '🇺🇾',
      'Colombia': '🇨🇴',
      'Mexico': '🇲🇽',
      'USA': '🇺🇸',
      'Canada': '🇨🇦',
      // Add more as needed
    };
    return flagMap[countryName] || '🏳️';
  }
}

// Export singleton instance
export const footballAPI = new FootballAPI();

// Setup Instructions:
// 1. Sign up at https://www.api-football.com
// 2. Get your API key from the dashboard
// 3. Create a .env.local file in the project root
// 4. Add: FOOTBALL_API_KEY=your_key_here
// 5. Uncomment the API calls in your components
