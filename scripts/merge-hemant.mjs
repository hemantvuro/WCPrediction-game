import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local manually
const envPath = join(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const envVars = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Available vars:', Object.keys(envVars));
  process.exit(1);
}

console.log('🔑 Using Supabase URL:', supabaseUrl);
console.log('🔑 Using key type:', envVars.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeHemantAccounts() {
  console.log('🔍 Finding duplicate Hemant accounts...\n');

  // Get all Hemant users
  const { data: hemantUsers, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .ilike('first_name', 'hemant');

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    process.exit(1);
  }

  console.log(`📊 Found ${hemantUsers.length} Hemant account(s):`);
  hemantUsers.forEach((user) => {
    console.log(`  - ID: ${user.id}`);
    console.log(`    Phone: ${user.phone_number}`);
    console.log(`    Admin: ${user.is_admin}`);
    console.log(`    Points: ${user.points}`);
    console.log('');
  });

  if (hemantUsers.length < 2) {
    console.log('✅ No duplicate accounts found. Nothing to merge.');
    return;
  }

  // Find real and temp Hemant
  const realHemant = hemantUsers.find((u) => u.phone_number === '7507057136');
  const tempHemant = hemantUsers.find(
    (u) => u.phone_number.startsWith('temp_') && u.id !== realHemant?.id
  );

  if (!realHemant) {
    console.error('❌ Could not find real Hemant (phone: 7507057136)');
    process.exit(1);
  }

  if (!tempHemant) {
    console.log('✅ No temp Hemant account found. Nothing to merge.');
    return;
  }

  console.log('✅ Real Hemant:', realHemant.id, realHemant.phone_number);
  console.log('🗑️ Temp Hemant:', tempHemant.id, tempHemant.phone_number);
  console.log('');

  // Get predictions from temp Hemant
  const { data: tempPredictions, error: predError } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', tempHemant.id);

  if (predError) {
    console.error('❌ Error fetching predictions:', predError);
    process.exit(1);
  }

  console.log(`📦 Found ${tempPredictions.length} prediction(s) to migrate\n`);

  // Migrate predictions if any exist
  if (tempPredictions.length > 0) {
    console.log('🔄 Migrating predictions...');
    const { error: updateError } = await supabase
      .from('predictions')
      .update({ user_id: realHemant.id })
      .eq('user_id', tempHemant.id);

    if (updateError) {
      console.error('❌ Failed to migrate predictions:', updateError);
      process.exit(1);
    }
    console.log('✅ Predictions migrated successfully\n');
  }

  // Delete temp Hemant
  console.log('🗑️ Deleting temp Hemant account...');
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', tempHemant.id);

  if (deleteError) {
    console.error('❌ Failed to delete temp Hemant:', deleteError);
    process.exit(1);
  }

  console.log('✅ Temp Hemant deleted successfully\n');
  console.log('🎉 Merge complete!\n');

  // Verify only one Hemant remains
  const { data: finalCheck, error: finalError } = await supabase
    .from('users')
    .select('*')
    .ilike('first_name', 'hemant');

  if (finalError) {
    console.error('❌ Error verifying final state:', finalError);
    process.exit(1);
  }

  console.log(`✅ Final verification: ${finalCheck.length} Hemant account(s) remaining`);
  finalCheck.forEach((user) => {
    console.log(`  - ID: ${user.id}`);
    console.log(`    Phone: ${user.phone_number}`);
    console.log(`    Admin: ${user.is_admin}`);
    console.log(`    Points: ${user.points}`);
  });
}

mergeHemantAccounts().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
