import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const teams = db.getAllTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, flag } = body;

    if (!name || !flag) {
      return NextResponse.json({ error: 'Name and flag are required' }, { status: 400 });
    }

    const newTeam = db.createTeam({ name, flag });
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Failed to create team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
