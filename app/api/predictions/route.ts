import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fixtureId, prediction, scoreA, scoreB, goalScorers } = body;

    if (!userId || !fixtureId || !prediction) {
      return NextResponse.json(
        { error: 'User ID, fixture ID, and prediction are required' },
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

    if (fixture.status !== 'open') {
      return NextResponse.json(
        { error: 'Predictions are closed for this fixture' },
        { status: 403 }
      );
    }

    const pred = db.createPrediction({
      userId,
      fixtureId,
      prediction,
      scoreA,
      scoreB,
      goalScorers,
    });

    return NextResponse.json(pred);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const predictions = db.getUserPredictions(userId);
      return NextResponse.json(predictions);
    }

    const predictions = db.getAllPredictions();
    return NextResponse.json(predictions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
