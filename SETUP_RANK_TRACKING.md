# Setup Rank Change Tracking

This enables the leaderboard to show rank changes (↑↓→) for each player.

## Step 1: Create the Database Table

Run this SQL in Supabase SQL Editor:
https://supabase.com/dashboard/project/mfrxriowdeztndnvdrfr/sql/new

Copy and paste the SQL from `CREATE_LEADERBOARD_HISTORY.sql`

## Step 2: How It Works

- **First Time**: When the leaderboard loads for the first time, everyone shows `→` (no previous rank)
- **After Updates**: When matches complete and points change, players who move up show `↑`, down show `↓`, or stay same show `→`
- **Points Change**: Shows `+X pts` in green when points increase

## What You'll See

### On Leaderboard (UI):
```
🥇 1. ↑ Vidhi
       97 points
       +5 pts

🥈 2. → Pritesh
       92 points
```

### Copy Leaderboard Text:
```
🏆 LEADERBOARD - FIFA 2026 🏆
6/30/2026

1. ↑ Vidhi - 97 pts (+5)
2. → Pritesh - 92 pts
3. ↓ Shweta - 92 pts
```

## When Snapshots Are Saved

A snapshot is automatically saved every time someone loads the leaderboard. This tracks:
- Current rank
- Current points
- Timestamp

The system compares the current state to the most recent snapshot to calculate movements.

## Testing

1. Run the SQL to create the table
2. Load the leaderboard (creates first snapshot with all → indicators)
3. Complete a match and update scores in admin
4. Reload leaderboard - you'll see rank changes!
