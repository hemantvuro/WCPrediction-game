-- Check predictions data
SELECT 
  COUNT(*) as total_predictions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT fixture_id) as unique_fixtures
FROM predictions;

-- Sample predictions
SELECT 
  p.id,
  p.user_id,
  p.fixture_id,
  p.prediction,
  p.score_a,
  p.score_b,
  u.first_name as user_name,
  f.team_a || ' vs ' || f.team_b as match,
  f.match_date
FROM predictions p
JOIN users u ON p.user_id = u.id
JOIN fixtures f ON p.fixture_id = f.id
ORDER BY f.match_date DESC, u.first_name
LIMIT 10;
