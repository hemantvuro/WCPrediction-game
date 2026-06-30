# 🧪 Testing Checklist - FIFA 2026 Prediction Game

## ✅ **Session Fix Applied**
**Issue**: App kept logging users out  
**Fix**: Added 30-day session expiry with automatic refresh  
**Status**: ✅ **FIXED** and deployed

---

## 📋 **Pre-Launch Testing Checklist**

### **1. User Enrollment & Authentication** ✅

#### Test Steps:
1. **First-time user enrollment:**
   - [ ] Go to https://wc-prediction-game-chi.vercel.app/
   - [ ] Enter name: "Test User"
   - [ ] Enter phone: "9876543210"
   - [ ] Click "Join Tournament"
   - [ ] **Expected**: User is enrolled and sees Match Prediction tab

2. **Returning user (session persistence):**
   - [ ] Close browser completely
   - [ ] Reopen and go to the app URL
   - [ ] **Expected**: Still logged in (no need to re-enroll)
   - [ ] Refresh page multiple times
   - [ ] **Expected**: Stays logged in

3. **Manual logout:**
   - [ ] Click the ⏻ button (top right)
   - [ ] Confirm logout
   - [ ] **Expected**: Back to enrollment form

---

### **2. Admin Fixture Management** ⚽

#### Test Steps:
1. **Login as admin:**
   - [ ] Phone: 7507057136
   - [ ] Name: Hemant
   - [ ] **Expected**: See "Admin" tab

2. **Create new fixture:**
   - [ ] Click Admin → Fixture Management
   - [ ] Click "Create New Fixture"
   - [ ] Select Team A: Argentina
   - [ ] Select Team B: Brazil
   - [ ] Set date/time
   - [ ] Set stage: Group
   - [ ] Toggle "Open for Predictions"
   - [ ] Click "Create"
   - [ ] **Expected**: Fixture appears in list

3. **Edit existing fixture:**
   - [ ] Click "Edit" on any fixture
   - [ ] Change status to "Completed"
   - [ ] Select result: "Team A Won"
   - [ ] Enter scores: Argentina 3, Brazil 1
   - [ ] Click "🔄 Fetch from API" (if API key is set)
   - [ ] **Expected**: Goal scorers auto-fill OR manual entry works
   - [ ] Save

4. **Delete fixture:**
   - [ ] Click "Delete" on a fixture
   - [ ] Confirm deletion
   - [ ] **Expected**: Fixture removed from list

---

### **3. Goal Scorer Points Calculation** 🎯

#### Test Scenario:
**Setup:**
- Fixture: Argentina vs France (Final)
- Admin sets result: Argentina 3 - 1 France
- Admin enters goal scorers: "Messi, Messi, Mbappé"
- Points rule: 2 points per correct goal scorer

**User Predictions:**
- User A predicts: ["Messi", "Ronaldo", "Mbappé"]
- User B predicts: ["Messi", "Messi", "Messi"]
- User C predicts: ["Neymar", "Haaland", "Benzema"]

**Expected Points:**
- User A: Messi scored 2x (4 pts) + Mbappé scored 1x (2 pts) = **6 points** ✅
- User B: Messi scored 2x (4 pts) + predicted Messi 3rd time but only scored 2x (0 pts) = **4 points** ✅
- User C: None of their predictions scored = **0 points** ✅

#### Test Steps:
1. [ ] Admin creates fixture (Argentina vs France)
2. [ ] Admin opens fixture for predictions
3. [ ] User A makes prediction with 3 players
4. [ ] Admin marks fixture as completed
5. [ ] Admin enters: Result + Score + Goal scorers (with duplicates)
6. [ ] Go to Leaderboard
7. [ ] **Expected**: User A's points calculated correctly (2x for Messi who scored 2 goals)

---

### **4. Prediction Flow** 🔮

#### Test Steps:
1. **Make a prediction:**
   - [ ] Go to "Match Prediction" tab
   - [ ] Click on an open fixture
   - [ ] Predict match outcome: "Team A Wins"
   - [ ] Enter score: 2-1
   - [ ] Select 3 goal scorers
   - [ ] Click "Submit Prediction"
   - [ ] **Expected**: Success message, card shows "Prediction Submitted"

2. **Edit existing prediction:**
   - [ ] Click "Edit Prediction" on same fixture
   - [ ] Change outcome to "Draw"
   - [ ] Change score to 1-1
   - [ ] Click "Update Prediction"
   - [ ] **Expected**: Prediction updated successfully

3. **Locked fixture:**
   - [ ] Admin locks a fixture
   - [ ] User tries to predict
   - [ ] **Expected**: "This match is locked" message

---

### **5. Leaderboard & Points** 🏆

#### Test Steps:
1. **Initial state:**
   - [ ] Go to Leaderboard tab
   - [ ] **Expected**: All users listed with 0 points initially

2. **After match completion:**
   - [ ] Admin completes a fixture with results
   - [ ] Check leaderboard
   - [ ] **Expected**: Users who predicted correctly have points updated

3. **Ranking:**
   - [ ] **Expected**: Users sorted by total points (highest first)
   - [ ] Ties: Users with same points share same rank

4. **Points breakdown:**
   - [ ] Result points: Correct match outcome (win/draw/loss)
   - [ ] Score points: Exact score correct
   - [ ] Goal scorer points: Each correct player who scored (including multiple goals)

---

### **6. Points Rules Configuration** 📋

#### Test Steps:
1. **Admin access:**
   - [ ] Go to Admin → Points Rules
   - [ ] **Expected**: See rules for each stage (group, round16, quarter, semi, final)

2. **Modify points:**
   - [ ] Select "Group Stage"
   - [ ] Set result points: 3
   - [ ] Set score points: 5
   - [ ] Set goal scorer points: 2
   - [ ] Click "Update"
   - [ ] **Expected**: Rules saved successfully

3. **Different stages:**
   - [ ] Set Final stage with higher points (e.g., result: 10, score: 15, scorer: 5)
   - [ ] Complete a final match
   - [ ] **Expected**: Users get higher points for final matches

---

### **7. Prediction Sections Toggle** 🎚️

#### Test Steps:
1. **Disable score prediction:**
   - [ ] Admin edits fixture
   - [ ] Uncheck "Enable Score Prediction"
   - [ ] Save
   - [ ] User views fixture in "Match Prediction"
   - [ ] **Expected**: Score input fields NOT shown

2. **Disable scorer prediction:**
   - [ ] Admin edits fixture
   - [ ] Uncheck "Enable Scorer Prediction"
   - [ ] Save
   - [ ] User views fixture
   - [ ] **Expected**: Goal scorer dropdowns NOT shown

3. **Match outcome always enabled:**
   - [ ] **Expected**: Match outcome (Team A/Draw/Team B) ALWAYS visible

---

### **8. All Fixtures Tab** 📅

#### Test Steps:
1. **View all fixtures:**
   - [ ] Go to "All Fixtures" tab
   - [ ] **Expected**: Three sections:
     - ✅ Completed Matches (collapsed by default)
     - 🔓 Open for Predictions (expanded by default, green highlight)
     - 🔒 Upcoming Matches (collapsed by default)

2. **Accordion behavior:**
   - [ ] Click on "Completed Matches"
   - [ ] **Expected**: Expands to show all completed fixtures
   - [ ] Click again
   - [ ] **Expected**: Collapses

3. **Fixture details:**
   - [ ] Completed fixtures show final score and result
   - [ ] Open fixtures show "Open for Predictions"
   - [ ] Locked fixtures show date/time

---

### **9. Manage Participants** 👥

#### Test Steps:
1. **View participants:**
   - [ ] Admin → Manage Participants
   - [ ] **Expected**: List of all enrolled users

2. **Add points:**
   - [ ] Find a user
   - [ ] Enter "+10" in points field
   - [ ] Click "Update"
   - [ ] **Expected**: User gets 10 bonus points

3. **Remove points:**
   - [ ] Enter "-5" in points field
   - [ ] Click "Update"
   - [ ] **Expected**: 5 points deducted

4. **Remove user:**
   - [ ] Click "Remove" on a test user
   - [ ] Confirm removal
   - [ ] **Expected**: User removed from system

---

### **10. Copy to Clipboard Features** 📋

#### Test Steps:
1. **Copy matches (Admin only):**
   - [ ] Go to "Match Prediction" tab as admin
   - [ ] Click "Copy Matches" button (top right)
   - [ ] Paste into WhatsApp/Telegram
   - [ ] **Expected**: Formatted list of upcoming matches

2. **Copy leaderboard (Admin only):**
   - [ ] Go to "Leaderboard" tab as admin
   - [ ] Click "📋 Copy Leaderboard" button
   - [ ] Paste into group chat
   - [ ] **Expected**: Formatted leaderboard with emojis

---

### **11. Edge Cases & Error Handling** ⚠️

#### Test Steps:
1. **API rate limit:**
   - [ ] Click "Fetch from API" 100+ times in one day
   - [ ] **Expected**: Error message: "API rate limit exceeded. Please enter manually."

2. **Network error:**
   - [ ] Turn off WiFi
   - [ ] Try to submit prediction
   - [ ] **Expected**: Error message shown, user stays logged in

3. **Duplicate phone number:**
   - [ ] Try to enroll with existing phone number
   - [ ] **Expected**: Logs in as existing user (not creating duplicate)

4. **Invalid input:**
   - [ ] Try to enter negative scores
   - [ ] Try to select less than 3 goal scorers
   - [ ] **Expected**: Validation prevents invalid submissions

5. **Match not found in API:**
   - [ ] Click "Fetch from API" on a very old or custom fixture
   - [ ] **Expected**: Error message, manual entry still works

---

## 🎯 **Critical User Flows to Test Before Launch**

### **Flow 1: Complete User Journey**
1. New user enrolls
2. User makes predictions on 3 matches
3. Admin completes 1 match with results
4. User checks leaderboard and sees their points
5. User edits a prediction on an open match
6. Admin locks a match
7. User can't predict on locked match anymore

### **Flow 2: Admin Workflow**
1. Admin logs in
2. Creates new fixture
3. Opens it for predictions
4. Users make predictions
5. Match finishes
6. Admin marks as completed
7. Admin clicks "Fetch from API" (goal scorers auto-fill)
8. Admin saves
9. Points calculated automatically
10. Leaderboard updates

### **Flow 3: Goal Scorer Edge Case**
1. Admin creates match: Argentina vs France
2. Admin sets points rule: 2 pts per goal scorer
3. User predicts: ["Messi", "Ronaldo", "Mbappé"]
4. Match ends: Messi scores 3 goals, Mbappé scores 1
5. Admin enters: "Messi, Messi, Messi, Mbappé"
6. System calculates: Messi (3 goals × 2 pts = 6) + Mbappé (1 goal × 2 pts = 2) = **8 points total**
7. User gets correct 8 points

---

## 📊 **Success Criteria**

Before sharing with friends, ensure:

- [ ] ✅ Session persistence works (no random logouts)
- [ ] ✅ Admin can create, edit, delete fixtures
- [ ] ✅ Users can enroll and make predictions
- [ ] ✅ Goal scorer points calculate correctly with multiple goals
- [ ] ✅ Leaderboard updates after match completion
- [ ] ✅ Points rules can be configured per stage
- [ ] ✅ Prediction sections can be toggled on/off
- [ ] ✅ "Fetch from API" button works (when API key is set)
- [ ] ✅ Manual entry fallback works
- [ ] ✅ All error messages are user-friendly
- [ ] ✅ Mobile responsive (test on phone)

---

## 🚀 **Ready to Launch!**

Once all items above are checked, you're good to go! Share the link with your friends:

**App URL**: https://wc-prediction-game-chi.vercel.app/

**Admin Login**: 
- Phone: 7507057136
- Name: Hemant

---

## 🐛 **Known Issues (None Currently)**

All reported issues have been fixed:
- ✅ Session persistence fixed (30-day expiry)
- ✅ Goal scorer points calculation fixed (handles multiple goals)
- ✅ TypeScript errors resolved
- ✅ API integration implemented with fallback
- ✅ All deployment errors fixed

---

## 📞 **Support**

If you find any issues during testing:
1. Note down the exact steps to reproduce
2. Check browser console for errors (F12 → Console tab)
3. Share screenshots if UI looks broken
4. Test on different browsers (Chrome, Safari, Firefox)
