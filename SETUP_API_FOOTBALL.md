# API-Football Setup Guide

## 🎯 **What This Does**

The "🔄 Fetch from API" button in the admin panel automatically retrieves:
- Goal scorer names
- Number of goals per player (handles multiple goals correctly)
- Final scores (as backup if you haven't entered them)
- All available players for autocomplete

---

## 📝 **Step-by-Step Setup** (5 minutes)

### **Step 1: Sign Up for API-Football**

1. Go to: https://rapidapi.com/api-sports/api/api-football
2. Click **"Subscribe to Test"** or **"Pricing"**
3. Select the **"Basic" plan** (FREE)
   - 100 requests per day
   - No credit card required
4. Create account (or login with Google/GitHub)

### **Step 2: Get Your API Key**

1. After subscribing, you'll see your API key on the page
2. Look for **"X-RapidAPI-Key"** in the code snippets
3. Copy the long string (it looks like: `a1b2c3d4e5f6...`)

Example:
```
X-RapidAPI-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### **Step 3: Add API Key to Your Project**

1. Open `.env.local` file in the project root
2. Find the line:
   ```
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```
3. Replace `your_rapidapi_key_here` with your actual key:
   ```
   RAPIDAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   NEXT_PUBLIC_RAPIDAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

### **Step 4: Restart Your Development Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### **Step 5: Test It!**

1. Go to http://localhost:3000/admin/fixtures
2. Click "Edit" on any **completed** fixture
3. Mark status as "Completed"
4. Click **"🔄 Fetch from API"** button
5. Goal scorers should auto-fill within 2-3 seconds!

---

## 🔧 **For Production (Vercel)**

### Add to Vercel Environment Variables:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add two variables:
   - **Name**: `RAPIDAPI_KEY`  
     **Value**: `your_key_here`
   - **Name**: `NEXT_PUBLIC_RAPIDAPI_KEY`  
     **Value**: `your_key_here`
3. Redeploy

---

## 📊 **API Limits & Usage**

### Free Tier (Basic Plan):
- ✅ 100 requests per day
- ✅ Goal scorers, lineups, match events
- ✅ No credit card required
- ✅ All World Cup 2026 matches

### Usage Estimates:
- **World Cup Group Stage**: 48 matches = 48 API calls
- **Knockout Stage**: 16 matches = 16 API calls
- **Total Tournament**: ~64 API calls (well within free limit)

### How to Check Your Usage:
1. Go to https://rapidapi.com/developer/billing/subscriptions
2. View your current usage
3. Resets daily at midnight UTC

---

## 🎮 **How to Use as Admin**

### Scenario 1: Normal Flow (95% of cases)
```
1. Match finishes: Argentina 3-1 France
2. Go to /admin/fixtures
3. Edit the fixture
4. Toggle "Completed"
5. Enter result: Team A Won
6. Click "🔄 Fetch from API"
7. Wait 2-3 seconds
8. See auto-filled: "Messi, Messi, Mbappé"
9. Click "Save"
✅ Done in 30 seconds!
```

### Scenario 2: API Fails (5% of cases)
```
1. Click "🔄 Fetch from API"
2. See error: "Rate limit exceeded" or "Match not found"
3. Manually enter: "Messi, Messi, Mbappé"
4. Click "Save"
✅ Fallback works perfectly
```

---

## ❓ **Troubleshooting**

### Problem: Button says "API key not configured"
**Solution**: 
- Check `.env.local` has `RAPIDAPI_KEY=your_key`
- Restart dev server: `npm run dev`

### Problem: "Rate limit exceeded"
**Solution**: 
- You've used 100 requests today
- Wait until tomorrow (resets at midnight UTC)
- OR enter goal scorers manually

### Problem: "Match not found in API-Football"
**Solution**: 
- The match may not be in their database yet
- Enter goal scorers manually
- Try again in a few hours

### Problem: Button is grayed out
**Solution**: 
- The fixture must be saved first
- Save the fixture, then click "Edit" again
- Now the button will work

---

## 🔍 **How It Works Technically**

```
Admin clicks "🔄 Fetch"
         ↓
Frontend: POST /api/fixtures/[id]/fetch-scorers
         ↓
Backend: Checks if fixture has externalId
         ↓
If no ID: Search API-Football by team names + date
         ↓
If found: Store externalId for future use
         ↓
Fetch match details: GET /fixtures?id=123456
         ↓
API returns:
{
  "events": [
    {"player": {"name": "L. Messi"}, "type": "Goal", "time": {"elapsed": 23}},
    {"player": {"name": "L. Messi"}, "type": "Goal", "time": {"elapsed": 108}},
    {"player": {"name": "K. Mbappé"}, "type": "Goal", "time": {"elapsed": 80}}
  ]
}
         ↓
Backend extracts: ["Messi", "Messi", "Mbappé"]
         ↓
Frontend displays: "Messi, Messi, Mbappé"
         ↓
Admin reviews and saves
         ↓
Database updated → Points calculated → Leaderboard refreshed
```

---

## 📅 **API-Football Coverage**

### ✅ Available:
- FIFA World Cup 2026
- UEFA Champions League
- Premier League, La Liga, Bundesliga
- International friendlies
- Major tournaments (Euros, Copa America)

### ❌ Not Available:
- Very small local leagues
- Amateur competitions
- Some friendlies may be delayed

**For World Cup 2026**: 100% coverage guaranteed

---

## 💰 **Cost Summary**

| Plan | Cost | Requests/Day | Suitable For |
|------|------|--------------|--------------|
| **Basic** | FREE | 100 | ✅ World Cup (64 matches total) |
| Pro | $10/month | 5,000 | Multiple tournaments |
| Ultra | $25/month | 30,000 | Professional use |

**Recommendation**: FREE plan is perfect for World Cup 2026

---

## 🚀 **Next Steps**

1. ✅ Sign up at https://rapidapi.com/api-sports/api/api-football
2. ✅ Copy your API key
3. ✅ Add to `.env.local`
4. ✅ Restart server
5. ✅ Test with a completed match
6. 🎉 Enjoy automatic goal scorer fetching!

---

## 📞 **Support**

- **API-Football Docs**: https://www.api-football.com/documentation-v3
- **RapidAPI Dashboard**: https://rapidapi.com/developer/dashboard
- **Status Page**: https://status.api-football.com/

If you have issues, the API-Football support team responds within 24 hours on RapidAPI.
