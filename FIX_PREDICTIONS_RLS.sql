-- ============================================
-- FIX PREDICTIONS TABLE - ENSURE DATA IS CAPTURED
-- ============================================
-- Run this in Supabase SQL Editor NOW before tonight's matches

-- 1. Check current RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'predictions';

-- 2. Disable RLS on predictions table (to ensure API can read/write)
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is now disabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'predictions';

-- 4. Test insert (this should work)
-- DELETE this test row after confirming it appears:
-- INSERT INTO predictions (user_id, fixture_id, prediction, score_a, score_b)
-- SELECT
--   (SELECT id FROM users LIMIT 1),
--   (SELECT id FROM fixtures LIMIT 1),
--   'teamA',
--   2,
--   1
-- RETURNING *;

-- Expected: Should return 'f' (false) for rls_enabled
-- This means the API can now read and write predictions without restrictions
