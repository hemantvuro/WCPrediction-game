import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// FIFA 2026 World Cup Teams
const TEAMS = [
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Panama', flag: '🇵🇦' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Cape Verde', flag: '🇨🇻' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Ivory Coast', flag: '🇨🇮' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Austria', flag: '🇦🇹' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Haiti', flag: '🇭🇹' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Curaçao', flag: '🇨🇼' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Czech Republic', flag: '🇨🇿' },
  { name: 'DR Congo', flag: '🇨🇩' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'Poland', flag: '🇵🇱' },
];

export async function POST() {
  try {
    console.log('Initializing teams...');

    // Check if teams already exist
    const existingTeams = await db.getAllTeams();
    if (existingTeams.length > 0) {
      return NextResponse.json({
        message: `Teams already initialized (${existingTeams.length} teams exist)`,
        count: existingTeams.length,
      });
    }

    // Create all teams
    const createdTeams = [];
    for (const team of TEAMS) {
      try {
        const created = await db.createTeam(team);
        createdTeams.push(created);
        console.log(`Created team: ${team.name}`);
      } catch (error) {
        console.error(`Failed to create team ${team.name}:`, error);
      }
    }

    console.log(`✅ Successfully created ${createdTeams.length} teams`);

    return NextResponse.json({
      success: true,
      message: `✅ Successfully initialized ${createdTeams.length} teams`,
      count: createdTeams.length,
      teams: createdTeams.map(t => `${t.flag} ${t.name}`),
    });
  } catch (error: any) {
    console.error('Failed to initialize teams:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize teams',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
