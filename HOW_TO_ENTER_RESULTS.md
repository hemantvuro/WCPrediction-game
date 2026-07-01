# How to Enter Match Results

## Quick Steps

### 1. Open Fixture for Editing
- Go to **Admin → Fixture Management**
- Find the fixture from June 30
- Click **"✏️ Edit"**

### 2. Change Status to "Completed"
In the **Status** dropdown:
- Select **"✅ Completed (Enter Results Below)"**

### 3. Enter Results
Now you'll see a green box with result fields:

**Result Dropdown:**
- Select who won: Team A Won / Draw / Team B Won

**Final Score:**
- Team A goals: Enter number (e.g., 2)
- Team B goals: Enter number (e.g., 1)

**Goal Scorers (Optional):**
- Enter names separated by commas
- Example: `Messi, Di Maria, Messi`
- Or click **"🔄 Fetch from API"** to auto-fill

### 4. Save
- Click **"💾 Save Fixture"**
- Fixture is now marked as completed with results

### 5. Verify Points
- Go to **Leaderboard** tab
- Users with correct predictions will now have points!

## Example: Argentina 2-1 Brazil

```
Status: ✅ Completed (Enter Results Below)

Result: Team A Won  (if Argentina is Team A)

Final Score:
- Team A goals: 2
- Team B goals: 1

Goal Scorers: Messi, Di Maria  (optional)
```

## Important Notes

### Result Fields Only Show When Status = Completed
If you don't see the result fields:
1. Make sure Status dropdown shows "✅ Completed"
2. The green box with result fields will appear below

### Manual Points Override
Remember to **reset manual points to 0** first:
- Admin → Manage Participants
- Set everyone's points to 0
- This allows calculated points to show

## Full Workflow for Yesterday's Matches

For each match from June 30:

1. **Edit** the fixture
2. **Status** → Completed
3. **Result** → Who won
4. **Scores** → Enter goals
5. **Save**
6. Repeat for next match

After all matches:
- Go to Leaderboard
- Points should now appear!

## Troubleshooting

### "I don't see result fields"
- Check that Status = "✅ Completed"
- Green box should appear below status dropdown

### "Points still showing 97, 92, etc."
- Manual points override calculated points
- Reset to 0 in Manage Participants

### "Points are 0 for everyone"
- Check fixtures are marked as "completed"
- Check result and scores are entered
- Check predictions exist in database

### "Some users have points, others don't"
- This is correct! Only users who predicted correctly get points
- Users who predicted wrong = 0 points
- Users who didn't predict = 0 points
