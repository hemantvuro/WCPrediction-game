-- ============================================
-- DELETE DUPLICATE HEMANT (Simple Version)
-- ============================================
-- Run this in Supabase SQL Editor
-- This will delete the temp Hemant and keep only the real admin+player

-- Step 1: See all Hemant accounts
SELECT id, first_name, phone_number, is_admin, points
FROM users
WHERE first_name ILIKE 'hemant'
ORDER BY created_at;

-- Step 2: Delete ONLY the temp Hemant (not the admin)
-- This keeps Hemant with phone 7507057136 (admin + player)
-- and removes any temp_ phone number
DELETE FROM users
WHERE first_name ILIKE 'hemant'
  AND phone_number LIKE 'temp_%';

-- Step 3: Verify only one Hemant remains (should be the admin)
SELECT id, first_name, phone_number, is_admin, points
FROM users
WHERE first_name ILIKE 'hemant';

-- Expected result:
-- 1 row with phone_number = '7507057136' and is_admin = true
