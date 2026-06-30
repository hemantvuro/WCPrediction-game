# 🗓️ Fixture Management Guide

## 📅 **Current Situation**

**Today's Date**: June 30, 2026  
**Timezone**: India (IST - UTC+5:30)

All existing fixtures in the database are from June 12-24, which are now **in the past**.

---

## 🎯 **How Fixture Status Works**

The system automatically determines fixture status based on match date and current time:

### **Status Rules:**

1. **🔓 Open for Predictions**
   - Tomorrow's matches (July 1) 
   - ONLY if current time is **before 1PM** today
   - Users can submit/edit predictions

2. **✅ Completed**
   - Past matches (before today)
   - Admin must manually enter final scores
   - Shows results to users

3. **🔒 Upcoming (Locked)**
   - Future matches (after tomorrow)
   - Today's matches (too late to predict)
   - Tomorrow's matches (after 1PM today)
   - Users cannot predict yet

---

## 🔧 **What You Need to Do**

### **Option 1: Use Auto-Update (Recommended)**

1. Go to **Admin → Fixtures Management**
2. Click **"🤖 Auto-Update Status"** button
3. System will automatically:
   - Mark past matches as COMPLETED
   - Open tomorrow's matches (if before 1PM)
   - Lock future matches
4. Click this button **daily** at the start of each day

### **Option 2: Manually Create New Fixtures**

Since tournament starts in June but we're testing now, create test fixtures:

1. Click **"➕ Create Fixture"**
2. Select teams (e.g., Argentina vs Brazil)
3. **Set match date**: Tomorrow (July 1, 2026) at 8:00 PM IST
4. Set stage: Group, Round16, Quarter, etc.
5. Toggle **"Open for Predictions"** ON
6. Save

### **Option 3: Edit Existing Fixtures**

Update old fixture dates to future dates:

1. Click **"Edit"** on any fixture
2. Change **Match Date & Time** to July 1-5, 2026
3. System will auto-calculate if it should be open/locked

---

## 📋 **Daily Admin Workflow**

### **Every Morning (~10 AM)**
```
1. Login as admin
2. Go to Fixtures Management
3. Click "🤖 Auto-Update Status"
4. Check "Open for Predictions" section
5. Verify tomorrow's matches are showing
```

### **After Each Match Finishes**
```
1. Edit the completed fixture
2. Mark status as "Completed"
3. Enter final scores
4. Click "🔄 Fetch from API" (if API key is set)
5. Or manually enter goal scorers
6. Save
```

### **Before 1 PM Daily**
```
Tomorrow's matches will be OPEN for predictions.
Users have until 1 PM to make predictions.

After 1 PM: System auto-locks tomorrow's matches.
```

---

## 🕐 **Timeline Example (June 30)**

**Current Time**: June 30, 2026, 10:00 AM IST

| Match Date | Status | Reason |
|------------|--------|--------|
| June 29 | ✅ Completed | Yesterday - admin entered scores |
| June 30 (today) | 🔒 Locked | Today's matches - too late |
| July 1 (tomorrow, 8 PM) | 🔓 **OPEN** | Before 1 PM cutoff |
| July 2 | 🔒 Locked | Day after tomorrow |

**After 1 PM on June 30:**

| Match Date | Status | Reason |
|------------|--------|--------|
| July 1 (tomorrow) | 🔒 Locked | After 1 PM cutoff |

---

## 🎮 **User Experience**

### **Match Prediction Tab**
Shows only OPEN fixtures (tomorrow's matches before 1PM)

### **All Fixtures Tab**
- **✅ Completed Matches**: Past matches with scores
- **🔓 Open for Predictions**: Tomorrow's matches (before 1PM)
- **🔒 Upcoming Matches**: Future locked matches

---

## ⚙️ **Technical Details**

### **Auto-Update Logic**
```javascript
Current India Time: June 30, 2026, 10:00 AM

Cutoff: Today at 1:00 PM (June 30, 1:00 PM)

Rules:
1. matchDate < today start → COMPLETED
2. matchDate = tomorrow AND now < 1PM → OPEN
3. matchDate = tomorrow AND now >= 1PM → LOCKED
4. matchDate > tomorrow → LOCKED
5. matchDate = today → LOCKED
```

### **API Endpoint**
```
POST /api/admin/auto-update-fixtures

Returns:
{
  success: true,
  updates: {
    openCount: 3,
    completedCount: 48,
    upcomingCount: 16
  }
}
```

---

## 🚀 **Quick Start for Testing**

### **Scenario: Test the System Today**

1. **Create 3 test fixtures for tomorrow (July 1)**:
   - Argentina vs Brazil - July 1, 8:00 PM
   - France vs Germany - July 1, 8:30 PM  
   - Spain vs Portugal - July 1, 9:00 PM

2. **Click "🤖 Auto-Update Status"**
   - All 3 should show as OPEN (since it's before 1PM)

3. **As a user**, go to Match Prediction tab
   - You'll see all 3 matches
   - Submit predictions

4. **After 1 PM**, click "🤖 Auto-Update Status" again
   - All 3 matches will become LOCKED
   - Users can no longer predict

5. **Tomorrow morning (July 2)**, click "🤖 Auto-Update Status"
   - Yesterday's matches (July 1) become COMPLETED
   - Create new matches for July 3
   - Those become OPEN (if before 1PM)

---

## 🔄 **Automated Daily Updates (Future Enhancement)**

Currently manual - admin clicks button daily.

**Future**: Can set up cron job to run auto-update:
- Every day at 12:00 AM (midnight)
- Every day at 1:00 PM (lock tomorrow's matches)

---

## ❓ **FAQ**

### Q: Why are all fixtures showing as Completed?
**A:** All existing fixtures are from June 12-24. Today is June 30, so they're all in the past. Click "🤖 Auto-Update Status" to mark them as completed, then create new fixtures for July 1+.

### Q: When should I click Auto-Update?
**A:** Every morning before users start predicting. Also click after 1 PM to lock tomorrow's matches.

### Q: Can I manually override status?
**A:** Yes! Edit any fixture and manually toggle Open/Locked. Auto-update won't change manually-set statuses unless they're clearly wrong (e.g., past match still open).

### Q: What time zone are fixtures in?
**A:** All times are India Standard Time (IST - UTC+5:30). The system automatically handles this.

---

## 📞 **Support**

If fixtures aren't updating correctly:
1. Check browser console for errors
2. Verify match dates are set correctly (in IST)
3. Run "🤖 Auto-Update Status" button
4. Refresh the page

All fixture times should be in format: `YYYY-MM-DDTHH:MM:SS+05:30`

Example: `2026-07-01T20:00:00+05:30` = July 1, 2026, 8:00 PM IST
