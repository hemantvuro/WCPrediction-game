import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, phoneNumber } = body;

    if (!firstName || !phoneNumber) {
      return NextResponse.json(
        { error: 'First name and phone number are required' },
        { status: 400 }
      );
    }

    const existingUser = db.getUserByPhone(phoneNumber);
    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Grant admin rights to Hemant
    const isAdmin = phoneNumber === '7507057136' && firstName.toLowerCase() === 'hemant';

    const user = db.createUser({
      firstName,
      phoneNumber,
      isAdmin
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = db.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
