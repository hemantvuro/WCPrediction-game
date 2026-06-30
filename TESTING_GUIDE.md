# 🧪 Testing Guide - WC Prediction Game

## Prerequisites
- Dev server running on http://localhost:3000
- Browser open

---

## Test 1: User Enrollment & Leaderboard

### Step 1.1: Create User 1 (Alice)
1. Open http://localhost:3000
2. You should see the enrollment form
3. Enter:
   - **First Name:** Alice
   - **Phone Number:** 1111111111
4. Click **"Join the Game"**
5. ✅ **Expected:** Should see the main app with Match Prediction tab

### Step 1.2: Check Leaderboard
1. Click **"Leaderboard"** tab
2. ✅ **Expected:** Alice should appear with 0 points

### Step 1.3: Logout and Create User 2 (Bob)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.clear()` and press Enter
4. Refresh the page (F5)
5. You should see enrollment form again
6. Enter:
   - **First Name:** Bob
   - **Phone Number:** 2222222222
7. Click **"Join the Game"**
8. ✅ **Expected:** Should see the main app

### Step 1.4: Check Leaderboard Again
1. Click **"Leaderboard"** tab
2. ✅ **Expected:** Both Alice and Bob should appear with 0 points

---

## Test 2: Admin Setup (as Hemant)

### Step 2.1: Login as Admin
1. Open browser DevTools (F12) → Console
2. Type: `localStorage.clear()` and press Enter
3. Refresh page
4. Enter:
   - **First Name:** Hemant
   - **Phone Number:** 7507057136
5. Click **"Join the Game"**
6. ✅ **Expected:** You should see **"Admin"** tab in navigation

### Step 2.2: Sync Fixtures
1. Click **"Admin"** tab
2. Click **"Fixture Management"** tile
3. Click **"🔄 Sync from API"** button
4. ✅ **Expected:** Alert saying "Successfully synced X fixtures"
5. You should see fixture cards appear

### Step 2.3: Create a Test Fixture (Completed Match)
Since World Cup 2022 fixtures are all completed, we need to:

1. In **Fixture Management**, find any fixture card
2. Click **"✏️ Edit"** button
3. In the Edit modal:
   - Set **Status** toggle to **ON** (Open)
   - Change date to future (e.g., 2026-07-01T20:00)
   - Click **"✓ Update Fixture"**
4. ✅ **Expected:** Fixture is now "Open" and available for predictions

---

## Test 3: Make Predictions

### Step 3.1: Alice Makes Prediction (Login as Alice)
1. Open DevTools → Console
2. Type: `localStorage.clear()` and press Enter
3. Refresh page
4. Login as:
   - **First Name:** Alice
   - **Phone Number:** 1111111111
5. Go to **"Match Prediction"** tab
6. Find the open fixture you edited
7. Make a prediction:
   - Click **Team A** button
   - Enter score: **2 - 1** (Team A: 2, Team B: 1)
8. ✅ **Expected:** Prediction auto-saves (no submit button needed)

### Step 3.2: Bob Makes Different Prediction
1. Open DevTools → Console
2. Type: `localStorage.clear()` and press Enter
3. Refresh page
4. Login as:
   - **First Name:** Bob
   - **Phone Number:** 2222222222
5. Go to **"Match Prediction"** tab
6. Make a different prediction:
   - Click **Team B** button
   - Enter score: **1 - 0** (Team A: 1, Team B: 0)
7. ✅ **Expected:** Prediction auto-saves

---

## Test 4: Complete Match & Award Points

### Step 4.1: Login as Admin (Hemant)
1. Open DevTools → Console
2. Type: `localStorage.clear()` and press Enter
3. Refresh page
4. Login as:
   - **First Name:** Hemant
   - **Phone Number:** 7507057136

### Step 4.2: Update Fixture Result
1. Click **"Admin"** tab
2. Click **"Fixture Management"** tile
3. Find the test fixture
4. Click **"✏️ Edit"** button
5. In the modal, set:
   - **Status:** OFF (Locked/Completed)
   - **Team A Score:** 2
   - **Team B Score:** 1
   - **Result:** Select "Team A Wins"
6. Click **"✓ Update Fixture"**
7. ✅ **Expected:** Fixture updated successfully

---

## Test 5: Verify Points in Leaderboard

### Step 5.1: Check Leaderboard
1. Click **"Leaderboard"** tab
2. ✅ **Expected Results:**
   - **Alice:** 4 points
     - 2 points for correct outcome (Team A wins)
     - 2 points for exact score (2-1)
   - **Bob:** 0 points
     - Wrong outcome (predicted Team B)
     - Wrong score (predicted 1-0)

---

## Test 6: Manual Points Adjustment (Admin)

### Step 6.1: Adjust Bob's Points
1. As Admin (Hemant), click **"Admin"** tab
2. Click **"Manage Participants"** tile
3. Find Bob in the list
4. Click **"Edit"** button
5. In Points Adjustment field, enter: **+2**
6. Click **"Update Participant"**
7. ✅ **Expected:** Alert "Participant updated successfully"

### Step 6.2: Verify Adjusted Points
1. Go back to main page
2. Click **"Leaderboard"** tab
3. ✅ **Expected:**
   - **Alice:** 4 points
   - **Bob:** 2 points (0 calculated + 2 manual adjustment)

---

## Summary of What to Test

| Test | What | Expected Result |
|------|------|----------------|
| 1 | User enrollment | Users appear in leaderboard with 0 points |
| 2 | Admin access | Hemant sees Admin tab, others don't |
| 3 | Fixture sync | Fixtures load from API |
| 4 | Make predictions | Auto-save works, different users can predict |
| 5 | Complete match | Fixture marked as completed |
| 6 | Points calculation | Alice gets 4 points, Bob gets 0 |
| 7 | Manual adjustment | Admin can add/subtract points |

---

## Points Rules (Default)

For **Group Stage** matches:
- **Correct Outcome:** 2 points
- **Exact Score:** 2 points
- **Goal Scorers:** 0 points (not enabled for group stage)

**Total possible per match:** 4 points (if both outcome and score are correct)

---

## Troubleshooting

### "No fixtures found"
- Make sure you clicked "Sync from API" as admin
- Check browser console for errors

### "User not found" / Logged out randomly
- Clear localStorage and login again
- This was fixed, but if it persists, check browser console

### Predictions not saving
- Check if fixture is "Open" status
- Make sure countdown hasn't reached 0
- Check browser console for errors

### Points not calculating
- Make sure fixture status is "Completed"
- Check that result (Team A/B/Draw) is set
- Check that scores are entered

---

## Quick Commands (Browser Console)

```javascript
// Clear session and logout
localStorage.clear()

// Check current user
localStorage.getItem('userId')
localStorage.getItem('userData')

// View all users (fetch from API)
fetch('/api/users').then(r => r.json()).then(console.log)

// View leaderboard
fetch('/api/leaderboard').then(r => r.json()).then(console.log)
```

---

## Ready to Share?

Once testing is complete, you can deploy to Vercel to get a shareable link!
