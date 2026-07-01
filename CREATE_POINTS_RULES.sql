-- ============================================
-- CREATE POINTS RULES TABLE
-- ============================================
-- Run this in Supabase SQL Editor to enable points rules management

-- Create points_rules table
CREATE TABLE IF NOT EXISTS points_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL UNIQUE,
  correct_outcome INT NOT NULL DEFAULT 2,
  exact_score INT NOT NULL DEFAULT 2,
  goal_scorers INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rules for all stages
INSERT INTO points_rules (stage, correct_outcome, exact_score, goal_scorers) VALUES
  ('group', 2, 2, 0),
  ('round32', 3, 3, 1),
  ('round16', 4, 4, 1),
  ('quarter', 5, 5, 2),
  ('semi', 6, 6, 2),
  ('third_place', 6, 6, 2),
  ('final', 10, 10, 3)
ON CONFLICT (stage) DO NOTHING;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_points_rules_updated_at ON points_rules;
CREATE TRIGGER update_points_rules_updated_at
  BEFORE UPDATE ON points_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table created
SELECT * FROM points_rules ORDER BY stage;
