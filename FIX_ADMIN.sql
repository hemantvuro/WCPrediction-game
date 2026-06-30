-- Run this SQL in Supabase SQL Editor to set Hemant as admin
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- Check current status
SELECT id, first_name, phone_number, is_admin, points
FROM users
WHERE first_name ILIKE 'hemant' OR phone_number = '7507057136';

-- Update Hemant to admin (will update all matching rows)
UPDATE users
SET
  first_name = 'Hemant',
  phone_number = '7507057136',
  is_admin = true
WHERE first_name ILIKE 'hemant' OR phone_number = '7507057136';

-- Verify the update
SELECT id, first_name, phone_number, is_admin, points
FROM users
WHERE phone_number = '7507057136';

-- Expected result:
-- id | first_name | phone_number | is_admin | points
-- ---|------------|--------------|----------|-------
-- XX | Hemant     | 7507057136   | true     | XX
