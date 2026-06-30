-- Run this SQL in Supabase SQL Editor to set Hemant as admin
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- Step 1: Check current status - Find Hemant
SELECT id, first_name, phone_number, is_admin, points, created_at
FROM users
WHERE phone_number = '7507057136';

-- Step 2: Update ONLY the user with phone 7507057136 to admin
UPDATE users
SET is_admin = true
WHERE phone_number = '7507057136';

-- Step 3: Verify the update worked
SELECT id, first_name, phone_number, is_admin, points
FROM users
WHERE phone_number = '7507057136';

-- Expected result should show:
-- is_admin = true (previously false)

-- Optional: See all users and their admin status
-- SELECT id, first_name, phone_number, is_admin, points
-- FROM users
-- ORDER BY created_at;
