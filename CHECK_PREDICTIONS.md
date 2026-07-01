# Check If Predictions Were Saved

## Quick SQL Check

Run this in Supabase SQL Editor to see all predictions:

```sql
-- See how many predictions exist
SELECT 
  u.first_name as player,
  f.team_a || ' vs ' || f.team_b as match,
  p.prediction as outcome,
  p.score_a || '-' || p.score_b as score,
  p.created_at
FROM predictions p
JOIN users u ON p.user_id = u.id
JOIN fixtures f ON p.fixture_id = f.id
ORDER BY p.created_at DESC
LIMIT 50;
```

## What to Look For

### If You See Predictions ✅
- Player names in first column
- Match names (e.g., "Argentina vs Brazil")
- Outcome (teamA, teamB, draw)
- Score (e.g., "2-1")
- Created timestamp (should be from yesterday June 30)

**Result:** Predictions ARE saved, but points aren't calculated because fixtures need results entered.

### If You See Nothing ❌
- Empty result set
- No rows returned

**Result:** Predictions were NOT saved. API rejected them (likely fixture status was locked).

## Why Points Aren't Showing

Points are ONLY calculated when:

1. ✅ Fixture status = 'completed'
2. ✅ Fixture has result set (teamA/teamB/draw)
3. ✅ Fixture has scoreA and scoreB set

**Current situation:**
- Predictions saved ✅ (if users saw "✓ Saved")
- Fixtures NOT marked as completed ❌
- Fixture results NOT entered ❌

**Therefore:** Points = 0 for everyone

## How to Enter Results & Give Points

### Step 1: Go to Fixture Management
Admin → Fixture Management

### Step 2: Find Yesterday's Matches
- Look in "✅ Completed Matches" section
- Or search for the fixtures from June 30

### Step 3: Edit Each Fixture
Click "✏️ Edit" on the fixture

### Step 4: Enter Results
Fill in these fields:

**Status:**
- Change to "Completed"

**Result:**
- Select winner: Team A / Team B / Draw

**Score:**
- Score A: Enter goals (e.g., 2)
- Score B: Enter goals (e.g., 1)

**Goal Scorers (optional):**
- Enter names separated by commas
- Example: "Messi, Di Maria, Messi"

### Step 5: Save
Click "💾 Save Fixture"

### Step 6: Verify Points
- Go to Leaderboard tab
- Points should now appear for players who predicted correctly

## Example: Entering Argentina 2-1 Brazil

```
Status: Completed ✓
Result: Team A (Argentina) ✓
Score A: 2
Score B: 1
Goal Scorers: Messi, Di Maria (optional)
```

**Who gets points:**
- Predicted Argentina win → 2 pts (result correct)
- Predicted Argentina win + exact score 2-1 → 4 pts (result + score)
- Predicted Messi as scorer → +1 pt (if enabled for that stage)

## Admin Workflow (Daily)

After matches finish:

1. **Morning (before 1PM)**: Run auto-update to open tomorrow's fixtures
2. **After matches**: Enter results for completed matches
3. **Verify**: Check leaderboard shows updated points

## Verification SQL

Check if fixtures have results entered:

```sql
-- See fixtures with results
SELECT 
  team_a || ' vs ' || team_b as match,
  status,
  result,
  score_a,
  score_b,
  match_date
FROM fixtures
WHERE match_date >= '2026-06-30' 
  AND match_date < '2026-07-01'
ORDER BY match_date;
```

**What you want to see:**
- status = 'completed'
- result = 'teamA', 'teamB', or 'draw'
- score_a and score_b = numbers (not null)

## Points Calculation Example

**Fixture:** Argentina 2-1 Brazil (Group Stage)
**Points Rules:** Result = 2pts, Exact Score = 2pts

**User predictions:**
1. Vidhi: Argentina 2-1 → 4pts (result + exact score)
2. Pritesh: Argentina 3-0 → 2pts (result only)
3. Hemant: Brazil 1-2 → 0pts (wrong outcome)
4. Shweta: No prediction → 0pts

## Common Issues

### Issue 1: Predictions saved but 0 points
**Cause:** Fixtures not marked as completed or results not entered
**Fix:** Enter results in Fixture Management

### Issue 2: Some users have points, others don't
**Cause:** Only users with correct predictions get points
**Fix:** This is correct behavior

### Issue 3: All users show manual points (97, 92, etc.)
**Cause:** Manual points override calculated points
**Fix:** In Participant Management, set points to 0 to use calculated points

### Issue 4: Points don't update after entering results
**Cause:** Leaderboard caching
**Fix:** Refresh the page
