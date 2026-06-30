import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fixture = db.createFixture(body);
    return NextResponse.json(fixture, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create fixture' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Fixture ID is required' },
        { status: 400 }
      );
    }

    const fixture = db.updateFixture(id, updates);
    if (!fixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fixture);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update fixture' },
      { status: 500 }
    );
  }
}
