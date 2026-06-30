/**
 * Script to manually set Hemant as admin in the database
 * Run with: node scripts/fix-hemant-admin.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.error('❌ Failed to read .env.local:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixHemantAdmin() {
  try {
    console.log('🔍 Finding Hemant in database...');

    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }

    console.log(`Found ${users.length} total users`);

    // Find Hemant by phone
    let hemant = users.find((u) => u.phone_number === '7507057136');

    if (!hemant) {
      // Find by name
      hemant = users.find((u) => u.first_name.toLowerCase() === 'hemant');

      if (!hemant) {
        console.log('❌ Hemant not found!');
        console.log('\nPlease enroll first:');
        console.log('  Name: Hemant');
        console.log('  Phone: 7507057136');
        return;
      }

      console.log(`Found Hemant by name with phone: ${hemant.phone_number}`);
    } else {
      console.log(`Found Hemant with correct phone: ${hemant.phone_number}`);
    }

    console.log('\nCurrent user details:');
    console.log(`  ID: ${hemant.id}`);
    console.log(`  Name: ${hemant.first_name}`);
    console.log(`  Phone: ${hemant.phone_number}`);
    console.log(`  isAdmin: ${hemant.is_admin}`);
    console.log(`  Points: ${hemant.points}`);

    if (hemant.is_admin && hemant.phone_number === '7507057136') {
      console.log('\n✅ Hemant already has admin rights!');
      console.log('\nIf Admin tab is not showing:');
      console.log('  1. Logout from the app');
      console.log('  2. Clear browser localStorage (F12 → Application → Local Storage → Clear All)');
      console.log('  3. Login again with Name: Hemant, Phone: 7507057136');
      return;
    }

    // Update Hemant to admin
    console.log('\n🔧 Setting Hemant as admin...');

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        first_name: 'Hemant',
        phone_number: '7507057136',
        is_admin: true,
      })
      .eq('id', hemant.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    console.log('\n✅ SUCCESS! Hemant is now admin!');
    console.log('\nUpdated user details:');
    console.log(`  ID: ${updated.id}`);
    console.log(`  Name: ${updated.first_name}`);
    console.log(`  Phone: ${updated.phone_number}`);
    console.log(`  isAdmin: ${updated.is_admin}`);
    console.log(`  Points: ${updated.points}`);

    console.log('\n📋 Next Steps:');
    console.log('  1. Logout from the app');
    console.log('  2. Clear browser localStorage (F12 → Application → Local Storage → Clear All)');
    console.log('  3. Login again with Name: Hemant, Phone: 7507057136');
    console.log('  4. You should see "Admin" tab now!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixHemantAdmin();
