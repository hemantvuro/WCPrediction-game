# Goal Scorer Feature - Implementation Status

## 🔍 **Current Situation**

### Football-Data.org API Limitations
The **free tier** of Football-Data.org API does NOT provide:
- ❌ Goal scorer names
- ❌ Goal scorer details
- ❌ Match lineups/squads
- ❌ Individual match statistics

**What the free tier provides:**
- ✅ Match fixtures (teams, date, time)
- ✅ Final scores (fullTime.home, fullTime.away)
- ✅ Match status (SCHEDULED, FINISHED, etc.)
- ✅ Basic team information

**Testing with API:**
```bash
curl -H "X-Auth-Token: YOUR_KEY" \
  "https://api.football-data.org/v4/matches/MATCH_ID"
  
# Response: {"message":"The resource you are looking for is restricted 
# and apparently not within your permissions. Please check your subscription."}
```

## 📊 **Available Options**

### Option 1: Manual Entry by Admin (CURRENT IMPLEMENTATION)
**Status**: ✅ **Working**

**How it works:**
1. Admin goes to `/admin/fixtures` 
2. Edits completed match
3. Enters goal scorers manually: "Messi, Messi, Ronaldo" (if Messi scored 2, Ronaldo scored 1)
4. System correctly calculates: Each predicted player gets points × number of goals they scored

**Pros:**
- ✅ Works with free API tier
- ✅ Admin has full control
- ✅ Points calculation is accurate

**Cons:**
- ⚠️ Manual data entry required
- ⚠️ Prone to typos (though autocomplete can help)

**Current UI:**
```
Goal Scorers (comma-separated)
💡 Tip: If a player scores multiple goals, enter their name 
multiple times (e.g., Messi, Messi, Ronaldo)

[Input field: "Messi, Messi, Ronaldo"]
```

---

### Option 2: Use Alternative Free APIs
**Status**: 🔍 **Research Needed**

**Potential alternatives:**
1. **API-Football (RapidAPI)**
   - Free tier: 100 requests/day
   - Includes goal scorers, lineups, events
   - URL: https://rapidapi.com/api-sports/api/api-football

2. **TheSportsDB API**
   - Free tier available
   - Includes goal events
   - URL: https://www.thesportsdb.com/api.php

3. **Sportradar** (if you have access)
   - Comprehensive data
   - May require paid subscription

**Implementation effort**: 2-3 hours to integrate new API

---

### Option 3: Upgrade Football-Data.org to Paid Tier
**Status**: 💰 **Requires Subscription**

**Cost**: 
- Tier 2: €19/month - includes goal scorers
- Tier 3: €49/month - includes lineups + more

**Would provide:**
- Full match details endpoint
- Goal scorer names with timestamps
- Player lineups/squads
- Substitutions

---

### Option 4: User Enters Player Names Manually (Prediction Phase)
**Status**: ✅ **Already Implemented**

**How it works:**
1. User makes prediction
2. Enters 3 player names manually: "Messi", "Ronaldo", "Mbappe"
3. Admin enters actual scorers after match
4. System matches names and calculates points

**Current behavior**: Text input fields (no dropdown)

**To improve**: Add autocomplete with common player names database

---

## 🎯 **Recommended Solution**

### **Keep Current Manual Entry + Add Autocomplete**

**Why:**
1. ✅ Works with existing free API
2. ✅ Admin maintains control over data
3. ✅ No additional API costs
4. ✅ Points calculation is already correct

**Enhancement: Add player name autocomplete**

#### Step 1: Create player database
Create `data/players.json`:
```json
{
  "argentina": ["Lionel Messi", "Lautaro Martínez", "Ángel Di María"],
  "france": ["Kylian Mbappé", "Antoine Griezmann", "Olivier Giroud"],
  "brazil": ["Neymar Jr", "Vinícius Jr", "Richarlison"],
  ...
}
```

#### Step 2: Add autocomplete component
Replace text input with autocomplete in both:
- User prediction form (`components/PredictionCard.tsx`)
- Admin result entry (`app/admin/fixtures/page.tsx`)

**Example library**: react-select or @headlessui/react Combobox

#### Step 3: Filter by fixture teams
When user/admin is on a specific fixture:
- Show only players from Team A and Team B
- User types "Mes" → suggests "Lionel Messi" (if Argentina is playing)

**Implementation time**: 2-3 hours

---

## 🔧 **Current Points Calculation Logic**

### ✅ **Working Correctly** (Fixed in latest commit)

```typescript
// lib/supabase-database.ts - calculateLeaderboard()

// User predicted: ["Messi", "Ronaldo", "Mbappe"]
// Admin entered actual: ["Messi", "Messi", "Ronaldo"]  
// (Messi scored 2, Ronaldo scored 1)

if (pred.goalScorers && fixture.goalScorers && pred.goalScorers.length > 0) {
  let scorerPoints = 0;
  pred.goalScorers.forEach(predictedScorer => {
    // Count how many times this predicted player actually scored
    const goalsScored = fixture.goalScorers!.filter(s => s === predictedScorer).length;
    // Messi: filter finds 2 matches → 2 goals
    // Ronaldo: filter finds 1 match → 1 goal
    // Mbappe: filter finds 0 matches → 0 goals
    scorerPoints += goalsScored * rule.goalScorerPoints;
  });
  points += scorerPoints;
}

// If goalScorerPoints = 2:
// Messi: 2 goals × 2 = 4 points
// Ronaldo: 1 goal × 2 = 2 points  
// Total: 6 points ✅
```

---

## 📝 **Summary**

### Current Implementation Status:
- ✅ User can predict 3 players (text input)
- ✅ Admin manually enters goal scorers after match
- ✅ Points calculation correctly handles multiple goals by same player
- ✅ Admin sees helpful tip about entering names multiple times

### What's Missing:
- ❌ Automatic goal scorer data from API (requires paid tier or alternative API)
- ⚠️ Player autocomplete (optional enhancement)

### Recommended Next Steps:
1. **Short term**: Keep manual entry, works perfectly
2. **Enhancement**: Add player name autocomplete (2-3 hours work)
3. **Long term**: If budget allows, upgrade API or use API-Football for automatic data

### Decision Required:
Would you like me to:
- [ ] Keep current manual entry (works fine as-is)
- [ ] Add player autocomplete (2-3 hours work)
- [ ] Research and integrate alternative free API with goal scorer data (3-4 hours)
- [ ] Update to use paid Football-Data.org tier (requires €19/month subscription)
