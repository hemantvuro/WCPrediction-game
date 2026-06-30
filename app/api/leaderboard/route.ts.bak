import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const leaderboard = db.calculateLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
