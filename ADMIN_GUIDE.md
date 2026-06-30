# Admin Guide - FIFA 2026 Prediction Game

## Overview
Complete admin-controlled prediction game system. All fixtures, teams, and participants are managed by admin.

## Admin Dashboard
Access: **http://localhost:3000/admin**

### Quick Actions

1. **🏴 Manage Teams** (`/admin/teams`)
   - Add new teams with names and flag emojis
   - Edit existing teams
   - Delete teams
   - Emoji picker: Windows + . or Mac Ctrl + Cmd + Space

2. **⚽ Manage Fixtures** (`/admin/fixtures`)
   - Create fixtures by selecting teams from dropdown
   - Auto-calculated status based on match date/time
   - Edit/delete fixtures
   - Copy today's matches for WhatsApp

3. **👥 Manage Participants** (`/admin/participants`)
   - View all enrolled users
   - Edit user details (name, phone)
   - Manually override points for any user
   - Remove participants

4. **🏆 Copy Leaderboard**
   - One-click copy formatted leaderboard
   - Paste directly to WhatsApp group

5. **📊 Match Results**
   - Quick update match status and scores
   - Mark matches as completed
   - Enter final scores and results

6. **🎯 Points Rules**
   - Adjust points for each stage
   - Result points, Score points, Goal scorer points

---

## How to Set Up the Tournament

### Step 1: Teams (Pre-loaded)
48 FIFA 2026 teams are already loaded. You can:
- Add more teams if needed
- Edit team names or flags
- Delete unused teams

### Step 2: Create Fixtures
Go to `/admin/fixtures` and click **"+ Create Fixture"**

**Required fields:**
- **Team A**: Select from dropdown
- **Team B**: Select from dropdown
- **Stage**: Group Stage / Round of 32 / Round of 16 / Quarter / Semi / Third Place / Final
- **Group**: (Only for Group Stage) - A, B, C, etc.
- **Match Date & Time**: Set in local time (IST)

**Auto-calculated:**
- **Status**: Automatically set based on date/time
  - **Open**: More than 2 hours before match (users can predict)
  - **Locked**: Within 2 hours of match (no predictions)
  - **Completed**: Match finished (set by admin when entering results)

### Step 3: Status Rules
Status changes automatically based on match time:

| Time Before Match | Status | Predictions Allowed |
|-------------------|--------|---------------------|
| > 2 hours | Open | ✅ Yes |
| < 2 hours | Locked | ❌ No |
| After match | Locked/Completed | ❌ No |

### Step 4: Share Today's Matches
From `/admin/fixtures`, click **"Copy Today's Matches"**
- Copies all matches scheduled for today
- Formatted for WhatsApp
- Includes time in IST

Example output:
```
⚽ TODAY'S MATCHES - 29/06/2026

1. 🇲🇽 Mexico vs 🇳🇴 Norway - 02:30 AM
2. 🏴 England vs 🇺🇸 USA - 11:30 PM

Make your predictions now!
```

### Step 5: Update Results
Two ways to update:

**Method 1: Quick Update (Admin Dashboard)**
1. Go to `/admin`
2. Scroll to "Match Results"
3. Click on any fixture
4. Select:
   - Status: Completed
   - Result: Team A Won / Draw / Team B Won
   - Scores: Enter final score

**Method 2: Full Edit (Fixtures Management)**
1. Go to `/admin/fixtures`
2. Click "Edit" on the fixture
3. Update all details including goal scorers

### Step 6: Share Leaderboard
From `/admin`, click **"Copy Leaderboard"**
- Formatted with emojis and movement arrows
- Shows points changes
- Paste to WhatsApp

Example output:
```
🏆 LEADERBOARD - FIFA 2026 🏆
29/06/2026

1. → 🥇 Harsha - 12 pts (+4)
2. ↑ 🥈 Rahul - 10 pts (+2)
3. ↓ 🥉 Priya - 8 pts
```

---

## Managing Participants

### View All Participants
- Go to `/admin/participants`
- See all enrolled users with join date

### Edit Participant
Click "Edit" to modify:
- First Name
- Phone Number
- **Manual Points Override**: Set custom points (overrides calculated points)

### Remove Participant
Click "Remove" to delete a user from the game

### Manual Points Override
Use this to:
- Adjust points for disputes
- Bonus points for special achievements
- Penalty points if needed
- When set, calculated points are ignored

---

## Points System

### Default Points Rules

| Stage | Result | Score | Goal Scorers |
|-------|--------|-------|--------------|
| Group Stage | 2 pts | 2 pts | 0 pts |
| Round of 32 | 2 pts | 2 pts | 0 pts |
| Round of 16 | 2 pts | 2 pts | 0 pts |
| Quarter Finals | 2 pts | 2 pts | 0 pts |
| Semi Finals | 2 pts | 2 pts | 1 pt each |
| Third Place | 2 pts | 2 pts | 1 pt each |
| Final | 2 pts | 2 pts | 1 pt each |

### How Points are Calculated
1. **Result Points**: Correct winner (or draw for group stage)
2. **Score Points**: Exact score match (e.g., 2-1)
3. **Goal Scorers**: Correct goal scorer names (Semi finals onwards)

### Edit Points Rules
1. Go to `/admin`
2. Click "Edit Points" button
3. Change values for any stage
4. Changes apply to all future calculations

---

## Initial Setup (Done)

✅ All fixtures cleared - admin creates them
✅ 48 teams pre-loaded with flags
✅ Round of 32 stage added
✅ Auto-status calculation enabled
✅ Admin-only leaderboard export
✅ Admin-only today's matches export

---

## Common Workflows

### Daily Routine
1. Morning: Copy today's matches → Share to WhatsApp
2. Throughout day: Users make predictions
3. After matches: Update results in admin dashboard
4. Evening: Copy leaderboard → Share to WhatsApp

### Creating All Group Stage Matches
For each group (A-L):
1. Go to `/admin/fixtures`
2. Create 6 matches per group (4 teams = 6 combinations)
3. Set stage: "Group Stage"
4. Set group letter: A, B, C, etc.
5. Set dates according to FIFA schedule

### Creating Knockout Rounds
1. After group stage completes
2. Create Round of 32 matches
3. Select qualified teams from dropdowns
4. Dates typically 2-3 days after group stage
5. No group field needed (leave empty)

---

## User Features (Not Admin-Controlled)

Users can:
- Enroll themselves (first name + phone only)
- Make predictions on open matches
- View all fixtures
- View leaderboard

Users cannot:
- Create/edit fixtures
- Edit other users
- Export leaderboard
- See admin dashboard

---

## Technical Notes

### Fixture Status Logic
```
if match is in past:
  if result entered: status = "completed"
  else: status = "locked"
else if match within 2 hours:
  status = "locked"
else:
  status = "open"
```

### Points Calculation Priority
- Manual points override (if set by admin)
- Else: Calculated from predictions

### Data Persistence
Currently using **in-memory database**
- Resets when server restarts
- Upgrade to Supabase/PostgreSQL for production

---

## Troubleshooting

### "No fixtures available"
- Admin needs to create fixtures first
- Go to `/admin/fixtures` and create matches

### "Status not changing"
- Status auto-updates based on match date/time
- Check system time is correct
- Refresh the page

### "Leaderboard shows 0 points"
- Make sure match results are entered
- Status must be "Completed"
- Result field must be set

### "Users can't predict"
- Check fixture status is "Open"
- If match is within 2 hours, it's locked automatically
- Change match date to future time if testing

---

## Production Checklist

Before going live:
- [ ] Set up actual database (Supabase/PostgreSQL)
- [ ] Create all group stage fixtures
- [ ] Test one complete fixture cycle (create → predict → complete → leaderboard)
- [ ] Share enrollment link with users
- [ ] Set up backup system
- [ ] Document your WhatsApp sharing schedule

---

## Support

For questions or issues:
1. Check this guide first
2. Try refreshing the page
3. Check browser console for errors
4. Restart the dev server

---

**Happy Predicting! ⚽🏆**
