# Setup Guide

## Quick Start

The application is ready to run! Follow these steps:

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 2. First Time Setup

1. **Enroll as a user**:
   - Open http://localhost:3000
   - Enter your first name and phone number
   - Click "Join Game"

2. **Access Admin Dashboard**:
   - Click the "Admin" button in the top right
   - Or visit http://localhost:3000/admin directly

### 3. Admin Tasks

#### Add/Update Match Results
1. Go to Admin Dashboard
2. Scroll to "Fixtures Management"
3. Click on any fixture to edit
4. Update:
   - Status (open/locked/completed)
   - Result (Team A/Draw/Team B)
   - Final scores
5. Click "Save Changes"

#### Modify Points Rules
1. Go to Admin Dashboard
2. Find "Points Rules" section
3. Click "Edit Points"
4. Modify points for:
   - Result Points (correct match outcome)
   - Score Points (exact score prediction)
   - Goal Scorer Points (correct goal scorer)
5. Changes save automatically

### 4. Player Experience

#### Make Predictions
1. Go to "Upcoming Matches" tab
2. Select your prediction (Team A/Draw/Team B)
3. For knockout stages, optionally add score predictions
4. For semi-finals/finals, add goal scorer names
5. Click "Submit Prediction"

#### View Leaderboard
1. Click "Leaderboard" tab
2. See your rank and points
3. Click "Export for WhatsApp" to copy formatted text
4. Paste in your WhatsApp group!

### 5. Sample Data

The app comes with sample fixtures including:
- Italy vs Netherlands (completed)
- Argentina vs Mexico (open)
- Brazil vs Spain (open)
- Germany vs France (open)
- England vs Portugal (locked)
- Belgium vs Croatia (knockout - locked)
- Uruguay vs Colombia (quarter-final - locked)

## Common Tasks

### Add New Fixtures

To add more fixtures, you can either:

**Option 1: Modify the sample data file**
Edit `data/sample-data.ts` and restart the server.

**Option 2: Create an API endpoint**
Currently the app uses sample data. To add fixtures dynamically:
1. Go to Admin Dashboard
2. Use the fixtures management interface
3. Or call the API directly:

```bash
curl -X POST http://localhost:3000/api/admin/fixtures \
  -H "Content-Type: application/json" \
  -d '{
    "teamA": "France",
    "teamB": "Germany",
    "teamAFlag": "🇫🇷",
    "teamBFlag": "🇩🇪",
    "stage": "group",
    "matchDate": "2026-06-15T18:00:00",
    "status": "open"
  }'
```

### Lock Predictions Before Match

1. Open Admin Dashboard
2. Click on the fixture
3. Change status to "locked"
4. Save changes

### Enter Match Results

1. Open Admin Dashboard
2. Click on the completed fixture
3. Change status to "completed"
4. Select the result (Team A/Draw/Team B)
5. Enter final scores
6. Save changes
7. Leaderboard automatically updates!

### Export Leaderboard

1. Go to Leaderboard tab
2. Click "Export for WhatsApp"
3. Text is copied to clipboard
4. Paste into WhatsApp

Format example:
```
🏆 LEADERBOARD - FIFA 2026 🏆
6/26/2026

1. ↑ 🥇 John - 24 pts (+4)
2. ↓ 🥈 Sarah - 22 pts (+2)
3. → 🥉 Mike - 20 pts (+2)
```

## Important Notes

⚠️ **Data Persistence**: Currently using in-memory storage. Data will be lost when you restart the server.

To make it permanent:
1. Add a database (PostgreSQL, MongoDB)
2. Replace `lib/database.ts` with real database calls
3. See README.md for recommended databases

## Troubleshooting

### Server won't start
```bash
# Try a different port
PORT=3001 npm run dev
```

### Changes not showing
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Restart dev server

### Predictions not saving
- Check browser console for errors
- Ensure fixture status is "open"
- Verify user is enrolled

## Next Steps

1. **Customize Fixtures**: Edit `data/sample-data.ts` with real World Cup matches
2. **Invite Friends**: Share the URL with your group
3. **Test Workflow**: Make predictions → Lock fixtures → Enter results → Check leaderboard
4. **Deploy**: See README.md for deployment options (Vercel, Netlify)

## Support

For issues or questions, check:
- README.md for detailed documentation
- Browser console for error messages
- Network tab in browser DevTools for API errors

---

Enjoy your World Cup prediction game! ⚽🏆
