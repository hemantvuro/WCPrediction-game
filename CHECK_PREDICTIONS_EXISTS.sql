-- ============================================
-- CHECK IF PREDICTIONS DATA EXISTS
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Count total predictions
SELECT COUNT(*) as total_predictions FROM predictions;

-- 2. Check if table is empty or has data
SELECT
  COUNT(*) as total_rows,
  MIN(created_at) as first_prediction,
  MAX(created_at) as latest_prediction
FROM predictions;

-- 3. Sample of predictions (if any exist)
SELECT
  p.id,
  p.user_id,
  p.fixture_id,
  p.prediction,
  p.score_a,
  p.score_b,
  p.created_at,
  u.first_name as user_name,
  f.team_a || ' vs ' || f.team_b as match
FROM predictions p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN fixtures f ON p.fixture_id = f.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 4. Check Row Level Security (RLS) policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'predictions';

-- 5. Check if RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'predictions';
