# Admin Guide - FIFA World Cup 2026 Prediction Game

## Creating & Editing Fixtures

### NEW: Stage Selection (Critical for Points!)

When creating or editing a fixture, you MUST select the **Tournament Stage**. This determines how many points users earn:

**Stage Options:**
- Group Stage (2 pts result + 2 pts score = 4 max)
- Round of 32 (3 pts result + 3 pts score = 6 max)
- Round of 16 (4 pts result + 4 pts score = 8 max)
- Quarter Finals (5 pts result + 5 pts score = 10 max)
- Semi Finals (6 pts result + 6 pts score = 12 max)
- Third Place (6 pts result + 6 pts score = 12 max)
- Final (10 pts result + 10 pts score = 20 max)

### Creating a New Fixture:

1. Go to **Admin → Fixture Management**
2. Click **"➕ Create Fixture"**
3. Fill in ALL required fields:
   - Team A (dropdown)
   - Team B (dropdown)
   - Match Date & Time
   - **Tournament Stage** ⭐ (select carefully!)
   - Group (optional, only for group stage)
   - Status (Locked/Open/Completed)
4. Click **Save**
5. Fixture appears immediately in database

✅ All functions work automatically (predictions, leaderboard, stats)

### Editing an Existing Fixture:

1. Find the fixture in Fixture Management
2. Click **"✏️ Edit"**
3. Modify any field including **Stage**
4. Click **Save**
5. Changes apply immediately

**Common Edit: Fixing Stage**
- If points seem wrong, check the stage
- Edit fixture → Change stage dropdown → Save
- Points recalculate on next leaderboard load

### Entering Match Results:

1. Edit the completed fixture
2. Change status to **"Completed"**
3. Enter **Score A** and **Score B**
4. Select **Result** (Team A Won / Draw / Team B Won)
5. Save
6. Points calculate automatically

---

## Copy Matches Button

**Location:** Admin tab (top button)

**Purpose:** Share match updates via WhatsApp/social media

**Click to copy formatted text with:**
- Recent results + prediction accuracy
- Upcoming matches + prediction counts
- App link

**Sample Output:**
```
⚽ FIFA World Cup 2026 - Match Updates
📅 1 Jul, 2026

✅ RECENT RESULTS
🇲🇽 Mexico 2 - 0 Ecuador 🇪🇨
   75% predicted correctly

🔜 UPCOMING MATCHES
🏴󠁧󠁢󠁥󠁮󠁧󠁿 England vs DR Congo 🇨🇩
   📍 1 Jul, 04:00 pm
```

---

## Points System

### How It Works:
1. Admin creates fixture with **correct stage**
2. Users make predictions
3. Admin enters result when match completes
4. Points calculate automatically on leaderboard load

### Point Values by Stage:

| Stage | Correct Outcome | Exact Score | Max |
|-------|----------------|-------------|-----|
| Group | 2 | +2 | 4 |
| R32 | 3 | +3 | 6 |
| R16 | 4 | +4 | 8 |
| Quarter | 5 | +5 | 10 |
| Semi | 6 | +6 | 12 |
| Final | 10 | +10 | 20 |

### If Points Are Wrong:
1. Check fixture's stage setting
2. Edit fixture → Correct the stage → Save
3. Leaderboard recalculates automatically

---

## Quick Troubleshooting

**Problem: New fixture not appearing**
→ Refresh page

**Problem: Users can't predict**
→ Check status is "Open" (not "Locked")

**Problem: Wrong points awarded**
→ Check fixture stage, edit if needed

**Problem: Points didn't update**
→ Ensure status = "Completed", scores entered

---

## Important Reminders

✅ **Always select correct stage** - Can't be guessed, must be set manually  
✅ Stage determines point values - Group = 2 pts, Final = 10 pts  
✅ Points calculate automatically - No manual intervention  
✅ Edit stage anytime - Changes apply on next leaderboard load  
✅ Test with sample fixture before tournament starts

---

For detailed points breakdown, see [POINTS_SYSTEM.md](./POINTS_SYSTEM.md)
