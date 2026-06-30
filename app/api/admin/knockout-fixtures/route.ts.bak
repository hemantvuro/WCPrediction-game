import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { fixtureId, teamA, teamB, teamAFlag, teamBFlag } = body;

    if (!fixtureId || !teamA || !teamB) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const fixture = db.getFixture(fixtureId);
    if (!fixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      );
    }

    const updated = db.updateFixture(fixtureId, {
      teamA,
      teamB,
      teamAFlag: teamAFlag || '⚽',
      teamBFlag: teamBFlag || '⚽',
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update knockout fixture:', error);
    return NextResponse.json(
      { error: 'Failed to update knockout fixture' },
      { status: 500 }
    );
  }
}
