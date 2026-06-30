import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('PUT /api/fixtures/[id] - Received body:', body);
    console.log('PUT /api/fixtures/[id] - Fixture ID:', id);

    const { teamA, teamB, teamAFlag, teamBFlag, stage, group, matchDate, status, result, scoreA, scoreB, goalScorers, enableMatchOutcome, enableScorePrediction, enableScorerPrediction } = body;

    const updateData = {
      teamA,
      teamB,
      teamAFlag,
      teamBFlag,
      stage,
      group,
      matchDate: matchDate ? new Date(matchDate) : undefined,
      status,
      result,
      scoreA,
      scoreB,
      goalScorers,
      enableMatchOutcome,
      enableScorePrediction,
      enableScorerPrediction,
    };

    console.log('PUT /api/fixtures/[id] - Update data:', updateData);

    const updated = db.updateFixture(id, updateData);

    if (!updated) {
      console.error('Fixture not found:', id);
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    console.log('PUT /api/fixtures/[id] - Updated successfully:', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update fixture:', error);
    return NextResponse.json({ error: `Failed to update fixture: ${error}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fixture = db.getFixture(id);
    if (!fixture) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    const deleted = db.deleteFixture(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Fixture deleted successfully' });
  } catch (error) {
    console.error('Failed to delete fixture:', error);
    return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 });
  }
}
