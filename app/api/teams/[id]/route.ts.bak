import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, flag } = body;

    const updated = db.updateTeam(params.id, { name, flag });

    if (!updated) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = db.deleteTeam(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Failed to delete team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
