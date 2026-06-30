-- FIFA World Cup Prediction Game - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  flag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixtures table
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  team_a_flag TEXT NOT NULL,
  team_b_flag TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('group', 'round32', 'round16', 'quarter', 'semi', 'third_place', 'final')),
  "group" TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('locked', 'open', 'completed')),
  result TEXT CHECK (result IN ('teamA', 'draw', 'teamB')),
  score_a INTEGER,
  score_b INTEGER,
  goal_scorers TEXT[],
  external_id TEXT,
  enable_match_outcome BOOLEAN DEFAULT TRUE,
  enable_score_prediction BOOLEAN DEFAULT TRUE,
  enable_scorer_prediction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions table
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL CHECK (prediction IN ('teamA', 'draw', 'teamB')),
  score_a INTEGER,
  score_b INTEGER,
  goal_scorers TEXT[],
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fixture_id)
);

-- Points rules table
CREATE TABLE points_rules (
  stage TEXT PRIMARY KEY CHECK (stage IN ('group', 'round32', 'round16', 'quarter', 'semi', 'third_place', 'final')),
  correct_outcome INTEGER NOT NULL DEFAULT 2,
  exact_score INTEGER NOT NULL DEFAULT 2,
  goal_scorers INTEGER NOT NULL DEFAULT 0
);

-- Insert default points rules
INSERT INTO points_rules (stage, correct_outcome, exact_score, goal_scorers) VALUES
('group', 2, 2, 0),
('round32', 3, 3, 1),
('round16', 4, 4, 1),
('quarter', 5, 5, 2),
('semi', 6, 6, 2),
('third_place', 6, 6, 2),
('final', 10, 10, 3);

-- Create indexes for performance
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_fixtures_match_date ON fixtures(match_date);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_fixture_id ON predictions(fixture_id);
CREATE INDEX idx_users_phone ON users(phone_number);

-- Create updated_at trigger for predictions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_rules ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now via anon key)
CREATE POLICY "Enable all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON fixtures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON points_rules FOR ALL USING (true) WITH CHECK (true);
