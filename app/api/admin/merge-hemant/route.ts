import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST() {
  try {
    console.log('🔍 Finding duplicate Hemant accounts...');

    // Get all users with firstName 'Hemant'
    const allUsers = await db.getAllUsers();
    const hemantUsers = allUsers.filter(
      (u) => u.firstName.toLowerCase() === 'hemant'
    );

    console.log('📊 Found Hemant accounts:', hemantUsers.length);

    if (hemantUsers.length < 2) {
      return NextResponse.json({
        success: true,
        message: 'No duplicate Hemant accounts found',
        hemantUsers,
      });
    }

    // Find the real Hemant (phone: 7507057136)
    const realHemant = hemantUsers.find((u) => u.phoneNumber === '7507057136');

    // Find temp Hemant (phone starts with temp_)
    const tempHemant = hemantUsers.find(
      (u) => u.phoneNumber.startsWith('temp_') && u.id !== realHemant?.id
    );

    if (!realHemant || !tempHemant) {
      return NextResponse.json({
        success: false,
        message: 'Could not identify real and temp Hemant accounts',
        hemantUsers,
      });
    }

    console.log('✅ Real Hemant:', realHemant.id, realHemant.phoneNumber);
    console.log('🗑️ Temp Hemant:', tempHemant.id, tempHemant.phoneNumber);

    // Get predictions from temp Hemant
    const tempPredictions = await db.getUserPredictions(tempHemant.id);
    console.log('📦 Predictions to migrate:', tempPredictions.length);

    // Migrate predictions from temp to real Hemant
    // We need to update predictions in the database
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (tempPredictions.length > 0) {
      console.log('🔄 Migrating predictions...');
      const { error: updateError } = await supabase
        .from('predictions')
        .update({ user_id: realHemant.id })
        .eq('user_id', tempHemant.id);

      if (updateError) {
        console.error('❌ Failed to migrate predictions:', updateError);
        return NextResponse.json({
          success: false,
          message: 'Failed to migrate predictions',
          error: updateError,
        });
      }
      console.log('✅ Predictions migrated successfully');
    }

    // Delete temp Hemant
    console.log('🗑️ Deleting temp Hemant account...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', tempHemant.id);

    if (deleteError) {
      console.error('❌ Failed to delete temp Hemant:', deleteError);
      return NextResponse.json({
        success: false,
        message: 'Failed to delete temp Hemant',
        error: deleteError,
      });
    }

    console.log('✅ Temp Hemant deleted successfully');
    console.log('🎉 Merge complete!');

    return NextResponse.json({
      success: true,
      message: 'Successfully merged Hemant accounts',
      realHemant: {
        id: realHemant.id,
        name: realHemant.firstName,
        phone: realHemant.phoneNumber,
        isAdmin: realHemant.isAdmin,
      },
      tempHemant: {
        id: tempHemant.id,
        phone: tempHemant.phoneNumber,
      },
      predictionsMigrated: tempPredictions.length,
    });
  } catch (error) {
    console.error('❌ Error merging Hemant accounts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
