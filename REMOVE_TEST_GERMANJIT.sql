-- ============================================
-- REMOVE TEST AND GERMANJIT USERS
-- ============================================

-- Step 1: Check which users match
SELECT
  id,
  first_name,
  phone_number,
  points,
  created_at
FROM users
WHERE first_name ILIKE 'Test' OR first_name ILIKE 'Germanjit';

-- Step 2: Check if they have any predictions (will be deleted with user)
SELECT
  u.first_name,
  COUNT(p.id) as prediction_count
FROM users u
LEFT JOIN predictions p ON p.user_id = u.id
WHERE u.first_name ILIKE 'Test' OR u.first_name ILIKE 'Germanjit'
GROUP BY u.id, u.first_name;

-- Step 3: Delete the users (and their predictions)
DELETE FROM users
WHERE first_name ILIKE 'Test' OR first_name ILIKE 'Germanjit';

-- Step 4: Verify they're gone
SELECT
  first_name,
  phone_number
FROM users
WHERE first_name ILIKE 'Test' OR first_name ILIKE 'Germanjit';

-- Should return 0 rows (empty result)
