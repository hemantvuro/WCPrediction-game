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

    // Check if user already exists by phone number
    const existingUserByPhone = await db.getUserByPhone(phoneNumber);
    if (existingUserByPhone) {
      return NextResponse.json(existingUserByPhone);
    }

    // Check if a user with the same first name exists (case-insensitive)
    // This handles the case where admin created a temp user and real user is logging in
    const allUsers = await db.getAllUsers();
    const existingUserByName = allUsers.find(
      (u) => u.firstName.toLowerCase() === firstName.toLowerCase()
    );

    if (existingUserByName && existingUserByName.phoneNumber.startsWith('temp_')) {
      // User exists with temp phone number - update with real phone number
      console.log(`Matching existing user by name: ${existingUserByName.firstName}, updating phone number`);

      const updatedUser = await db.updateUser(existingUserByName.id, {
        phoneNumber,
      });

      return NextResponse.json(updatedUser, { status: 200 });
    }

    // Grant admin rights to Hemant
    const isAdmin = phoneNumber === '7507057136' && firstName.toLowerCase() === 'hemant';

    // Create new user
    const user = await db.createUser({
      firstName,
      phoneNumber,
      isAdmin
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await db.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
