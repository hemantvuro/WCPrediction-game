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

    // Extract all fields, ensuring boolean values are preserved
    const updateData: any = {};

    if (body.teamA !== undefined) updateData.teamA = body.teamA;
    if (body.teamB !== undefined) updateData.teamB = body.teamB;
    if (body.teamAFlag !== undefined) updateData.teamAFlag = body.teamAFlag;
    if (body.teamBFlag !== undefined) updateData.teamBFlag = body.teamBFlag;
    if (body.stage !== undefined) updateData.stage = body.stage;
    if (body.group !== undefined) updateData.group = body.group;
    if (body.matchDate !== undefined) updateData.matchDate = new Date(body.matchDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.result !== undefined) updateData.result = body.result;
    if (body.scoreA !== undefined) updateData.scoreA = body.scoreA;
    if (body.scoreB !== undefined) updateData.scoreB = body.scoreB;
    if (body.goalScorers !== undefined) updateData.goalScorers = body.goalScorers;
    if (body.enableMatchOutcome !== undefined) updateData.enableMatchOutcome = body.enableMatchOutcome;
    if (body.enableScorePrediction !== undefined) updateData.enableScorePrediction = body.enableScorePrediction;
    if (body.enableScorerPrediction !== undefined) updateData.enableScorerPrediction = body.enableScorerPrediction;
    if (body.externalId !== undefined) updateData.externalId = body.externalId;

    console.log('PUT /api/fixtures/[id] - Parsed update data:', updateData);

    const updated = await db.updateFixture(id, updateData);

    if (!updated) {
      console.error('Fixture not found or update failed:', id);
      return NextResponse.json({ error: 'Fixture not found or update failed' }, { status: 404 });
    }

    console.log('PUT /api/fixtures/[id] - Updated successfully:', updated);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update fixture:', error);
    return NextResponse.json({
      error: 'Failed to update fixture',
      message: error.message || String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fixture = await db.getFixture(id);
    if (!fixture) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    const deleted = await db.deleteFixture(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Fixture deleted successfully' });
  } catch (error) {
    console.error('Failed to delete fixture:', error);
    return NextResponse.json({ error: 'Failed to delete fixture' }, { status: 500 });
  }
}
