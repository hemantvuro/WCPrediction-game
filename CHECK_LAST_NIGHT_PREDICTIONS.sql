-- ============================================
-- CHECK LAST NIGHT'S PREDICTIONS (June 30, 2026)
-- ============================================

-- Show all predictions for June 30, 2026 fixtures
SELECT
  f.team_a || ' vs ' || f.team_b as match,
  f.match_date,
  u.first_name as player_name,
  p.prediction as outcome_prediction,
  p.score_a,
  p.score_b,
  p.goal_scorers,
  p.created_at as predicted_at
FROM predictions p
JOIN users u ON p.user_id = u.id
JOIN fixtures f ON p.fixture_id = f.id
WHERE f.match_date::date = '2026-06-30'
ORDER BY f.match_date, u.first_name;

-- Summary: How many predictions per fixture
SELECT
  f.team_a || ' vs ' || f.team_b as match,
  f.match_date,
  COUNT(p.id) as total_predictions
FROM fixtures f
LEFT JOIN predictions p ON p.fixture_id = f.id
WHERE f.match_date::date = '2026-06-30'
GROUP BY f.id, f.team_a, f.team_b, f.match_date
ORDER BY f.match_date;
