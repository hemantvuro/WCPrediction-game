import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { fetchMatchDetails, searchFixture } from '@/lib/api-football';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get fixture from database
    const fixture = await db.getFixture(id);
    if (!fixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      );
    }

    let apiFixtureId: string | undefined = fixture.externalId;

    // If no external ID, try to search for it
    if (!apiFixtureId) {
      console.log(`No external ID for fixture ${id}, searching...`);
      const searchResult = await searchFixture(
        fixture.teamA,
        fixture.teamB,
        fixture.matchDate
      );

      if (!searchResult) {
        return NextResponse.json(
          {
            error: 'Could not find match in API-Football database',
            message: 'This match may not be available in API-Football. Please enter goal scorers manually.'
          },
          { status: 404 }
        );
      }

      apiFixtureId = searchResult;
      // Save the external ID for future use
      await db.updateFixture(id, { externalId: apiFixtureId });
    }

    // Fetch match details from API-Football
    const matchDetails = await fetchMatchDetails(apiFixtureId);

    // Format goal scorers (already includes duplicates for multiple goals)
    const goalScorersString = matchDetails.goalScorers.join(', ');

    return NextResponse.json({
      success: true,
      goalScorers: matchDetails.goalScorers,
      goalScorersString,
      homeGoals: matchDetails.homeGoals,
      awayGoals: matchDetails.awayGoals,
      status: matchDetails.status,
      availablePlayers: [...matchDetails.players.home, ...matchDetails.players.away],
      message: `✅ Found ${matchDetails.goalScorers.length} goal(s)`,
    });
  } catch (error: any) {
    console.error('Error fetching goal scorers:', error);

    // Check for specific error types
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'API rate limit exceeded',
          message: 'You have reached the daily API limit (100 requests). Please enter goal scorers manually or try again tomorrow.',
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'API key not configured',
          message: 'API-Football integration is not set up. Please enter goal scorers manually.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch goal scorers',
        message: error.message || 'An unexpected error occurred. Please enter goal scorers manually.',
      },
      { status: 500 }
    );
  }
}
