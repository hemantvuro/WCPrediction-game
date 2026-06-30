import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

/**
 * One-time endpoint to set Hemant as admin
 * This ensures the admin flag is set correctly in the database
 */
export async function POST() {
  try {
    console.log('Setting admin rights for Hemant (7507057136)...');

    // Get all users
    const users = await db.getAllUsers();
    console.log('Total users:', users.length);

    // Find Hemant by phone number
    let hemant = users.find((u) => u.phoneNumber === '7507057136');

    if (!hemant) {
      // Find Hemant by name (case-insensitive)
      hemant = users.find((u) => u.firstName.toLowerCase() === 'hemant');

      if (!hemant) {
        return NextResponse.json({
          success: false,
          error: 'Hemant not found in database',
          message: 'Please enroll first with Name: Hemant and Phone: 7507057136',
        });
      }

      // If found by name but wrong phone, update it
      console.log(`Found Hemant with different phone: ${hemant.phoneNumber}`);
      console.log('Updating phone number to 7507057136...');
    }

    // Update Hemant to have admin rights
    console.log(`Updating user ${hemant.id} to admin...`);
    const updated = await db.updateUser(hemant.id, {
      firstName: 'Hemant',
      phoneNumber: '7507057136',
      isAdmin: true,
    });

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update user',
      }, { status: 500 });
    }

    console.log('✅ Admin rights set successfully!');
    console.log('Updated user:', updated);

    return NextResponse.json({
      success: true,
      message: '✅ Hemant is now admin!',
      user: {
        id: updated.id,
        firstName: updated.firstName,
        phoneNumber: updated.phoneNumber,
        isAdmin: updated.isAdmin,
        points: updated.points,
      },
    });
  } catch (error: any) {
    console.error('Failed to set admin:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to set admin',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
