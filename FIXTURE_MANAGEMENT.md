# Fixture Management System

## Automatic Status Management

### Status Rules (Time-Based)
The system automatically updates fixture statuses based on the current time:

1. **COMPLETED** 🔒
   - Matches that started more than 2 hours ago
   - Shows the final score prominently
   - Cannot be edited or toggled
   - Locked from predictions

2. **OPEN** 🔓
   - Matches in the next 24 hours
   - Available for user predictions
   - Appears on "Match Prediction" tab
   - Users can submit/update predictions

3. **LOCKED** 🔒
   - Future matches beyond 24 hours
   - Listed in "All Fixtures" tab only
   - Not available for predictions
   - Admin can manually unlock if needed

### How It Works
- Every time fixtures are fetched, the system checks the match date
- Automatically assigns the appropriate status based on time
- Admin can still manually override statuses if needed
- Completed matches with scores remain completed

## Knockout Stage Management

### TBD Teams
- Knockout fixtures start with "TBD" (To Be Determined) teams
- As tournament progresses, teams advance to next rounds
- Admin needs to update these fixtures with actual teams

### Updating Knockout Fixtures

#### Method 1: Manual Update
1. Navigate to **Admin → Manage Fixtures**
2. Find knockout fixture with "TBD" teams
3. Click **"🔄 Update Teams"** button
4. Select Team A and Team B from dropdowns
5. Click **"✓ Update"**
6. Teams and flags are updated automatically

#### Method 2: Through Edit
1. Click **"✏️ Edit"** on any fixture
2. Change teams, flags, and other details in modal
3. Save changes

### What Needs Updating
- **Round of 32**: 16 matches (32 teams)
- **Round of 16**: 8 matches (16 teams)  
- **Quarter Finals**: 4 matches (8 teams)
- **Semi Finals**: 2 matches (4 teams)
- **Third Place**: 1 match (2 teams)
- **Final**: 1 match (2 teams)

## Admin Workflow

### Daily Routine

**Morning (Before Matches)**
1. Check today's fixtures
2. Ensure they're marked as "OPEN"
3. Users can now submit predictions

**After Matches**
1. Go to **Admin → Match Results**
2. Update scores and goal scorers
3. System marks fixture as "COMPLETED"
4. Automatically calculates user points

**Update Knockouts (As Needed)**
1. When Round of 32 completes → Update Round of 16 teams
2. When Round of 16 completes → Update Quarter Finals
3. Continue for each stage

### Key Features

**Completed Fixtures Display**
- Show score prominently (e.g., "Brazil 3 - 1 Argentina")
- Display "✅ COMPLETED" badge
- No toggle or edit buttons
- Locked from further predictions

**Open Fixtures**
- Show "🔓 OPEN" badge
- Toggle switch available
- Appear on Match Prediction tab
- Accept user predictions

**Locked Fixtures**
- Show "🔒 LOCKED" badge  
- Toggle switch available
- Only in All Fixtures tab
- No predictions allowed

## Time Windows

```
Current Time: June 29, 2026

Past (Completed):
├─ All matches before June 28, 10 PM IST
└─ Status: COMPLETED

Next 24 Hours (Open):
├─ June 29, 10 PM - June 30, 10 PM IST
└─ Status: OPEN

Future (Locked):
├─ All matches after June 30, 10 PM IST
└─ Status: LOCKED
```

## Match Prediction Tab Behavior

**Shows Only:**
- Fixtures with status = "OPEN"
- Matches in next 24 hours
- Real team names (not TBD)

**Does NOT Show:**
- Locked fixtures
- Completed fixtures
- TBD knockout fixtures

## Technical Implementation

### Files Changed
1. **`lib/fixture-utils.ts`** (NEW)
   - `getFixtureStatus()` - Calculate status from date
   - `updateFixtureStatuses()` - Batch update all fixtures
   - `canPredict()` - Check if fixture accepts predictions

2. **`app/api/fixtures/route.ts`**
   - Auto-updates statuses on every GET request
   - Saves updated statuses to database

3. **`app/api/admin/knockout-fixtures/route.ts`** (NEW)
   - PUT endpoint to update knockout teams
   - Accepts: fixtureId, teamA, teamB, flags

4. **`app/admin/fixtures/page.tsx`**
   - Shows score for completed matches
   - "Update Teams" button for TBD knockouts
   - Toggle disabled for completed matches
   - Softer colors throughout

### API Endpoints

**GET /api/fixtures**
- Returns all fixtures with auto-updated statuses
- Saves status changes to database

**PUT /api/admin/knockout-fixtures**
```json
{
  "fixtureId": "fixture_xyz",
  "teamA": "Brazil",
  "teamB": "Argentina", 
  "teamAFlag": "🇧🇷",
  "teamBFlag": "🇦🇷"
}
```

## Notes

- Status updates happen automatically every time fixtures are loaded
- Admin can still manually override any status if needed
- Completed matches with scores are never auto-changed
- System uses India timezone (Asia/Kolkata) for all calculations
- 24-hour window gives users enough time to predict

## Future Enhancements

1. **Live Score Integration**
   - Fetch live scores from sports API
   - Auto-update completed matches
   - Real-time score display

2. **Team Advancement Logic**
   - Auto-detect winners from group stage
   - Populate Round of 32 automatically
   - Continue through knockout stages

3. **Notifications**
   - Alert admin when fixtures need updating
   - Remind users about closing predictions
   - Send results after matches complete
