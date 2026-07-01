-- Find all Hemant accounts
SELECT id, first_name, phone_number, is_admin, points, created_at
FROM users
WHERE first_name ILIKE 'hemant'
ORDER BY created_at;

-- This will show you both Hemant accounts
-- One should have phone 7507057136 (real admin)
-- One should have temp_hemant_... (temp account)

-- Step 1: Find the IDs
-- Replace USER_ID_TO_KEEP and USER_ID_TO_DELETE with actual IDs from above query

-- Step 2: Move all predictions from temp Hemant to real Hemant
-- UPDATE predictions
-- SET user_id = 'USER_ID_TO_KEEP'
-- WHERE user_id = 'USER_ID_TO_DELETE';

-- Step 3: Delete the duplicate Hemant (temp account)
-- DELETE FROM users
-- WHERE id = 'USER_ID_TO_DELETE';

-- Step 4: Verify only one Hemant remains
-- SELECT id, first_name, phone_number, is_admin, points
-- FROM users
-- WHERE first_name ILIKE 'hemant';


-- ============================================
-- AUTOMATIC FIX (safer - keeps real admin)
-- ============================================

-- This will automatically:
-- 1. Keep Hemant with phone 7507057136
-- 2. Move predictions from temp Hemant to real Hemant
-- 3. Delete temp Hemant

-- First, let's see what we're working with
SELECT
  id,
  first_name,
  phone_number,
  is_admin,
  points,
  (SELECT COUNT(*) FROM predictions WHERE user_id = users.id) as prediction_count
FROM users
WHERE first_name ILIKE 'hemant'
ORDER BY created_at;

-- Now run this to fix (uncomment when ready):
/*
-- Get the real Hemant ID (with phone 7507057136)
DO $$
DECLARE
  real_hemant_id UUID;
  temp_hemant_id UUID;
BEGIN
  -- Find real Hemant
  SELECT id INTO real_hemant_id
  FROM users
  WHERE phone_number = '7507057136';

  -- Find temp Hemant (phone starts with temp_)
  SELECT id INTO temp_hemant_id
  FROM users
  WHERE first_name ILIKE 'hemant'
    AND phone_number LIKE 'temp_%'
  LIMIT 1;

  -- Only proceed if both exist
  IF real_hemant_id IS NOT NULL AND temp_hemant_id IS NOT NULL THEN
    -- Move all predictions from temp to real
    UPDATE predictions
    SET user_id = real_hemant_id
    WHERE user_id = temp_hemant_id;

    -- Delete temp Hemant
    DELETE FROM users
    WHERE id = temp_hemant_id;

    RAISE NOTICE 'Successfully merged Hemant accounts!';
    RAISE NOTICE 'Kept: % (7507057136)', real_hemant_id;
    RAISE NOTICE 'Removed: % (temp account)', temp_hemant_id;
  ELSE
    RAISE NOTICE 'Could not find both Hemant accounts';
  END IF;
END $$;
*/

-- Verify the fix
SELECT id, first_name, phone_number, is_admin, points
FROM users
WHERE first_name ILIKE 'hemant';
