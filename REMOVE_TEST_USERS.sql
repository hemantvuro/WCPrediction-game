-- SQL script to remove Test and Germanjit users from the database
-- Run these commands in Supabase SQL Editor

-- Step 1: Check if users exist
SELECT id, "firstName", "phoneNumber", "isAdmin", "createdAt"
FROM users
WHERE LOWER("firstName") IN ('test', 'germanjit');

-- Step 2: Check how many predictions they have (optional)
SELECT u."firstName", COUNT(p.id) as prediction_count
FROM users u
LEFT JOIN predictions p ON p."userId" = u.id
WHERE LOWER(u."firstName") IN ('test', 'germanjit')
GROUP BY u."firstName", u.id;

-- Step 3: Delete predictions first (due to foreign key constraint)
DELETE FROM predictions
WHERE "userId" IN (
  SELECT id FROM users WHERE LOWER("firstName") IN ('test', 'germanjit')
);

-- Step 4: Delete the users
DELETE FROM users
WHERE LOWER("firstName") IN ('test', 'germanjit');

-- Step 5: Verify deletion
SELECT id, "firstName", "phoneNumber"
FROM users
WHERE LOWER("firstName") IN ('test', 'germanjit');
-- Should return 0 rows

-- Step 6: Check remaining users count
SELECT COUNT(*) as total_users FROM users;