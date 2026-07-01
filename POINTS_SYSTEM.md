# Points System Documentation

## Overview
The FIFA World Cup 2026 Prediction Game automatically calculates and awards points to users based on their predictions when match results are entered.

## How It Works

### 1. **Making Predictions**
Users predict:
- Match outcome (Team A win, Draw, or Team B win)
- Exact score (optional, e.g., 2-1)

### 2. **Entering Results (Admin Only)**
When an admin enters the final result in Fixture Management:
- Set the match status to "Completed"
- Enter the final score (scoreA and scoreB)
- Select the winning team (or draw)

### 3. **Automatic Points Calculation**
The system automatically calculates points when:
- The leaderboard is loaded/refreshed
- Any user views the leaderboard tab
- The page is reloaded

**Calculation Logic:**
```
For each completed fixture:
  IF user predicted correct outcome (win/draw):
    → Award resultPoints (varies by stage)
    
    IF user also predicted exact score:
      → Award additional scorePoints (varies by stage)
```

## Points Table by Tournament Stage

| Stage | Correct Outcome | Exact Score | Total Possible |
|-------|----------------|-------------|----------------|
| **Group Stage** | 2 pts | +2 pts | 4 pts |
| **Round of 32** | 3 pts | +3 pts | 6 pts |
| **Round of 16** | 4 pts | +4 pts | 8 pts |
| **Quarter Finals** | 5 pts | +5 pts | 10 pts |
| **Semi Finals** | 6 pts | +6 pts | 12 pts |
| **Third Place** | 6 pts | +6 pts | 12 pts |
| **Final** | 10 pts | +10 pts | 20 pts |

## Examples

### Example 1: Group Stage Match
**Fixture:** England vs DR Congo  
**Actual Result:** England wins 2-0

**User A Prediction:** England wins, score 2-0  
→ **Points: 2 (outcome) + 2 (exact score) = 4 points**

**User B Prediction:** England wins, score 3-1  
→ **Points: 2 (outcome only) = 2 points**

**User C Prediction:** Draw, score 1-1  
→ **Points: 0 (incorrect outcome)**

### Example 2: Final Match
**Fixture:** Argentina vs Brazil  
**Actual Result:** Argentina wins 3-2

**User A Prediction:** Argentina wins, score 3-2  
→ **Points: 10 (outcome) + 10 (exact score) = 20 points**

**User B Prediction:** Argentina wins, score 2-1  
→ **Points: 10 (outcome only) = 10 points**

**User C Prediction:** Brazil wins  
→ **Points: 0 (incorrect outcome)**

## How to Check Points

### For Users:
1. Go to **Dashboard** tab
2. Your position card shows your total points and rank
3. Go to **Leaderboard** tab to see all player rankings

### For Admins:
1. Points are automatically calculated - no manual action needed
2. The leaderboard shows:
   - Total points per user
   - Rank (sorted by points, highest first)
   - Points change from previous snapshot
   - Correct predictions count
   - Exact scores count
3. Use **Copy Matches** button in Admin tab to share match updates with prediction stats

## Database Implementation

### Tables Involved:
- `fixtures` - Stores match details and results
- `predictions` - Stores user predictions
- `users` - Stores user data and manual points override
- `points_rules` - Stores point values per stage
- `leaderboard_history` - Tracks rank changes over time

### Key Functions:
- `calculateLeaderboard()` - Main calculation function (runs on every leaderboard load)
- `saveLeaderboardSnapshot()` - Saves rank history for tracking movement
- `getPointsRuleSync()` - Returns point values for each stage

## Admin Point Override

Admins can manually set a user's total points:
1. Go to **Admin → Participants**
2. Edit user and set manual points
3. Manual points OVERRIDE calculated points completely
4. Set to 0 to revert to auto-calculated points

## Troubleshooting

### "Points not updating after match completion"
**Solution:** Points update when leaderboard is loaded. Refresh the page or navigate to the Leaderboard tab.

### "User has wrong points"
**Check:**
1. Verify the fixture status is "Completed"
2. Verify the result and scores are entered correctly
3. Check if admin set manual points override (in Participants page)
4. Refresh the leaderboard tab

### "Points seem incorrect for a specific match"
**Verify:**
1. The stage of the match (group vs knockout affects points)
2. User's actual prediction vs fixture result
3. Exact score match criteria

## Code References

**Points Calculation:**  
`lib/supabase-database.ts` → `calculateLeaderboard()` (lines 528-611)

**Points Rules:**  
`lib/supabase-database.ts` → `getPointsRuleSync()` (lines 631-643)

**API Endpoint:**  
`app/api/leaderboard/route.ts` → Calls `calculateLeaderboard()`

## Notes

- Points are calculated in real-time, no caching
- Leaderboard automatically saves snapshots for rank tracking
- Test users ("test", "germanjit") are filtered from display but their points still calculate
- The system supports up to 1000 users efficiently
- Goal scorer predictions are in the database but removed from the UI (0 points awarded)

---

**Last Updated:** July 1, 2026  
**Version:** 2.0 (V2 Overhaul)
