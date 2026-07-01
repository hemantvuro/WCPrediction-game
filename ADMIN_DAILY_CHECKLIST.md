# Admin Daily Checklist - FIFA 2026 Prediction Game

## 🚨 CRITICAL: Run These SQL Scripts FIRST (One-time Setup)

**Before tonight's matches, run these in Supabase SQL Editor:**

### 1. Fix Predictions Access (MUST RUN FIRST)
File: `FIX_PREDICTIONS_RLS.sql`
- Disables Row Level Security on predictions table
- Ensures predictions can be saved and retrieved
- **Without this, predictions won't save!**

### 2. Add Soft Delete Protection (MUST RUN)
File: `SOFT_DELETE_PREDICTIONS.sql`
- Adds `deleted_at` column
- Prevents accidental permanent deletion
- Creates safe delete/restore functions

---

## 📅 Daily Workflow

### Morning (Before Matches Start)

**Step 1: Backup Yesterday's Predictions**
```
1. Go to Supabase SQL Editor
2. Run: BACKUP_PREDICTIONS_DAILY.sql
3. Click "Download as CSV"
4. Save as: predictions_backup_2026-07-01.csv
5. Store in safe folder
```

**Step 2: Open Today's Fixtures**
```
1. Go to Admin → Fixture Management
2. Use date filter to find today's matches
3. For each match:
   - Click ✏️ Edit
   - Change Status → "🔓 OPEN for Predictions"
   - Save
4. Verify on homepage that matches show "Predict Now" button
```

**Step 3: Notify Players**
```
- Post in WhatsApp group
- Tell players matches are now open for predictions
```

---

### After Matches Complete

**Step 1: Enter Results**
```
For each completed match:

1. Go to Admin → Fixture Management
2. Find the match
3. Click ✏️ Edit
4. Set Status → "✅ COMPLETED"
5. Select Result:
   - Who won? (Team A / Team B / Draw)
6. Enter Scores:
   - Score A: (e.g., 2)
   - Score B: (e.g., 1)
7. (Optional) Enter Goal Scorers:
   - Comma-separated: "Messi, Di Maria"
8. Click 💾 Save
```

**Step 2: Verify Points Awarded**
```
1. Go to Leaderboard tab
2. Check that points updated
3. Look for rank changes (↑↓→ indicators)
```

**Step 3: Check Player Predictions**
```
1. Go to Admin → Player Predictions
2. Select yesterday's date
3. Verify predictions are showing
4. Check participation rate
```

---

## 🔒 Fixture Status Guide

| Status | When to Use | What Players See |
|--------|-------------|-----------------|
| 🔒 LOCKED | Future matches (not ready) | "Opens soon" |
| 🔓 OPEN | Ready for predictions | "Predict Now" button |
| ✅ COMPLETED | Match finished + results entered | Final score, points awarded |

---

## ⚠️ Data Safety Rules

### DO ✅
- Backup predictions daily using `BACKUP_PREDICTIONS_DAILY.sql`
- Use "Edit" to update fixtures
- Test with one fixture first before bulk changes
- Keep CSV backups in a safe folder

### DON'T ❌
- **NEVER run `DELETE FROM predictions`** (data is gone forever on free plan)
- Don't delete fixtures that have predictions
- Don't change fixture IDs manually
- Don't disable soft-delete feature

### If You Need to Delete Something
```sql
-- Use soft delete (can be restored):
SELECT soft_delete_prediction('prediction-id-here');

-- To restore if mistake:
SELECT restore_prediction('prediction-id-here');
```

---

## 🐛 Troubleshooting

### "Predictions not saving"
**Check:**
1. Did you run `FIX_PREDICTIONS_RLS.sql`?
2. Is fixture status = "OPEN"?
3. Check browser console for errors (F12)

**Quick test:**
```sql
-- Try to insert a test prediction:
INSERT INTO predictions (user_id, fixture_id, prediction, score_a, score_b)
SELECT
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM fixtures WHERE status='open' LIMIT 1),
  'teamA', 2, 1
RETURNING *;
```

### "No predictions showing in Player Predictions page"
**Check:**
```sql
-- Are there predictions?
SELECT COUNT(*) FROM predictions WHERE deleted_at IS NULL;

-- Check RLS status:
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'predictions';
```
Should show `rowsecurity = false`

### "Points not updating"
**Required:**
- Fixture status = 'completed' ✅
- Fixture result is set ✅
- Fixture scores are set ✅

**Reset manual points:**
```sql
-- If users have manual points (97, 92, etc.), reset to use calculated:
UPDATE users SET points = 0;
```

---

## 📊 Useful SQL Queries

### See Today's Predictions
```sql
SELECT
  u.first_name,
  f.team_a || ' vs ' || f.team_b as match,
  p.prediction,
  p.score_a || '-' || p.score_b as score
FROM predictions p
JOIN users u ON p.user_id = u.id
JOIN fixtures f ON p.fixture_id = f.id
WHERE p.created_at::date = CURRENT_DATE
  AND p.deleted_at IS NULL
ORDER BY f.match_date, u.first_name;
```

### Count Predictions Per Match
```sql
SELECT
  f.team_a || ' vs ' || f.team_b as match,
  COUNT(p.id) as predictions_count
FROM fixtures f
LEFT JOIN predictions p ON p.fixture_id = f.id AND p.deleted_at IS NULL
WHERE f.match_date::date = CURRENT_DATE
GROUP BY f.id, f.team_a, f.team_b;
```

### Check Which Fixtures Are Open
```sql
SELECT
  team_a || ' vs ' || team_b as match,
  status,
  match_date
FROM fixtures
WHERE status = 'open'
ORDER BY match_date;
```

---

## 📞 Emergency Contacts

**Data Loss:**
1. Check CSV backups first
2. Contact Supabase support (they may have recent backups)
3. Ask players to re-enter predictions (last resort)

**System Issues:**
- Check browser console (F12 → Console)
- Check Supabase logs
- Verify fixture status is correct

---

## 🎯 Success Checklist

Daily verification:
- [ ] Predictions saving? (test with your own account)
- [ ] Fixtures open on time?
- [ ] Results entered for completed matches?
- [ ] Points showing on leaderboard?
- [ ] Backup created?
- [ ] Players notified?

**If all ✅, you're good! 🎉**
