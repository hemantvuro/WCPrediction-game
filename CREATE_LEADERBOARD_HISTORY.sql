-- ============================================
-- CREATE LEADERBOARD HISTORY TABLE
-- ============================================
-- Run this in Supabase SQL Editor to enable rank change tracking

-- Create leaderboard_history table
CREATE TABLE IF NOT EXISTS leaderboard_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  total_points INT NOT NULL,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_user_date
ON leaderboard_history(user_id, snapshot_date DESC);

-- Create index for latest snapshot queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_snapshot_date
ON leaderboard_history(snapshot_date DESC);

-- Verify table created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leaderboard_history'
ORDER BY ordinal_position;
