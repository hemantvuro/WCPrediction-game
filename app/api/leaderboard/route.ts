import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const leaderboard = await db.calculateLeaderboard();

    // Save snapshot for rank tracking (fire and forget - don't wait)
    db.saveLeaderboardSnapshot(leaderboard).catch(err =>
      console.error('Failed to save snapshot:', err)
    );

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
