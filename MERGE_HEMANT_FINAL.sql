-- ============================================
-- MERGE DUPLICATE HEMANT ACCOUNTS
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- Step 1: View current Hemant accounts
SELECT
  id,
  first_name,
  phone_number,
  is_admin,
  points,
  created_at,
  (SELECT COUNT(*) FROM predictions WHERE user_id = users.id) as prediction_count
FROM users
WHERE first_name ILIKE 'hemant'
ORDER BY created_at;

-- Expected: 2 rows
-- One with phone_number = '7507057136' (real admin)
-- One with phone_number starting with 'temp_' (duplicate)

-- ============================================
-- Step 2: AUTOMATIC MERGE
-- ============================================
-- This will:
-- 1. Keep Hemant with phone 7507057136
-- 2. Move all predictions from temp Hemant to real Hemant
-- 3. Delete temp Hemant account

DO $$
DECLARE
  real_hemant_id UUID;
  temp_hemant_id UUID;
  predictions_migrated INT;
BEGIN
  -- Find real Hemant (phone: 7507057136)
  SELECT id INTO real_hemant_id
  FROM users
  WHERE phone_number = '7507057136'
  LIMIT 1;

  -- Find temp Hemant (phone starts with temp_)
  SELECT id INTO temp_hemant_id
  FROM users
  WHERE first_name ILIKE 'hemant'
    AND phone_number LIKE 'temp_%'
  LIMIT 1;

  -- Check both exist
  IF real_hemant_id IS NULL THEN
    RAISE EXCEPTION 'Real Hemant (7507057136) not found';
  END IF;

  IF temp_hemant_id IS NULL THEN
    RAISE NOTICE 'No temp Hemant found - nothing to merge';
    RETURN;
  END IF;

  RAISE NOTICE 'Real Hemant ID: %', real_hemant_id;
  RAISE NOTICE 'Temp Hemant ID: %', temp_hemant_id;

  -- Count predictions to migrate
  SELECT COUNT(*) INTO predictions_migrated
  FROM predictions
  WHERE user_id = temp_hemant_id;

  RAISE NOTICE 'Predictions to migrate: %', predictions_migrated;

  -- Move all predictions from temp to real
  UPDATE predictions
  SET user_id = real_hemant_id
  WHERE user_id = temp_hemant_id;

  RAISE NOTICE 'Predictions migrated successfully';

  -- Delete temp Hemant
  DELETE FROM users
  WHERE id = temp_hemant_id;

  RAISE NOTICE 'Temp Hemant deleted successfully';
  RAISE NOTICE '🎉 Merge complete!';

END $$;

-- Step 3: Verify only one Hemant remains
SELECT
  id,
  first_name,
  phone_number,
  is_admin,
  points,
  (SELECT COUNT(*) FROM predictions WHERE user_id = users.id) as prediction_count
FROM users
WHERE first_name ILIKE 'hemant';

-- Expected: 1 row
-- phone_number = '7507057136'
-- is_admin = true
-- prediction_count = sum of both accounts
