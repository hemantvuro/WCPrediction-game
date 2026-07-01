-- ============================================
-- DAILY BACKUP: Export Predictions to CSV
-- ============================================
-- Run this every morning to backup yesterday's predictions

-- Export all predictions with user and fixture details
SELECT
  p.id as prediction_id,
  p.created_at as predicted_at,
  u.id as user_id,
  u.first_name as player_name,
  u.email as player_email,
  f.id as fixture_id,
  f.team_a,
  f.team_b,
  f.match_date,
  p.prediction as outcome_prediction,
  p.score_a,
  p.score_b,
  p.goal_scorers,
  p.points_earned
FROM predictions p
JOIN users u ON p.user_id = u.id
JOIN fixtures f ON p.fixture_id = f.id
ORDER BY p.created_at DESC;

-- After running:
-- 1. Click "Download as CSV" button in Supabase
-- 2. Save as: predictions_backup_YYYY-MM-DD.csv
-- 3. Keep in a safe folder

-- To restore from CSV:
-- 1. Go to Supabase Table Editor → predictions table
-- 2. Click "Import data from CSV"
-- 3. Select your backup file
-- 4. Map columns correctly
